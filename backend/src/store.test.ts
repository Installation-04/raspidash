import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, readdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// DATA_PATH is read at module load, so set it before importing the store
const dir = mkdtempSync(join(tmpdir(), 'raspidash-store-'));
process.env.DATA_PATH = join(dir, 'nested', 'config.json');
const { loadConfig, saveConfig } = await import('./store.js');

describe('store', () => {
  after(() => rmSync(dir, { recursive: true, force: true }));

  it('returns defaults when no config file exists', () => {
    const config = loadConfig();
    assert.equal(config.theme, 'dark');
    assert.equal(config.refreshInterval, 30);
    assert.ok(Array.isArray(config.integrations));
  });

  it('round-trips a saved config, creating parent directories', () => {
    const config = loadConfig();
    config.refreshInterval = 120;
    config.integrations.push({ id: 'test', type: 'pihole', name: 'Test', url: 'http://x' });
    saveConfig(config);

    const reloaded = loadConfig();
    assert.equal(reloaded.refreshInterval, 120);
    assert.equal(reloaded.integrations[0].id, 'test');
  });

  it('does not leave a temp file behind after saving', () => {
    saveConfig(loadConfig());
    const files = readdirSync(join(dir, 'nested'));
    assert.deepEqual(files, ['config.json']);
  });

  it('writes valid pretty-printed JSON', () => {
    saveConfig(loadConfig());
    const raw = readFileSync(process.env.DATA_PATH!, 'utf-8');
    assert.doesNotThrow(() => JSON.parse(raw));
  });
});
