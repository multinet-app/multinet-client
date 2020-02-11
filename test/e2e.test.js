import process from 'process';

import test from 'tape';
import puppeteer from 'puppeteer';

process.on('unhandledRejection', (error) => {
  console.log('FATAL: unhandled promise rejection');
  console.log(error);

  process.exit(1);
});

const width = 1920;
const height = 1080;

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || '8080';
const url = `http://${host}:${port}/`;

// Opens the chromium window
function browser(width, height) {
  return puppeteer.launch({
    headless: true,
    args: [`--window-size=${width},${height}`],
    // slowMo: 20 // For testing
  });
}

// Sets up the browser with some default settings
async function setup() {
  // Create a browser.
  const b = await browser(width, height);

  // Create a page.
  const p = await b.newPage();
  await p.setViewport({ width, height });
  await p.setDefaultTimeout(5000);

  // Navigate to the app, and dismiss the "got it" dialog.
  await p.goto(url);
  await p.waitForSelector('#got-it');
  await p.click('#got-it');

  return [b, p];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function get_element_coords(p, selector) {
  const el = await p.$(selector);
  const bb = await el.boundingBox();

  return {
    x: bb.x + bb.width / 2,
    y: bb.y + bb.height / 2,
  };
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

async function delete_workspace(p, name) {
  // Move the mouse over the workspace entry to make the checkbox appear.
  const entry = `a[href="#/workspaces/${name}/"]`;
  const coords = await get_element_coords(p, entry);
  await p.mouse.move(coords.x, coords.y);

  // Click on the checkbox, then on the delete icon.
  const selector = `${entry} input`;
  await p.waitForSelector(selector);
  await p.click(selector);
  await p.click('#delete-workspaces');

  // Wait for the delete dialog to appear, and for the "Yes" button to become
  // active.
  await sleep(4000);

  // Click on the "yes".
  await p.click('#delete-workspace-yes');
}

async function get_workspace_names(p) {
  await p.waitForSelector('.v-list-item__title');
  return p.evaluate(() => {
    let titles = [];
    let doc_nodes = document.querySelectorAll('.v-list-item__title');
    for (let node of doc_nodes) {
      titles.push(node.innerText);
    }
    return titles;
  });
}

// Checks that a workspace exists in the left pane
async function workspace_exists(p, name) {
  await p.waitForSelector('.v-list-item__title');
  const workspaces = await get_workspace_names(p);

  return workspaces.includes(name);
}

// Get the names of either all tables or all graphs in the current workspace
async function get_element_names(element_type, p) {
  let tables;

  // Search for the text of the table or graph elements
  await p.waitForSelector(`[data-title="${element_type}"] .ws-detail-empty-list`);
  tables = await p.evaluate(element_type => {
    let titles = [];
    let doc_nodes = document.querySelectorAll(`[data-title="${element_type}"] .ws-detail-empty-list`);
    for (let node of doc_nodes) {
      titles.push(node.innerText);
    }
    return titles;
  }, element_type);

  return tables;
}

// Checks if a table or graph exists in the current workspace
async function element_exists(element_type, p, name) {
  let exists, tables;

  tables = await get_element_names(element_type, p);

  exists = tables.includes(name);
  return exists;
}

// Checks if no tables or graphs exist in the current workspace
async function elements_empty(element_type, p) {
  let list_is_empty, tables;

  tables = await get_element_names(element_type, p);

  list_is_empty = tables.includes('info There\'s nothing here yet...');
  return list_is_empty;
}

// Declare global variables for the browser and page objects.
let b;
let p;

test('Create a valid workspace', async (t) => {
  // Set up the browser/page.
  [b, p] = await setup();

  // First, figure out a name we can use for the workspace.
  const workspaces = await get_workspace_names(p);
  let name;
  const limit = 1000;
  let i;
  for (i = 0; i < limit; i++) {
    name = `puppeteer${i}`;
    if (!workspaces.includes(name)) {
      break;
    }
  }
  if (i === limit) {
    throw new Error('fatal: could not find an unused name');
  }

  // Create the workspace.
  await create_workspace(p, name);
  await sleep(500);

  // Check that the new workspace now exists.
  const exists = await workspace_exists(p, name);
  t.ok(exists, `Workspace "${name}" was created`);

  // Check that the new workspace has no tables or networks.
  const tables = await elements_empty('Tables', p);
  t.ok(tables, 'The new workspace has no tables');

  const networks = await elements_empty('Networks', p);
  t.ok(networks, 'The new workspace has no networks');

  // Delete the workspace.
  await delete_workspace(p, name);
  await sleep(1000);
  const deleted = !await workspace_exists(p, name);
  t.ok(deleted, `Workspace "${name}" was deleted`);

  t.end();
});

test('Create a workspace with an invalid name (consisting of numbers)', async (t) => {
  const workspaces = await get_workspace_names(p);
  let name;
  const limit = 1000;
  for (name = 123; name < limit; name++) {
    if (!workspaces.includes(`${name}`)) {
      break;
    }
  }
  if (name === limit) {
    throw new Error('fatal: could not find an unused name');
  }
  name = `${name}`;

  await create_workspace(p, name);
  await p.click('#workspace-name', {
    clickCount: 3,
  });
  await p.click('#add-workspace');

  const workspaces2 = await get_workspace_names(p);
  t.ok(!workspaces2.includes(name), `Workspace with invalid name "${name}" was not created`);

  t.end();
});

test('Create a workspace with an invalid name (consisting of punctuation)', async (t) => {
  const workspaces = await get_workspace_names(p);
  const name = '++--==__';
  if (workspaces.includes(name)) {
    throw new Error('fatal: could not find an unused name');
  }

  await create_workspace(p, name);
  await p.click('#workspace-name', {
    clickCount: 3,
  });
  await p.click('#add-workspace');

  const workspaces2 = await get_workspace_names(p);
  t.ok(!workspaces2.includes(name), `Workspace with invalid name "${name}" was not created`);

  await b.close();

  t.end();
});

// Start of tests
test.skip('e2e - Check that actions that should work, do work', async (t) => {
  // Arrange: Set up the page
  const [b, p] = await setup();

  // Act: Test creating a workspace
  await create_workspace(p, 'puppeteer');

  // Assert: Check that the new workspace exists with no tables
  let exists = await workspace_exists(p, 'puppeteer');
  t.ok(exists, 'Workspace called "puppeteer" was created.');

  // Assert: Check that there are no tables or graphs yet
  exists = await elements_empty('Tables', p, undefined);

  t.ok(exists, 'The new workspace has no tables.');

  exists = await elements_empty('Networks', p, undefined);
  t.ok(exists, 'The new workspace has no networks.');

  // Cleanup
  await b.close();
  t.end();
});

test.skip('e2e - Check that actions that shouldn\'t work, don\'t work', async (t) => {
  // Arrange: Set up the page
  const [b, p] = await setup();

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

  exists = await element_exists('Tables', p, 'broken');
  t.notOk(exists, 'New workspaces don\'t have tables');

  // Cleanup
  await b.close();
  t.end();
});
