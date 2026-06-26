declare module 'net-snmp' {
  const Version1: number;
  const Version2c: number;
  const Version3: number;

  const AuthProtocols: Record<string, number>;
  const PrivProtocols: Record<string, number>;
  const SecurityLevel: Record<string, number>;

  function createSession(target: string, community: string, options?: any): any;
  function createV3Session(target: string, user: any, options?: any): any;
  function isVarbindError(varbind: any): boolean;
}
