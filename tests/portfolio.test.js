// Testes E2E do portfólio: abrem o site num navegador real (Chromium).
// Rodar: npm test
const { test, before, after, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".jpg": "image/jpeg" };
let server, baseURL, browser, context, page, errors;

before(async () => {
  server = http.createServer((req, res) => {
    const urlPath = req.url.split("?")[0];
    const file = path.join(ROOT, urlPath === "/" ? "index.html" : urlPath);
    if (!file.startsWith(ROOT) || !fs.existsSync(file)) return res.writeHead(404).end();
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "text/plain" });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, r));
  baseURL = `http://localhost:${server.address().port}`;
  browser = await chromium.launch();
});

after(async () => { await browser.close(); server.close(); });

beforeEach(async () => {
  errors = [];
  context = await browser.newContext({ colorScheme: "light" });
  page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("requestfailed", (r) => errors.push(`falhou: ${r.url()}`));
});

afterEach(async () => {
  assert.deepEqual(errors, [], "sem erros de JavaScript nem arquivos faltando");
  await context.close();
});

test("mostra nome, cargo e o projeto App de Clima", async () => {
  await page.goto(baseURL);
  assert.equal(await page.textContent(".hero__name"), "Moacir de Jesus Nascimento");
  assert.equal(await page.textContent(".hero__role"), "Desenvolvedor Front-end");
  assert.match(await page.textContent(".project__title"), /App de Clima/);
  assert.equal(await page.getAttribute(".project__links a:first-child", "href"), "https://moacirnascimento439.github.io/app-clima/");
});

test("todos os links do menu apontam para seções que existem", async () => {
  await page.goto(baseURL);
  const missing = await page.$$eval('a[href^="#"]', (as) =>
    as.map((a) => a.getAttribute("href").slice(1)).filter((id) => !document.getElementById(id)));
  assert.deepEqual(missing, []);
});

test("links externos abrem em nova aba com segurança", async () => {
  await page.goto(baseURL);
  const unsafe = await page.$$eval('a[target="_blank"]', (as) =>
    as.filter((a) => !a.rel.includes("noopener")).map((a) => a.href));
  assert.deepEqual(unsafe, []);
});

test("alterna o tema e lembra a escolha ao recarregar", async () => {
  await page.goto(baseURL);
  await page.click("#theme-toggle");
  assert.equal(await page.getAttribute("html", "data-theme"), "dark");
  await page.reload();
  assert.equal(await page.getAttribute("html", "data-theme"), "dark");
  assert.equal(await page.textContent("#theme-toggle"), "☀️");
});

test("celular: menu abre, navega e fecha", async () => {
  await page.setViewportSize({ width: 375, height: 740 });
  await page.goto(baseURL);
  assert.equal(await page.isVisible("#menu"), false);
  await page.click("#menu-toggle");
  assert.equal(await page.getAttribute("#menu-toggle", "aria-expanded"), "true");
  await page.click('.nav__link[href="#projetos"]');
  assert.equal(await page.isVisible("#menu"), false);
  await page.waitForFunction(() => location.hash === "#projetos");
});

test("celular: sem rolagem horizontal", async () => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto(baseURL);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  assert.equal(overflow, false);
});
