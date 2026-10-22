import puppeteer from "puppeteer";
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox","--disable-setuid-sandbox"] });
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR:\n" + e.stack));
page.on("console", m => { if (m.type()==="error") console.log("CONSOLE:", m.text()); });
await page.goto("http://localhost:5173/login", { waitUntil: "networkidle2", timeout: 40000 }).catch(e=>console.log("nav err", e.message));
await new Promise(r => setTimeout(r, 2000));
await browser.close();
