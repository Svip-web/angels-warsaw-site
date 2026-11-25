const bookingModal = document.querySelector(".booking-modal");
const bookingDialog = bookingModal?.querySelector(".booking-modal__dialog");
const bookingForm = bookingModal?.querySelector(".booking-form");
const bookingCloseButtons = bookingModal?.querySelectorAll(".booking-modal__close, .booking-modal__scrim") ?? [];
const bookingOpeners = document.querySelectorAll('a[href="#booking"]');
const bookingStatus = bookingModal?.querySelector(".booking-form__status");
const bookingSubmit = bookingModal?.querySelector(".booking-form__submit");
const bookingEndpoint = "https://angels-warsaw-booking-api.svip201517.chatgpt.site/api/booking";
let bookingReturnFocus = null;
let bookingStatusKey = "";
let bookingButtonKey = "submit";

const bookingCopy = {
  required: {
    ru: "Заполните обязательные поля.",
    pl: "Uzupełnij wymagane pola.",
    en: "Please complete the required fields.",
    uk: "Заповніть обов’язкові поля.",
  },
  sending: { ru: "Отправляем…", pl: "Wysyłamy…", en: "Sending…", uk: "Надсилаємо…" },
  failed: {
    ru: "Не удалось отправить заявку. Попробуйте ещё раз.",
    pl: "Nie udało się wysłać zgłoszenia. Spróbuj ponownie.",
    en: "We could not send your request. Please try again.",
    uk: "Не вдалося надіслати заявку. Спробуйте ще раз.",
  },
  sent: { ru: "Заявка отправлена ✓", pl: "Zgłoszenie wysłane ✓", en: "Request sent ✓", uk: "Заявку надіслано ✓" },
  submit: { ru: "Отправить заявку", pl: "Wyślij zgłoszenie", en: "Send request", uk: "Надіслати заявку" },
  received: {
    ru: "Заявка отправлена. Мы свяжемся с вами в ближайшее время.",
    pl: "Zgłoszenie zostało wysłane. Wkrótce się z Tobą skontaktujemy.",
    en: "Your request has been sent. We will contact you shortly.",
    uk: "Дякуємо! Ми отримали вашу заявку та зв’яжемося з вами найближчим часом.",
  },
  retry: {
    ru: "Подождите немного и попробуйте снова.",
    pl: "Odczekaj chwilę i spróbuj ponownie.",
    en: "Please wait a moment and try again.",
    uk: "Зачекайте трохи та спробуйте ще раз.",
  },
};

function bookingLanguage() {
  return window.ANGELS_I18N?.lang || document.documentElement.lang || "ru";
}

function bookingText(key) {
  const lang = bookingLanguage();
  return bookingCopy[key]?.[lang] || bookingCopy[key]?.ru || "";
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function setBookingDateLimits() {
  const dateInput = bookingForm?.elements.date;
  if (!dateInput) return;

  const today = new Date();
  const latest = new Date(today);
  latest.setFullYear(latest.getFullYear() + 1);
  dateInput.min = toDateInputValue(today);
  dateInput.max = toDateInputValue(latest);
}

function setBookingStatus(key = "", type = "") {
  bookingStatusKey = key;
  if (!bookingStatus) return;
  bookingStatus.textContent = bookingText(key);
  bookingStatus.dataset.state = type;
}

function setBookingButton(key) {
  bookingButtonKey = key;
  const label = bookingSubmit?.querySelector("span");
  if (label) label.textContent = bookingText(key);
}

window.addEventListener("angels:languagechange", () => {
  setBookingStatus(bookingStatusKey, bookingStatus?.dataset.state || "");
  setBookingButton(bookingButtonKey);
});

function openBooking(source = null) {
  if (!bookingModal || !bookingDialog) return;
  bookingReturnFocus = source instanceof HTMLElement ? source : document.activeElement;
  bookingModal.classList.add("is-open");
  bookingModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-booking-open");
  if (location.hash !== "#booking") history.pushState(null, "", "#booking");
  setBookingDateLimits();
  window.setTimeout(() => bookingDialog.focus({ preventScroll: true }), 40);
}

function closeBooking({ restoreFocus = true } = {}) {
  if (!bookingModal) return;
  bookingModal.classList.remove("is-open");
  bookingModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-booking-open");
  if (location.hash === "#booking") {
    history.replaceState(null, "", `${location.pathname}${location.search}`);
  }
  if (restoreFocus && bookingReturnFocus instanceof HTMLElement) bookingReturnFocus.focus({ preventScroll: true });
}

bookingOpeners.forEach((opener) => {
  opener.addEventListener("click", (event) => {
    event.preventDefault();
    openBooking(opener);
  });
});

bookingCloseButtons.forEach((button) => {
  button.addEventListener("click", () => closeBooking());
});

document.addEventListener("keydown", (event) => {
  if (!bookingModal?.classList.contains("is-open")) return;

  if (event.key === "Escape") {
    event.preventDefault();
    closeBooking();
    return;
  }

  if (event.key !== "Tab" || !bookingDialog) return;
  const focusable = [...bookingDialog.querySelectorAll('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.disabled && element.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

bookingForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setBookingStatus();

  if (!bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    setBookingStatus("required", "error");
    return;
  }

  const formData = new FormData(bookingForm);
  const payload = Object.fromEntries(formData.entries());
  payload.lang = bookingLanguage();
  payload.source = `${location.hostname}${location.pathname}`;
  bookingSubmit.disabled = true;
  bookingSubmit.classList.add("is-loading");
  setBookingButton("sending");

  try {
    const send = (body) => fetch(bookingEndpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    let response = await send(payload);
    // If the booking API rejects the Ukrainian language code, resend once with a supported one.
    if (payload.lang === "uk" && (response.status === 400 || response.status === 422)) {
      response = await send({ ...payload, lang: "ru" });
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok !== true) {
      const error = new Error("Booking request failed");
      error.bookingKey = response.status === 429 ? "retry"
        : [400, 422].includes(response.status) ? "required" : "failed";
      throw error;
    }

    bookingForm.reset();
    setBookingDateLimits();
    setBookingStatus("received", "success");
    setBookingButton("sent");
    window.setTimeout(() => {
      setBookingButton("submit");
      bookingSubmit.disabled = false;
    }, 3200);
  } catch (error) {
    setBookingStatus(error.bookingKey || "failed", "error");
    setBookingButton("submit");
    bookingSubmit.disabled = false;
  } finally {
    bookingSubmit.classList.remove("is-loading");
  }
});

window.addEventListener("hashchange", () => {
  if (location.hash === "#booking") openBooking();
});

setBookingDateLimits();
if (location.hash === "#booking") openBooking();
