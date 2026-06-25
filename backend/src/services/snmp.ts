import snmp from 'net-snmp';
import { loadConfig } from '../store.js';

// Standard MIB-II OIDs
export const OIDS = {
  sysDescr:    '1.3.6.1.2.1.1.1.0',
  sysUpTime:   '1.3.6.1.2.1.1.3.0',
  sysContact:  '1.3.6.1.2.1.1.4.0',
  sysName:     '1.3.6.1.2.1.1.5.0',
  sysLocation: '1.3.6.1.2.1.1.6.0',
  // Interface table (first iface)
  ifNumber:    '1.3.6.1.2.1.2.1.0',
  // HOST-RESOURCES-MIB
  hrProcessorLoad:   '1.3.6.1.2.1.25.3.3.1.2.1',
  hrStorageSizeBase: '1.3.6.1.2.1.25.2.3.1.4.1',
  hrStorageUsed:     '1.3.6.1.2.1.25.2.3.1.6.1',
  hrMemorySize:      '1.3.6.1.2.1.25.2.2.0',
};

function snmpVersion(v: string) {
  if (v === '1')  return snmp.Version1;
  if (v === '3')  return snmp.Version3;
  return snmp.Version2c;
}

function authProtocol(p: string) {
  if (p === 'sha')    return snmp.AuthProtocols.sha;
  if (p === 'sha256') return snmp.AuthProtocols.sha256;
  if (p === 'sha512') return snmp.AuthProtocols.sha512;
  return snmp.AuthProtocols.md5;
}

function privProtocol(p: string) {
  if (p === 'des')     return snmp.PrivProtocols.des;
  if (p === 'aes256b') return snmp.PrivProtocols.aes256b;
  if (p === 'aes256r') return snmp.PrivProtocols.aes256r;
  return snmp.PrivProtocols.aes;
}

function secLevel(l: string) {
  if (l === 'noAuthNoPriv') return snmp.SecurityLevel.noAuthNoPriv;
  if (l === 'authNoPriv')   return snmp.SecurityLevel.authNoPriv;
  return snmp.SecurityLevel.authPriv;
}

function makeSession(integration: any): any {
  const host = integration.url.replace(/^(snmp:\/\/|udp:\/\/)/, '').split(':')[0];
  const port = parseInt(integration.options?.port ?? '161', 10);
  const version = integration.options?.snmpVersion ?? '2c';

  if (version === '3') {
    const level = integration.options?.securityLevel ?? 'authPriv';
    const user: any = {
      name: integration.username ?? '',
      level: secLevel(level),
    };
    if (level !== 'noAuthNoPriv') {
      user.authProtocol = authProtocol(integration.options?.authProtocol ?? 'sha');
      user.authKey = integration.password ?? '';
    }
    if (level === 'authPriv') {
      user.privProtocol = privProtocol(integration.options?.privProtocol ?? 'aes');
      user.privKey = integration.options?.privPassword ?? '';
    }
    return snmp.createV3Session(host, user, { port, timeout: 5000, retries: 1 });
  }

  return snmp.createSession(host, integration.apiKey ?? 'public', {
    version: snmpVersion(version),
    port, timeout: 5000, retries: 1,
  });
}

function snmpGet(session: any, oids: string[]): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    session.get(oids, (error: any, varbinds: any[]) => {
      session.close();
      if (error) { reject(error); return; }
      const result: Record<string, any> = {};
      for (const vb of varbinds) {
        if (snmp.isVarbindError(vb)) continue;
        const raw = vb.value;
        result[vb.oid] = Buffer.isBuffer(raw)
          ? raw.toString('utf8').replace(/\0/g, '')
          : raw;
      }
      resolve(result);
    });
  });
}

export async function snmpSummary(integrationId: string) {
  const config = loadConfig();
  const integration = config.integrations.find(i => i.id === integrationId);
  if (!integration) throw new Error('Integration not found');

  const session = makeSession(integration);
  const data = await snmpGet(session, Object.values(OIDS));

  const uptimeCentiseconds = data[OIDS.sysUpTime] ?? 0;
  const uptimeSeconds = Math.floor(uptimeCentiseconds / 100);

  return {
    sysDescr:    (data[OIDS.sysDescr] ?? '').split('\n')[0].trim(),
    sysName:     data[OIDS.sysName] ?? '',
    sysLocation: data[OIDS.sysLocation] ?? '',
    sysContact:  data[OIDS.sysContact] ?? '',
    sysUpTime:   uptimeSeconds,
    ifNumber:    data[OIDS.ifNumber] ?? 0,
    cpuLoad:     data[OIDS.hrProcessorLoad] ?? null,
    memTotal:    data[OIDS.hrMemorySize] ?? null,
    storageSize: data[OIDS.hrStorageSizeBase] ?? null,
    storageUsed: data[OIDS.hrStorageUsed] ?? null,
  };
}
