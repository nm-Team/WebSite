# PHP to Astro Migration Plan

## Executive Summary

The Astro migration is feasible, but it should be executed as a verified static-site migration, not as a blind rewrite. Current PHP output, locale JSON, product JSON, and screenshots must remain the source of truth throughout the process.

Recommended direction:

1. Build the public website as a static Astro site deployable to Cloudflare Pages.
2. Keep dynamic PHP systems such as questionnaires and support search outside this migration unless they are rebuilt separately.
3. Migrate public language URLs from legacy underscore IDs to hyphenated public language tags.
4. Keep root URLs such as `/aboutus/` as full English pages for crawler fallback, with a small validated client-side redirect for real users who prefer another language.
5. Provide canonical prefixed URLs such as `/en/aboutus/` and `/zh-CN/aboutus/` that never auto-redirect.
6. Validate every migrated page by running the current PHP site and the Astro site side by side.

## Verified Repository Facts

| Area | Current state |
|---|---|
| PHP files | 30 PHP files are present. |
| Largest page | `products/template/nmBot-Telegram.php` has 1,635 lines. |
| Legacy locale IDs | `zh_CN`, `zh_HK`, `en_US`, `ja_JP`, `hu_MA`. |
| Legacy locale files | `src/locales/zh_CN.json`, `zh_HK.json`, `en_US.json`, `ja_JP.json`, `hu_MA.json`. |
| Legacy cookie | The current language cookie is `lang`; value can also be `auto`. |
| Legacy language selection | PHP reads `?lan=...`, then `lang` cookie, then `HTTP_ACCEPT_LANGUAGE`, then falls back to `en_US`. |
| Legacy i18n fallback | Translation lookup falls back through current language, `en_US`, then `zh_CN`. |
| Product overview route | `.htaccess` rewrites `/products/overview/{product}` to `products/overview.php?product={product}`. |
| Product data | Product listing and generic product detail pages read `src/json/products/{legacyLocale}/...`. |
| nmBot page | `products/template/nmBot-Telegram.php` is custom PHP using locale keys under `products.nmbot_telegram` plus remote image assets. |
| Dynamic systems | `blackboard/questionnaire/*` and `blackboard/support_doc_search/search.php` require runtime PHP behavior. |
| Build tooling | No root `package.json` or lockfile exists today; `pnpm` is appropriate for the new Astro project. |

## Language URL Model

### Public language tags

Use hyphenated public language tags for URLs and HTML metadata. Keep legacy IDs only as internal file/data aliases while migrating existing JSON.

| Legacy ID | Public URL tag | HTML `lang` | `hreflang` | Notes |
|---|---|---|---|---|
| `en_US` | `en` | `en` | `en` | Use short default English tag unless a US-specific distinction is required. |
| `zh_CN` | `zh-CN` | `zh-CN` | `zh-CN` | Simplified Chinese. |
| `zh_HK` | `zh-HK` | `zh-HK` | `zh-HK` | Traditional Chinese as currently represented by the repository. |
| `ja_JP` | `ja-JP` | `ja-JP` | `ja-JP` | Japanese. |
| `hu_MA` | `zh-x-mars` | `zh-x-mars` | omit or test carefully | "火星文" is a Chinese stylistic variant, not Hungarian/Morocco. `zh-x-mars` is a standards-friendly private-use BCP 47 tag. Avoid `hu-MA`. |

Notes:

- `zh-Mars` is readable, but it is not a standard BCP 47 language tag. If readability matters, it can be accepted as a route alias that redirects to `/zh-x-mars/...`.
- Keep a central mapping from public tag to legacy data folder. Do not rename all JSON files in the first pass unless there is a separate mechanical migration and test.
- If search engines do not accept `zh-x-mars` in `hreflang`, omit the 火星文 alternate from SEO tags while still serving the route for users.

Example mapping:

```ts
export const publicLocales = ['en', 'zh-CN', 'zh-HK', 'ja-JP', 'zh-x-mars'] as const;
export type PublicLocale = (typeof publicLocales)[number];

export const defaultLocale: PublicLocale = 'en';

export const localeDataMap: Record<PublicLocale, string> = {
  en: 'en_US',
  'zh-CN': 'zh_CN',
  'zh-HK': 'zh_HK',
  'ja-JP': 'ja_JP',
  'zh-x-mars': 'hu_MA',
};

export const localeLabels: Record<PublicLocale, string> = {
  en: 'English',
  'zh-CN': '中文（简体）',
  'zh-HK': '中文（繁体）',
  'ja-JP': '日本語',
  'zh-x-mars': '焱暒妏',
};
```

## URL Strategy

### Desired behavior

Root URLs contain complete English content and may redirect users based on saved/browser language:

```text
/aboutus/
  - HTML contains the full English page.
  - Search crawlers and no-JS clients can read the English page.
  - Real users with saved or detected non-English preference are redirected to the matching prefixed URL.

/en/aboutus/
  - Full English page.
  - Never auto-redirects.

/zh-CN/aboutus/
  - Full Simplified Chinese page.
  - Never auto-redirects.
```

This gives three useful properties:

1. Existing/root URLs remain useful and crawlable.
2. Users can share stable language-specific URLs.
3. Automatic language detection is isolated to unprefixed root URLs only.

### Generated route shape

```text
/                                      English fallback homepage + optional redirect
/aboutus/                              English fallback about page + optional redirect
/products/
/products/overview/nmBot-Telegram/

/en/
/en/aboutus/
/en/products/
/en/products/overview/nmBot-Telegram/

/zh-CN/
/zh-CN/aboutus/
/zh-CN/products/
/zh-CN/products/overview/nmBot-Telegram/

/zh-HK/...
/ja-JP/...
/zh-x-mars/...
```

### Redirect rules

Only unprefixed routes run automatic language redirects. Prefixed routes never redirect based on language preference.

Redirect priority:

1. If URL is already prefixed with a supported language tag, do nothing.
2. If `?lang=` or `?lan=` is present and valid, set `lang` cookie and redirect to that language's prefixed URL.
3. If `lang` cookie is valid and not `auto`, redirect to that language's prefixed URL.
4. If `lang=auto` or no cookie exists, inspect `navigator.languages`.
5. If no supported non-English language is detected, stay on the root English page.

The redirect script must be small, synchronous, validated, and included only on unprefixed pages.

```js
(() => {
  const locales = ['en', 'zh-CN', 'zh-HK', 'ja-JP', 'zh-x-mars'];
  const aliases = {
    en_US: 'en',
    zh_CN: 'zh-CN',
    zh_HK: 'zh-HK',
    ja_JP: 'ja-JP',
    hu_MA: 'zh-x-mars',
    zh: 'zh-CN',
    ja: 'ja-JP',
  };

  const first = location.pathname.split('/').filter(Boolean)[0];
  if (locales.includes(first)) return;

  const normalize = (value) => {
    if (!value) return '';
    const normalized = aliases[value] || aliases[value.replace('-', '_')] || value;
    if (locales.includes(normalized)) return normalized;
    if (normalized.toLowerCase().startsWith('zh-hk')) return 'zh-HK';
    if (normalized.toLowerCase().startsWith('zh')) return 'zh-CN';
    if (normalized.toLowerCase().startsWith('ja')) return 'ja-JP';
    if (normalized.toLowerCase().startsWith('en')) return 'en';
    return '';
  };

  const params = new URLSearchParams(location.search);
  const requested = normalize(params.get('lang') || params.get('lan'));
  const cookieMatch = document.cookie.match(/(?:^|;\s*)lang=([^;]*)/);
  const cookie = cookieMatch ? decodeURIComponent(cookieMatch[1]) : '';
  const saved = cookie === 'auto' ? '' : normalize(cookie);
  const detected = (navigator.languages || [navigator.language])
    .map(normalize)
    .find(Boolean);

  const target = requested || saved || detected || 'en';
  if (target === 'en') return;

  document.cookie = `lang=${encodeURIComponent(target)};path=/;max-age=999999999`;
  location.replace(`/${target}${location.pathname}${location.search}${location.hash}`);
})();
```

Implementation notes:

- Prefer `lang` as the cookie name for backward compatibility.
- Accept old cookie values such as `zh_CN` and immediately normalize them to the new public tag.
- Do not redirect unknown language values.
- Do not use this script on `/en/...`, `/zh-CN/...`, `/zh-HK/...`, `/ja-JP/...`, or `/zh-x-mars/...`.
- The root page should mark itself as canonical only if the SEO decision is to keep root English URLs canonical. Otherwise canonicalize English to `/en/...` and leave root as compatibility fallback.

### Legacy URL redirects (`_redirects`)

Current `.htaccess` rewrites `/products/overview/{product}` to `products/overview.php?product={product}`. After migration the pattern reverses: the clean URL is canonical and legacy query-parameter URLs must redirect.

Required `_redirects` entries:

```text
/products/overview.php?product=:product  /products/overview/:product  301
/products/overview?product=:product      /products/overview/:product  301
```

The `/products/overview/:product` pattern applies to all languages, so redirects must also handle prefixed variants:

```text
/en/products/overview.php?product=:product      /en/products/overview/:product      301
/en/products/overview?product=:product          /en/products/overview/:product      301
/zh-CN/products/overview.php?product=:product   /zh-CN/products/overview/:product   301
/zh-CN/products/overview?product=:product       /zh-CN/products/overview/:product   301
/zh-HK/products/overview.php?product=:product   /zh-HK/products/overview/:product   301
/zh-HK/products/overview?product=:product       /zh-HK/products/overview/:product   301
/ja-JP/products/overview.php?product=:product   /ja-JP/products/overview/:product   301
/ja-JP/products/overview?product=:product       /ja-JP/products/overview/:product   301
/zh-x-mars/products/overview.php?product=:product /zh-x-mars/products/overview/:product 301
/zh-x-mars/products/overview?product=:product   /zh-x-mars/products/overview/:product 301
```

Notes:
- Cloudflare Pages `_redirects` supports splats and placeholders; validate the exact syntax before deploying.
- If Cloudflare Pages does not support query parameter matching in `_redirects`, handle these via a Cloudflare Worker or a static redirect page that reads the `product` query parameter client-side.
- Test that redirects work for both `.php?product=` and `?product=` variants.
- Existing `.htaccess` rewrite (query-param ← clean URL) is removed after cutover.

## Feasibility Assessment

| Topic | Assessment | Notes |
|---|---|---|
| Astro static migration | Feasible | Public pages can be generated statically. |
| Root English fallback with client redirect | Feasible | Works for a static deployment; exact server-side PHP language negotiation is not preserved. |
| Cloudflare Pages without Functions | Feasible with constraints | Static pages, assets, redirects, and rewrites are fine. Runtime PHP features need another home. |
| Dynamic PHP removal | Not part of this migration | Questionnaire, session, MySQL, Redis, and support search require a separate decision. |
| nmBot page migration | Feasible but high risk | Needs visual and content parity baselines before refactoring. |
| SEO | Feasible | Requires canonical/hreflang decisions, sitemap validation, and crawler tests with JS disabled. |
| Timeline | 6-10 weeks | Depends mostly on nmBot parity and how strict visual comparison is. |

## Recommended Target Architecture

```text
WebSite/
├── astro/
│   ├── package.json
│   ├── astro.config.mjs
│   ├── tsconfig.json
│   ├── playwright.config.ts
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── robots.txt
│   │   └── _redirects
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Header.astro
│       │   │   ├── Footer.astro
│       │   │   ├── LanguageRedirect.astro
│       │   │   ├── LanguageSwitcher.astro
│       │   │   └── SEOHead.astro
│       │   ├── products/
│       │   │   ├── ProductCard.astro
│       │   │   ├── ProductDetailRenderer.astro
│       │   │   └── nmbot/
│       │   └── shared/
│       ├── data/
│       │   ├── locales/
│       │   ├── products/
│       │   └── sponsor.json
│       ├── i18n/
│       │   ├── locales.ts
│       │   ├── translate.ts
│       │   └── url.ts
│       ├── layouts/
│       │   └── BaseLayout.astro
│       ├── pages/
│       │   ├── [...slug].astro             # unprefixed English fallback + redirect
│       │   ├── [lang]/
│       │   │   └── [...slug].astro         # prefixed pages, no redirect
│       │   └── 404.astro
│       └── test/
│           ├── php-router.php
│           ├── route-manifest.ts
│           └── visual-baselines/
└── existing PHP files
```

Route generation:

- `src/pages/[...slug].astro` generates the unprefixed English fallback routes.
- `src/pages/[lang]/[...slug].astro` generates all prefixed language routes, including `/en/...`.
- `getStaticPaths()` enumerates known page slugs and public language tags.

## Migration Phases

### Phase 0: Baseline Harness

Goal: make the old PHP site and the new Astro site comparable before migration starts.

Tasks:

1. Create a route manifest containing page slug, source PHP file, supported locales, dynamic/static status, and expected redirects.
2. Add a small PHP test router that mimics the important `.htaccess` behavior for local comparison:
   - extensionless PHP files;
   - `/products/overview/{product}`;
   - `/blackboard/questionnaire/{id}` only if dynamic paths are included in tests.
3. Start the current PHP site locally, for example `php -S 127.0.0.1:8080 test/php-router.php`.
4. Capture baseline HTML and screenshots from the PHP site for each static route and locale.
5. Store baselines under `astro/src/test/visual-baselines/` or in Playwright snapshot folders.
6. Record pages that cannot be compared automatically because they redirect, require runtime data, or call external services.

Baseline capture matrix:

| Dimension | Values |
|---|---|
| Viewports | 390x844, 768x1024, 1440x1000 |
| Color scheme | light, dark where relevant |
| Languages | `en`, `zh-CN`, `zh-HK`, `ja-JP`, `zh-x-mars` |
| JavaScript | enabled for user behavior tests, disabled for crawler fallback tests |
| Pages | homepage, about, legal, product listing, generic product detail, nmBot, supportus, 404 |

### Phase 1: Astro Foundation

Goal: create a strict static Astro project without changing production.

Tasks:

1. Initialize Astro under `astro/` with TypeScript strict mode and `pnpm`.
2. Configure static output and directory-style build output.
3. Install Astro, sitemap integration, Vitest, Playwright, and only necessary test helpers.
4. Copy current static assets with minimal URL churn.
5. Implement locale mapping from public tags to legacy JSON folders.
6. Implement PHP-equivalent translation fallback.
7. Implement `BaseLayout`, `SEOHead`, `Header`, `Footer`, `LanguageRedirect`, and `LanguageSwitcher`.
8. Add tests for URL generation, locale normalization, fallback order, and route enumeration.

### Phase 2: Simple Static Pages

Goal: migrate low-risk pages and prove the comparison harness works.

Suggested order:

1. `404.php`
2. `cookies.php`
3. `business_cooperation.php`
4. `aboutus.php`
5. `legal/privacy-policy.php`
6. `legal/network-service-protocol.php`
7. `support/index.php` as `_redirects` or static redirect page
8. `status.php` as `_redirects` or static redirect page

Verification after each page:

1. Build Astro.
2. Start PHP baseline and Astro preview at fixed ports.
3. Compare title, meta description, heading text, main content text, canonical, and language alternates.
4. Compare screenshots at all required viewports.
5. Run no-JS mode on unprefixed route and confirm English content is visible.
6. Run redirect mode on unprefixed route with `lang=zh-CN` and confirm it reaches `/zh-CN/...`.
7. Confirm prefixed routes never auto-redirect.

### Phase 3: Data-Driven Static Pages

Goal: replace legacy client-side JSON rendering with build-time Astro rendering.

Pages:

1. `products/index.php`
2. Generic product detail pages from `products/overview.php`
3. `supportus.php`

Tasks:

1. Define TypeScript schemas for `src/json/products/{legacyLocale}/overview_list.json`.
2. Define schemas for generic product detail JSON.
3. Render product cards and detail blocks as Astro components.
4. Preserve existing button behavior and external links.
5. Review legacy HTML fields before outputting HTML.
6. Render sponsor data from `src/json/sponsor.json` at build time.

Verification focus:

- Product cards match count, order, title, intro, button labels, and links.
- Generic product pages match section order and major media assets.
- Missing locale-specific product data produces an explicit unavailable state or omits the route.
- No build-time JSON parse failure is allowed to pass silently.

### Phase 4: nmBot Page

Goal: migrate the custom nmBot landing page without invented content.

Source of truth:

- `products/template/nmBot-Telegram.php`
- `src/locales/*` keys under `products.nmbot_telegram`
- Current rendered PHP HTML
- Current rendered screenshots
- Remote assets referenced by the PHP template

Suggested component split:

```text
src/components/products/nmbot/
├── NmBotPage.astro
├── NmBotHero.astro
├── NmBotTextBlock.astro
├── NmBotFeatureBlock.astro
├── NmBotImageBlock.astro
├── NmBotPanelSection.astro
├── NmBotIntelligenceSection.astro
├── NmBotResourceLinks.astro
├── NmBotFooterNotes.astro
└── nmBotText.ts
```

Tasks:

1. Extract PHP helper behavior into typed utilities.
2. Preserve footer-note syntax, `|` no-wrap segmentation, and `<bs>` punctuation behavior where it affects layout.
3. Move inline CSS into scoped Astro styles or a dedicated CSS file after visual parity is measurable.
4. Keep remote asset URLs unchanged unless assets are intentionally mirrored.
5. Add focused screenshot tests for hero, nmBot Intelligence sections, resource links, and footer notes.

Verification focus:

- Same major section count and order as PHP.
- Same translated text after stripping intentional helper markup.
- Same remote image URLs or intentional replacements.
- Desktop/mobile screenshots within agreed tolerance.
- No new product claims or sections are introduced without approved content.

### Phase 5: Remaining Routes and Redirects

Goal: close route coverage and legacy compatibility.

Pages/routes:

1. `index.php`
2. `join/index.php`
3. `join/forum.php`
4. `language.php`
5. `sitemap.php`
6. `sitemap.xml`, `ror.xml`, `urllist.txt`

Notes:

- `join/forum.php` currently redirects to `/blackboard/questionnaire/22_07_04_join_nmteam_{jobType}`. If questionnaires remain PHP, this route should remain a redirect to the PHP service.
- `language.php` should become either a static language selection page or be folded into `LanguageSwitcher`.
- Replace `sitemap.php` with generated sitemap output, then verify all root and prefixed routes.

### Phase 6: Dynamic System Decision

Goal: avoid blocking the static migration on runtime PHP features.

Choose one path for each dynamic feature:

1. Keep it on current PHP hosting.
2. Move it to a subdomain such as `forms.nmteam.xyz` or `legacy.nmteam.xyz`.
3. Rebuild it as a separate service.
4. Retire it if no longer needed.

Affected paths:

```text
/blackboard/questionnaire/*
/blackboard/support_doc_search/search.php
/class/mysql.php
/class/redis.php
/class/session.php
```

### Phase 7: Cutover

Goal: switch production only after route coverage, redirects, and comparisons are green.

Tasks:

1. Build Astro and inspect `dist/`.
2. Run unit and integration tests.
3. Start PHP baseline and Astro preview.
4. Run the full comparison suite.
5. Run Lighthouse on representative pages.
6. Deploy Cloudflare Pages preview.
7. Verify `_redirects`, sitemap, canonical, and prefixed routes on preview.
8. Keep the PHP deployment available for dynamic systems and rollback until traffic is stable.

## Testing and Verification Strategy

### Local two-server comparison

Every migrated page should be verified with both sites running:

```text
PHP baseline:   http://127.0.0.1:8080
Astro preview:  http://127.0.0.1:4321
```

Suggested commands:

```bash
php -S 127.0.0.1:8080 astro/src/test/php-router.php
pnpm --dir astro build
pnpm --dir astro preview --host 127.0.0.1 --port 4321
pnpm --dir astro test
pnpm --dir astro playwright test
```

If the built-in PHP server cannot exactly mimic production rewrites, add explicit test cases for the known differences instead of hiding them.

### Route manifest

Maintain a machine-readable manifest:

```ts
export const routes = [
  {
    slug: '/aboutus/',
    phpPath: '/aboutus?lan={legacyLocale}',
    astroRootPath: '/aboutus/',
    astroLocalizedPath: '/{publicLocale}/aboutus/',
    kind: 'static-page',
    compare: ['text', 'metadata', 'links', 'screenshot'],
  },
  {
    slug: '/products/overview/nmBot-Telegram/',
    phpPath: '/products/overview/nmBot-Telegram?lan={legacyLocale}',
    astroRootPath: '/products/overview/nmBot-Telegram/',
    astroLocalizedPath: '/{publicLocale}/products/overview/nmBot-Telegram/',
    kind: 'custom-product-page',
    compare: ['text', 'metadata', 'links', 'screenshot', 'assets'],
  },
];
```

The manifest should drive baseline capture, screenshot tests, link checks, and sitemap checks.

### Text comparison

For each route and locale:

1. Fetch PHP and Astro pages.
2. Extract normalized `main` text.
3. Strip helper-only markup differences such as generated footnote IDs.
4. Compare required text blocks exactly where possible.
5. Allow known intentional wording changes only through an explicit allowlist.

This catches hallucinated copy and dropped legal/product text earlier than visual tests.

### Metadata comparison

Compare:

- `<title>`
- meta description
- canonical URL
- Open Graph title, description, image, URL
- Twitter card metadata
- JSON-LD validity
- `html[lang]`
- `hreflang` alternates

Rules:

- Root routes should expose full English metadata.
- Prefixed routes should expose metadata for their own language.
- `/zh-x-mars/...` should either omit SEO alternate tags or use a deliberately tested private-use tag strategy.

### Redirect tests

Required Playwright cases:

| Case | Expected result |
|---|---|
| `/aboutus/` with JS disabled | English content remains visible; no blank page. |
| `/aboutus/` with no cookie and browser language `en-US` | Stays on `/aboutus/`. |
| `/aboutus/` with no cookie and browser language `zh-CN` | Redirects to `/zh-CN/aboutus/`. |
| `/aboutus/` with `lang=zh-HK` cookie | Redirects to `/zh-HK/aboutus/`. |
| `/aboutus/` with legacy `lang=zh_CN` cookie | Redirects to `/zh-CN/aboutus/` and normalizes cookie. |
| `/en/aboutus/` with `lang=zh-CN` cookie | Does not redirect. |
| `/zh-CN/aboutus/` with `lang=en` cookie | Does not redirect. |
| Unknown cookie value | No redirect. |

### Visual comparison

Use screenshot comparison against PHP baselines:

- Compare desktop, tablet, and mobile.
- Disable animations where possible.
- Freeze time-dependent text where possible.
- Mask ad containers, externally changing avatars, and third-party widgets.
- Use strict thresholds for layout pages and a slightly looser threshold for remote image-heavy product pages.

Suggested thresholds:

| Page type | Max diff ratio | Notes |
|---|---:|---|
| Legal/static text pages | 0.005 | Text layout should be nearly identical. |
| Product listing | 0.01 | Allows tiny image/rendering differences. |
| nmBot custom landing page | 0.015 initial, tighten later | Large remote images and animations may need masks. |
| Redirect pages | No screenshot parity required | Verify redirect target and fallback content. |

### Link and asset checks

Automated checks should verify:

- No generated internal link returns 404.
- No generated route links to old `.php` URLs unless it is an intentional legacy/dynamic route.
- Product media URLs resolve or are explicitly allowed external URLs.
- Remote assets used by nmBot are still reachable.
- `_redirects` covers old `.php`, underscore, and product overview legacy query-parameter paths (`/products/overview(.php)?product=` → `/products/overview/{product}`).

### Sitemap and crawler checks

Run checks against built `dist/` and preview:

- Sitemap includes root fallback English routes and prefixed routes according to the SEO decision.
- Sitemap does not include dynamic PHP-only routes unless they remain publicly served elsewhere.
- No-JS crawl of root routes sees full English content.
- No-JS crawl of prefixed routes sees full localized content.
- Canonical URLs and alternates are consistent.

### CI gates

Minimum gates before merge:

1. TypeScript check.
2. Astro build.
3. Unit tests.
4. Route manifest validation.
5. Playwright redirect tests.
6. Playwright route crawl.
7. Screenshot tests for changed pages.
8. Link checker.
9. Sitemap/canonical/hreflang validator.

## Risk Matrix

| Risk | Impact | Mitigation |
|---|---|---|
| Client-side root redirect affects users before paint | Medium | Keep root page complete, validate script, and test no-JS crawler behavior. |
| Search engines dislike private-use 火星文 tag | Medium | Omit `zh-x-mars` from `hreflang` if validation/search docs indicate risk. |
| nmBot copy or claims diverge | High | Text comparison against PHP output and locale JSON. |
| Dynamic questionnaire breaks after PHP removal | High | Keep dynamic paths outside static cutover until replaced. |
| Product JSON renders unsafe HTML | High | Typed schemas plus reviewed HTML allowlist. |
| SEO drops from URL changes | Medium/High | Canonical strategy, redirects, sitemap validation, and Search Console follow-up. |
| Visual regressions in large pages | Medium | PHP screenshot baselines before component refactors. |

## Revised Timeline

```text
Week 1      Baseline harness, route manifest, language URL decisions
Week 2      Astro foundation, i18n mapping, layout, redirect component
Week 3      Simple static pages plus comparison workflow
Week 4      Product listing and generic product detail renderer
Week 5-6    nmBot page parity migration
Week 7      Remaining routes, redirects, sitemap, language page
Week 8      Full QA, Cloudflare preview, production cutover
Buffer      1-2 weeks if nmBot parity is strict or dynamic routing changes
```

## File Mapping

| Current file/path | Astro/static destination | Migration note |
|---|---|---|
| `functions.php` | `src/layouts/BaseLayout.astro`, layout components, `src/i18n/*`, `src/utils/seo.ts` | Reimplement layout/i18n behavior. |
| `index.php` | `/`, `/en/`, localized homepage routes | Root page gets English fallback plus redirect script. |
| `aboutus.php` | `/aboutus/`, `/en/aboutus/`, localized routes | Contains hard-coded per-locale body copy. |
| `cookies.php` | root, `/en`, and localized cookies routes | Static. |
| `business_cooperation.php` | `/business-cooperation/`, `/en/business-cooperation/`, localized routes | Redirect old underscore path. |
| `supportus.php` | support-us routes | Reads `src/json/sponsor.json`; render at build time. |
| `support/index.php` | `_redirects` or static redirect page | Redirects to `https://support.nmteam.xyz`. |
| `status.php` | `_redirects` or static redirect page | Redirects to `https://status.nmteam.xyz`. |
| `language.php` | `LanguageSwitcher.astro` and optional language selection page | Preserve `lang` cookie compatibility while normalizing values. |
| `legal/privacy-policy.php` | legal routes | Long static legal content. |
| `legal/network-service-protocol.php` | legal routes | Long static legal content. |
| `products/index.php` | product listing routes | Replace client-side JSON rendering with build-time rendering. |
| `products/overview.php` | product detail routes | Preserve `/products/overview/{product}/` pattern. |
| `products/template/nmBot-Telegram.php` | `NmBotPage.astro` and nmBot components | High-risk custom page; migrate from current source only. |
| `join/index.php` | join routes | Static recruitment page. |
| `join/forum.php` | `_redirects` or static redirect page | Redirects to questionnaire route based on `jobType`. |
| `sitemap.php` | generated sitemap | Verify root and prefixed URL coverage. |
| `src/css/` | `astro/src/styles/` or transitional public assets | Prefer parity first, cleanup later. |
| `src/js/` | Astro components/utilities or transitional public JS | Replace synchronous XHR and global variables over time. |
| `src/img/` | Astro public/imported assets | Avoid breaking URLs during migration. |
| `src/locales/` | `astro/src/data/locales/` | Keep files initially; map legacy IDs to public tags. |
| `src/json/products/` | `astro/src/data/products/` | Validate and render at build time. |
| `src/json/sponsor.json` | `astro/src/data/sponsor.json` | Render support page at build time. |
| `blackboard/questionnaire/` | Outside static migration | Keep PHP, move, or rebuild separately. |
| `blackboard/support_doc_search/search.php` | Outside static migration unless replaced | Dynamic proxy/search behavior. |
| `class/*.php` | Outside static migration | Runtime support for dynamic PHP systems. |

## Final Recommendation

Proceed with Astro using the root-English-plus-redirect model, but make `/en/...` and all localized prefixed routes canonical, stable, and non-redirecting. The migration should be considered complete only when the automated comparison suite proves that Astro output matches the current PHP site for text, metadata, links, redirects, screenshots, and crawler fallback behavior.
