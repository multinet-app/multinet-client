import test from 'tape';
import puppeteer from 'puppeteer';

const width = 1920;
const height = 1080;

function browser(width, height) {
  return puppeteer.launch({
    headless: true,
    args: [`--window-size=${width},${height}`],
    slowMo: 200
  });
}

test('e2e client test', async (t) => {
  t.ok("hello", "It's working.");

  const b = await browser(width, height);

  t.ok(browser, "puppeteer is live");

  await b.close();

  t.end();
});
