import puppeteer from "puppeteer";
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox","--disable-setuid-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 950 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.stack));
page.on("response", async (r) => { if (r.url().includes("/api/")) console.log("RESP", r.status(), r.url(), (await r.text().catch(()=>"")).slice(0,300)); });

const email = `smoke.${Date.now()}@uok.edu.pk`;
await page.goto("http://localhost:4173/register", { waitUntil: "networkidle2" });
const inputs = await page.$$("input");
await inputs[0].type("Dr. Smoke Tester");
await inputs[1].type(email);
await inputs[2].type("Password123");
await inputs[3].type("Password123");
await page.select("select", "Physics");
await page.click("button[type=submit]");
await page.waitForFunction(() => document.body.innerText.includes("Sign in to your portal"), { timeout: 20000 });
await page.type("input[type=email]", email);
await page.type("input[type=password]", "Password123");
await page.click("button[type=submit]");
await page.waitForFunction(() => location.pathname === "/dashboard", { timeout: 20000 });
await new Promise(r=>setTimeout(r,2000));

const labels = await page.evaluate(()=>[...document.querySelectorAll("label")].map(l=>[l.textContent.trim(), l.getAttribute("for")]));
console.log("LABELS:", JSON.stringify(labels, null, 1));
const inputsInfo = await page.evaluate(()=>[...document.querySelectorAll("input,select,textarea")].map(i=>[i.tagName,i.type||"",i.id,i.name]));
console.log("FIELDS:", JSON.stringify(inputsInfo, null, 1));
await browser.close();
