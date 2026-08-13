import { type NmBotTextContext,renderNmBotText } from '@/components/products/nmbot/nmBotText';
import type { PublicLocale } from '@/i18n/locales';

/**
 * Build the server-rendered product header bar shown inside the global site
 * header once the user scrolls past the hero on the nmBot intro page.
 */
export function buildNmBotProductHeaderHtml(locale: PublicLocale): string {
  const context: NmBotTextContext = { footerNotes: [] };
  const name = renderNmBotText(locale, 'products.nmbot_telegram.header_name', context);
  const panel = renderNmBotText(locale, 'products.nmbot_telegram.go_to_panel', context);
  const start = renderNmBotText(locale, 'products.nmbot_telegram.start_use', context);
  return `
    <div class="product-header-inner">
      <div class="product-name">${name}</div>
      <div class="action-buttons">
        <a href="https://nmbot.nmnm.fun?ref=nmBotHeader" target="_blank" rel="noopener noreferrer" class="action-button">${panel}</a>
        <a href="https://t.me/nmnmfunbot" target="_blank" rel="noopener noreferrer" class="action-button primary">${start}</a>
      </div>
    </div>
  `.trim();
}
