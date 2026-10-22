import puppeteer from "puppeteer";

const BASE = process.env.SMOKE_BASE || "http://localhost:4173";
const API = process.env.SMOKE_API || "http://localhost:5000";
const PASSWORD = "Password123";

const QEC = { email: "qec@uok.edu.pk", password: "UOK_QecSecret2026!" };

const errors = [];
const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 950 });

page.on("console", (msg) => {
  const text = msg.text();
  if (msg.type() === "error" && !text.startsWith("Failed to load resource")) {
    errors.push(`console.error: ${text}`);
  }
});
page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));

const step = async (name, fn) => {
  const before = errors.length;
  try {
    await fn();
  } catch (err) {
    errors.push(`step "${name}" threw: ${err.message}`);
  }
  const added = errors.slice(before);
  console.log(`${added.length ? "FAIL" : " OK "} ${name}${added.length ? " -> " + added.join(" | ") : ""}`);
};

async function api(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${text.slice(0, 200)}`);
  return data;
}

async function registerUser(name, department) {
  const email = `roles.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@uok.edu.pk`;
  await api("/api/auth/register", {
    method: "POST",
    body: { name, email, password: PASSWORD, department },
  });
  const login = await api("/api/auth/login", {
    method: "POST",
    body: { email, password: PASSWORD },
  });
  return { ...login, email };
}

async function loginInBrowser(email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
  await page.waitForSelector("input[type=email]");
  await page.click("input[type=email]", { clickCount: 3 });
  await page.type("input[type=email]", email);
  await page.click("input[type=password]", { clickCount: 3 });
  await page.type("input[type=password]", password);
  await page.click("button[type=submit]");
  await page.waitForFunction(
    () => !location.pathname.startsWith("/login"),
    { timeout: 20000 },
  );
}

await step("setup: create role accounts", async () => {
  const qecLogin = await api("/api/auth/login", {
    method: "POST",
    body: { email: QEC.email, password: QEC.password },
  });
  const token = qecLogin.token;

  const created = [];
  for (const [role, name, department] of [
    ["chairman", "Dr. Role Chairman", "Physics"],
    ["oec", "Dr. Role OEC", "Chemistry"],
  ]) {
    const user = await registerUser(name, department);
    await api("/api/admin/change-role", {
      method: "PUT",
      token,
      body: { targetUserId: user._id, newRole: role },
    });
    created.push({ ...user, role });
  }
  global.__accounts = created;
});

await step("chairman dashboard renders", async () => {
  const account = global.__accounts.find((a) => a.role === "chairman");
  await loginInBrowser(account.email, PASSWORD);
  await page.waitForFunction(() => location.pathname === "/chairman", { timeout: 20000 });
  await page.waitForFunction(
    () => document.body.innerText.includes("Chairman's console"),
    { timeout: 15000 },
  );
  await page.waitForFunction(
    () => document.body.innerText.includes("Faculty directory"),
    { timeout: 15000 },
  );
});

await step("oec dashboard renders", async () => {
  const account = global.__accounts.find((a) => a.role === "oec");
  await loginInBrowser(account.email, PASSWORD);
  await page.waitForFunction(() => location.pathname === "/oec", { timeout: 20000 });
  await page.waitForFunction(
    () => document.body.innerText.includes("Institution-wide"),
    { timeout: 15000 },
  );
});

await step("qec admin dashboard renders", async () => {
  await loginInBrowser(QEC.email, QEC.password);
  await page.waitForFunction(() => location.pathname === "/admin", { timeout: 20000 });
  await page.waitForFunction(
    () => document.body.innerText.includes("Portal administration"),
    { timeout: 15000 },
  );
  await page.waitForFunction(
    () => document.body.innerText.includes("Account & permission management"),
    { timeout: 15000 },
  );
});

await step("faculty directory table renders rows", async () => {
  await page.waitForSelector("table", { timeout: 15000 });
  const rows = await page.evaluate(() => document.querySelectorAll("tbody tr").length);
  if (rows < 1) throw new Error("no faculty rows rendered");
});

await step("faculty detail drawer opens", async () => {
  const cell = await page.$("tbody tr td");
  if (!cell) throw new Error("no table cell to click");
  await cell.click();
  await page.waitForFunction(
    () => document.body.innerText.includes("Qualifications"),
    { timeout: 15000 },
  );
});

console.log("\n--- console errors ---");
console.log(errors.length ? errors.join("\n") : "(none)");

await browser.close();
process.exit(errors.length ? 1 : 0);
