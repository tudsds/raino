const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('Launching Chrome...');
  const browser = await chromium.launch({
    headless: false,
    executablePath: '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe',
    args: [
      '--profile-directory=Profile 1',
      '--user-data-dir=/mnt/c/Users/27jam/AppData/Local/Google/Chrome/User Data'
    ]
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Navigate to raino-studio.vercel.app
  console.log('Navigating to raino-studio.vercel.app...');
  await page.goto('https://raino-studio.vercel.app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(__dirname, '.sisyphus/evidence/task-3-studio-loaded.png'), fullPage: true });
  console.log('Screenshot saved: task-3-studio-loaded.png');
  
  // Navigate to mail.google.com
  console.log('Navigating to mail.google.com...');
  await page.goto('https://mail.google.com', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(__dirname, '.sisyphus/evidence/task-3-gmail-access.png'), fullPage: true });
  console.log('Screenshot saved: task-3-gmail-access.png');
  
  await browser.close();
  console.log('Done!');
})();
