import test from 'tape';
import puppeteer from 'puppeteer';

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
  await p.waitForSelector('#add-workspace');
  await p.click('#add-workspace');
  await p.waitForSelector('#workspace-name');
  await p.focus('#workspace-name');
  await p.keyboard.type(name);
  await p.click('#create-workspace');
}

async function workspace_exists(p, name) {
  let exists = false;

  await p.waitForSelector('.v-list-item__title');
  let workspaces = await p.evaluate(() => {
    let titles = [];
    let doc_nodes = document.querySelectorAll('.v-list-item__title');
    for (let node of doc_nodes) {
      titles.push(node.innerText);
    }
    return titles;
  });

  exists = workspaces.includes(name);

  return exists;
}

async function element_exists(empty = false, element_type, p, name) {
  let exists, list_is_empty, tables;

  await p.waitForSelector('[data-title="Tables"] .ws-detail-empty-list ');
  tables = await p.evaluate(element_type => {
    let titles = [];
    let doc_nodes = document.querySelectorAll('[data-title="' + element_type + '"] .ws-detail-empty-list ');
    for (let node of doc_nodes) {
      titles.push(node.innerText);
    }
    return titles;
  }, element_type);

  if (empty) {
    list_is_empty = tables.includes('info There\'s nothing here yet...');
    return list_is_empty;
  } else {
    exists = tables.includes(name);
    return exists;
  }
}


// Start of tests
test('e2e - Check that actions that should work, do work', async (t) => {
  // Arrange: Set up the page
  const b = await browser(width, height);
  const p = await b.newPage();
  await p.setViewport({ width, height });
  await p.goto('http://127.0.0.1:58080/');

  // Act: Test creating a workspace
  await create_workspace(p, 'puppeteer');

  // Assert: Check that the new workspace exists with no tables
  let exists = await workspace_exists(p, 'puppeteer');
  t.ok(exists, 'Workspace called "puppeteer" was created.');

  // Assert: Check that there are no tables or graphs yet
  exists = await element_exists(true, 'Tables', p, undefined);

  t.ok(exists, 'The new workspace has no tables.');

  exists = await element_exists(true, 'Graphs', p, undefined);
  t.ok(exists, 'The new workspace has no graphs.');

  // Cleanup
  await b.close();
  t.end();
});

test('e2e - Check that actions that shouldn\'t work, don\'t work', async (t) => {
  // Arrange: Set up the page
  const b = await browser(width, height);
  const p = await b.newPage();
  await p.setViewport({ width, height });
  await p.goto('http://127.0.0.1:58080/');

  // Act: Test creating invalid workspaces
  await create_workspace(p, '123');
  await p.click('#workspace-name', { clickCount: 3 });
  await p.click('#add-workspace'); // Close the modal (this will cause a failure in the next command if it is made)

  await create_workspace(p, '++--==__');
  await p.click('#workspace-name', { clickCount: 3 });
  await p.click('#add-workspace'); // Close the modal (this will cause a failure in the next command if it is made)

  await create_workspace(p, 'a');

  // Assert: Check that the new workspace exists with no tables
  await sleep(200);
  let exists = await workspace_exists(p, '123');
  t.notOk(exists, 'Workspace called "123" wasn\'t created.');

  exists = await workspace_exists(p, '++--==__');
  t.notOk(exists, 'Workspace called "++--==__" wasn\'t created.');

  exists = await workspace_exists(p, 'a');
  t.ok(exists, 'Workspace called "a" was created.');

  // Cleanup
  await b.close();
  t.end();
});
