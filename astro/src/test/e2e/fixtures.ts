import { type BrowserContext, test as base } from '@playwright/test';

export { expect, type Locator } from '@playwright/test';

export async function isolateExternalRequests(context: BrowserContext, baseURL: string | undefined) {
  if (!baseURL) throw new Error('Browser tests require a baseURL for the built site.');
  const siteOrigin = new URL(baseURL).origin;
  // Exercise the real local HTML, scripts, styles, images and data without CDN or tracking requests.
  await context.route((url) => /^https?:$/.test(url.protocol) && url.origin !== siteOrigin, (route) => route.abort());
}

export const test = base.extend({
  context: async ({ context, baseURL }, use) => {
    await isolateExternalRequests(context, baseURL);
    await use(context);
  },
});
