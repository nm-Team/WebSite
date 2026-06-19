import { describe, expect, it } from 'vitest';

import { t } from '@/i18n/translate';

describe('translate fallback', () => {
  it('returns key value from locale file when present', () => {
    expect(t('en', 'index.title')).not.toBe('index.title');
  });

  it('falls back to key for missing values', () => {
    expect(t('ja-JP', '__missing__.key')).toBe('__missing__.key');
  });
});
