import test from 'tape';
import puppeteer from 'puppeteer';

const width = 1920;
const height = 1080;

function browser(width, height) {
    return puppeteer.launch({
    headless: false,
    args: [`--window-size=${width},${height}`],
    slowMo: 100
    });
}

test('e2e client test', async (t) => {
    t.ok("hello", "It's working.");

    // Set up the page
    const b = await browser(width, height);
    const p = await b.newPage();
    await p.setViewport({ width, height });
    await p.goto("http://127.0.0.1:8080/");
    
    // Test creating a workspace
    await p.waitForSelector("#add-workspace");
    await p.click("#add-workspace")
    await p.waitForSelector("#workspace-name");
    await p.focus('#workspace-name')
    await p.keyboard.type('puppeteer')
    await p.click("#create-workspace")



    t.ok(b, "puppeteer is live");

    await b.close();

    t.end();
});
