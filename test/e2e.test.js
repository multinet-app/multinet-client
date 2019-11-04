import test from 'tape';
import puppeteer from 'puppeteer';

let browser;
const width = 1920;
const height = 1080;

browser = async () => await puppeteer.launch({
    headless: false,
    args: [`--window-size=${width},${height}`],
    slowMo: 200
})

test('e2e client test', async (t) => { 
    t.ok("hello", "It's working.");

    browser()
    .then(d => {t.ok(d, "puppeteer is live");})

    t.end();
})