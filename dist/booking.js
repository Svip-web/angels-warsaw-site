const bookingModal = document.querySelector(".booking-modal");
const bookingDialog = bookingModal?.querySelector(".booking-modal__dialog");
const bookingForm = bookingModal?.querySelector(".booking-form");
const bookingCloseButtons = bookingModal?.querySelectorAll(".booking-modal__close, .booking-modal__scrim") ?? [];
const bookingOpeners = document.querySelectorAll('a[href="#booking"]');
const bookingStatus = bookingModal?.querySelector(".booking-form__status");
const bookingSubmit = bookingModal?.querySelector(".booking-form__submit");
let bookingReturnFocus = null;

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

function setBookingStatus(message = "", type = "") {
  if (!bookingStatus) return;
  bookingStatus.textContent = message;
  bookingStatus.dataset.state = type;
}

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
    setBookingStatus("Заполните обязательные поля.", "error");
    return;
  }

  const formData = new FormData(bookingForm);
  const payload = Object.fromEntries(formData.entries());
  bookingSubmit.disabled = true;
  bookingSubmit.classList.add("is-loading");
  bookingSubmit.querySelector("span").textContent = "Отправляем…";

  try {
    const response = await fetch("/api/booking", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.ok !== true) {
      throw new Error(result.message || "Не удалось отправить заявку.");
    }

    bookingForm.reset();
    setBookingDateLimits();
    setBookingStatus(result.message, "success");
    bookingSubmit.querySelector("span").textContent = "Заявка отправлена ✓";
    window.setTimeout(() => {
      bookingSubmit.querySelector("span").textContent = "Отправить заявку";
      bookingSubmit.disabled = false;
    }, 3200);
  } catch (error) {
    setBookingStatus(error.message || "Не удалось отправить заявку. Попробуйте ещё раз.", "error");
    bookingSubmit.querySelector("span").textContent = "Отправить заявку";
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
