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

const debug = !!process.env.DEBUG;

// Opens the chromium window
function browser(w, h) {
  return puppeteer.launch({
    headless: !debug,
    args: [`--window-size=${w},${h}`],
    slowMo: debug ? 250 : 0,
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  await sleep(2000);
  await p.click('#got-it');

  return [b, p];
}

async function getElementCoords(p, selector) {
  const el = await p.$(selector);
  const bb = await el.boundingBox();

  return {
    x: bb.x + bb.width / 2,
    y: bb.y + bb.height / 2,
  };
}

// Clicks the add workspace button, types a name, and clicks the button
async function createWorkspace(p, name) {
  await p.waitForSelector('#add-workspace');
  await p.click('#add-workspace');
  await p.waitForSelector('#workspace-name');
  await p.focus('#workspace-name');
  await p.keyboard.type(name);
  await p.click('#create-workspace');
}

async function deleteWorkspace(p, name) {
  // Move the mouse over the workspace entry to make the checkbox appear.
  const entry = `a[href="#/workspaces/${name}/"]`;
  const coords = await getElementCoords(p, entry);
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

async function getWorkspaceNames(p) {
  return p.evaluate(() => {
    const titles = [];
    const docNodes = document.querySelectorAll('.v-list-item__title');
    docNodes.forEach((node) => {
      titles.push(node.innerText);
    });
    return titles;
  });
}

// Checks that a workspace exists in the left pane
async function workspaceExists(p, name) {
  const workspaces = await getWorkspaceNames(p);

  return workspaces.includes(name);
}

// Get the names of either all tables or all graphs in the current workspace
async function getElementNames(elementType, p) {
  // Search for the text of the table or graph elements
  await p.waitForSelector(`[data-title="${elementType}"] .ws-detail-empty-list`);
  const tables = await p.evaluate((elType) => {
    const titles = [];
    const docNodes = document.querySelectorAll(`[data-title="${elType}"] .ws-detail-empty-list`);
    docNodes.forEach((node) => {
      titles.push(node.innerText);
    });
    return titles;
  }, elementType);

  return tables;
}

// Checks if no tables or graphs exist in the current workspace
async function elementsEmpty(elementType, p) {
  const tables = await getElementNames(elementType, p);
  return tables.includes('info There\'s nothing here yet...');
}

// Declare global variables for the browser and page objects.
let b;
let p;

test('Create a valid workspace', async (t) => {
  // Set up the browser/page.
  [b, p] = await setup();

  // First, figure out a name we can use for the workspace.
  const workspaces = await getWorkspaceNames(p);
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
  await createWorkspace(p, name);
  await sleep(500);

  // Check that the new workspace now exists.
  const exists = await workspaceExists(p, name);
  t.ok(exists, `Workspace "${name}" was created`);

  // Check that the new workspace has no tables or networks.
  const tables = await elementsEmpty('Tables', p);
  t.ok(tables, 'The new workspace has no tables');

  const networks = await elementsEmpty('Networks', p);
  t.ok(networks, 'The new workspace has no networks');

  // Delete the workspace.
  await deleteWorkspace(p, name);
  await sleep(1000);
  const deleted = !await workspaceExists(p, name);
  t.ok(deleted, `Workspace "${name}" was deleted`);

  t.end();
});

test('Create a workspace with an invalid name (consisting of numbers)', async (t) => {
  const workspaces = await getWorkspaceNames(p);
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

  await createWorkspace(p, name);
  await p.click('#workspace-name', {
    clickCount: 3,
  });
  await p.click('#add-workspace');

  const workspaces2 = await getWorkspaceNames(p);
  t.ok(!workspaces2.includes(name), `Workspace with invalid name "${name}" was not created`);

  t.end();
});

test('Create a workspace with an invalid name (consisting of punctuation)', async (t) => {
  const workspaces = await getWorkspaceNames(p);
  const name = '++--==__';
  if (workspaces.includes(name)) {
    throw new Error('fatal: could not find an unused name');
  }

  await createWorkspace(p, name);
  await p.click('#workspace-name', {
    clickCount: 3,
  });
  await p.click('#add-workspace');

  const workspaces2 = await getWorkspaceNames(p);
  t.ok(!workspaces2.includes(name), `Workspace with invalid name "${name}" was not created`);

  await b.close();

  t.end();
});
