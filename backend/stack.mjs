import puppeteer from "puppeteer";
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox","--disable-setuid-sandbox"] });
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR:\n" + e.stack));
await page.goto("http://localhost:4173/login", { waitUntil: "networkidle2", timeout: 30000 }).catch(e=>console.log("nav err", e.message));
await new Promise(r => setTimeout(r, 1500));
await browser.close();
