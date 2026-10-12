import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const projectRoot = import.meta.dirname;
const root = join(import.meta.dirname, "dist");
const envPath = join(projectRoot, ".env");
const port = Number(process.env.PORT ?? 4173);
const bookingAttempts = new Map();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;

function loadLocalEnv() {
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^(["'])(.*)\1$/, "$2");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadLocalEnv();

const mime = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function sendJson(response, status, data) {
  const body = JSON.stringify(data);
  response.writeHead(status, {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
  });
  response.end(body);
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > 16_384) {
        reject(new Error("PAYLOAD_TOO_LARGE"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });

    request.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new Error("INVALID_JSON"));
      }
    });

    request.on("error", reject);
  });
}

function normalizeText(value, maxLength) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function escapeHtml(value) {
  return value.replace(/[&<>]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character]);
}

function isRateLimited(request) {
  const address = request.socket.remoteAddress ?? "unknown";
  const now = Date.now();
  const recent = (bookingAttempts.get(address) ?? []).filter((timestamp) => now - timestamp < RATE_WINDOW_MS);

  if (recent.length >= RATE_MAX) {
    bookingAttempts.set(address, recent);
    return true;
  }

  recent.push(now);
  bookingAttempts.set(address, recent);
  return false;
}

function validateBooking(payload) {
  const booking = {
    date: normalizeText(payload.date, 10),
    time: normalizeText(payload.time, 5),
    guests: Number(payload.guests),
    name: normalizeText(payload.name, 80),
    phone: normalizeText(payload.phone, 32),
    note: normalizeText(payload.note, 500),
    website: normalizeText(payload.website, 120),
  };

  if (booking.website) return { error: "Не удалось отправить заявку." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(booking.date)) return { error: "Выберите дату." };
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(booking.time)) return { error: "Выберите время." };
  if (!Number.isInteger(booking.guests) || booking.guests < 1 || booking.guests > 60) {
    return { error: "Укажите количество гостей от 1 до 60." };
  }
  if (booking.name.length < 2) return { error: "Укажите имя." };
  if (!/^\+?[0-9\s()\-]{7,24}$/.test(booking.phone)) return { error: "Проверьте номер телефона." };

  const selectedDate = new Date(`${booking.date}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const latest = new Date(today);
  latest.setFullYear(latest.getFullYear() + 1);
  if (Number.isNaN(selectedDate.getTime()) || selectedDate < today || selectedDate > latest) {
    return { error: "Выберите актуальную дату." };
  }

  return { booking };
}

async function handleBooking(request, response) {
  if (request.method !== "POST") {
    response.writeHead(405, { allow: "POST" });
    response.end();
    return;
  }

  if (isRateLimited(request)) {
    sendJson(response, 429, { ok: false, message: "Слишком много попыток. Попробуйте немного позже." });
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(request);
  } catch {
    sendJson(response, 400, { ok: false, message: "Некорректные данные формы." });
    return;
  }

  const result = validateBooking(payload);
  if (result.error) {
    sendJson(response, 400, { ok: false, message: result.error });
    return;
  }

  loadLocalEnv();
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    sendJson(response, 503, {
      ok: false,
      message: "Приём заявок временно не настроен. Свяжитесь с администратором.",
    });
    return;
  }

  const { booking } = result;
  const message = [
    "<b>Новая заявка · Angel's Warsaw</b>",
    "",
    `<b>Дата:</b> ${escapeHtml(booking.date)}`,
    `<b>Время:</b> ${escapeHtml(booking.time)}`,
    `<b>Гостей:</b> ${booking.guests}`,
    `<b>Имя:</b> ${escapeHtml(booking.name)}`,
    `<b>Телефон:</b> ${escapeHtml(booking.phone)}`,
    booking.note ? `<b>Комментарий:</b> ${escapeHtml(booking.note)}` : "",
    "",
    `<i>Отправлено: ${new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Warsaw" }).format(new Date())}</i>`,
  ].filter(Boolean).join("\n");

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    const telegramResult = await telegramResponse.json().catch(() => null);
    if (!telegramResponse.ok || telegramResult?.ok !== true) {
      throw new Error("TELEGRAM_DELIVERY_FAILED");
    }

    sendJson(response, 200, { ok: true, message: "Заявка отправлена. Мы свяжемся с вами для подтверждения." });
  } catch {
    sendJson(response, 502, {
      ok: false,
      message: "Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь с нами напрямую.",
    });
  }
}

createServer(async (request, response) => {
  const url = new URL(request.url, "http://localhost");
  if (url.pathname === "/api/booking") {
    await handleBooking(request, response);
    return;
  }

  const requestPath = decodeURIComponent(url.pathname);
  const safePath = normalize(requestPath).replace(/^(\.\.(\/|\\|$))+/, "");
  let filePath = join(root, safePath === "/" ? "index.html" : safePath);

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, "index.html");
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const fileStats = statSync(filePath);
  const contentType = mime[extname(filePath)] ?? "application/octet-stream";
  const range = request.headers.range;

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);

    if (!match) {
      response.writeHead(416, { "content-range": `bytes */${fileStats.size}` });
      response.end();
      return;
    }

    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Number(match[2]) : fileStats.size - 1;

    if (start > end || end >= fileStats.size) {
      response.writeHead(416, { "content-range": `bytes */${fileStats.size}` });
      response.end();
      return;
    }

    response.writeHead(206, {
      "accept-ranges": "bytes",
      "cache-control": "no-store",
      "content-length": end - start + 1,
      "content-range": `bytes ${start}-${end}/${fileStats.size}`,
      "content-type": contentType,
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    createReadStream(filePath, { start, end }).pipe(response);
    return;
  }

  response.writeHead(200, {
    "accept-ranges": "bytes",
    "cache-control": "no-store",
    "content-length": fileStats.size,
    "content-type": contentType,
  });

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  createReadStream(filePath).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Local: http://127.0.0.1:${port}`);
});
