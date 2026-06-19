import { describe, expect, it } from 'vitest';

import {
  getNmBotText,
  nmBotAsset,
  type NmBotTextContext,
  renderNmBotTextValue,
  stripNmBotHelperMarkup,
} from '@/components/products/nmbot/nmBotText';

describe('nmBot text helpers', () => {
  it('preserves footer notes, no-wrap segmentation, and punctuation markers', () => {
    const context: NmBotTextContext = { footerNotes: [] };
    const html = renderNmBotTextValue('Alpha|Beta。[footer:Legacy note]', context);

    expect(html).toContain('<nobr>Alpha</nobr>');
    expect(html).toContain('<nobr>Beta<bs>。</bs><sup>');
    expect(html).toContain('id="footer-note-sup-1"');
    expect(context.footerNotes).toEqual([{ id: 1, html: 'Legacy note' }]);
  });

  it('keeps translated text stable after stripping intentional helper markup', () => {
    const raw = getNmBotText('zh-CN', 'products.nmbot_telegram.features.content_1');
    const context: NmBotTextContext = { footerNotes: [] };
    const rendered = renderNmBotTextValue(raw, context);

    expect(stripNmBotHelperMarkup(rendered)).toBe(stripNmBotHelperMarkup(raw));
  });

  it('keeps PHP remote asset URLs unchanged', () => {
    expect(nmBotAsset('website intro header background.png')).toBe(
      'https://websiteres.nmteam.xyz/pintroimg/nmBot-Telegram/v2/website intro header background.png',
    );
  });
});
