const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set headers similar to a normal browser visit
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
  });

  try {
    const url = 'https://api.encar.com/search/car/list/mobile?count=5&q=(And.Hidden.N.)&sr=|ModifiedDate|0|5';
    console.log('Navigating to', url);
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Extract JSON response
    const content = await page.evaluate(() => document.body.innerText);
    console.log('Response content snippet:', content.substring(0, 200));
  } catch (err) {
    console.error('Error fetching via puppeteer:', err);
  } finally {
    await browser.close();
  }
})();
