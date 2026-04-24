// Use dynamic import to find playwright
const { chromium } = await import('playwright-core');

console.log('Launching Chrome with Profile 1...');
const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: false,
  args: [
    '--user-data-dir=C:\\Users\\27jam\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1',
    '--no-first-run',
    '--no-default-browser-check'
  ]
});
console.log('✓ Browser launched successfully');

const page = await browser.newPage();
await page.goto('https://mail.google.com', { timeout: 20000 });
console.log('✓ Navigated to Gmail');

await page.screenshot({ path: 'test-gmail.png', timeout: 10000 });
console.log('✓ Screenshot saved to test-gmail.png');

await browser.close();
console.log('✓ Browser closed');
console.log('SUCCESS: Playwright can control Chrome Profile 1');
