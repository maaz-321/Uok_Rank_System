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

const setInput = async (label, value) => {
  const handle = await page.evaluateHandle((lbl) => {
    const labels = [...document.querySelectorAll("label")];
    const label = labels.find((node) => node.textContent.trim().startsWith(lbl));
    return label ? document.getElementById(label.getAttribute("for")) : null;
  }, label);
  const element = handle.asElement();
  if (!element) throw new Error(`field not found: ${label}`);
  await element.click({ clickCount: 3 });
  await element.type(value);
};

await setInput("Father / Guardian name", "Ali Khan");
await setInput("CNIC / B-Form number", "42101-1234567-8");
await setInput("Domicile district", "Karachi");
await setInput("Postal address", "12 University Road Karachi");
await setInput("Permanent address", "22 Shahrah-e-Faisal Karachi");
await page.select("select[name=gender]", "Male");
await page.evaluate(() => {
  const dob = document.querySelector("input[type=date]");
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(dob, "1985-05-10");
  dob.dispatchEvent(new Event("input", { bubbles: true }));
});
await setInput("Degree title", "Ph.D. in Physics");
await setInput("Board / University", "University of Karachi");
await setInput("Passing year", "2015");
await setInput("Obtained marks", "80");
await setInput("Total marks", "100");
console.log("VALUES:", JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll("input,select,textarea")].map(i=>[i.name,i.value]))));
const buttons = await page.$$("button");
for (const button of buttons) {
  const text = await page.evaluate((el) => el.textContent, button);
  if (text.includes("Save academic record")) { await button.click(); break; }
}
await new Promise(r=>setTimeout(r,4000));
console.log("TOASTS:", await page.evaluate(()=>[...document.querySelectorAll("[data-sonner-toast]")].map(t=>t.innerText)));
console.log("ERRORS ON PAGE:", await page.evaluate(()=>[...document.querySelectorAll("[data-invalid], .chakra-field__error-text")].map(e=>e.innerText).slice(0,20)));
console.log("PAGE TEXT SNIPPET:", (await page.evaluate(()=>document.body.innerText)).slice(0,1200));
await browser.close();
