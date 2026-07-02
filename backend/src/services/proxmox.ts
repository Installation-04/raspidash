import { loadConfig } from '../store.js';

const FETCH_TIMEOUT_MS = 10_000;

async function getTicket(url: string, username: string, password: string, insecure: boolean) {
  const res = await fetch(`${url}/api2/json/access/ticket`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username, password }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    // @ts-ignore node fetch
    ...(insecure ? { dispatcher: await getInsecureDispatcher() } : {}),
  });
  if (!res.ok) throw new Error(`Proxmox auth failed: ${res.status}`);
  const json = await res.json() as any;
  if (!json.data?.ticket) throw new Error('Proxmox auth failed: no ticket in response');
  return {
    ticket: json.data.ticket as string,
    csrfToken: json.data.CSRFPreventionToken as string,
  };
}

const ticketCache = new Map<string, { ticket: string; csrfToken: string; expires: number }>();

export async function proxmoxFetch(integrationId: string, path: string) {
  const config = loadConfig();
  const integration = config.integrations.find((i) => i.id === integrationId);
  if (!integration) throw new Error('Integration not found');

  const baseUrl = integration.url.replace(/\/$/, '');
  const apiUrl = `${baseUrl}/api2/json${path}`;
  const insecure = integration.insecure ?? false;
  const dispatcherOpt = insecure ? { dispatcher: await getInsecureDispatcher() } : {};

  // API token auth
  if (integration.apiKey) {
    const res = await fetch(apiUrl, {
      headers: { Authorization: `PVEAPIToken=${integration.apiKey}` },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      // @ts-ignore node fetch
      ...dispatcherOpt,
    });
    if (!res.ok) throw new Error(`Proxmox API error: ${res.status}`);
    return res.json();
  }

  // Ticket auth with cache
  const now = Date.now();
  let cached = ticketCache.get(integrationId);
  if (!cached || cached.expires < now) {
    const { ticket, csrfToken } = await getTicket(
      baseUrl,
      integration.username!,
      integration.password!,
      insecure
    );
    cached = { ticket, csrfToken, expires: now + 7200_000 };
    ticketCache.set(integrationId, cached);
  }

  const res = await fetch(apiUrl, {
    headers: { Cookie: `PVEAuthCookie=${cached.ticket}`, CSRFPreventionToken: cached.csrfToken },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    // @ts-ignore node fetch
    ...dispatcherOpt,
  });
  if (!res.ok) {
    // Ticket may have been revoked server-side; drop it so the next poll re-authenticates
    if (res.status === 401) ticketCache.delete(integrationId);
    throw new Error(`Proxmox API error: ${res.status}`);
  }
  return res.json();
}

let insecureDispatcher: unknown;

async function getInsecureDispatcher() {
  // Node 18+ undici dispatcher for self-signed certs
  if (insecureDispatcher) return insecureDispatcher;
  try {
    // @ts-ignore
    const { Agent } = await import('undici');
    insecureDispatcher = new Agent({ connect: { rejectUnauthorized: false } });
    return insecureDispatcher;
  } catch {
    return undefined;
  }
}
