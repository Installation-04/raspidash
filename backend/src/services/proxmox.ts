import { loadConfig } from '../store.js';

async function getTicket(url: string, username: string, password: string, insecure: boolean) {
  const res = await fetch(`${url}/api2/json/access/ticket`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username, password }),
    // @ts-ignore node fetch
    ...(insecure ? { dispatcher: getInsecureDispatcher() } : {}),
  });
  const json = await res.json() as any;
  return {
    ticket: json.data?.ticket,
    csrfToken: json.data?.CSRFPreventionToken,
  };
}

const ticketCache = new Map<string, { ticket: string; csrfToken: string; expires: number }>();

export async function proxmoxFetch(integrationId: string, path: string) {
  const config = loadConfig();
  const integration = config.integrations.find((i) => i.id === integrationId);
  if (!integration) throw new Error('Integration not found');

  const baseUrl = integration.url.replace(/\/$/, '');
  const apiUrl = `${baseUrl}/api2/json${path}`;

  // API token auth
  if (integration.apiKey) {
    const res = await fetch(apiUrl, {
      headers: { Authorization: `PVEAPIToken=${integration.apiKey}` },
    });
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
      integration.insecure ?? false
    );
    cached = { ticket, csrfToken, expires: now + 7200_000 };
    ticketCache.set(integrationId, cached);
  }

  const res = await fetch(apiUrl, {
    headers: { Cookie: `PVEAuthCookie=${cached.ticket}`, CSRFPreventionToken: cached.csrfToken },
  });
  return res.json();
}

function getInsecureDispatcher() {
  // Node 18+ undici dispatcher for self-signed certs
  try {
    // @ts-ignore
    const { Agent } = await import('undici');
    return new Agent({ connect: { rejectUnauthorized: false } });
  } catch {
    return undefined;
  }
}
