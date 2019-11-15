import test from 'tape';
import puppeteer from 'puppeteer';

const width = 1920;
const height = 1080;

function browser(width, height) {
    return puppeteer.launch({
    headless: true,
    args: [`--window-size=${width},${height}`],
    // slowMo: 20
    });
}

test('e2e-client-test-valid-actions', async (t) => {
    // Arrange: Set up the page
    const b = await browser(width, height);
    const p = await b.newPage();
    await p.setViewport({ width, height });
    await p.goto("http://127.0.0.1:8080/");
    
    // Act: Test creating a workspace
    await p.waitForSelector("#add-workspace");
    await p.click("#add-workspace")
    await p.waitForSelector("#workspace-name");
    await p.focus('#workspace-name')
    await p.keyboard.type('puppeteer')
    await p.click("#create-workspace")

    // Assert: Check that the new workspace exists with no tables
    await p.waitForSelector(".v-list-item");
    await p.waitForSelector(".v-list-item__title");
    const workspace_name = await p.evaluate(() => document.querySelector('.v-list-item__title').innerText);
    t.equal(workspace_name, "puppeteer", "The new workspace is created and called the right thing.")

    // Assert: Check that there are no tables or graphs yet
    await p.waitForSelector(".ws-detail-empty-list");
    let tables = await p.evaluate(() => document.querySelectorAll('.ws-detail-empty-list')[0].innerText.split("info ")[1]);
    t.equal(tables, "There's nothing here yet...", "The new workspace has no tables.")

    let graphs = await p.evaluate(() => document.querySelectorAll('.ws-detail-empty-list')[1].innerText.split("info ")[1]);
    t.equal(graphs, "There's nothing here yet...", "The new workspace has no graphs.")

    // Act: Add a node table, an edge table, and a graph
    await p.waitForSelector("#add-table");
    await p.click("#add-table")
    await p.focus('#table-name')
    await p.keyboard.type('nodes')
    // await p.click("#file-selector")

    // Assert: Check the tables and graph exist


    // Act: Check that the tables imported correctly, the data should show what we expect


    await b.close();

    t.end();
});

test('e2e-client-test-invalid-actions', async (t) => {
    // Arrange: Set up the page
    const b = await browser(width, height);
    const p = await b.newPage();
    await p.setViewport({ width, height });
    await p.goto("http://127.0.0.1:8080/");
    
    // Act: Test creating invalid workspaces
    await p.waitForSelector("#add-workspace");
    await p.click("#add-workspace")
    await p.waitForSelector("#workspace-name");
    await p.focus('#workspace-name')
    await p.keyboard.type('123')
    await p.click("#create-workspace")
    await p.click("#workspace-name", { clickCount: 3 })
    await p.focus('#workspace-name')
    await p.keyboard.type('++--==__')
    await p.click("#create-workspace")
    await p.click("#workspace-name", { clickCount: 3 })
    await p.focus('#workspace-name')
    await p.keyboard.type('a')
    await p.click("#create-workspace")

    // Assert: Check that the new workspace exists with no tables
    await p.waitForSelector(".v-list-item");
    await p.waitForSelector(".v-list-item__title");
    const workspace_name = await p.evaluate(() => document.querySelector('.v-list-item__title').innerText);
    t.equal(workspace_name, "a", "Invalid workspaces weren't created but the last valid one was.")

    // Assert: Check that there are no tables or graphs yet
    await p.waitForSelector(".ws-detail-empty-list");
    let tables = await p.evaluate(() => document.querySelectorAll('.ws-detail-empty-list')[0].innerText.split("info ")[1]);
    t.equal(tables, "There's nothing here yet...", "The new workspace has no tables.")

    let graphs = await p.evaluate(() => document.querySelectorAll('.ws-detail-empty-list')[1].innerText.split("info ")[1]);
    t.equal(graphs, "There's nothing here yet...", "The new workspace has no graphs.")

    // Act: Add a node table, an edge table, and a graph
    await p.waitForSelector("#add-table");
    await p.click("#add-table")
    await p.focus('#table-name')
    await p.keyboard.type('nodes')
    // await p.click("#file-selector")

    // Assert: Check the tables and graph exist


    // Act: Check that the tables imported correctly, the data should show what we expect


    await b.close();

    t.end();
});