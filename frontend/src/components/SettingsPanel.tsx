import { useState } from 'react';
import {
  X, Plus, Trash2, ChevronRight,
  Server, HardDrive, Shield, Home, Container, Film,
  Activity, Globe, Tv, Clapperboard, Gauge, Cloud, GitBranch,
  Wifi, Lock, PlayCircle, BarChart2, Eye, Download, Radio,
  Music, Subtitles, Terminal, MonitorCheck, Cpu, Network,
} from 'lucide-react';
import { AppConfig, Integration } from '../types';
import { api } from '../api';
import { ThemeTab } from './settings/ThemeTab';
import { ColorsTab } from './settings/ColorsTab';
import { GeneralTab } from './settings/GeneralTab';
import { applyTheme, getTheme } from '../themes';

interface Props {
  config: AppConfig;
  onClose: () => void;
  onConfigChange: (config: AppConfig) => void;
}

type AuthMode = 'apikey' | 'userpass' | 'apikey_or_userpass';

interface IntConf {
  label: string;
  icon: React.ReactNode;
  color: string;
  urlPlaceholder?: string;
  authMode: AuthMode;
  apiKeyLabel?: string;
  apiKeyPlaceholder?: string;
  usernamePlaceholder?: string;
  note?: string;
}

const INT_CONFIG: Record<string, IntConf> = {
  proxmox: {
    label: 'Proxmox VE', icon: <Server size={15} />, color: '#E57000',
    urlPlaceholder: 'https://192.168.1.10:8006',
    authMode: 'apikey_or_userpass',
    apiKeyLabel: 'API Token', apiKeyPlaceholder: 'user@pam!tokenid=secret',
    note: 'Create a token under Datacenter → Permissions → API Tokens',
  },
  truenas: {
    label: 'TrueNAS', icon: <HardDrive size={15} />, color: '#0095D5',
    urlPlaceholder: 'https://192.168.1.10',
    authMode: 'apikey_or_userpass',
    apiKeyLabel: 'API Key', apiKeyPlaceholder: 'Generated API key',
    note: 'Settings → API Keys → Add',
  },
  pihole: {
    label: 'Pi-hole', icon: <Shield size={15} />, color: '#D42328',
    urlPlaceholder: 'http://192.168.1.10',
    authMode: 'apikey',
    apiKeyLabel: 'API Token / Password',
    apiKeyPlaceholder: 'Settings → API / Web interface → Show API token',
    note: 'Pi-hole v5: use your web password. v6+: use the API key from Settings → API.',
  },
  homeassistant: {
    label: 'Home Assistant', icon: <Home size={15} />, color: '#41BDF5',
    urlPlaceholder: 'http://homeassistant.local:8123',
    authMode: 'apikey',
    apiKeyLabel: 'Long-lived access token',
    apiKeyPlaceholder: 'eyJ...',
    note: 'Profile → Long-Lived Access Tokens → Create Token',
  },
  portainer: {
    label: 'Portainer', icon: <Container size={15} />, color: '#13BEF9',
    urlPlaceholder: 'https://192.168.1.10:9443',
    authMode: 'apikey_or_userpass',
    apiKeyLabel: 'API Key', apiKeyPlaceholder: 'ptr_...',
    note: 'Account → Access tokens → Add access token',
  },
  jellyfin: {
    label: 'Jellyfin', icon: <Film size={15} />, color: '#9B59B6',
    urlPlaceholder: 'http://192.168.1.10:8096',
    authMode: 'apikey_or_userpass',
    apiKeyLabel: 'API Key', apiKeyPlaceholder: 'Dashboard → Admin → API Keys → +',
  },
  uptimekuma: {
    label: 'Uptime Kuma', icon: <Activity size={15} />, color: '#5CDD8B',
    urlPlaceholder: 'http://192.168.1.10:3001',
    authMode: 'userpass',
    usernamePlaceholder: 'admin',
  },
  adguard: {
    label: 'AdGuard Home', icon: <Shield size={15} />, color: '#67B346',
    urlPlaceholder: 'http://192.168.1.10:3000',
    authMode: 'userpass',
    usernamePlaceholder: 'admin',
  },
  sonarr: {
    label: 'Sonarr', icon: <Tv size={15} />, color: '#3498DB',
    urlPlaceholder: 'http://192.168.1.10:8989',
    authMode: 'apikey',
    apiKeyLabel: 'API Key', apiKeyPlaceholder: 'Settings → General → Security → API Key',
  },
  radarr: {
    label: 'Radarr', icon: <Clapperboard size={15} />, color: '#F39C12',
    urlPlaceholder: 'http://192.168.1.10:7878',
    authMode: 'apikey',
    apiKeyLabel: 'API Key', apiKeyPlaceholder: 'Settings → General → Security → API Key',
  },
  speedtest: {
    label: 'Speedtest Tracker', icon: <Gauge size={15} />, color: '#00B4D8',
    urlPlaceholder: 'http://192.168.1.10:8765',
    authMode: 'apikey_or_userpass',
    apiKeyLabel: 'API Key', apiKeyPlaceholder: 'Settings → API',
  },
  nextcloud: {
    label: 'Nextcloud', icon: <Cloud size={15} />, color: '#0082C9',
    urlPlaceholder: 'https://cloud.example.com',
    authMode: 'userpass',
    usernamePlaceholder: 'admin',
    note: 'Use an App Password for better security (Settings → Security → App passwords)',
  },
  gitea: {
    label: 'Gitea', icon: <GitBranch size={15} />, color: '#609926',
    urlPlaceholder: 'http://192.168.1.10:3000',
    authMode: 'apikey_or_userpass',
    apiKeyLabel: 'Access Token', apiKeyPlaceholder: 'Profile → Settings → Applications → Token',
  },
  unifi: {
    label: 'UniFi', icon: <Wifi size={15} />, color: '#0059C6',
    urlPlaceholder: 'https://192.168.1.1',
    authMode: 'userpass',
    usernamePlaceholder: 'admin',
    note: 'Use a local admin account — not your Ubiquiti cloud account',
  },
  nginxpm: {
    label: 'Nginx Proxy Manager', icon: <Lock size={15} />, color: '#F15833',
    urlPlaceholder: 'http://192.168.1.10:81',
    authMode: 'userpass',
    usernamePlaceholder: 'admin@example.com',
    note: 'Default credentials: admin@example.com / changeme',
  },
  plex: {
    label: 'Plex', icon: <PlayCircle size={15} />, color: '#E5A00D',
    urlPlaceholder: 'http://192.168.1.10:32400',
    authMode: 'apikey',
    apiKeyLabel: 'Plex Token (X-Plex-Token)',
    apiKeyPlaceholder: 'xxxxxxxxxxxxxxxxxxxx',
    note: 'Find your token: plex.tv/web → account → XML file → X-Plex-Token attribute',
  },
  grafana: {
    label: 'Grafana', icon: <BarChart2 size={15} />, color: '#F46800',
    urlPlaceholder: 'http://192.168.1.10:3000',
    authMode: 'apikey',
    apiKeyLabel: 'Service Account Token', apiKeyPlaceholder: 'glsa_...',
    note: 'Administration → Service accounts → Add service account → Add token',
  },
  overseerr: {
    label: 'Overseerr', icon: <Eye size={15} />, color: '#E0AE5B',
    urlPlaceholder: 'http://192.168.1.10:5055',
    authMode: 'apikey',
    apiKeyLabel: 'API Key', apiKeyPlaceholder: 'Settings → General → API Key',
  },
  qbittorrent: {
    label: 'qBittorrent', icon: <Download size={15} />, color: '#2F67BA',
    urlPlaceholder: 'http://192.168.1.10:8080',
    authMode: 'userpass',
    usernamePlaceholder: 'admin',
    note: 'Tools → Options → Web UI → Authentication',
  },
  sabnzbd: {
    label: 'SABnzbd', icon: <Radio size={15} />, color: '#F5A623',
    urlPlaceholder: 'http://192.168.1.10:8080',
    authMode: 'apikey',
    apiKeyLabel: 'API Key', apiKeyPlaceholder: 'Config → General → SABnzbd API Key',
  },
  immich: {
    label: 'Immich', icon: <MonitorCheck size={15} />, color: '#4776E6',
    urlPlaceholder: 'http://192.168.1.10:2283',
    authMode: 'apikey',
    apiKeyLabel: 'API Key', apiKeyPlaceholder: 'User Settings → API Keys → New API Key',
  },
  synology: {
    label: 'Synology DSM', icon: <Cpu size={15} />, color: '#B5B5B6',
    urlPlaceholder: 'https://192.168.1.10:5001',
    authMode: 'userpass',
    usernamePlaceholder: 'admin',
    note: 'Use a dedicated user with limited permissions for better security',
  },
  prowlarr: {
    label: 'Prowlarr', icon: <Globe size={15} />, color: '#FF7F7F',
    urlPlaceholder: 'http://192.168.1.10:9696',
    authMode: 'apikey',
    apiKeyLabel: 'API Key', apiKeyPlaceholder: 'Settings → General → Security → API Key',
  },
  lidarr: {
    label: 'Lidarr', icon: <Music size={15} />, color: '#27A468',
    urlPlaceholder: 'http://192.168.1.10:8686',
    authMode: 'apikey',
    apiKeyLabel: 'API Key', apiKeyPlaceholder: 'Settings → General → Security → API Key',
  },
  bazarr: {
    label: 'Bazarr', icon: <Subtitles size={15} />, color: '#1A9CE0',
    urlPlaceholder: 'http://192.168.1.10:6767',
    authMode: 'apikey',
    apiKeyLabel: 'API Key', apiKeyPlaceholder: 'Settings → General → API Key',
  },
  cockpit: {
    label: 'Cockpit', icon: <Terminal size={15} />, color: '#0066CC',
    urlPlaceholder: 'https://192.168.1.10:9090',
    authMode: 'userpass',
    usernamePlaceholder: 'root',
    note: 'Use your Linux system username and password',
  },
  snmp: {
    label: 'SNMP Device', icon: <Network size={15} />, color: '#00AA88',
    urlPlaceholder: '192.168.1.1',
    authMode: 'apikey',
    apiKeyLabel: 'Community String', apiKeyPlaceholder: 'public',
    note: 'Enter the device IP. Use SNMPv3 for encrypted auth.',
  },
};

const EMPTY = {
  name: '', type: 'proxmox' as Integration['type'],
  url: '', username: '', password: '', apiKey: '', insecure: false,
  snmpVersion: '2c' as '1' | '2c' | '3',
  snmpPort: '161',
  snmpSecurityLevel: 'authPriv' as 'noAuthNoPriv' | 'authNoPriv' | 'authPriv',
  snmpAuthProtocol: 'sha' as 'md5' | 'sha' | 'sha256' | 'sha512',
  snmpPrivProtocol: 'aes' as 'des' | 'aes' | 'aes256b' | 'aes256r',
  snmpPrivPassword: '',
};

type Tab = 'integrations' | 'appearance' | 'general';

export function SettingsPanel({ config, onClose, onConfigChange }: Props) {
  const [tab, setTab] = useState<Tab>('integrations');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const conf = INT_CONFIG[form.type] ?? INT_CONFIG.proxmox;

  const resetForm = (type: Integration['type']) =>
    setForm({ ...EMPTY, type });

  const handleAdd = async () => {
    setSaving(true);
    try {
      const payload: any = { name: form.name, type: form.type, url: form.url, insecure: form.insecure };
      if (form.apiKey)    payload.apiKey = form.apiKey;
      if (form.username)  payload.username = form.username;
      if (form.password)  payload.password = form.password;
      if (form.type === 'snmp') {
        payload.options = {
          snmpVersion: form.snmpVersion,
          port: form.snmpPort,
          securityLevel: form.snmpSecurityLevel,
          authProtocol: form.snmpAuthProtocol,
          privProtocol: form.snmpPrivProtocol,
          ...(form.snmpPrivPassword ? { privPassword: form.snmpPrivPassword } : {}),
        };
      }
      const integration = await api.addIntegration(payload);
      onConfigChange({ ...config, integrations: [...config.integrations, integration] });
      setAdding(false);
      setForm(EMPTY);
    } catch (e: any) { alert('Error: ' + e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this integration?')) return;
    try {
      await api.deleteIntegration(id);
      onConfigChange({ ...config, integrations: config.integrations.filter(i => i.id !== id) });
    } catch (e: any) { alert(e.message); }
  };

  const handleThemeChange = async (themeId: string) => {
    applyTheme(getTheme(themeId).vars, config.customColors);
    onConfigChange({ ...config, themeId });
    api.saveTheme(themeId).catch(() => {});
  };

  const handleColorsChange = async (customColors: Record<string, string>) => {
    applyTheme(getTheme(config.themeId).vars, customColors);
    onConfigChange({ ...config, customColors });
    api.saveColors(customColors).catch(() => {});
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'integrations', label: 'Integrations' },
    { id: 'appearance',   label: 'Appearance' },
    { id: 'general',      label: 'General' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col animate-fade-in"
        style={{
          background: 'rgb(var(--color-bg-card) / 0.95)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgb(var(--color-bg-border) / 0.6)',
          boxShadow: '-20px 0 60px rgb(0 0 0 / 0.4)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgb(var(--color-bg-border) / 0.4)' }}>
          <div>
            <div className="font-semibold text-tx">Settings</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgb(var(--color-text-muted))' }}>Configure Raspidash</div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'rgb(var(--color-text-muted))' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgb(var(--color-text))'; (e.currentTarget as HTMLElement).style.background = 'rgb(var(--color-bg-border) / 0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgb(var(--color-text-muted))'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-5 gap-1 pt-3 pb-0"
          style={{ borderBottom: '1px solid rgb(var(--color-bg-border) / 0.4)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-3 py-2 text-sm font-medium rounded-t-lg transition-colors relative"
              style={tab === t.id
                ? { color: 'rgb(var(--color-accent))', borderBottom: '2px solid rgb(var(--color-accent))', marginBottom: '-1px' }
                : { color: 'rgb(var(--color-text-muted))' }}
              onMouseEnter={e => { if (tab !== t.id) (e.currentTarget as HTMLElement).style.color = 'rgb(var(--color-text))'; }}
              onMouseLeave={e => { if (tab !== t.id) (e.currentTarget as HTMLElement).style.color = 'rgb(var(--color-text-muted))'; }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5 flex flex-col gap-4">

          {/* INTEGRATIONS */}
          {tab === 'integrations' && (
            <>
              {config.integrations.length === 0 && !adding && (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2 opacity-30">🔌</div>
                  <div className="text-sm" style={{ color: 'rgb(var(--color-text-muted))' }}>No integrations yet</div>
                </div>
              )}

              {config.integrations.map(i => {
                const c = INT_CONFIG[i.type];
                const color = c?.color ?? 'rgb(var(--color-accent))';
                return (
                  <div key={i.id} className="flex items-center gap-3 p-3.5 rounded-xl transition-colors"
                    style={{ background: 'rgb(var(--color-bg) / 0.5)', border: '1px solid rgb(var(--color-bg-border) / 0.5)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${color}26`, color }}>
                      {c?.icon ?? <Globe size={15} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-tx truncate">{i.name}</div>
                      <div className="text-xs truncate" style={{ color: 'rgb(var(--color-text-muted))' }}>
                        {c?.label ?? i.type} · {i.url}
                      </div>
                    </div>
                    <button onClick={() => handleDelete(i.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors shrink-0"
                      style={{ color: 'rgb(var(--color-text-muted))' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgb(var(--color-red))'; (e.currentTarget as HTMLElement).style.background = 'rgb(var(--color-red) / 0.1)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgb(var(--color-text-muted))'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}

              {!adding ? (
                <button onClick={() => setAdding(true)}
                  className="flex items-center gap-2.5 p-3.5 rounded-xl transition-all text-sm"
                  style={{ border: '1.5px dashed rgb(var(--color-bg-border))', color: 'rgb(var(--color-text-muted))' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgb(var(--color-accent) / 0.5)'; (e.currentTarget as HTMLElement).style.color = 'rgb(var(--color-text))'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgb(var(--color-bg-border))'; (e.currentTarget as HTMLElement).style.color = 'rgb(var(--color-text-muted))'; }}>
                  <Plus size={15} />
                  <span>Add integration</span>
                  <ChevronRight size={13} className="ml-auto opacity-50" />
                </button>
              ) : (
                <IntegrationForm
                  form={form}
                  conf={conf}
                  saving={saving}
                  onChange={patch => setForm(f => ({ ...f, ...patch }))}
                  onTypeChange={type => resetForm(type as Integration['type'])}
                  onCancel={() => { setAdding(false); setForm(EMPTY); }}
                  onSave={handleAdd}
                />
              )}
            </>
          )}

          {/* APPEARANCE */}
          {tab === 'appearance' && (
            <div className="flex flex-col gap-6">
              <ThemeTab themeId={config.themeId || 'dark'} onChange={handleThemeChange} />
              <div className="pt-4" style={{ borderTop: '1px solid rgb(var(--color-bg-border) / 0.4)' }}>
                <ColorsTab
                  themeId={config.themeId || 'dark'}
                  customColors={config.customColors || {}}
                  onChange={handleColorsChange}
                  onReset={() => handleColorsChange({})}
                />
              </div>
            </div>
          )}

          {/* GENERAL */}
          {tab === 'general' && (
            <GeneralTab config={config} onChange={onConfigChange} />
          )}
        </div>
      </div>
    </>
  );
}

/* ── Dynamic integration form ── */

interface FormState {
  name: string; type: Integration['type'];
  url: string; username: string; password: string; apiKey: string; insecure: boolean;
  snmpVersion: '1' | '2c' | '3';
  snmpPort: string;
  snmpSecurityLevel: 'noAuthNoPriv' | 'authNoPriv' | 'authPriv';
  snmpAuthProtocol: 'md5' | 'sha' | 'sha256' | 'sha512';
  snmpPrivProtocol: 'des' | 'aes' | 'aes256b' | 'aes256r';
  snmpPrivPassword: string;
}

function IntegrationForm({ form, conf, saving, onChange, onTypeChange, onCancel, onSave }: {
  form: FormState; conf: IntConf; saving: boolean;
  onChange: (patch: Partial<FormState>) => void;
  onTypeChange: (type: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const canSave = !!form.name && !!form.url && (() => {
    if (form.type === 'snmp') {
      if (form.snmpVersion !== '3') return !!form.apiKey; // community
      if (form.snmpSecurityLevel === 'noAuthNoPriv') return !!form.username;
      return !!form.username && !!form.password;
    }
    if (conf.authMode === 'userpass') return !!form.username && !!form.password;
    if (conf.authMode === 'apikey')   return !!form.apiKey;
    return !!(form.apiKey || (form.username && form.password));
  })();

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl"
      style={{ background: 'rgb(var(--color-bg) / 0.5)', border: '1px solid rgb(var(--color-bg-border) / 0.5)' }}>

      {/* Type picker with icon grid */}
      <div>
        <label className="text-xs font-medium mb-2 block" style={{ color: 'rgb(var(--color-text-muted))' }}>Integration type</label>
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {Object.entries(INT_CONFIG).map(([key, c]) => (
            <button key={key} onClick={() => onTypeChange(key)}
              className="flex flex-col items-center gap-1 p-2 rounded-lg text-center transition-all"
              style={form.type === key
                ? { background: `${c.color}26`, border: `1px solid ${c.color}66`, color: c.color }
                : { background: 'rgb(var(--color-bg) / 0.4)', border: '1px solid rgb(var(--color-bg-border) / 0.4)', color: 'rgb(var(--color-text-muted))' }}
              title={c.label}>
              <span style={{ color: form.type === key ? c.color : 'rgb(var(--color-text-muted))' }}>{c.icon}</span>
              <span style={{ fontSize: '9px', fontWeight: 600, lineHeight: 1.2 }}>{c.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Selected type header */}
        <div className="flex items-center gap-2 mb-3 pb-3"
          style={{ borderBottom: '1px solid rgb(var(--color-bg-border) / 0.4)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${conf.color}26`, color: conf.color }}>
            {conf.icon}
          </div>
          <div>
            <div className="text-sm font-semibold text-tx">{conf.label}</div>
            {conf.note && (
              <div className="text-xs mt-0.5" style={{ color: 'rgb(var(--color-text-muted))' }}>{conf.note}</div>
            )}
          </div>
        </div>
      </div>

      <F label="Display name">
        <input className="input" placeholder={`My ${conf.label}`}
          value={form.name} onChange={e => onChange({ name: e.target.value })} />
      </F>

      <F label="URL">
        <input className="input" placeholder={conf.urlPlaceholder ?? 'http://192.168.1.10'}
          value={form.url} onChange={e => onChange({ url: e.target.value })} />
      </F>

      {/* SNMP version + port */}
      {form.type === 'snmp' && (
        <div className="flex gap-2">
          <F label="SNMP Version">
            <select className="input" value={form.snmpVersion} onChange={e => onChange({ snmpVersion: e.target.value as any })}>
              <option value="1">v1</option>
              <option value="2c">v2c</option>
              <option value="3">v3</option>
            </select>
          </F>
          <F label="Port">
            <input className="input" placeholder="161" value={form.snmpPort} onChange={e => onChange({ snmpPort: e.target.value })} />
          </F>
        </div>
      )}

      {/* API key field (community string for SNMP v1/v2c) */}
      {(conf.authMode === 'apikey' || conf.authMode === 'apikey_or_userpass') && form.type !== 'snmp' && (
        <F label={conf.apiKeyLabel ?? 'API Key'}>
          <input className="input" placeholder={conf.apiKeyPlaceholder ?? 'Paste your API key'}
            value={form.apiKey} onChange={e => onChange({ apiKey: e.target.value })} />
        </F>
      )}
      {/* Community string — only shown for v1/v2c */}
      {form.type === 'snmp' && form.snmpVersion !== '3' && (
        <F label="Community String">
          <input className="input" placeholder="public"
            value={form.apiKey} onChange={e => onChange({ apiKey: e.target.value })} />
        </F>
      )}

      {/* Divider for optional username/password */}
      {conf.authMode === 'apikey_or_userpass' && (
        <div className="flex items-center gap-2 my-1">
          <div className="flex-1 h-px" style={{ background: 'rgb(var(--color-bg-border) / 0.5)' }} />
          <span className="text-xs" style={{ color: 'rgb(var(--color-text-muted))' }}>or username / password</span>
          <div className="flex-1 h-px" style={{ background: 'rgb(var(--color-bg-border) / 0.5)' }} />
        </div>
      )}

      {/* Username / password */}
      {(conf.authMode === 'userpass' || conf.authMode === 'apikey_or_userpass') && form.type !== 'snmp' && (
        <>
          <F label="Username">
            <input className="input" placeholder={conf.usernamePlaceholder ?? 'admin'}
              value={form.username} onChange={e => onChange({ username: e.target.value })} />
          </F>
          <F label="Password">
            <input type="password" className="input"
              value={form.password} onChange={e => onChange({ password: e.target.value })} />
          </F>
        </>
      )}

      {/* SNMPv3 auth */}
      {form.type === 'snmp' && form.snmpVersion === '3' && (
        <>
          <F label="Security Name (Username)">
            <input className="input" placeholder="snmpuser"
              value={form.username} onChange={e => onChange({ username: e.target.value })} />
          </F>
          <F label="Security Level">
            <select className="input" value={form.snmpSecurityLevel} onChange={e => onChange({ snmpSecurityLevel: e.target.value as any })}>
              <option value="noAuthNoPriv">noAuthNoPriv — No auth, no encryption</option>
              <option value="authNoPriv">authNoPriv — Auth only</option>
              <option value="authPriv">authPriv — Auth + encryption</option>
            </select>
          </F>
          {form.snmpSecurityLevel !== 'noAuthNoPriv' && (
            <>
              <div className="flex gap-2">
                <F label="Auth Protocol">
                  <select className="input" value={form.snmpAuthProtocol} onChange={e => onChange({ snmpAuthProtocol: e.target.value as any })}>
                    <option value="md5">MD5</option>
                    <option value="sha">SHA-1</option>
                    <option value="sha256">SHA-256</option>
                    <option value="sha512">SHA-512</option>
                  </select>
                </F>
                <F label="Auth Password">
                  <input type="password" className="input" placeholder="Min 8 chars"
                    value={form.password} onChange={e => onChange({ password: e.target.value })} />
                </F>
              </div>
            </>
          )}
          {form.snmpSecurityLevel === 'authPriv' && (
            <div className="flex gap-2">
              <F label="Privacy Protocol">
                <select className="input" value={form.snmpPrivProtocol} onChange={e => onChange({ snmpPrivProtocol: e.target.value as any })}>
                  <option value="des">DES</option>
                  <option value="aes">AES-128</option>
                  <option value="aes256b">AES-256 (Blumenthal)</option>
                  <option value="aes256r">AES-256 (Reeder)</option>
                </select>
              </F>
              <F label="Privacy Password">
                <input type="password" className="input" placeholder="Min 8 chars"
                  value={form.snmpPrivPassword} onChange={e => onChange({ snmpPrivPassword: e.target.value })} />
              </F>
            </div>
          )}
        </>
      )}

      <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'rgb(var(--color-text-muted))' }}>
        <input type="checkbox" checked={form.insecure} onChange={e => onChange({ insecure: e.target.checked })} />
        Allow self-signed certificates
      </label>

      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 py-2 text-sm rounded-xl transition-colors"
          style={{ border: '1px solid rgb(var(--color-bg-border))', color: 'rgb(var(--color-text-muted))' }}>
          Cancel
        </button>
        <button onClick={onSave} disabled={saving || !canSave}
          className="flex-1 py-2 text-sm font-medium rounded-xl text-white transition-all disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, rgb(var(--color-accent)), rgb(var(--color-accent) / 0.7))` }}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function F({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgb(var(--color-text-muted))' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
