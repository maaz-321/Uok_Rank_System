import puppeteer from "puppeteer";
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox","--disable-setuid-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 950 });
page.on("pageerror", (e) => console.log("PAGEERROR:\n" + e.stack));
page.on("response", async (r) => { if (r.url().includes("/api/")) console.log("RESP", r.status(), r.url(), (await r.text().catch(()=>"")).slice(0,200)); });

await page.goto("http://localhost:4173/login", { waitUntil: "networkidle2" });
await page.type("input[type=email]", "nobody@example.com");
await page.type("input[type=password]", "wrongpassword");
await page.click("button[type=submit]");
await new Promise(r=>setTimeout(r,2500));
console.log("path after invalid:", await page.evaluate(()=>location.pathname));

await page.goto("http://localhost:4173/register", { waitUntil: "networkidle2" });
await page.click("button[type=submit]");
await new Promise(r=>setTimeout(r,1500));
console.log("validation err present:", await page.evaluate(()=>document.body.innerText.includes("Select your department")));

const email = `smoke.${Date.now()}@uok.edu.pk`;
const inputs = await page.$$("input");
console.log("num inputs:", inputs.length);
await inputs[0].type("Dr. Smoke Tester");
await inputs[1].type(email);
await inputs[2].type("Password123");
await inputs[3].type("Password123");
await page.select("select", "Physics");
await page.click("button[type=submit]");
await new Promise(r=>setTimeout(r,3000));
console.log("path after register:", await page.evaluate(()=>location.pathname));

await page.type("input[type=email]", email);
await page.type("input[type=password]", "Password123");
await page.click("button[type=submit]");
await new Promise(r=>setTimeout(r,4000));
console.log("path after login:", await page.evaluate(()=>location.pathname));
console.log("BODY:", (await page.evaluate(()=>document.body.innerText)).slice(0,500));
await browser.close();
