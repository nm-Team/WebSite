# nmTeam Official Website

The nmTeam website is a static [Astro](https://astro.build/) application. Visit the production site at [nmteam.xyz](https://nmteam.xyz?ref=nmTeam_GitHub_HomePage).

![Website screenshot][screenshot]

[screenshot]: https://websiteres.nmteam.xyz/github/nmTeam_Website_ScreenShot.png

## Development

The application lives in [`astro/`](astro/).

```shell
cd astro
pnpm install --frozen-lockfile
pnpm dev
```

Run the validation suite from the same directory:

```shell
pnpm check
pnpm test
pnpm lint
pnpm build
pnpm test:e2e
```

Legacy PHP URLs remain compatible through the static redirect rules in [`astro/public/_redirects`](astro/public/_redirects).
