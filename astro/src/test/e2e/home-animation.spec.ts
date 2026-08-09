import { expect, test } from '@playwright/test';

type TransitionPhase = 'run' | 'start' | 'end';
type CloneKind = 'logo' | 'name';

interface RecordedTransition {
  phase: TransitionPhase;
  propertyName: string;
  isClone: boolean;
  isHeaderBrand: boolean;
  cloneKind: CloneKind | null;
  elapsedTime: number;
  headerBrandOpacity: number | null;
  headerHasHiddenTitle: boolean | null;
  isConnected: boolean;
  sequence: number;
}

interface RecordedCloneRemoval {
  cloneKind: CloneKind;
  sequence: number;
}

interface HomeAnimationWindow extends Window {
  __homeAnimationTransitions?: RecordedTransition[];
  __homeAnimationCloneRemovals?: RecordedCloneRemoval[];
  __homeAnimationSequence?: number;
}

test('flies the nmTeam title into the header and back while scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  await page.route('https://newsroom.nmteam.xyz/api/posts**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ status: 200, data: [] }),
    });
  });

  await page.route('https://websiteres.nmteam.xyz/producticon/nmTeam/logo@64.png', async (route) => {
    await route.abort();
  });

  await page.goto('/zh-CN/', { waitUntil: 'domcontentloaded' });
  await page.locator('.indexHeaderName').waitFor({ state: 'attached' });

  await page.evaluate(() => {
    const browserWindow = window as HomeAnimationWindow;
    browserWindow.__homeAnimationTransitions = [];
    browserWindow.__homeAnimationCloneRemovals = [];
    browserWindow.__homeAnimationSequence = 0;

    const nextSequence = (): number => {
      browserWindow.__homeAnimationSequence = (browserWindow.__homeAnimationSequence ?? 0) + 1;
      return browserWindow.__homeAnimationSequence;
    };

    const getCloneKind = (element: HTMLElement): CloneKind | null => {
      if (element.getAttribute('aria-hidden') !== 'true' || element.parentElement !== document.body) return null;
      if (element.classList.contains('indexHeaderLogo')) return 'logo';
      if (element.classList.contains('indexHeaderName')) return 'name';
      return null;
    };

    const recordTransition = (phase: TransitionPhase) => (event: Event): void => {
      if (!(event instanceof TransitionEvent) || !(event.target instanceof HTMLElement)) return;

      const cloneKind = getCloneKind(event.target);
      const isTitleTransform = event.propertyName === 'transform'
        && event.target.classList.contains('indexHeaderName');
      const isCloneOpacity = event.propertyName === 'opacity' && cloneKind !== null;
      const isHeaderBrand = event.propertyName === 'opacity'
        && event.target.matches('#pageHeader .left');
      if (!isTitleTransform && !isCloneOpacity && !isHeaderBrand) return;

      const headerBrand = isCloneOpacity
        ? document.querySelector<HTMLElement>('#pageHeader .left')
        : null;
      const pageHeader = isCloneOpacity
        ? document.querySelector<HTMLElement>('#pageHeader')
        : null;

      browserWindow.__homeAnimationTransitions?.push({
        phase,
        propertyName: event.propertyName,
        isClone: cloneKind !== null,
        isHeaderBrand,
        cloneKind,
        elapsedTime: event.elapsedTime,
        headerBrandOpacity: headerBrand
          ? Number.parseFloat(window.getComputedStyle(headerBrand).opacity)
          : null,
        headerHasHiddenTitle: pageHeader ? pageHeader.classList.contains('hidetitle') : null,
        isConnected: event.target.isConnected,
        sequence: nextSequence(),
      });
    };

    document.addEventListener('transitionrun', recordTransition('run'), true);
    document.addEventListener('transitionstart', recordTransition('start'), true);
    document.addEventListener('transitionend', recordTransition('end'), true);

    new MutationObserver((records) => {
      records.forEach((record) => {
        record.removedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          const cloneKind = node.classList.contains('indexHeaderLogo')
            ? 'logo'
            : node.classList.contains('indexHeaderName') ? 'name' : null;
          if (node.getAttribute('aria-hidden') !== 'true' || cloneKind === null) return;
          browserWindow.__homeAnimationCloneRemovals?.push({
            cloneKind,
            sequence: nextSequence(),
          });
        });
      });
    }).observe(document.body, { childList: true });
  });

  await page.evaluate(() => {
    window.scrollTo(0, 700);
  });

  const readTitleTransitionPhases = async (isClone: boolean): Promise<TransitionPhase[]> => page.evaluate((expectedClone) => {
    const events = (window as HomeAnimationWindow).__homeAnimationTransitions ?? [];
    return events
      .filter((event) => event.isClone === expectedClone && event.propertyName === 'transform')
      .map((event) => event.phase);
  }, isClone);

  const resetAnimationJournal = async (): Promise<void> => page.evaluate(() => {
    const browserWindow = window as HomeAnimationWindow;
    browserWindow.__homeAnimationTransitions = [];
    browserWindow.__homeAnimationCloneRemovals = [];
    browserWindow.__homeAnimationSequence = 0;
  });

  const assertCloneHandoff = async (): Promise<void> => {
    await expect.poll(async () => page.evaluate(() => {
      const browserWindow = window as HomeAnimationWindow;
      const events = browserWindow.__homeAnimationTransitions ?? [];
      const removals = browserWindow.__homeAnimationCloneRemovals ?? [];
      return (['logo', 'name'] as const).every((cloneKind) => (
        events.some((event) => (
          event.cloneKind === cloneKind
          && event.propertyName === 'opacity'
          && event.phase === 'end'
        ))
        && removals.some((removal) => removal.cloneKind === cloneKind)
      ));
    })).toBe(true);

    const journal = await page.evaluate(() => ({
      events: (window as HomeAnimationWindow).__homeAnimationTransitions ?? [],
      removals: (window as HomeAnimationWindow).__homeAnimationCloneRemovals ?? [],
    }));

    (['logo', 'name'] as const).forEach((cloneKind) => {
      const opacityEvents = journal.events.filter((event) => (
        event.cloneKind === cloneKind && event.propertyName === 'opacity'
      ));
      expect(opacityEvents.map((event) => event.phase)).toEqual(['run', 'start', 'end']);
      expect(opacityEvents.every((event) => (
        event.headerBrandOpacity === 1 && event.headerHasHiddenTitle === false
      ))).toBe(true);

      const endEvent = opacityEvents.find((event) => event.phase === 'end');
      expect(endEvent).toBeDefined();
      expect(endEvent?.elapsedTime).toBeGreaterThanOrEqual(0.2);
      expect(endEvent?.elapsedTime).toBeLessThanOrEqual(0.5);
      expect(endEvent?.isConnected).toBe(true);

      const removal = journal.removals.find((entry) => entry.cloneKind === cloneKind);
      expect(removal).toBeDefined();
      expect(removal?.sequence).toBeGreaterThan(endEvent?.sequence ?? Number.POSITIVE_INFINITY);
    });

    const firstHandoffSequence = Math.min(...journal.events
      .filter((event) => event.cloneKind !== null && event.propertyName === 'opacity')
      .map((event) => event.sequence));
    const headerBrandOpacityPhases = journal.events
      .filter((event) => (
        event.isHeaderBrand
        && event.propertyName === 'opacity'
        && event.sequence >= firstHandoffSequence
      ))
      .map((event) => event.phase);
    expect(headerBrandOpacityPhases).toEqual([]);
  };

  await expect.poll(async () => {
    const phases = await readTitleTransitionPhases(true);
    return phases.includes('run') && phases.includes('start');
  }).toBe(true);

  await expect.poll(async () => (await readTitleTransitionPhases(true)).includes('end')).toBe(true);
  await assertCloneHandoff();

  const header = page.locator('#pageHeader');
  await expect(header).not.toHaveClass(/\bhidden\b/);
  await expect(header).not.toHaveClass(/\bhidetitle\b/);
  await expect(header.locator('.left')).toBeVisible();

  const headerLogoUsesInlineArtwork = await header.locator('.logo').evaluate((logo) => (
    logo instanceof HTMLElement && logo.style.backgroundImage.includes('data:image/png;base64,')
  ));
  expect(headerLogoUsesInlineArtwork).toBe(true);

  await resetAnimationJournal();
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });

  await expect.poll(async () => {
    const phases = await readTitleTransitionPhases(false);
    return phases.includes('run') && phases.includes('start');
  }).toBe(true);

  await expect.poll(async () => (await readTitleTransitionPhases(false)).includes('end')).toBe(true);

  await expect(header).toHaveClass(/\bhidden\b/);
  await expect(header).toHaveClass(/\bhidetitle\b/);
  await expect(page.locator('.indexHeaderName')).toBeVisible();

  await resetAnimationJournal();
  await page.evaluate(() => window.scrollTo(0, 700));
  await expect.poll(async () => (await readTitleTransitionPhases(true)).includes('start')).toBe(true);

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(async () => (await readTitleTransitionPhases(false)).includes('start')).toBe(true);

  await resetAnimationJournal();
  await page.evaluate(() => window.scrollTo(0, 700));
  await expect.poll(async () => (await readTitleTransitionPhases(true)).includes('start')).toBe(true);
  await assertCloneHandoff();

  await expect(header).not.toHaveClass(/\bhidden\b/);
  await expect(header).not.toHaveClass(/\bhidetitle\b/);
  await expect(page.locator('body > .indexHeaderLogo[aria-hidden="true"]')).toHaveCount(0);
  await expect(page.locator('body > .indexHeaderName[aria-hidden="true"]')).toHaveCount(0);
});
