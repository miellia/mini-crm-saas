import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.join(process.cwd(), 'public', 'screenshots');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    executablePath: EDGE_PATH,
    headless: 'new' 
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to login...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'login.png') });
  console.log('Captured login.png');

  // Login
  console.log('Logging in...');
  await page.type('input[type="email"]', 'admin@crm.com');
  await page.type('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');

  // Wait for dashboard to load by waiting for a stat card
  await page.waitForSelector('.stat-card', { timeout: 10000 });
  // Add a slight delay for charts to render fully
  await new Promise((r) => setTimeout(r, 1000));
  
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dashboard.png') });
  console.log('Captured dashboard.png');

  // Navigate to Customers
  console.log('Navigating to Customers...');
  await page.goto('http://localhost:3000/customers', { waitUntil: 'networkidle0' });
  await page.waitForSelector('table', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'customers.png') });
  console.log('Captured customers.png');

  // Navigate to Customer Profile
  console.log('Navigating to Customer Profile...');
  const customerLink = await page.$('tbody tr td a');
  if (customerLink) {
    await customerLink.click();
    await page.waitForSelector('.animate-fade-in', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'customer-profile.png') });
    console.log('Captured customer-profile.png');
  }

  // Navigate to Pipeline
  console.log('Navigating to Pipeline...');
  await page.goto('http://localhost:3000/pipeline', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.pipeline-column', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pipeline.png') });
  console.log('Captured pipeline.png');

  await browser.close();
  console.log('Screenshots completed.');
})();
