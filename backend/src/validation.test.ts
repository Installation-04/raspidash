import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateRefreshInterval, sanitizeRestorePayload } from './validation.js';

describe('validateRefreshInterval', () => {
  it('accepts values within 5–3600', () => {
    assert.equal(validateRefreshInterval(30), 30);
    assert.equal(validateRefreshInterval(5), 5);
    assert.equal(validateRefreshInterval(3600), 3600);
    assert.equal(validateRefreshInterval('60'), 60);
  });

  it('rejects out-of-range, non-numeric, and missing values', () => {
    assert.equal(validateRefreshInterval(0), null);
    assert.equal(validateRefreshInterval(-5), null);
    assert.equal(validateRefreshInterval(4), null);
    assert.equal(validateRefreshInterval(3601), null);
    assert.equal(validateRefreshInterval(NaN), null);
    assert.equal(validateRefreshInterval(Infinity), null);
    assert.equal(validateRefreshInterval('fast'), null);
    assert.equal(validateRefreshInterval(undefined), null);
    assert.equal(validateRefreshInterval(null), null);
  });
});

describe('sanitizeRestorePayload', () => {
  const integration = { id: 'i1', type: 'pihole', name: 'Pi-hole', url: 'http://pi.hole' };
  const widget = { id: 'w1', type: 'clock', title: 'Clock', x: 0, y: 0, w: 3, h: 2 };

  it('accepts a valid backup and keeps known keys', () => {
    const result = sanitizeRestorePayload({
      integrations: [integration],
      widgets: [widget],
      theme: 'dark',
      themeId: 'nord',
      refreshInterval: 60,
      dashboardTitle: 'Home',
    });
    assert.ok(result);
    assert.equal(result.integrations.length, 1);
    assert.equal(result.widgets.length, 1);
    assert.equal((result as any).themeId, 'nord');
    assert.equal((result as any).dashboardTitle, 'Home');
    assert.equal(result.refreshInterval, 60);
  });

  it('strips unknown keys', () => {
    const result = sanitizeRestorePayload({
      integrations: [],
      widgets: [],
      maliciousField: { evil: true },
      __proto__ignored: 1,
    });
    assert.ok(result);
    assert.equal((result as any).maliciousField, undefined);
    assert.equal((result as any).__proto__ignored, undefined);
  });

  it('rejects payloads without integrations/widgets arrays', () => {
    assert.equal(sanitizeRestorePayload(null), null);
    assert.equal(sanitizeRestorePayload('a string'), null);
    assert.equal(sanitizeRestorePayload([]), null);
    assert.equal(sanitizeRestorePayload({}), null);
    assert.equal(sanitizeRestorePayload({ integrations: [], widgets: 'nope' }), null);
    assert.equal(sanitizeRestorePayload({ integrations: {}, widgets: [] }), null);
  });

  it('rejects malformed integration and widget entries', () => {
    assert.equal(
      sanitizeRestorePayload({ integrations: [{ id: 'x' }], widgets: [] }),
      null
    );
    assert.equal(
      sanitizeRestorePayload({ integrations: [], widgets: [{ id: 'w', type: 'clock', x: 'a', y: 0, w: 1, h: 1 }] }),
      null
    );
    assert.equal(
      sanitizeRestorePayload({ integrations: [null], widgets: [] }),
      null
    );
  });

  it('resets an invalid refreshInterval to the default', () => {
    const result = sanitizeRestorePayload({ integrations: [], widgets: [], refreshInterval: 0 });
    assert.ok(result);
    assert.equal(result.refreshInterval, 30);
  });
});
