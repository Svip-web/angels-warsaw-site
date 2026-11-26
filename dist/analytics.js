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
  // Meta runs on page load by the owner's explicit configuration.
  // These consent controls apply to Google only.
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
      title: "Настройки Google", text: "Meta Pixel работает на этом сайте сразу. Здесь можно разрешить или отклонить дополнительную аналитику и рекламу Google. Бронирование доступно при любом выборе.",
      accept: "Разрешить Google", reject: "Отклонить Google", settings: "Настроить Google", save: "Сохранить выбор", close: "Закрыть", footer: "Настройки Google",
      analytics: "Аналитика", analyticsText: "Google Analytics: просмотры страниц, меню и действия с формой.",
      marketing: "Реклама Google", marketingText: "Разрешение рекламных cookies и персонализации Google.",
      note: "В события сайта не включаются имя, телефон и комментарий из формы. Настройки Google можно изменить внизу сайта.",
    },
    pl: {
      title: "Ustawienia Google", text: "Meta Pixel działa na tej stronie od razu. Tutaj możesz zezwolić na dodatkową analitykę i reklamy Google lub je odrzucić. Rezerwacja działa niezależnie od wyboru.",
      accept: "Zezwól na Google", reject: "Odrzuć Google", settings: "Dostosuj Google", save: "Zapisz wybór", close: "Zamknij", footer: "Ustawienia Google",
      analytics: "Analityka", analyticsText: "Google Analytics: odsłony stron, menu i interakcje z formularzem.",
      marketing: "Reklamy Google", marketingText: "Zgoda na reklamowe cookies i personalizację Google.",
      note: "Zdarzenia wysyłane przez stronę nie zawierają imienia, telefonu ani komentarza z formularza. Ustawienia Google możesz zmienić na dole strony.",
    },
    en: {
      title: "Google settings", text: "Meta Pixel runs on this website immediately. Here you can allow or decline additional Google analytics and advertising. Booking works with any choice.",
      accept: "Allow Google", reject: "Decline Google", settings: "Customize Google", save: "Save preferences", close: "Close", footer: "Google settings",
      analytics: "Analytics", analyticsText: "Google Analytics: page views, menu views and booking form interactions.",
      marketing: "Google advertising", marketingText: "Permission for Google advertising cookies and personalization.",
      note: "Events sent by this website do not include your name, phone or form comment. You can change Google settings in the website footer.",
    },
    uk: {
      title: "Налаштування Google", text: "Meta Pixel працює на цьому сайті одразу. Тут можна дозволити або відхилити додаткову аналітику та рекламу Google. Бронювання доступне за будь-якого вибору.",
      accept: "Дозволити Google", reject: "Відхилити Google", settings: "Налаштувати Google", save: "Зберегти вибір", close: "Закрити", footer: "Налаштування Google",
      analytics: "Аналітика", analyticsText: "Google Analytics: перегляди сторінок, меню та взаємодії з формою.",
      marketing: "Реклама Google", marketingText: "Дозвіл на рекламні cookies та персоналізацію Google.",
      note: "Ім’я, телефон і коментар із форми не включаються в події сайту. Налаштування Google можна змінити внизу сайту.",
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
    // Meta reads the browser URL itself. Exclude contact data, while allowing
    // normal campaign, cache-busting and preview parameters.
    const url = new URL(location.href);
    if ([...url.searchParams].some(([key, value]) => {
      if (/^(?:e[-_]?mail|phone|tel|mobile|name|first[-_]?name|last[-_]?name|full[-_]?name|address|comment|note|message)$/i.test(key)) return true;
      return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);
    })) return false;
    return !url.hash || /^#[a-z][a-z0-9-]*$/i.test(url.hash);
  }

  function loadMeta() {
    if (!metaUrlIsSafe()) return;
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
    if (metaLoaded && metaUrlIsSafe() && (!onceKey || !sent.meta.has(onceKey))) {
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
    consent = { analytics: next.analytics === true, marketing: next.marketing === true };
    choiceSaved = true;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...consent, savedAt: Date.now() })); } catch {}
    notifyConsent();
    if (!consent.analytics) clearCookies(["_ga", "_gid", "_gat"]);
    if (!consent.marketing) clearCookies(["_gcl_"]);
    panel.hidden = true;
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    // A new document removes previously loaded vendor listeners after withdrawal.
    if (revokeGoogle) { location.reload(); return; }
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
