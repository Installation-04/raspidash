export interface Theme {
  id: string;
  name: string;
  vars: Record<string, string>;
}

// Values are space-separated RGB components for Tailwind's rgb(.../<alpha>) syntax
export const THEMES: Theme[] = [
  {
    id: 'dark',
    name: 'Dark',
    vars: {
      '--color-bg':          '26 26 46',
      '--color-bg-card':     '22 33 62',
      '--color-bg-border':   '15 52 96',
      '--color-accent':      '233 69 96',
      '--color-blue':        '76 201 240',
      '--color-green':       '74 222 128',
      '--color-yellow':      '250 204 21',
      '--color-red':         '248 113 113',
      '--color-text':        '255 255 255',
      '--color-text-muted':  '156 163 175',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    vars: {
      '--color-bg':          '5 5 15',
      '--color-bg-card':     '10 10 25',
      '--color-bg-border':   '30 30 60',
      '--color-accent':      '123 97 255',
      '--color-blue':        '99 179 237',
      '--color-green':       '72 213 151',
      '--color-yellow':      '246 173 85',
      '--color-red':         '252 129 129',
      '--color-text':        '226 232 240',
      '--color-text-muted':  '113 128 150',
    },
  },
  {
    id: 'amoled',
    name: 'AMOLED',
    vars: {
      '--color-bg':          '0 0 0',
      '--color-bg-card':     '10 10 10',
      '--color-bg-border':   '30 30 30',
      '--color-accent':      '0 200 83',
      '--color-blue':        '33 150 243',
      '--color-green':       '0 200 83',
      '--color-yellow':      '255 193 7',
      '--color-red':         '244 67 54',
      '--color-text':        '255 255 255',
      '--color-text-muted':  '117 117 117',
    },
  },
  {
    id: 'nord',
    name: 'Nord',
    vars: {
      '--color-bg':          '36 41 51',
      '--color-bg-card':     '46 52 64',
      '--color-bg-border':   '59 66 82',
      '--color-accent':      '136 192 208',
      '--color-blue':        '129 161 193',
      '--color-green':       '163 190 140',
      '--color-yellow':      '235 203 139',
      '--color-red':         '191 97 106',
      '--color-text':        '236 239 244',
      '--color-text-muted':  '144 153 166',
    },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    vars: {
      '--color-bg':          '40 42 54',
      '--color-bg-card':     '33 34 44',
      '--color-bg-border':   '68 71 90',
      '--color-accent':      '255 121 198',
      '--color-blue':        '139 233 253',
      '--color-green':       '80 250 123',
      '--color-yellow':      '241 250 140',
      '--color-red':         '255 85 85',
      '--color-text':        '248 248 242',
      '--color-text-muted':  '98 114 164',
    },
  },
  {
    id: 'catppuccin',
    name: 'Catppuccin',
    vars: {
      '--color-bg':          '30 30 46',
      '--color-bg-card':     '36 36 54',
      '--color-bg-border':   '49 50 68',
      '--color-accent':      '203 166 247',
      '--color-blue':        '137 220 235',
      '--color-green':       '166 227 161',
      '--color-yellow':      '249 226 175',
      '--color-red':         '243 139 168',
      '--color-text':        '205 214 244',
      '--color-text-muted':  '108 112 134',
    },
  },
  {
    id: 'gruvbox',
    name: 'Gruvbox',
    vars: {
      '--color-bg':          '40 40 40',
      '--color-bg-card':     '50 48 47',
      '--color-bg-border':   '80 73 69',
      '--color-accent':      '215 153 33',
      '--color-blue':        '131 165 152',
      '--color-green':       '184 187 38',
      '--color-yellow':      '215 153 33',
      '--color-red':         '204 36 29',
      '--color-text':        '235 219 178',
      '--color-text-muted':  '146 131 116',
    },
  },
  {
    id: 'tokyo',
    name: 'Tokyo Night',
    vars: {
      '--color-bg':          '26 27 38',
      '--color-bg-card':     '31 32 47',
      '--color-bg-border':   '41 46 66',
      '--color-accent':      '122 162 247',
      '--color-blue':        '125 207 255',
      '--color-green':       '158 206 106',
      '--color-yellow':      '224 175 104',
      '--color-red':         '247 118 142',
      '--color-text':        '192 202 245',
      '--color-text-muted':  '86 95 137',
    },
  },
  {
    id: 'light',
    name: 'Light',
    vars: {
      '--color-bg':          '241 245 249',
      '--color-bg-card':     '255 255 255',
      '--color-bg-border':   '203 213 225',
      '--color-accent':      '99 102 241',
      '--color-blue':        '14 165 233',
      '--color-green':       '34 197 94',
      '--color-yellow':      '234 179 8',
      '--color-red':         '239 68 68',
      '--color-text':        '15 23 42',
      '--color-text-muted':  '100 116 139',
    },
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    vars: {
      '--color-bg':          '10 5 30',
      '--color-bg-card':     '20 10 50',
      '--color-bg-border':   '80 20 120',
      '--color-accent':      '255 0 200',
      '--color-blue':        '0 220 255',
      '--color-green':       '0 255 180',
      '--color-yellow':      '255 210 0',
      '--color-red':         '255 50 100',
      '--color-text':        '255 220 255',
      '--color-text-muted':  '180 100 200',
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    vars: {
      '--color-bg':          '5 0 20',
      '--color-bg-card':     '12 0 35',
      '--color-bg-border':   '255 215 0',
      '--color-accent':      '255 215 0',
      '--color-blue':        '0 240 255',
      '--color-green':       '57 255 20',
      '--color-yellow':      '255 215 0',
      '--color-red':         '255 10 84',
      '--color-text':        '255 255 255',
      '--color-text-muted':  '180 140 255',
    },
  },
  {
    id: 'halo',
    name: 'Halo',
    vars: {
      '--color-bg':          '8 14 10',
      '--color-bg-card':     '12 22 16',
      '--color-bg-border':   '30 70 45',
      '--color-accent':      '0 188 120',
      '--color-blue':        '80 180 220',
      '--color-green':       '0 210 100',
      '--color-yellow':      '200 170 60',
      '--color-red':         '210 60 60',
      '--color-text':        '200 230 210',
      '--color-text-muted':  '90 130 100',
    },
  },
  {
    id: 'matrix',
    name: 'Matrix',
    vars: {
      '--color-bg':          '0 5 0',
      '--color-bg-card':     '0 12 0',
      '--color-bg-border':   '0 80 0',
      '--color-accent':      '0 255 65',
      '--color-blue':        '0 200 50',
      '--color-green':       '0 255 65',
      '--color-yellow':      '120 255 0',
      '--color-red':         '255 0 65',
      '--color-text':        '0 255 65',
      '--color-text-muted':  '0 140 30',
    },
  },
  {
    id: 'solarized',
    name: 'Solarized',
    vars: {
      '--color-bg':          '0 43 54',
      '--color-bg-card':     '7 54 66',
      '--color-bg-border':   '88 110 117',
      '--color-accent':      '38 139 210',
      '--color-blue':        '38 139 210',
      '--color-green':       '133 153 0',
      '--color-yellow':      '181 137 0',
      '--color-red':         '220 50 47',
      '--color-text':        '131 148 150',
      '--color-text-muted':  '88 110 117',
    },
  },
];

export const DEFAULT_THEME_ID = 'dark';

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function applyTheme(vars: Record<string, string>, customColors?: Record<string, string>) {
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  if (customColors) {
    Object.entries(customColors).forEach(([k, v]) => root.style.setProperty(k, hexToRgb(v)));
  }
}

export function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
}

export function rgbToHex(rgb: string): string {
  const [r, g, b] = rgb.split(' ').map(Number);
  return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');
}

export const COLOR_SLOTS: { key: string; label: string }[] = [
  { key: '--color-bg',         label: 'Background' },
  { key: '--color-bg-card',    label: 'Card Background' },
  { key: '--color-bg-border',  label: 'Border' },
  { key: '--color-accent',     label: 'Accent' },
  { key: '--color-blue',       label: 'Blue' },
  { key: '--color-green',      label: 'Green' },
  { key: '--color-yellow',     label: 'Yellow' },
  { key: '--color-red',        label: 'Red' },
  { key: '--color-text',       label: 'Text' },
  { key: '--color-text-muted', label: 'Muted Text' },
];
