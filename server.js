const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");

loadEnvFile(path.join(ROOT, ".env"));

const PORT = Number(process.env.PORT || 3000);
let activePort = PORT;
let siteUrl = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/$/, "");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

fs.mkdirSync(DATA_DIR, { recursive: true });

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsAt = trimmed.indexOf("=");
    if (equalsAt === -1) continue;

    const key = trimmed.slice(0, equalsAt).trim();
    let value = trimmed.slice(equalsAt + 1).trim();
    if (!key || process.env[key] !== undefined) continue;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(body);
}

function sendText(res, status, text) {
  res.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  res.end(text);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(Object.assign(new Error("Request body is too large"), { status: 413 }));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw.trim()) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(Object.assign(new Error("Invalid JSON body"), { status: 400 }));
      }
    });
    req.on("error", reject);
  });
}

function cleanText(value, max = 1000) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, max);
}

function cleanEmail(value) {
  return cleanText(value, 254).toLowerCase();
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function appendRecord(fileName, record) {
  const file = path.join(DATA_DIR, fileName);
  const line = JSON.stringify({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...record
  });
  fs.appendFileSync(file, `${line}\n`, "utf8");
}

function validateContact(payload) {
  const record = {
    name: cleanText(payload.name, 160),
    email: cleanEmail(payload.email),
    topic: cleanText(payload.topic, 160),
    message: cleanText(payload.message, 5000)
  };

  if (!record.name || !isEmail(record.email) || !record.message) {
    return { error: "Please provide a name, valid email address, and message." };
  }
  return { record };
}

function validatePartnership(payload) {
  const record = {
    organisation: cleanText(payload.organisation, 200),
    contactPerson: cleanText(payload.contactPerson, 160),
    email: cleanEmail(payload.email),
    partnershipType: cleanText(payload.partnershipType, 200),
    description: cleanText(payload.description, 5000)
  };

  if (!record.organisation || !record.contactPerson || !isEmail(record.email) || !record.partnershipType || !record.description) {
    return { error: "Please complete all partnership inquiry fields." };
  }
  return { record };
}

function validateDonation(payload) {
  const amountNAD = Number(payload.amountNAD);
  const record = {
    amountNAD,
    firstName: cleanText(payload.firstName, 100),
    lastName: cleanText(payload.lastName, 100),
    email: cleanEmail(payload.email),
    phone: cleanText(payload.phone, 50),
    invoiceNumber: `DKF-${Date.now()}-${crypto.randomInt(1000, 9999)}`
  };

  if (!Number.isFinite(amountNAD) || amountNAD < 10 || !record.firstName || !record.lastName || !isEmail(record.email) || !record.phone) {
    return { error: "Please complete all donation fields. The minimum amount is NAD 10." };
  }
  return { record };
}

async function createPayTodayIntent(donation) {
  const endpoint = process.env.PAYTODAY_CREATE_INTENT_URL;
  const credentials = {
    shop_key: process.env.PAYTODAY_SHOP_KEY,
    shop_handle: process.env.PAYTODAY_SHOP_HANDLE,
    private_key: process.env.PAYTODAY_PRIVATE_KEY,
    environment: process.env.PAYTODAY_ENVIRONMENT || "production"
  };

  if (!endpoint) {
    return {
      configured: false,
      message: "PayToday server endpoint is not configured yet."
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ...credentials,
      amount: Math.round(donation.amountNAD),
      invoice_number: donation.invoiceNumber,
      user_first_name: donation.firstName,
      user_last_name: donation.lastName,
      user_email: donation.email,
      user_phone_number: donation.phone,
      return_url: `${siteUrl}/donate-thanks.html`
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "PayToday checkout request failed");
  }

  const paymentUrl = data.payment_url || data?.data?.payment_url || data.url || data?.data?.url;
  if (!paymentUrl) {
    throw new Error("PayToday response did not include a payment URL");
  }

  return { configured: true, paymentUrl };
}

async function handleApi(req, res) {
  if (req.method === "GET" && req.url === "/api/health") {
    return sendJson(res, 200, { ok: true, service: "dorothy-welfare-foundation-backend" });
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { ok: false, message: "Method not allowed" });
  }

  const payload = await readJsonBody(req);

  if (req.url === "/api/contact") {
    const { record, error } = validateContact(payload);
    if (error) return sendJson(res, 400, { ok: false, message: error });
    appendRecord("contact-submissions.jsonl", record);
    return sendJson(res, 201, { ok: true, message: "Thank you. Your message has been received." });
  }

  if (req.url === "/api/partnerships") {
    const { record, error } = validatePartnership(payload);
    if (error) return sendJson(res, 400, { ok: false, message: error });
    appendRecord("partnership-inquiries.jsonl", record);
    return sendJson(res, 201, { ok: true, message: "Thank you. Your partnership inquiry has been received." });
  }

  if (req.url === "/api/donations/paytoday") {
    const { record, error } = validateDonation(payload);
    if (error) return sendJson(res, 400, { ok: false, message: error });
    appendRecord("donation-attempts.jsonl", record);

    const intent = await createPayTodayIntent(record);
    if (!intent.configured) {
      return sendJson(res, 503, {
        ok: false,
        code: "PAYTODAY_NOT_CONFIGURED",
        message: "Donation checkout is not configured yet. Please contact us for assistance."
      });
    }

    return sendJson(res, 201, {
      ok: true,
      paymentUrl: intent.paymentUrl,
      invoiceNumber: record.invoiceNumber
    });
  }

  return sendJson(res, 404, { ok: false, message: "API route not found" });
}

function serveStatic(req, res) {
  const url = new URL(req.url, siteUrl);
  const requestedPath = decodeURIComponent(url.pathname);
  const relativePath = requestedPath === "/" ? "index.html" : requestedPath.replace(/^\/+/, "");
  const absolutePath = path.resolve(ROOT, relativePath);

  if (!absolutePath.startsWith(ROOT)) {
    return sendText(res, 403, "Forbidden");
  }

  fs.stat(absolutePath, (statErr, stats) => {
    if (statErr || !stats.isFile()) {
      return sendText(res, 404, "Not found");
    }

    const ext = path.extname(absolutePath).toLowerCase();
    res.writeHead(200, {
      "content-type": MIME_TYPES[ext] || "application/octet-stream"
    });
    fs.createReadStream(absolutePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith("/api/")) {
      await handleApi(req, res);
      return;
    }
    serveStatic(req, res);
  } catch (error) {
    const status = error.status || 500;
    sendJson(res, status, {
      ok: false,
      message: status === 500 ? "Server error" : error.message
    });
  }
});

function listen(port, attemptsLeft = 10) {
  activePort = port;
  if (!process.env.SITE_URL) siteUrl = `http://localhost:${activePort}`;

  server.once("error", (error) => {
    if (error.code === "EADDRINUSE" && !process.env.PORT && attemptsLeft > 0) {
      listen(port + 1, attemptsLeft - 1);
      return;
    }
    throw error;
  });

  server.listen(activePort, () => {
    console.log(`Dorothy Welfare Foundation backend running at http://localhost:${activePort}`);
  });
}

listen(PORT);
