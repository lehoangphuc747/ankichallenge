import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function main() {
  const statsData = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src/data/ac11_stats.json'), 'utf8'));
  const days = statsData.meta?.daysAvailable || [];
  const firstSlug = days[0]?.toLowerCase().replace(' ', '') || 'day1';
  const lastSlug = days[days.length - 1]?.toLowerCase().replace(' ', '') || 'day55';
  const slugRange = `${firstSlug}_${lastSlug}`; // e.g. day1_day55
  const shortRange = slugRange.replace(/day(\d+)/g, 'd$1'); // e.g. d1_d55

  const htmlPath = path.join(projectRoot, `dashboard_checkin_${slugRange}.html`);
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`File not found: ${htmlPath}`);
  }

  console.log('Launching browser with Puppeteer...');
  const launchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  };
  const chromePath = '/home/phuclee/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome';
  if (fs.existsSync(chromePath)) {
    launchOptions.executablePath = chromePath;
  }

  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 1800, deviceScaleFactor: 2 });
    
    const fileUrl = `file://${htmlPath}`;
    console.log(`Navigating to ${fileUrl}...`);
    await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait a brief moment for Chart.js animations to complete
    await new Promise(r => setTimeout(r, 1500));

    // Hide unnecessary buttons in the screenshot if any
    await page.evaluate(() => {
      const actions = document.querySelector('.header-actions');
      if (actions) actions.style.display = 'none';
      const pagination = document.querySelector('.pagination');
      if (pagination) pagination.style.display = 'none';
    });

    const targets = [
      `anki_challenge_${slugRange}_chart.jpg`,
      `public/anki_challenge_${slugRange}_chart.jpg`,
      `anki_challenge_${shortRange}_chart.jpg`,
      `public/anki_challenge_${shortRange}_chart.jpg`
    ];

    console.log('Capturing screenshot...');
    const buffer = await page.screenshot({
      type: 'jpeg',
      quality: 90,
      fullPage: true
    });

    for (const t of targets) {
      const fullPath = path.join(projectRoot, t);
      fs.writeFileSync(fullPath, buffer);
      console.log(`Saved: ${t} (${Math.round(buffer.length / 1024)} KB)`);
    }

    console.log('All charts generated successfully via Puppeteer!');
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
