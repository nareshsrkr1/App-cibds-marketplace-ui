import { describe, expect, it } from 'vitest';
import { adaptConsolePanel } from './workspace.adapter';

describe('adaptConsolePanel', () => {
  it('strips script tags and event handler attributes from subtitleHtml', () => {
    const result = adaptConsolePanel({
      persona: 'producer',
      panel: {
        id: 'subs',
        title: 'Subscription requests',
        items: [
          {
            id: 'r1',
            title: 'Market Risk',
            subtitleHtml:
              'wants <b onclick="alert(1)">Endur P&amp;L</b><script>alert(1)</script>',
          },
        ],
      },
    });

    const html = result.panel.items[0].subtitleHtml ?? '';
    expect(html).not.toContain('<script');
    expect(html).not.toContain('onclick');
    expect(html).toContain('<b>Endur P&amp;L</b>');
  });

  it('keeps the allowed inline markup (b, span.mono) intact', () => {
    const result = adaptConsolePanel({
      persona: 'producer',
      panel: {
        id: 'subs',
        title: 'Subscription requests',
        items: [
          {
            id: 'r1',
            title: 'Market Risk',
            subtitleHtml: 'wants <b>Endur P&amp;L</b> · <span class="mono">DS-CIB-40121</span>',
          },
        ],
      },
    });

    expect(result.panel.items[0].subtitleHtml).toBe(
      'wants <b>Endur P&amp;L</b> · <span class="mono">DS-CIB-40121</span>',
    );
  });
});
