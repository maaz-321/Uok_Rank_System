import puppeteer from 'puppeteer';

const BASE = process.env.SMOKE_BASE || 'http://localhost:4173';
const errors = [];
const logs = [];

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 950 });

page.on('console', (msg) => {
  const text = msg.text();
  logs.push(`[${msg.type()}] ${text}`);
  // Browser-generated network noise for intentionally rejected requests
  // (401 for bad credentials, 403 for role checks) is not an app error.
  if (msg.type() === 'error' && !text.startsWith('Failed to load resource')) {
    errors.push(`console.error: ${text}`);
  }
});
page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
page.on('requestfailed', (req) => {
  const url = req.url();
  if (!url.includes('fonts.g')) errors.push(`requestfailed: ${url} ${req.failure()?.errorText}`);
});

const step = async (name, fn) => {
  const before = errors.length;
  try {
    await fn();
  } catch (err) {
    errors.push(`step "${name}" threw: ${err.message}`);
  }
  const added = errors.slice(before);
  console.log(`${added.length ? 'FAIL' : ' OK '} ${name}${added.length ? ' -> ' + added.join(' | ') : ''}`);
};

await step('load /login', async () => {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('input[type=email]', { timeout: 15000 });
});

await step('login page renders brand + form', async () => {
  const text = await page.evaluate(() => document.body.innerText);
  if (!text.includes('Sign in to your portal')) throw new Error('missing login heading');
  if (!text.includes('University of Karachi')) throw new Error('missing brand');
});

await step('dark mode toggle', async () => {
  const before = await page.evaluate(() => document.documentElement.className);
  await page.click('button[aria-label*="dark mode"], button[aria-label*="light mode"]');
  await new Promise((r) => setTimeout(r, 400));
  const after = await page.evaluate(() => document.documentElement.className);
  if (before === after) throw new Error(`class unchanged: ${before}`);
});

await step('invalid login shows toast', async () => {
  await page.type('input[type=email]', 'nobody@example.com');
  await page.type('input[type=password]', 'wrongpassword');
  await page.click('button[type=submit]');
  await page.waitForFunction(
    () => document.body.innerText.includes('Sign in failed'),
    { timeout: 15000 },
  );
});

await step('register page renders', async () => {
  await page.goto(`${BASE}/register`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('select', { timeout: 15000 });
  const text = await page.evaluate(() => document.body.innerText);
  if (!text.includes('Create your account')) throw new Error('missing register heading');
});

await step('register validation errors show', async () => {
  await page.click('button[type=submit]');
  await page.waitForFunction(
    () => document.body.innerText.includes('Select your department'),
    { timeout: 15000 },
  );
});

const email = `smoke.${Date.now()}@uok.edu.pk`;
const password = 'Password123';

await step('register succeeds', async () => {
  const inputs = await page.$$('input');
  await inputs[0].type('Dr. Smoke Tester');
  await inputs[1].type(email);
  await inputs[2].type(password);
  await inputs[3].type(password);
  await page.select('select', 'Physics');
  await page.click('button[type=submit]');
  await page.waitForFunction(() => location.pathname === '/login', { timeout: 20000 });
  // React Router updates the URL before the new route renders, so wait for the
  // login form itself rather than the path alone.
  await page.waitForFunction(
    () => document.body.innerText.includes('Sign in to your portal'),
    { timeout: 20000 },
  );
});

await step('login succeeds and lands on /dashboard', async () => {
  await page.waitForSelector('input[type=email]', { timeout: 15000 });
  await page.click('input[type=email]', { clickCount: 3 });
  await page.type('input[type=email]', email);
  await page.click('input[type=password]', { clickCount: 3 });
  await page.type('input[type=password]', password);
  await page.click('button[type=submit]');
  await page.waitForFunction(() => location.pathname === '/dashboard', { timeout: 20000 });
  await page.waitForFunction(
    () => document.body.innerText.includes('Welcome, Dr.'),
    { timeout: 15000 },
  );
});

await step('faculty dashboard renders academic form', async () => {
  const text = await page.evaluate(() => document.body.innerText);
  if (!text.includes('Personal & contact details')) throw new Error('missing personal section');
  if (!text.includes('Academic qualifications')) throw new Error('missing qualifications section');
});

await step('academic form saves', async () => {
  const setInput = async (label, value) => {
    const handle = await page.evaluateHandle((lbl) => {
      const labels = [...document.querySelectorAll('label')];
      const label = labels.find((node) => node.textContent.trim().startsWith(lbl));
      return label ? document.getElementById(label.getAttribute('for')) : null;
    }, label);
    const element = handle.asElement();
    if (!element) throw new Error(`field not found: ${label}`);
    await element.click({ clickCount: 3 });
    await element.type(value);
  };

  await setInput('Father / Guardian name', 'Ali Khan');
  await setInput('CNIC / B-Form number', '42101-1234567-8');
  await setInput('Domicile district', 'Karachi');
  await setInput('Postal address', '12 University Road Karachi');
  await setInput('Permanent address', '22 Shahrah-e-Faisal Karachi');

  await page.select('select[name=gender]', 'Male');
  await page.evaluate(() => {
    const dob = document.querySelector('input[type=date]');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(dob, '1985-05-10');
    dob.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await setInput('Degree title', 'Ph.D. in Physics');
  await setInput('Board / University', 'University of Karachi');
  await setInput('Passing year', '2015');
  await setInput('Obtained marks', '80');
  await setInput('Total marks', '100');
  await page.select('select[name="qualifications.0.degreeLevel"]', 'Ph.D');

  const buttons = await page.$$('button');
  for (const button of buttons) {
    const text = await page.evaluate((el) => el.textContent, button);
    if (text.includes('Save academic record')) {
      await button.click();
      break;
    }
  }
  await page.waitForFunction(
    () => document.body.innerText.includes('Academic record saved'),
    { timeout: 20000 },
  );
});

await step('command palette opens with Ctrl+K', async () => {
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyK');
  await page.keyboard.up('Control');
  // innerText does not include input placeholders, so assert on a rendered item.
  await page.waitForFunction(
    () => document.body.innerText.includes('Go to my dashboard'),
    { timeout: 10000 },
  );
  await page.keyboard.press('Escape');
});

await step('faculty list is forbidden for faculty role', async () => {
  const result = await page.evaluate(async () => {
    const res = await fetch('/api/admin/faculty-list', {
      headers: { Authorization: `Bearer ${localStorage.getItem('uok_token')}` },
    });
    return res.status;
  });
  if (result !== 403) throw new Error(`expected 403, got ${result}`);
});

console.log('\n--- console errors ---');
console.log(errors.length ? errors.join('\n') : '(none)');

await browser.close();
process.exit(errors.length ? 1 : 0);
