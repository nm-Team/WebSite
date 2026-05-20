# Visual Baselines

This folder stores baseline screenshots captured from the legacy PHP site for Phase 0 comparison.

## Capture prerequisites

1. Install PHP CLI and ensure `php` is available in PATH.
2. Start PHP baseline server:
   - `php -S 127.0.0.1:8080 src/test/php-router.php`
3. Build and preview Astro site:
   - `pnpm build`
   - `pnpm preview --host 127.0.0.1 --port 4321`

## Capture matrix

- Viewports: `390x844`, `768x1024`, `1440x1000`
- Locales: `en`, `zh-CN`, `zh-HK`, `ja-JP`, `zh-x-mars`
- JS mode: enabled and disabled

## Current status

- Baseline capture completed on 2026-05-20 (Asia/Shanghai).
- Captured artifacts:
  - `php/js-enabled`: 105 PNG + 105 HTML
  - `php/js-disabled`: 105 PNG + 105 HTML
  - `astro/js-enabled`: 105 PNG + 105 HTML
  - `astro/js-disabled`: 105 PNG + 105 HTML
