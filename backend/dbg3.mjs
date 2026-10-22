import puppeteer from "puppeteer";
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox","--disable-setuid-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 950 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
page.on("request", (r) => { if (r.url().includes("/api/")) console.log("REQ", r.method(), r.url(), (r.postData()||"").slice(0,120)); });

await page.goto("http://localhost:4173/login", { waitUntil: "networkidle2" });
await page.waitForSelector("input[type=email]");
await page.type("input[type=email]", "nobody@example.com");
await page.type("input[type=password]", "wrongpassword");
await page.click("button[type=submit]");
await page.waitForFunction(() => document.body.innerText.includes("Sign in failed"), { timeout: 15000 });

await page.goto("http://localhost:4173/register", { waitUntil: "networkidle2" });
await page.waitForSelector("select");
await page.click("button[type=submit]");
await page.waitForFunction(() => document.body.innerText.includes("Select your department"), { timeout: 15000 });

const email = `smoke.${Date.now()}@uok.edu.pk`;
const inputs = await page.$$("input");
await inputs[0].type("Dr. Smoke Tester");
await inputs[1].type(email);
await inputs[2].type("Password123");
await inputs[3].type("Password123");
await page.select("select", "Physics");
await page.click("button[type=submit]");
await page.waitForFunction(() => location.pathname === "/login", { timeout: 20000 });
console.log("--- at /login, input values:", await page.evaluate(()=>[...document.querySelectorAll("input")].map(i=>[i.type,i.value])));
await page.type("input[type=email]", email);
await page.type("input[type=password]", "Password123");
console.log("--- before submit, input values:", await page.evaluate(()=>[...document.querySelectorAll("input")].map(i=>[i.type,i.value])));
await page.click("button[type=submit]");
await new Promise(r=>setTimeout(r,3000));
console.log("--- after submit, input values:", await page.evaluate(()=>[...document.querySelectorAll("input")].map(i=>[i.type,i.value])));
console.log("path:", await page.evaluate(()=>location.pathname));
console.log("toast:", (await page.evaluate(()=>document.body.innerText)).slice(0,300));
await browser.close();
