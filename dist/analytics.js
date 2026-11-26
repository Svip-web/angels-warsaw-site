(() => {
  "use strict";
  if (window.ANGELS_ANALYTICS) return;

  const GTM_ID = "GTM-5Z32PTTB";
  // Website integration is active. GTM owns the GA4 tag configuration.
  const GOOGLE_READY = true;
  const STORAGE_KEY = "angels-consent-v1";
  const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
  const isMenu = /(?:^|\/)menu\.html$/.test(location.pathname);
  const pageType = isMenu ? "menu" : "home";
  const sent = { google: new Set(), meta: new Set() };
  let consent = { analytics: false, marketing: false };
  let choiceSaved = false;
  let googleLoaded = false;
  let metaLoaded = false;
  let formCycle = 0;
  let panel;
  let settingsButton;
  let returnFocus;
  const consentListeners = [];

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  // Advanced Consent Mode: load GTM immediately with denied defaults.
  // Send GTM signals immediately; Consent Mode governs Google storage/use.
  // Meta still requires marketing opt-in.
  gtag("consent", "default", {
    analytics_storage: "denied", ad_storage: "denied",
    ad_user_data: "denied", ad_personalization: "denied",
    functionality_storage: "granted", security_storage: "granted",
    personalization_storage: "denied",
  });
  gtag("set", "ads_data_redaction", true);
  gtag("set", "url_passthrough", false);

  const copy = {
    ru: {
      title: "Настройки cookies", text: "Обязательные настройки помогают сайту работать. С вашего разрешения используем Google Analytics для статистики и Meta Pixel для рекламы. Бронирование доступно при любом выборе.",
      accept: "Принять все", reject: "Только необходимые", settings: "Настроить", save: "Сохранить выбор", close: "Закрыть", footer: "Настройки cookies",
      analytics: "Аналитика", analyticsText: "Google Analytics: просмотры страниц, меню и действия с формой.",
      marketing: "Маркетинг", marketingText: "Meta Pixel: эффективность рекламы и действия на сайте.",
      note: "Имя, телефон и комментарий из формы не передаются в событиях аналитики. Выбор можно изменить внизу сайта.",
    },
    pl: {
      title: "Ustawienia cookies", text: "Niezbędne ustawienia umożliwiają działanie strony. Za Twoją zgodą korzystamy z Google Analytics do statystyk i Meta Pixel do reklamy. Rezerwacja działa niezależnie od wyboru.",
      accept: "Akceptuj wszystkie", reject: "Tylko niezbędne", settings: "Dostosuj", save: "Zapisz wybór", close: "Zamknij", footer: "Ustawienia cookies",
      analytics: "Analityka", analyticsText: "Google Analytics: odsłony stron, menu i interakcje z formularzem.",
      marketing: "Marketing", marketingText: "Meta Pixel: skuteczność reklam i działania na stronie.",
      note: "Imię, telefon i komentarz z formularza nie są przekazywane w zdarzeniach analitycznych. Wybór możesz zmienić na dole strony.",
    },
    en: {
      title: "Cookie settings", text: "Essential settings keep this website working. With your permission, we use Google Analytics for statistics and Meta Pixel for advertising. Booking works with any choice.",
      accept: "Accept all", reject: "Essential only", settings: "Customize", save: "Save preferences", close: "Close", footer: "Cookie settings",
      analytics: "Analytics", analyticsText: "Google Analytics: page views, menu views and booking form interactions.",
      marketing: "Marketing", marketingText: "Meta Pixel: advertising performance and actions on this website.",
      note: "Your name, phone and form comment are not included in analytics events. You can change your choice in the website footer.",
    },
    uk: {
      title: "Налаштування cookies", text: "Обов’язкові налаштування забезпечують роботу сайту. З вашого дозволу використовуємо Google Analytics для статистики та Meta Pixel для реклами. Бронювання доступне за будь-якого вибору.",
      accept: "Прийняти всі", reject: "Лише необхідні", settings: "Налаштувати", save: "Зберегти вибір", close: "Закрити", footer: "Налаштування cookies",
      analytics: "Аналітика", analyticsText: "Google Analytics: перегляди сторінок, меню та взаємодії з формою.",
      marketing: "Маркетинг", marketingText: "Meta Pixel: ефективність реклами та дії на сайті.",
      note: "Ім’я, телефон і коментар із форми не передаються в подіях аналітики. Вибір можна змінити внизу сайту.",
    },
  };

  function language() {
    const lang = window.ANGELS_I18N?.lang || document.documentElement.lang;
    return Object.hasOwn(copy, lang) ? lang : "ru";
  }

  function pageLocation(url = location.href) {
    try {
      const parsed = new URL(url, location.origin);
      // Do not copy arbitrary queries, hash fragments or form values into analytics.
      if (parsed.origin !== location.origin) return parsed.origin;
      const safe = new URL(parsed.pathname, parsed.origin);
      const lang = parsed.searchParams.get("lang");
      if (Object.hasOwn(copy, lang)) safe.searchParams.set("lang", lang);
      return safe.href;
    } catch { return ""; }
  }

  function parameters() {
    return {
      page_type: pageType, language: language(),
      page_location: pageLocation(), page_referrer: pageLocation(document.referrer || location.origin),
      page_title: isMenu ? "Angel's — Menu" : "Angel's Warsaw",
      form_id: "booking", form_location: pageType,
    };
  }

  function googleConsent() {
    return {
      analytics_storage: consent.analytics ? "granted" : "denied",
      ad_storage: consent.marketing ? "granted" : "denied",
      ad_user_data: consent.marketing ? "granted" : "denied",
      ad_personalization: consent.marketing ? "granted" : "denied",
    };
  }

  function notifyConsent() {
    const state = googleConsent();
    gtag("consent", "update", state);
    // The GTM consent template uses updateConsentState synchronously through this hook.
    consentListeners.forEach((listener) => { try { listener({ ...state }); } catch {} });
  }

  function injectScript(id, src) {
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.async = true;
    script.src = src;
    document.head.append(script);
  }

  function loadGoogle() {
    if (!GOOGLE_READY || googleLoaded) return;
    googleLoaded = true;
    // The container owns GA4. There is no second GA4 installation in the website.
    const context = parameters();
    gtag("set", {
      page_location: context.page_location,
      page_referrer: context.page_referrer,
      page_title: context.page_title,
    });
    window.dataLayer.push(context);
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    injectScript("angels-gtm", `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`);
  }

  function metaUrlIsSafe() {
    // Meta reads the browser URL itself. Fail closed on unknown query/hash values.
    const url = new URL(location.href);
    if ([...url.searchParams].some(([key, value]) => {
      if (key === "lang") return !Object.hasOwn(copy, value);
      if (key === "v") return !/^[a-f0-9]{7,40}$/i.test(value);
      if (key === "fbclid" || key === "gclid") return !/^[a-z0-9_-]{10,512}$/i.test(value);
      if (/^utm_(source|medium|campaign|content|term|id)$/.test(key)) {
        return value.length > 180 || !/^[\p{L}\p{N} ._~+-]*$/u.test(value);
      }
      return true;
    })) return false;
    return !url.hash || /^#[a-z][a-z0-9-]*$/i.test(url.hash);
  }

  function loadMeta() {
    if (!consent.marketing || !metaUrlIsSafe()) return;
    // The actual Meta bootstrap and Pixel ID are visible in each page's <head>.
    metaLoaded = window.ANGELS_META_PIXEL?.load() === true;
  }

  const events = {
    page_view: ["PageView", "track"], view_menu: ["ViewMenu", "trackCustom"],
    booking_click: ["BookingClick", "trackCustom"], form_start: ["FormStart", "trackCustom"],
    generate_lead: ["Lead", "track"],
  };

  function track(name, onceKey) {
    if (!events[name]) return;
    const params = parameters();
    if (googleLoaded && (!onceKey || !sent.google.has(onceKey))) {
      if (onceKey) sent.google.add(onceKey);
      // GTM receives each signal immediately, including in denied consent mode.
      window.dataLayer.push({ event: `angels_${name}`, ...params });
    }
    if (consent.marketing && metaLoaded && metaUrlIsSafe() && (!onceKey || !sent.meta.has(onceKey))) {
      if (onceKey) sent.meta.add(onceKey);
      const [eventName, method] = events[name];
      // Only fixed, non-personal labels. No form field values or DOM text.
      window.fbq(method, eventName, { page_type: pageType, language: language(), form_id: "booking" });
    }
  }

  function trackPage() {
    track("page_view", "page");
    if (isMenu) track("view_menu", "menu");
  }

  function clearCookies(prefixes) {
    const domains = ["", location.hostname, `.${location.hostname}`];
    const parts = location.hostname.split(".");
    if (parts.length > 2) domains.push(`.${parts.slice(-2).join(".")}`);
    for (const entry of document.cookie.split(";")) {
      const name = entry.split("=")[0].trim();
      if (!prefixes.some((prefix) => name.startsWith(prefix))) continue;
      for (const domain of domains) {
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${domain ? `; domain=${domain}` : ""}`;
      }
    }
  }

  function choose(next) {
    const revokeGoogle = googleLoaded && consent.analytics && !next.analytics;
    const revokeMeta = metaLoaded && consent.marketing && !next.marketing;
    consent = { analytics: next.analytics === true, marketing: next.marketing === true };
    choiceSaved = true;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...consent, savedAt: Date.now() })); } catch {}
    notifyConsent();
    if (revokeMeta) window.fbq("consent", "revoke");
    if (!consent.analytics) clearCookies(["_ga", "_gid", "_gat"]);
    if (!consent.marketing) clearCookies(["_fbp", "_fbc", "_gcl_"]);
    panel.hidden = true;
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    // A new document removes previously loaded vendor listeners after withdrawal.
    if (revokeGoogle || revokeMeta) { location.reload(); return; }
    loadGoogle();
    loadMeta();
    trackPage();
  }

  function translatePanel() {
    if (!panel) return;
    const text = copy[language()];
    panel.querySelectorAll("[data-consent-copy]").forEach((node) => { node.textContent = text[node.dataset.consentCopy]; });
    panel.setAttribute("aria-label", text.title);
    settingsButton.textContent = text.footer;
  }

  function openSettings() {
    returnFocus = document.activeElement;
    panel.hidden = false;
    panel.querySelector("[data-consent-details]").hidden = false;
    panel.querySelector('[data-consent-action="save"]').hidden = false;
    panel.querySelector('[data-consent-action="close"]').hidden = !choiceSaved;
    panel.querySelector('[data-consent-action="settings"]').hidden = true;
    panel.querySelector('[name="consent-analytics"]').checked = consent.analytics;
    panel.querySelector('[name="consent-marketing"]').checked = consent.marketing;
    panel.focus({ preventScroll: true });
  }

  function init() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved?.version === 1 && typeof saved.analytics === "boolean" && typeof saved.marketing === "boolean" &&
          Number.isFinite(saved.savedAt) && saved.savedAt <= Date.now() && Date.now() - saved.savedAt < MAX_AGE) {
        consent = { analytics: saved.analytics, marketing: saved.marketing };
        choiceSaved = true;
      }
    } catch {}

    panel = document.createElement("section");
    panel.className = "angels-consent";
    panel.dataset.i18nSkip = "";
    panel.setAttribute("role", "region");
    panel.tabIndex = -1;
    panel.hidden = choiceSaved;
    panel.innerHTML = `
      <p class="angels-consent__title" data-consent-copy="title"></p>
      <p class="angels-consent__text" data-consent-copy="text"></p>
      <div class="angels-consent__details" data-consent-details hidden>
        <label class="angels-consent__option"><input type="checkbox" name="consent-analytics"><span><strong data-consent-copy="analytics"></strong><small data-consent-copy="analyticsText"></small></span></label>
        <label class="angels-consent__option"><input type="checkbox" name="consent-marketing"><span><strong data-consent-copy="marketing"></strong><small data-consent-copy="marketingText"></small></span></label>
        <p class="angels-consent__text" data-consent-copy="note"></p>
      </div>
      <div class="angels-consent__actions">
        <button type="button" data-consent-action="accept" data-consent-copy="accept"></button>
        <button type="button" data-consent-action="reject" data-consent-copy="reject"></button>
        <button type="button" data-consent-action="settings" data-consent-copy="settings"></button>
        <button type="button" data-consent-action="save" data-consent-copy="save" hidden></button>
        <button type="button" data-consent-action="close" data-consent-copy="close" hidden></button>
      </div>`;
    document.body.append(panel);
    settingsButton = document.createElement("button");
    settingsButton.type = "button";
    settingsButton.className = "angels-cookie-settings";
    settingsButton.dataset.i18nSkip = "";
    (document.querySelector(".site-footer, .menu-page__footer") || document.body).append(settingsButton);
    settingsButton.addEventListener("click", openSettings);
    panel.addEventListener("click", (event) => {
      const action = event.target.closest("[data-consent-action]")?.dataset.consentAction;
      if (action === "accept") choose({ analytics: true, marketing: true });
      if (action === "reject") choose({ analytics: false, marketing: false });
      if (action === "settings") openSettings();
      if (action === "save") choose({
        analytics: panel.querySelector('[name="consent-analytics"]').checked,
        marketing: panel.querySelector('[name="consent-marketing"]').checked,
      });
      if (action === "close") { panel.hidden = true; returnFocus?.focus({ preventScroll: true }); }
    });
    panel.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && choiceSaved) { panel.hidden = true; returnFocus?.focus({ preventScroll: true }); }
    });
    window.addEventListener("angels:languagechange", translatePanel);
    // In another tab a withdrawn consent must take effect here too.
    window.addEventListener("storage", (event) => { if (event.key === STORAGE_KEY) location.reload(); });
    translatePanel();
    notifyConsent();
    loadGoogle();
    loadMeta();
    trackPage();

    const form = document.querySelector(".booking-form");
    const started = (event) => {
      if (event.target.matches('input:not([type="hidden"]):not([name="website"]), select, textarea')) {
        track("form_start", `form-${formCycle}`);
      }
    };
    form?.addEventListener("focusin", started);
    form?.addEventListener("input", started);
    form?.addEventListener("change", started);
    document.querySelectorAll('a[href="#booking"]').forEach((link) => {
      link.addEventListener("click", () => track("booking_click"));
    });
  }

  window.ANGELS_ANALYTICS = Object.freeze({
    bookingSuccess() {
      // Called only from booking.js after HTTP success AND result.ok === true.
      try { track("generate_lead"); } catch { /* Tracking must never interrupt a booking. */ }
      formCycle++;
    },
    getConsent() { return { ...consent }; },
    getGoogleConsent: googleConsent,
    onConsentChange(callback) { if (typeof callback === "function") consentListeners.push(callback); },
    get googleReady() { return GOOGLE_READY; },
    openSettings,
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
