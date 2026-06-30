const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Listen for all responses
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api.encar.com') || url.includes('/search/') || url.includes('.json')) {
      if (response.request().resourceType() === 'fetch' || response.request().resourceType() === 'xhr') {
        try {
          const text = await response.text();
          if (text.includes('SearchResults')) {
             console.log('FOUND API URL:', url);
             console.log('Response Snippet:', text.substring(0, 300));
          }
        } catch (e) {
          // ignore
        }
      }
    }
  });

  try {
    const url = 'https://www.encar.com/dc/dc_carsearchlist.do?carType=kor&searchType=model&TG.R=A';
    console.log('Navigating to', url);
    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log('Page loaded, waiting 3 seconds...');
    await new Promise(r => setTimeout(r, 3000));
  } catch (err) {
    console.error('Error fetching via puppeteer:', err);
  } finally {
    await browser.close();
  }
})();
