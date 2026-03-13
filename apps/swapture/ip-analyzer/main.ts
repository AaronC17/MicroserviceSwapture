interface IPData {
  ip: string;
  city?: string;
  region?: string;
  country_name?: string;
  country_code?: string;
  org?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  asn?: string;
  /** ipapi.co returns error details when rate-limited or IP is invalid */
  error?: boolean;
  reason?: string;
  /** Some providers surface VPN/proxy hints via the org field prefix */
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

async function getUserIP(): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch("https://api.ipify.org?format=json", { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) {
      throw new Error(`Failed to fetch your IP (HTTP ${response.status})`);
    }
    const data = (await response.json()) as { ip: string };
    if (!data.ip) throw new Error("Could not determine your IP address.");
    return data.ip;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

async function getIPDetails(ip: string): Promise<IPData> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(
          "Rate limit reached on the free API tier. Please wait a moment and try again."
        );
      }
      throw new Error(`IP lookup failed (HTTP ${response.status})`);
    }
    const data = (await response.json()) as IPData;
    if (data.error) {
      throw new Error(data.reason ?? "Invalid IP address or lookup failed.");
    }
    return data;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Country flag emoji helper (works for ISO 3166-1 alpha-2 codes)
// ---------------------------------------------------------------------------

function countryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "";
  const offset = 0x1f1e6 - 65; // 'A' char code is 65
  const chars = countryCode
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + offset));
  return chars.join("");
}

// ---------------------------------------------------------------------------
// VPN / proxy heuristic
// The ipapi.co free tier doesn't expose a dedicated VPN flag, but the `org`
// field often starts with "AS<number> <Provider>" and known VPN providers
// can be detected with a lightweight keyword check.
// ---------------------------------------------------------------------------

const VPN_KEYWORDS = [
  "vpn",
  "proxy",
  "tor",
  "hosting",
  "cloud",
  "datacenter",
  "data center",
  "amazon",
  "digitalocean",
  "linode",
  "vultr",
  "hetzner",
  "ovh",
  "cloudflare",
  "fastly",
  "akamai",
];

function detectVPN(data: IPData): string {
  if (!data.org) return "Unknown";
  const org = data.org.toLowerCase();
  const isVPN = VPN_KEYWORDS.some((kw) => org.includes(kw));
  return isVPN ? "⚠️ Possible VPN / Hosting / Proxy" : "✅ Likely residential / ISP";
}

// ---------------------------------------------------------------------------
// DOM rendering
// ---------------------------------------------------------------------------

function buildDetailRow(label: string, value: string): string {
  return `
    <div class="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
      <span class="text-xs font-semibold uppercase tracking-wide text-slate-400 shrink-0 w-32">${label}</span>
      <span class="text-sm text-slate-700 text-right font-medium break-all">${value}</span>
    </div>`;
}

function displayResults(data: IPData, prefix: "auto" | "manual"): void {
  const ipEl = document.getElementById(`${prefix}-ip`);
  const detailsEl = document.getElementById(`${prefix}-details`);
  const resultsEl = document.getElementById(`${prefix}-results`);

  if (!ipEl || !detailsEl || !resultsEl) return;

  ipEl.textContent = data.ip;

  const flag = data.country_code ? countryFlag(data.country_code) : "";
  const country = data.country_name
    ? `${flag} ${data.country_name}`.trim()
    : "N/A";
  const coords =
    data.latitude != null && data.longitude != null
      ? `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`
      : "N/A";

  detailsEl.innerHTML = [
    buildDetailRow("Country", country),
    buildDetailRow("Region", data.region ?? "N/A"),
    buildDetailRow("City", data.city ?? "N/A"),
    buildDetailRow("ISP / Org", data.org ?? "N/A"),
    buildDetailRow("Timezone", data.timezone ?? "N/A"),
    buildDetailRow("Coordinates", coords),
    buildDetailRow("VPN / Proxy", detectVPN(data)),
    ...(data.asn ? [buildDetailRow("ASN", data.asn)] : []),
  ].join("");

  resultsEl.classList.remove("hidden");

  // Wire up copy button
  const copyBtn = document.getElementById(`${prefix}-copy-btn`);
  if (copyBtn) {
    copyBtn.onclick = () => copyToClipboard(data.ip, copyBtn);
  }
}

// ---------------------------------------------------------------------------
// Loading / error state helpers
// ---------------------------------------------------------------------------

function showLoading(prefix: "auto" | "manual", visible: boolean): void {
  const el = document.getElementById(`${prefix}-loading`);
  if (!el) return;
  if (visible) {
    el.classList.remove("hidden");
    el.classList.add("flex");
  } else {
    el.classList.add("hidden");
    el.classList.remove("flex");
  }
}

function showError(prefix: "auto" | "manual", message: string): void {
  const el = document.getElementById(`${prefix}-error`);
  if (!el) return;
  el.textContent = `⚠️ ${message}`;
  el.classList.remove("hidden");
}

function clearError(prefix: "auto" | "manual"): void {
  const el = document.getElementById(`${prefix}-error`);
  if (!el) return;
  el.textContent = "";
  el.classList.add("hidden");
}

function hideResults(prefix: "auto" | "manual"): void {
  const el = document.getElementById(`${prefix}-results`);
  el?.classList.add("hidden");
}

// ---------------------------------------------------------------------------
// Copy to clipboard
// ---------------------------------------------------------------------------

function copyToClipboard(text: string, btn: HTMLElement): void {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      const original = btn.innerHTML;
      btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
      </svg> Copied!`;
      setTimeout(() => {
        btn.innerHTML = original;
      }, 2000);
    })
    .catch(() => {
      showError("auto", "Could not copy to clipboard.");
    });
}

// ---------------------------------------------------------------------------
// Auto-detect on page load
// ---------------------------------------------------------------------------

async function autoDetect(): Promise<void> {
  showLoading("auto", true);
  clearError("auto");
  hideResults("auto");

  try {
    const ip = await getUserIP();
    const data = await getIPDetails(ip);
    displayResults(data, "auto");
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    showError("auto", message);
  } finally {
    showLoading("auto", false);
  }
}

// ---------------------------------------------------------------------------
// Manual lookup on button click / Enter key
// ---------------------------------------------------------------------------

function isValidIPv4(value: string): boolean {
  const parts = value.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255 && String(num) === part;
  });
}

function isValidIPv6(value: string): boolean {
  // RFC 5952 – allow full, compressed (::), and mixed IPv4-in-IPv6 forms.
  // We split on '::' first to handle the zero-compression shorthand.
  const halves = value.split("::");
  if (halves.length > 2) return false; // more than one '::' is invalid

  const toGroups = (s: string) => (s === "" ? [] : s.split(":"));

  if (halves.length === 2) {
    // Compressed form: left :: right
    const left = toGroups(halves[0]);
    const right = toGroups(halves[1]);
    if (left.length + right.length > 7) return false;
    return [...left, ...right].every((g) => /^[0-9a-fA-F]{1,4}$/.test(g));
  }

  // Full form: exactly 8 colon-separated groups
  const groups = toGroups(halves[0]);
  if (groups.length !== 8) return false;
  return groups.every((g) => /^[0-9a-fA-F]{1,4}$/.test(g));
}

function isValidIP(value: string): boolean {
  const trimmed = value.trim();
  return isValidIPv4(trimmed) || isValidIPv6(trimmed);
}

async function runManualLookup(): Promise<void> {
  const input = document.getElementById("ip-input") as HTMLInputElement | null;
  const btn = document.getElementById("analyze-btn") as HTMLButtonElement | null;
  const placeholder = document.getElementById("manual-placeholder");

  if (!input) return;
  const ip = input.value.trim();

  if (!ip) {
    showError("manual", "Please enter an IP address.");
    return;
  }

  if (!isValidIP(ip)) {
    showError("manual", "Please enter a valid IPv4 or IPv6 address (e.g. 8.8.8.8).");
    return;
  }

  clearError("manual");
  hideResults("manual");
  placeholder?.classList.add("hidden");
  showLoading("manual", true);
  if (btn) btn.disabled = true;

  try {
    const data = await getIPDetails(ip);
    displayResults(data, "manual");
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    showError("manual", message);
    placeholder?.classList.remove("hidden");
  } finally {
    showLoading("manual", false);
    if (btn) btn.disabled = false;
  }
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  // Auto-detect immediately
  autoDetect();

  // Analyze button click
  const analyzeBtn = document.getElementById("analyze-btn");
  analyzeBtn?.addEventListener("click", () => runManualLookup());

  // Enter key in input
  const ipInput = document.getElementById("ip-input");
  ipInput?.addEventListener("keydown", (e: Event) => {
    if ((e as KeyboardEvent).key === "Enter") runManualLookup();
  });
});

export {};
