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
  await page.getByRole('button', { name: 'Save image', exact: true }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('Louka-Gauthier-Paint.png');
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  expect(await ink(page)).toBe(0);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  expect(await image(page)).toBe(after);
  expect(errors).toEqual([]);
});

test('scroll over canvas erases pixels along the visible cursor and reverses exactly', async ({ page }) => {
  await ready(page);
  const before = await image(page);
  const initialInk = await ink(page);
  const rect = (await page.locator('canvas').boundingBox())!;
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.wheel(0, 1400);
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
  await page.mouse.wheel(0, 10000);
  await expect.poll(() => ink(page)).toBe(0);
  await expect(page.locator('.eraser-cursor')).toBeHidden();
  // The finished scene remains a usable drawing surface.
  await page.mouse.move(rect.x + 30, rect.y + 30);
  await page.mouse.down();
  await page.mouse.move(rect.x + 170, rect.y + 65, { steps: 12 });
  await page.mouse.up();
  expect(await ink(page)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  expect(await ink(page)).toBe(0);
  await page.mouse.wheel(0, -10000);
  await expect.poll(() => image(page)).toBe(before);
  await page.mouse.wheel(0, 10000);
  await expect.poll(() => ink(page)).toBe(0);
  await page.getByRole('button', { name: 'Replay introduction', exact: false }).click();
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
  await page.mouse.wheel(0, 10000);
  await expect.poll(() => ink(page)).toBe(0);
  await expect(page.locator('.eraser-cursor')).toBeHidden();
  await page.getByRole('button', { name: 'Replay introduction', exact: false }).click();
  await expect.poll(() => image(page)).toBe(before);
  await page.setViewportSize({ width: 1100, height: 700 });
  await expect(canvas).toHaveAttribute('width', '960');
  await expect.poll(() => ink(page)).toBeGreaterThan(45000);
});
