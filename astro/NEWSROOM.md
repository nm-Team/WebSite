# Newsroom

Newsroom is part of this Astro application. Content and assets were imported from
`nm-Team/astro-newsroom` at commit `309550cc5efcaaf42c1a54b65a3f2b0b52389dab`.
The original repository retains its Git history. Future publishing happens here.

## Content

Articles live in `src/content/newsroom/{locale}/{articleId}.md`. Supported locales
are `zh-CN` and `en`. Use the same `articleId` and publication timestamp for all
translations. Preserve IDs, including their capitalization, after publication.
Dates in URLs are calculated in `Asia/Shanghai`.

The import contains 34 Chinese articles and 32 English translations. The nmFun
test announcement and service outage explanation have no English version.
`src/data/newsroom/import-manifest.json` records the imported article inventory
and original SHA-256 hashes. Do not add invented translations to fill gaps.

Use a separate Markdown file for each translation. Keep shared image references
and link definitions in every translation that needs them. Store images under
`public/newsroom/uploads/` and reference them as `/newsroom/uploads/...`.
The `cover` field can override the first Markdown image. Category identifiers
are `press-release`, `update`, `photos`, `stories`, and `statement`.

Article-body links open a new window with `noopener noreferrer`. This behavior
is applied by the Sätteri plugin only to the Newsroom content collection.

## Routes and rendering

The application uses Astro's static rendering and component architecture. The
imported UI is already written in Astro, so it does not need a React or Vue
runtime. Navigation and search use small browser scripts. Framework components
can use Astro's `client:*` directives when a future feature needs hydration.

Both `/zh-CN/newsroom/` and `/en/newsroom/` have article lists, pagination,
categories, tags, monthly archives, search, an about page, and `rss.xml`.
Article URLs are `/{locale}/newsroom/{articleId}-{YYYY-MM-DD}/`.
The default `/newsroom/` entry redirects to English. Main-site Chinese locales
link to Chinese Newsroom; English and Japanese link to English Newsroom.
The `hreflang` links only include translations that exist.

The homepage reads the latest five articles at build time. Newsroom search loads
the selected language's `search-data.json`, including the full article text.
The compatibility endpoint `/newsroom/api/posts` retains `{ status, data }` and
the legacy post fields, with Chinese articles and new canonical permalinks.
Its legacy `cid` remains present when the original article had one.

The main header uses `navigationMode="flow"` on Newsroom pages. It scrolls away,
while the local Newsroom header stays at the viewport top. The local footer
contains Newsroom categories, archives and feeds, followed by the global website
footer with legal links and the language selector. That selector returns to an
available translation, or the selected Newsroom language's index when missing.
Newsroom keeps its namespaced CSS. Fonts, theme variables and the system theme
script are shared with the website. Newsroom uses only its original Umami site
ID (`3f6853e3-82e8-4f73-977f-cf685c37e3c3`).

The local navigation is 52px high on desktop and 48px below 700px. It contains
the Newsroom title, about link, and search. Mobile navigation and desktop search
support Escape, focus restoration, and background scroll locking. Opening the
global menu closes the local menu. Reduced-motion preferences disable the local
navigation and card entrance animations. Pointer toggles fade and slide the
local menu over 180ms, with reversible transitions for rapid toggles. Keyboard
actions update immediately.

Both navigation levels and footer levels share the same horizontal gutter:
10% on wide screens, 20px through 900px, and 16-20px on phones. Their content
edges stay aligned without changing the article or card layout.

The local navigation is transparent while below the viewport top. Its tinted
background, blur and separator appear only after it reaches the sticky position.
Scroll, resize and restored page positions update this state once per frame.

## Build and migration outputs

Run the commands in the repository README from `astro/`. `pnpm build` produces:

- `dist/`: the complete website, including Newsroom and additional main-site
  redirects for historical `/news/`, `/uploads/`, and `/usr/uploads/` paths.
- `legacy-newsroom-dist/`: a separate redirect deployment for
  `newsroom.nmteam.xyz`. Its manifest covers the imported article aliases,
  pagination, categories, tags, archives, special pages, RSS, search, API and
  both historical upload prefixes. Unknown paths retain a 404 response.

`integrations/newsroom-compatibility.ts` generates these rules from the imported
alias manifest, built routes and actual asset files. It fails the build if any
target is missing or the static rules exceed Cloudflare Pages limits.
`legacy-newsroom-dist/redirect-manifest.json` is the reviewable inventory.

The legacy output includes a small Cloudflare Pages Worker routed only to
`/api/posts` and `/api/posts/`. It preserves query parameters and adds CORS
headers to the API's 301 response. Other routes use `_redirects`. This is needed
because [Pages redirects run before header rules](https://developers.cloudflare.com/pages/configuration/redirects/).
The main website remains a static deployment. The Worker uses
[Pages advanced mode](https://developers.cloudflare.com/pages/functions/advanced-mode/)
without adding an application runtime or package manager to the old site.

## Production cutover

1. Deploy `dist/` to the existing `nm.team` site. Check both Newsroom languages,
   articles, images, search and RSS on the deployed site.
2. Deploy `legacy-newsroom-dist/` to the project serving `newsroom.nmteam.xyz`.
   Keep that hostname's DNS and TLS active. Preserve query strings in equivalent
   provider rules if using a platform other than Cloudflare Pages.
3. Verify an old `.html` article, a category article alias, an upload under each
   prefix, `/search/?q=nmBot`, `/rss.xml` and the cross-origin API. Each supported
   legacy URL must reach the final destination without redirect chains.
4. Keep the old repository read-only after cutover. Publish future articles here.

The Chinese RSS feed preserves imported items' old GUID strings so existing
subscribers do not receive every historical article again. English uses its new
canonical URLs as GUIDs. Sitemaps include canonical Newsroom pages and existing
translations, while search and data endpoints are excluded.

The repository changes do not deploy or reconfigure the old hostname. If the
new site must be rolled back before old-host cutover, restore the earlier site
deployment. After cutover, restore the old Newsroom deployment first so old
links keep working while the main site is rolled back.
