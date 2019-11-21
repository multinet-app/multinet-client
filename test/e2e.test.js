import test from "tape";
import puppeteer from "puppeteer";

const width = 1920;
const height = 1080;

// Opens the chromium window
function browser(width, height) {
    return puppeteer.launch({
    headless: true,
    args: [`--window-size=${width},${height}`],
    // slowMo: 20 // For testing
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Clicks the add workspace button, types a name, and clicks the button
async function create_workspace(p, name) {
    await p.waitForSelector("#add-workspace");
    await p.click("#add-workspace")
    await p.waitForSelector("#workspace-name");
    await p.focus("#workspace-name")
    await p.keyboard.type(name)
    await p.click("#create-workspace")
}

async function workspace_exists(p, name) {
    let exists = false;

    await p.waitForSelector(".v-list-item__title");
    let workspaces = await p.evaluate(() => {
        let titles = []
        let doc_nodes = document.querySelectorAll(".v-list-item__title"); 
        for (node of doc_nodes) {
            titles.push(node.innerText)
        }
        return titles
    });

    exists = workspaces.includes(name)

    return exists
}

async function node_table_exists(p, name, empty = false) {
    let exists = false;

    await p.waitForSelector(".ws-detail-empty-list");
    let tables = await p.evaluate(() => {
        let titles = []
        let doc_nodes = document.querySelectorAll(".ws-detail-empty-list"); 
        for (node of doc_nodes) {
            titles.push(node.innerText)
        }
        return titles
    });
    console.log(tables)

    // TODO: fix this
    if (empty) {
        return tables.length
    } else {
        exists = tables.includes(name)
        return exists
    }
}

// Start of tests
test("e2e - Check that actions that should work, do work", async (t) => {
    // Arrange: Set up the page
    const b = await browser(width, height);
    const p = await b.newPage();
    await p.setViewport({ width, height });
    await p.goto("http://127.0.0.1:8080/");
    
    // Act: Test creating a workspace
    await create_workspace(p, "puppeteer")

    // Assert: Check that the new workspace exists with no tables
    let exists = await workspace_exists(p, "puppeteer")
    t.equal(exists, true, "Workspace called 'puppeteer' was created.")

    // Assert: Check that there are no tables or graphs yet
    exists = await node_table_exists(p, "", true)
    t.equal(exists, 0, "The new workspace has no tables.")

    let graphs = await p.evaluate(() => document.querySelectorAll(".ws-detail-empty-list")[1].innerText.split("info ")[1]);
    t.equal(graphs, "There's nothing here yet...", "The new workspace has no graphs.")

    // Cleanup
    await b.close();
    t.end();
});

test("e2e - Check that actions that shouldn't work, don't work", async (t) => {
    // Arrange: Set up the page
    const b = await browser(width, height);
    const p = await b.newPage();
    await p.setViewport({ width, height });
    await p.goto("http://127.0.0.1:8080/");
    
    // Act: Test creating invalid workspaces
    await create_workspace(p, "123")
    await p.click("#workspace-name", { clickCount: 3 })
    await p.click("#add-workspace") // Close the modal (this will cause a failure in the next command if it is made)

    await create_workspace(p, "++--==__")
    await p.click("#workspace-name", { clickCount: 3 })
    await p.click("#add-workspace") // Close the modal (this will cause a failure in the next command if it is made)

    await create_workspace(p, "a")

    // Assert: Check that the new workspace exists with no tables
    await sleep(200)
    let exists = await workspace_exists(p, "123")
    t.equal(exists, false, "Workspace called '123' wasn't created.")

    exists = await workspace_exists(p, "++--==__")
    t.equal(exists, false, "Workspace called '++--==__' wasn't created.")

    exists = await workspace_exists(p, "a")
    t.equal(exists, true, "Workspace called 'a' was created.")

    // Cleanup
    await b.close();
    t.end();
});