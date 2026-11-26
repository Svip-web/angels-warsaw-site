import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const source = readFileSync(new URL("dist/analytics.js", root), "utf8");
const bookingSource = readFileSync(new URL("dist/booking.js", root), "utf8");

class Element {
  constructor() { this.listeners = {}; this.dataset = {}; this.hidden = false; this.checked = false; this.isConnected = true; this.nodes = new Map(); }
  addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); }
  dispatch(name, event = {}) { for (const callback of this.listeners[name] || []) callback(event); }
  querySelector(selector) { if (!this.nodes.has(selector)) this.nodes.set(selector, new Element()); return this.nodes.get(selector); }
  querySelectorAll() { return []; }
  setAttribute() {}
  focus() {}
  append(node) { (this.children ||= []).push(node); }
}

function environment({ googleReady = true, saved, url = "https://angelskaraoke.pl/menu.html?lang=en" } = {}) {
  const location = new URL(url);
  let reloads = 0;
  location.reload = () => reloads++;
  const storage = new Map(saved ? [["angels-consent-v1", JSON.stringify(saved)]] : []);
  const head = new Element(), body = new Element(), footer = new Element(), form = new Element(), opener = new Element();
  const globalEvents = new Element();
  const document = {
    readyState: "complete", head, body, referrer: "https://example.com/?email=private@example.com",
    cookie: "", documentElement: { lang: "en" }, activeElement: new Element(),
    createElement: () => new Element(), getElementById: (id) => head.children?.find((n) => n.id === id),
    querySelector: (selector) => selector === ".booking-form" ? form : footer,
    querySelectorAll: () => [opener],
  };
  const context = vm.createContext({
    document, location, URL, Date, Set, Object,
    localStorage: { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  });
  context.window = context;
  context.ANGELS_I18N = { lang: "en" };
  context.addEventListener = globalEvents.addEventListener.bind(globalEvents);
  vm.runInContext(googleReady ? source.replace("const GOOGLE_READY = false;", "const GOOGLE_READY = true;") : source, context);
  const panel = body.children[0];
  const choose = (action) => panel.dispatch("click", { target: { closest: () => ({ dataset: { consentAction: action } }) } });
  const googleEvents = () => Array.from(context.dataLayer).filter((item) => item.event?.startsWith("angels_"));
  const metaEvents = () => Array.from(context.fbq?.queue || []).filter((item) => ["track", "trackCustom"].includes(item[0]));
  const start = () => form.dispatch("focusin", { target: { matches: () => true } });
  return { context, document, panel, head, form, opener, globalEvents, choose, googleEvents, metaEvents, start, storage, get reloads() { return reloads; } };
}

const choice = (analytics, marketing) => ({ version: 1, analytics, marketing, savedAt: Date.now() });
let checks = 0;
function check(fn) { fn(); checks++; }

check(() => {
  const e = environment();
  assert.equal(e.head.children?.length || 0, 0);
  assert.equal(e.googleEvents().length, 0);
  assert.equal(e.metaEvents().length, 0);
  assert.equal(e.context.dataLayer[0][0], "consent");
  for (const key of ["analytics_storage", "ad_storage", "ad_user_data", "ad_personalization"]) assert.equal(e.context.dataLayer[0][2][key], "denied");
  e.choose("reject"); e.start(); e.context.ANGELS_ANALYTICS.bookingSuccess();
  assert.equal(e.googleEvents().length, 0); assert.equal(e.metaEvents().length, 0);
});

for (const analytics of [false, true]) for (const marketing of [false, true]) check(() => {
  const e = environment({ saved: choice(analytics, marketing) });
  assert.equal(e.head.children?.some((n) => n.id === "angels-gtm") || false, analytics);
  assert.equal(e.head.children?.some((n) => n.id === "angels-meta-pixel") || false, marketing);
  e.opener.dispatch("click"); e.start(); e.start(); e.start();
  e.context.ANGELS_ANALYTICS.bookingSuccess();
  const g = e.googleEvents().map((event) => event.event);
  const m = e.metaEvents().map((event) => event[1]);
  assert.deepEqual(g, analytics ? ["angels_page_view", "angels_view_menu", "angels_booking_click", "angels_form_start", "angels_generate_lead"] : []);
  assert.deepEqual(m, marketing ? ["PageView", "ViewMenu", "BookingClick", "FormStart", "Lead"] : []);
  const payload = JSON.stringify(e.googleEvents()) + JSON.stringify(e.metaEvents().map((event) => event[2]));
  assert.ok(!payload.includes("private@example.com"));
  for (const command of e.context.fbq?.queue || []) assert.notEqual(command[0], "userData");
});

check(() => {
  const e = environment();
  e.context.ANGELS_ANALYTICS.bookingSuccess();
  e.choose("accept"); e.choose("accept");
  assert.deepEqual(e.googleEvents().map((x) => x.event), ["angels_page_view", "angels_view_menu"]);
  assert.deepEqual(e.metaEvents().map((x) => x[1]), ["PageView", "ViewMenu"]);
});

check(() => {
  const e = environment({ saved: choice(true, true), url: "https://angelskaraoke.pl/?lang=pl&email=private@example.com" });
  assert.equal(e.context.fbq, undefined);
  assert.equal(e.googleEvents()[0].page_location, "https://angelskaraoke.pl/?lang=pl");
  assert.equal(e.googleEvents()[0].page_referrer, "https://example.com");
});

check(() => {
  const e = environment({ saved: choice(true, true), url: "https://angelskaraoke.pl/menu.html?lang=pl&utm_source=instagram&utm_campaign=evening&fbclid=abcdefghijklmno#bar" });
  assert.equal(e.metaEvents().length, 2);
});

check(() => {
  const e = environment({ saved: choice(true, true) });
  e.choose("reject");
  assert.equal(e.reloads, 1);
  e.start(); e.context.ANGELS_ANALYTICS.bookingSuccess();
  assert.equal(e.googleEvents().length, 2); assert.equal(e.metaEvents().length, 2);
  const saved = JSON.parse(e.storage.get("angels-consent-v1"));
  assert.equal(saved.analytics, false); assert.equal(saved.marketing, false);
  assert.equal(e.context.fbq.queue.at(-1)[1], "revoke");
});

check(() => {
  const expired = choice(true, true); expired.savedAt -= 181 * 86400000;
  const e = environment({ saved: expired });
  assert.equal(e.head.children?.length || 0, 0); assert.equal(e.panel.hidden, false);
});

check(() => {
  const e = environment({ googleReady: false, saved: choice(true, true) });
  assert.equal(e.context.ANGELS_ANALYTICS.googleReady, false);
  assert.equal(e.head.children.some((n) => n.id === "angels-gtm"), false);
  assert.equal(e.metaEvents().length, 2);
});

check(() => {
  const e = environment({ saved: choice(true, true) });
  const states = [];
  e.context.ANGELS_ANALYTICS.onConsentChange((state) => states.push(state));
  e.choose("reject");
  assert.equal(states[0].analytics_storage, "denied");
  e.globalEvents.dispatch("storage", { key: "angels-consent-v1" });
  assert.equal(e.reloads, 2);
});

check(() => {
  const e = environment({ saved: choice(true, false) });
  const defaults = [], updates = [];
  let completed = false;
  const sandbox = {
    require(name) {
      if (name === "setDefaultConsentState") return (state) => defaults.push(state);
      if (name === "updateConsentState") return (state) => updates.push(state);
      if (name === "callInWindow") return (path, ...args) => e.context.ANGELS_ANALYTICS[path.split(".")[1]](...args);
      throw new Error(`Unexpected GTM sandbox API: ${name}`);
    },
    data: { gtmOnSuccess() { completed = true; } },
  };
  vm.runInNewContext(readFileSync(new URL("analytics/gtm-consent-template.js", root), "utf8"), sandbox);
  assert.equal(completed, true);
  assert.equal(defaults[0].analytics_storage, "denied");
  assert.equal(updates[0].analytics_storage, "granted");
  assert.equal(updates[0].ad_storage, "denied");
  e.choose("reject");
  assert.equal(updates[1].analytics_storage, "denied");
});

check(() => {
  assert.ok(bookingSource.indexOf('if (!response.ok || result.ok !== true)') < bookingSource.indexOf('ANGELS_ANALYTICS?.bookingSuccess()'));
  assert.ok(bookingSource.includes('if (bookingSubmit.disabled) return;'));
  assert.ok(bookingSource.includes('if (!String(payload.website || "").trim())'));
  for (const page of ["index.html", "menu.html"]) {
    const html = readFileSync(new URL(`dist/${page}`, root), "utf8");
    assert.equal([...html.matchAll(/src="analytics\.js(?:\?[^\"]*)?"/g)].length, 1);
    assert.equal([...html.matchAll(/href="consent\.css(?:\?[^\"]*)?"/g)].length, 1);
    assert.ok(html.indexOf('src="i18n.js') < html.indexOf('src="analytics.js'), "Language must be initialized before tracking");
    assert.ok(html.indexOf('src="analytics.js') < html.indexOf('src="booking.js'), "Analytics must be available to the booking handler");
    assert.ok(!html.includes("facebook.com/tr?"));
  }
});

console.log(`Analytics check passed: ${checks} consent, event, privacy and integration scenarios. No network or real bookings.`);
