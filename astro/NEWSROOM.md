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
