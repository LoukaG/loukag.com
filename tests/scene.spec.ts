import { test, expect, type Page } from '@playwright/test';

async function ink(page: Page) {
  return page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
    const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    let count = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] < 240 || pixels[i + 1] < 240 || pixels[i + 2] < 240) count++;
    }
    return count;
  });
}
async function ready(page: Page) {
  await page.goto('/');
  await expect(page.locator('astro-island')).not.toHaveAttribute('ssr');
  await expect.poll(() => ink(page)).toBeGreaterThan(45000);
}
async function scrollScene(page: Page, progress: number) {
  await page.evaluate(value => window.scrollTo(0, window.innerHeight * 3.2 / 3 * value), progress);
}
async function image(page: Page) {
  return page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
}

test('opens directly in Paint with portrait; drawing, undo, redo and export work', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await ready(page);
  await expect(page.getByRole('region', { name: 'Microsoft Paint' })).toBeVisible();
  await expect(page.getByRole('heading', { name: "Hello :-) I'm Louka Gauthier, full stack developper" })).toBeAttached();
  await expect(page.locator('.desktop-shell,.taskbar-root,.wallpaper')).toHaveCount(0);
  const before = await image(page);
  await page.screenshot({ path: '/tmp/paint-intro-desktop.png' });
  const rect = (await page.locator('canvas').boundingBox())!;
  await page.mouse.move(rect.x + 30, rect.y + 30);
  await page.mouse.down();
  await page.mouse.move(rect.x + 170, rect.y + 65, { steps: 12 });
  await page.mouse.up();
  const after = await image(page);
  expect(after).not.toBe(before);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  expect(await image(page)).toBe(before);
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  expect(await image(page)).toBe(after);
  const downloadPromise = page.waitForEvent('download');
  await page.keyboard.press('ControlOrMeta+s');
  expect((await downloadPromise).suggestedFilename()).toBe('Louka-Gauthier-Paint.png');
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  expect(await ink(page)).toBe(0);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  expect(await image(page)).toBe(after);
  expect(errors).toEqual([]);
});

test('scroll over canvas erases pixels along the visible cursor and reverses exactly', async ({ page }) => {
  await ready(page);
  const rect = (await page.locator('canvas').boundingBox())!;
  // Put a user stroke across the center, where the scroll eraser starts.
  await page.mouse.move(rect.x + rect.width * 0.45, rect.y + rect.height / 2);
  await page.mouse.down();
  await page.mouse.move(rect.x + rect.width * 0.55, rect.y + rect.height / 2, { steps: 12 });
  await page.mouse.up();
  const center = () => page.locator('canvas').evaluate((canvas: HTMLCanvasElement) =>
    [...canvas.getContext('2d')!.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data]);
  expect(await center()).toEqual([0, 0, 0, 255]);
  const before = await image(page);
  const initialInk = await ink(page);
  await scrollScene(page, 0.026);
  await expect(page.locator('.eraser-cursor')).toBeVisible();
  const start = await page.locator('.eraser-cursor').evaluate((cursor: HTMLElement) => ({
    x: parseFloat(cursor.style.left), y: parseFloat(cursor.style.top),
  }));
  expect(start.x).toBeGreaterThan(45);
  expect(start.x).toBeLessThan(55);
  expect(start.y).toBeGreaterThan(45);
  expect(start.y).toBeLessThan(55);
  expect(await center()).toEqual([255, 255, 255, 255]);
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  const scrollDistance = 900 * 3.2 / 3;
  expect(await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)).toBeCloseTo(scrollDistance * 6.5, 0);
  await page.mouse.wheel(0, scrollDistance * 0.48);
  await expect(page.locator('.eraser-cursor')).toBeVisible();
  await expect.poll(() => ink(page)).toBeLessThan(initialInk * 0.85);
  expect(await ink(page)).toBeGreaterThan(0);
  await page.screenshot({ path: '/tmp/paint-intro-erasing.png' });
  // The center of the visible eraser must be blank in the actual bitmap.
  const erasedUnderCursor = await page.locator('.canvas-sheet').evaluate(sheet => {
    const canvas = sheet.querySelector('canvas')!;
    const cursor = sheet.querySelector<HTMLElement>('.eraser-cursor')!;
    const x = Math.min(canvas.width - 1, Math.max(0, Math.floor(parseFloat(cursor.style.left) / 100 * canvas.width)));
    const y = Math.min(canvas.height - 1, Math.max(0, Math.floor(parseFloat(cursor.style.top) / 100 * canvas.height)));
    return [...canvas.getContext('2d')!.getImageData(x, y, 1, 1).data];
  });
  expect(erasedUnderCursor).toEqual([255, 255, 255, 255]);
  await scrollScene(page, 1);
  await expect(page.locator('.eraser-cursor')).toBeHidden();
  await expect.poll(() => ink(page)).toBeLessThan(initialInk * 0.05);
  const residue = await image(page);
  const remainingInk = await ink(page);
  expect(remainingInk).toBeGreaterThan(0);
  await scrollScene(page, 0);
  await expect.poll(() => image(page)).toBe(before);
  await scrollScene(page, 1);
  await expect.poll(() => image(page)).toBe(residue);
  await page.getByRole('button', { name: 'File', exact: true }).click();
  await page.getByRole('button', { name: 'Recent images', exact: true }).click();
  await page.getByRole('button', { name: 'Introduction', exact: true }).click();
  await expect.poll(() => image(page)).toBe(before);
});

test('mobile composition fits, touch can scroll, help and reduced motion work', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  const canvas = page.locator('canvas');
  const rect = (await canvas.boundingBox())!;
  expect(rect.x).toBeGreaterThanOrEqual(0);
  expect(rect.x + rect.width).toBeLessThanOrEqual(390);
  expect(rect.y + rect.height).toBeLessThan(844);
  await expect(canvas).toHaveCSS('touch-action', 'pan-y');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.screenshot({ path: '/tmp/paint-intro-mobile.png' });
  const before = await image(page);
  await page.getByRole('button', { name: 'Paint help' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Paint help' })).toBeFocused();
  await page.mouse.move(190, 400);
  await scrollScene(page, 1);
  await expect.poll(() => ink(page)).toBe(0);
  await expect(page.locator('.eraser-cursor')).toBeHidden();
  await page.getByRole('button', { name: 'File', exact: true }).click();
  await page.getByRole('button', { name: 'Recent images', exact: true }).click();
  await page.getByRole('button', { name: 'Introduction', exact: true }).click();
  await expect.poll(() => image(page)).toBe(before);
  await page.setViewportSize({ width: 1100, height: 700 });
  await expect(canvas).toHaveAttribute('width', '960');
  await expect.poll(() => ink(page)).toBeGreaterThan(45000);
});


test('education timeline connects internships, reverses and fits on mobile', async ({ page }) => {
  await ready(page);
  await scrollScene(page, 1.8);
  await expect(page.getByRole('status')).toContainText('Education');
  await expect.poll(() => ink(page)).toBeGreaterThan(8000);
  const education = await image(page);
  await page.screenshot({ path: '/tmp/paint-education.png' });
  await scrollScene(page, 3.3);
  await expect(page.getByRole('status')).toContainText('revisit');
  await expect.poll(() => image(page)).not.toBe(education);
  const entries = await page.locator('.sr-only article').evaluateAll(articles => articles.map(article => article.textContent));
  expect(entries).toHaveLength(9);
  expect(entries[0]).toContain('Cégep de Trois-Rivières');
  expect(entries[1]).toContain('May–Aug 2021 · Internship');
  expect(entries[1]).toContain('Proaxion');
  expect(entries[2]).toContain('Professional work');
  expect(entries[3]).toContain('Professional work');
  expect(entries[4]).toContain('Université de Sherbrooke');
  expect(entries[5]).toContain('2024 · Internship');
  expect(entries[5]).toContain('MesAieux');
  expect(entries[5]).toContain('PostgreSQL');
  expect(entries[6]).toContain('Humanware');
  expect(entries[6]).toContain('accessibility');
  expect(entries[7]).toContain('Djob');
  expect(entries[7]).toContain('Flutter');
  expect(entries[8]).toContain('Apr 2026–Present · Professional work');
  expect(entries[8]).toContain('Full-Stack Developer / Architecture & AI');
  expect(entries[8]).toContain('Attraction');
  expect(entries[8]).toContain('TypeScript');
  expect(entries[8]).toContain('AWS');
  expect(entries[8]).toContain('Claude Code and OpenAI Codex');
  await page.screenshot({ path: '/tmp/paint-experience.png' });
  const work = await image(page);
  const rect = (await page.locator('canvas').boundingBox())!;
  await page.mouse.move(rect.x + rect.width * 0.8, rect.y + rect.height * 0.2);
  await page.mouse.down();
  await page.mouse.move(rect.x + rect.width * 0.9, rect.y + rect.height * 0.3, { steps: 8 });
  await page.mouse.up();
  expect(await image(page)).not.toBe(work);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  expect(await image(page)).toBe(work);
  await scrollScene(page, 1.8);
  await expect.poll(() => image(page)).toBe(education);
  await page.setViewportSize({ width: 390, height: 844 });
  await scrollScene(page, 3.3);
  await expect(page.locator('canvas')).toHaveAttribute('height', '850');
  await expect(page.getByRole('status')).toContainText('revisit');
  await page.screenshot({ path: '/tmp/paint-experience-mobile.png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});


test('Paint builds the timeline with typing boxes and a moving pencil', async ({ page }) => {
  await ready(page);
  const box = page.locator('.paint-text-box');
  const cursor = page.locator('.paint-build-cursor');
  await scrollScene(page, 1.015);
  await expect(box).toBeVisible();
  await expect(cursor).toHaveAttribute('data-tool', 'text');
  const first = await box.getAttribute('data-text');
  expect('Education & Experience'.startsWith(first!)).toBe(true);
  await scrollScene(page, 1.025);
  await expect.poll(() => box.getAttribute('data-text')).not.toBe(first);
  const next = await box.getAttribute('data-text');
  expect(next!.startsWith(first!)).toBe(true);
  expect(next!.length).toBeLessThan('Education & Experience'.length);
  await page.screenshot({ path: '/tmp/paint-typing.png' });
  let pencil = false;
  for (let value = 1.05; value < 1.3; value += 0.01) {
    await scrollScene(page, value);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    if (await cursor.getAttribute('data-tool') === 'pencil') { pencil = true; break; }
  }
  expect(pencil).toBe(true);
  await expect(cursor).toBeVisible();
  await expect(box).toBeHidden();
  await page.screenshot({ path: '/tmp/paint-pencil.png' });
  await scrollScene(page, 3.3);
  await expect(cursor).toBeHidden();
  await expect(box).toBeHidden();
});


test('Save icon and File menu download the PDF CV and recent images navigate the timeline', async ({ page }) => {
  await ready(page);
  await expect(page.getByRole('button', { name: /Replay introduction/ })).toHaveCount(0);
  const toolbarDownload = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download CV (PDF)', exact: true }).click();
  expect((await toolbarDownload).suggestedFilename()).toBe('CV Louka Gauthier (en).pdf');
  await page.getByRole('button', { name: 'File', exact: true }).click();
  await expect(page.locator('.file-menu > button, .file-menu > .recent-files > button, .file-menu > a'))
    .toHaveText(['NewReload the page', 'OpenChoose a project image', 'Recent images▸', 'Save asCV · PDF document', 'About PaintView website source on GitHub']);
  const about = page.getByRole('link', { name: /About Paint/ });
  await expect(about).toHaveAttribute('href', 'https://github.com/LoukaG/loukag.com');
  await expect(about).toHaveAttribute('target', '_blank');
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Save as' }).click();
  expect((await download).suggestedFilename()).toBe('CV Louka Gauthier (en).pdf');
  const doc = await page.request.get('/cv.pdf');
  expect(doc.ok()).toBe(true);
  expect((await doc.body()).subarray(0, 5).toString()).toBe('%PDF-');
  await expect(page.locator('.file-menu')).toBeHidden();
  await page.getByRole('button', { name: 'File', exact: true }).click();
  const recent = page.getByRole('button', { name: 'Recent images', exact: true });
  const submenu = page.getByRole('group', { name: 'Recent images shortcuts' });
  await expect(submenu).toBeHidden();
  await recent.hover();
  await expect(submenu).toBeVisible();
  await expect(submenu.getByRole('button')).toHaveText(['Introduction', 'Education & Experience', 'Projects', 'Contact']);
  await submenu.getByRole('button', { name: 'Education & Experience', exact: true }).click();
  await expect(page.locator('.file-menu')).toBeHidden();
  await expect(page.getByRole('status')).toContainText('timeline');
  expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(900 * 3.2 / 3 * 1.04, 0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'File', exact: true }).click();
  await recent.click();
  await expect(submenu).toBeVisible();
  await submenu.getByRole('button', { name: 'Introduction', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect.poll(() => ink(page)).toBeGreaterThan(45000);
  await page.getByRole('button', { name: 'File', exact: true }).click();
  await recent.click();
  await submenu.getByRole('button', { name: 'Projects', exact: true }).click();
  await expect(page.locator('.file-menu')).toBeHidden();
  await expect(page.getByRole('dialog', { name: 'Open a project', exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'File', exact: true }).click();
  await recent.click();
  await submenu.getByRole('button', { name: 'Contact', exact: true }).click();
  await expect(page.locator('.file-menu')).toBeHidden();
  await expect(page.getByRole('link', { name: 'Email: loukagauthier55@gmail.com' })).toBeVisible();
});

test('New reloads the page', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'File', exact: true }).click();
  await Promise.all([
    page.waitForEvent('load'),
    page.getByRole('button', { name: 'New', exact: false }).click(),
  ]);
  await expect(page.locator('astro-island')).not.toHaveAttribute('ssr');
  expect(await page.evaluate(() => (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).type)).toBe('reload');
  await expect(page.locator('.file-menu')).toBeHidden();
});


test('scrolling past the timeline opens a project picker and project images in Paint', async ({ page }) => {
  await ready(page);
  await scrollScene(page, 3.8);
  const picker = page.getByRole('dialog', { name: 'Open a project', exact: true });
  await expect(picker).toBeVisible();
  await expect(picker.getByRole('radio')).toHaveCount(3);
  const lockedScroll = await page.evaluate(() => window.scrollY);
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
  await page.mouse.move(5, 5);
  await page.mouse.wheel(0, 1200);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await page.evaluate(() => window.scrollY)).toBe(lockedScroll);
  await page.screenshot({ path: '/tmp/paint-project-picker.png' });
  await picker.getByRole('radio', { name: 'Just Flip A Coin.png' }).check();
  await picker.getByRole('button', { name: 'Open', exact: true }).click();
  await expect(picker).toBeHidden();
  await expect(page.locator('canvas')).toHaveAttribute('aria-label', /Just Flip A Coin.*7,500\+/);
  await expect(page.getByRole('link', { name: /Visit project/ })).toHaveAttribute('href', 'https://play.google.com/store/apps/details?id=com.loukag.just_flip_a_coin');
  const coin = await image(page);
  await page.screenshot({ path: '/tmp/paint-project-coin.png' });
  const download = page.waitForEvent('download');
  await page.keyboard.press('ControlOrMeta+s');
  expect((await download).suggestedFilename()).toBe('Just Flip A Coin.png');
  await page.getByRole('button', { name: 'File', exact: true }).click();
  await page.getByRole('button', { name: 'Recent images', exact: true }).click();
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await expect(picker).toBeVisible();
  await picker.getByRole('textbox', { name: 'Search projects' }).fill('PolyfirGroup');
  await expect(picker.getByRole('radio')).toHaveCount(1);
  await picker.getByRole('button', { name: 'Open', exact: true }).click();
  await expect(page.locator('canvas')).toHaveAttribute('aria-label', /PolyfirGroup.*500\+ registered users and 1,000\+ downloads/);
  await page.screenshot({ path: '/tmp/paint-project-polyfirgroup.png' });
  await expect(page.getByRole('link', { name: /Visit project/ })).toHaveAttribute('href', 'https://polyfirgroup.com');
  expect(await image(page)).not.toBe(coin);
  await page.setViewportSize({ width: 390, height: 844 });
  await scrollScene(page, 3.8);
  await page.screenshot({ path: '/tmp/paint-project-polyfirgroup-mobile.png' });
  await page.getByRole('button', { name: 'Choose another project…', exact: true }).click();
  await expect(picker).toBeVisible();
  await page.screenshot({ path: '/tmp/paint-project-picker-mobile.png' });
  await picker.getByRole('radio', { name: 'PDF Toolkit.png' }).check();
  await picker.getByRole('button', { name: 'Open', exact: true }).click();
  await expect(page.locator('canvas')).toHaveAttribute('aria-label', /PDF Toolkit/);
  await expect(page.getByRole('link', { name: /Visit project/ })).toHaveAttribute('href', 'https://apps.microsoft.com/detail/9nqsnbhzw382');
  await page.screenshot({ path: '/tmp/paint-project-pdf-toolkit-mobile.png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.getByRole('button', { name: 'Choose another project…', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(picker).toBeHidden();
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
  const unlockedScroll = await page.evaluate(() => window.scrollY);
  await page.mouse.move(5, 5);
  await page.mouse.wheel(0, -150);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(unlockedScroll);
  await scrollScene(page, 3.3);
  await expect(page.getByRole('link', { name: /Visit project/ })).toBeHidden();
  await expect(page.getByRole('status')).toContainText('revisit');
});

test('the bucket fills the project black before contact details type in', async ({ page }) => {
  await ready(page);
  await scrollScene(page, 3.8);
  const picker = page.getByRole('dialog', { name: 'Open a project', exact: true });
  await picker.getByRole('radio', { name: 'PDF Toolkit.png' }).check();
  await picker.getByRole('button', { name: 'Open', exact: true }).click();
  await expect(page.locator('canvas')).toHaveAttribute('aria-label', /PDF Toolkit/);
  const project = await image(page);
  await scrollScene(page, 4.1);
  await expect(page.locator('.paint-build-cursor')).toHaveAttribute('data-tool', 'fill');
  await expect(page.locator('.build-bucket')).toBeVisible();
  await expect(page.getByRole('link', { name: /Visit project/ })).toBeHidden();
  await scrollScene(page, 4.3);
  await expect(page.getByRole('status')).toContainText('Filling');
  await expect.poll(() => page.locator('.paint-build-cursor').evaluate((cursor: HTMLElement) => parseFloat(cursor.style.left))).toBe(78);
  const fill = await image(page);
  await page.screenshot({ path: '/tmp/paint-bucket-fill.png' });
  await scrollScene(page, 4.44);
  await expect.poll(() => page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
    const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 0; i < pixels.length; i += 4) if (pixels[i] || pixels[i + 1] || pixels[i + 2]) return false;
    return true;
  })).toBe(true);
  await scrollScene(page, 4.48);
  await expect(page.locator('.paint-text-box')).toBeVisible();
  await expect(page.locator('.paint-build-cursor')).toHaveAttribute('data-tool', 'text');
  await expect(page.locator('.contact-hotspot')).toHaveCount(0);
  await scrollScene(page, 6.5);
  await expect(page.getByRole('link', { name: 'Email: loukagauthier55@gmail.com' })).toHaveAttribute('href', 'mailto:loukagauthier55@gmail.com');
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(page.locator('.contact-hotspot')).toHaveCount(3);
  await expect(page.locator('.paint-build-cursor')).toBeHidden();
  await page.screenshot({ path: '/tmp/paint-contact.png' });
  await scrollScene(page, 4.3);
  await expect.poll(() => image(page)).toBe(fill);
  await scrollScene(page, 3.6);
  await expect.poll(() => image(page)).toBe(project);
  await page.setViewportSize({ width: 390, height: 844 });
  await scrollScene(page, 6.5);
  await expect(page.getByRole('link', { name: /Email:/ })).toBeVisible();
  await page.screenshot({ path: '/tmp/paint-contact-mobile.png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await scrollScene(page, 4.3);
  await expect(page.locator('.paint-build-cursor')).toBeHidden();
  await scrollScene(page, 4.6);
  await expect(page.locator('.contact-hotspot')).toHaveCount(3);
});

test('Clippy resets only on scrolling, respects dialogs and shares one message per section', async ({ page }) => {
  await ready(page);
  await page.clock.install();
  // Re-arm after installing the clock so the inactivity timer uses virtual time.
  await page.evaluate(() => window.dispatchEvent(new Event('scroll')));
  const clippy = page.getByRole('complementary', { name: 'Clippy', exact: true });
  await page.clock.runFor(14_000);
  await expect(clippy).toBeHidden();
  await scrollScene(page, 0.01);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.clock.runFor(100);
  await page.clock.runFor(14_000);
  await expect(clippy).toBeHidden();
  await page.mouse.move(10, 10);
  await page.mouse.click(5, 5);
  await page.keyboard.press('Shift');
  await page.clock.runFor(1_001);
  await expect(clippy).toContainText('He drew that himself. Unfortunately. Scroll to see more of his drawing');
  await page.screenshot({ path: '/tmp/paint-clippy-desktop.png' });
  await page.getByRole('button', { name: 'Dismiss Clippy' }).click();
  await page.clock.runFor(30_000);
  await expect(clippy).toBeHidden();

  await scrollScene(page, 1.8);
  await page.clock.runFor(100);
  await expect(page.locator('.paint-scroll-hint')).toContainText('Education');
  await page.clock.runFor(100);
  await expect(clippy).toBeHidden();
  await page.clock.runFor(15_001);
  await expect(clippy).toContainText("That's a lot of experience for someone who still uses Paint.");

  await scrollScene(page, 3.8);
  await page.clock.runFor(100);
  const picker = page.getByRole('dialog', { name: 'Open a project', exact: true });
  await expect(picker).toBeVisible();
  await page.clock.runFor(20_000);
  await expect(clippy).toBeHidden();
  await picker.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.clock.runFor(15_001);
  await expect(clippy).toContainText('Some of these actually work!');

  await page.setViewportSize({ width: 390, height: 844 });
  await scrollScene(page, 6.5);
  await page.clock.runFor(100);
  await expect(page.locator('.paint-scroll-hint')).toContainText('Thanks');
  await page.clock.runFor(100);
  await expect(clippy).toBeHidden();
  await page.clock.runFor(15_001);
  await expect(clippy).toContainText("You made it! Most people don't scroll this far.");
  const rect = (await clippy.boundingBox())!;
  expect(rect.x).toBeGreaterThanOrEqual(0);
  expect(rect.x + rect.width).toBeLessThanOrEqual(390);
  await page.screenshot({ path: '/tmp/paint-clippy-mobile.png' });
  await scrollScene(page, 0);
  await page.clock.runFor(15_100);
  await expect(clippy).toBeHidden();
});
