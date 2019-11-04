import test from 'tape';
import puppeteer from 'puppeteer';

let browser;
const width = 1920;
const height = 1080;

// const browser = puppeteer.launch({
//     headless: false,
//     args: [`--window-size=${width},${height}`],
//     slowMo: 200
// })

test('e2e client test', async (t) => { 
    t.ok("hello", "It's working.");

    const browser = await puppeteer.launch({
        headless: false,
        args: [`--window-size=${width},${height}`],
        slowMo: 200
    })

    browser
    .then(d => {t.ok(d, "puppeteer is live"); return d;})
    .then(d => d.close())

    t.end();
})