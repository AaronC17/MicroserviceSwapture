/**
 * Subnet Calculator — Core Logic
 * Used by index.html (compiled/bundled output embedded inline).
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubnetResult {
  ip: string;
  subnetMask: string;
  cidr: number;
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
  ipClass: string;
  binaryNetwork: string;
  binaryMask: string;
}

// ─── IP / Number conversions ──────────────────────────────────────────────────

/**
 * Converts a dotted-decimal IPv4 string to an unsigned 32-bit integer.
 * e.g. "192.168.1.1" → 3232235777
 */
export function ipToNumber(ip: string): number {
  return (
    ip
      .split('.')
      .reduce((acc, octet) => ((acc << 8) | parseInt(octet, 10)) >>> 0, 0) >>> 0
  );
}

/**
 * Converts an unsigned 32-bit integer back to a dotted-decimal IPv4 string.
 * e.g. 3232235777 → "192.168.1.1"
 */
export function numberToIP(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join('.');
}

// ─── CIDR ↔ Subnet Mask ───────────────────────────────────────────────────────

/**
 * Converts a CIDR prefix length (0–32) to an unsigned 32-bit subnet mask number.
 * e.g. 24 → 0xFFFFFF00 (4294967040)
 */
export function cidrToMask(cidr: number): number {
  if (cidr < 0 || cidr > 32) {
    throw new RangeError(`CIDR must be between 0 and 32, got ${cidr}`);
  }
  return cidr === 0 ? 0 : ((0xffffffff << (32 - cidr)) >>> 0);
}

/**
 * Converts a dotted-decimal subnet mask to its CIDR prefix length.
 * Returns -1 if the mask is not a valid contiguous subnet mask.
 * e.g. "255.255.255.0" → 24
 */
export function maskToCIDR(mask: string): number {
  const num = ipToNumber(mask);

  // Count leading 1 bits
  let bits = num;
  let count = 0;
  while (bits & 0x80000000) {
    count++;
    bits = (bits << 1) >>> 0;
  }

  // Verify mask is contiguous (no 1 bits after the first 0 bit)
  if (cidrToMask(count) !== num) return -1;

  return count;
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Returns true if the string is a valid dotted-decimal IPv4 address.
 * Each octet must be an integer 0–255 with no leading zeros.
 */
export function isValidIP(ip: string): boolean {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    if (p === '' || p.length > 3) return false;
    const n = Number(p);
    return Number.isInteger(n) && n >= 0 && n <= 255;
  });
}

/**
 * Returns true if the string is a valid contiguous IPv4 subnet mask.
 */
export function isValidMask(mask: string): boolean {
  if (!isValidIP(mask)) return false;
  return maskToCIDR(mask) !== -1;
}

// ─── IP Classification ────────────────────────────────────────────────────────

/**
 * Returns the traditional IP class (A/B/C/D/E) based on the first octet.
 */
export function getIPClass(firstOctet: number): string {
  if (firstOctet >= 1 && firstOctet <= 126) return 'A';
  if (firstOctet === 127) return 'A (Loopback)';
  if (firstOctet >= 128 && firstOctet <= 191) return 'B';
  if (firstOctet >= 192 && firstOctet <= 223) return 'C';
  if (firstOctet >= 224 && firstOctet <= 239) return 'D (Multicast)';
  if (firstOctet >= 240 && firstOctet <= 255) return 'E (Reserved)';
  return 'Unknown';
}

// ─── Binary representation ────────────────────────────────────────────────────

/**
 * Returns the binary dot-notation of a 32-bit number.
 * e.g. 3232235520 → "11000000.10101000.00000001.00000000"
 */
export function toBinaryOctets(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ]
    .map((o) => o.toString(2).padStart(8, '0'))
    .join('.');
}

// ─── Core Subnet Calculation ──────────────────────────────────────────────────

/**
 * Calculates all subnet properties given an IPv4 address and a CIDR prefix length.
 *
 * @param ip   - Dotted-decimal IPv4 address string (e.g. "192.168.1.50")
 * @param cidr - Prefix length 0–32 (e.g. 24)
 * @returns    SubnetResult with all computed fields
 *
 * Special cases:
 *  - /31: 2 addresses, 2 usable (point-to-point, RFC 3021)
 *  - /32: 1 address (single host), 0 usable
 */
export function calculateSubnet(ip: string, cidr: number): SubnetResult {
  if (!isValidIP(ip)) throw new Error(`Invalid IP address: "${ip}"`);
  if (cidr < 0 || cidr > 32) throw new RangeError(`CIDR must be 0–32, got ${cidr}`);

  const ipNum = ipToNumber(ip);
  const maskNum = cidrToMask(cidr);
  const networkNum = (ipNum & maskNum) >>> 0;
  const broadcastNum = (networkNum | (~maskNum >>> 0)) >>> 0;

  const totalHosts = Math.pow(2, 32 - cidr);

  // /31 → 2 usable (RFC 3021 point-to-point), /32 → 0 usable
  const usableHosts: number =
    cidr === 32 ? 0 : cidr === 31 ? 2 : totalHosts - 2;

  // For /32, firstHost and lastHost are the address itself
  const firstHost =
    cidr === 32 ? numberToIP(networkNum) : numberToIP(networkNum + 1);
  const lastHost =
    cidr === 32 ? numberToIP(broadcastNum) : numberToIP(broadcastNum - 1);

  const firstOctet = (ipNum >>> 24) & 255;

  return {
    ip,
    subnetMask: numberToIP(maskNum),
    cidr,
    networkAddress: numberToIP(networkNum),
    broadcastAddress: numberToIP(broadcastNum),
    firstHost,
    lastHost,
    totalHosts,
    usableHosts,
    ipClass: getIPClass(firstOctet),
    binaryNetwork: toBinaryOctets(networkNum),
    binaryMask: toBinaryOctets(maskNum),
  };
}

// ─── DOM Wiring ───────────────────────────────────────────────────────────────

type InputMode = 'cidr' | 'mask';

interface DOMRefs {
  ipInput: HTMLInputElement;
  cidrInput: HTMLInputElement;
  maskInput: HTMLInputElement;
  cidrPanel: HTMLElement;
  maskPanel: HTMLElement;
  tabCidr: HTMLButtonElement;
  tabMask: HTMLButtonElement;
  ipError: HTMLElement;
  cidrError: HTMLElement;
  maskError: HTMLElement;
  resultsSection: HTMLElement;
  resultSummary: HTMLElement;
  resultBody: HTMLElement;
  calculateBtn: HTMLButtonElement;
}

const RESULT_ROWS: Array<{
  label: string;
  key: keyof SubnetResult;
  mono: boolean;
  prefix?: string;
}> = [
  { label: 'IP Address',             key: 'ip',               mono: true  },
  { label: 'Subnet Mask',            key: 'subnetMask',       mono: true  },
  { label: 'CIDR Notation',          key: 'cidr',             mono: true, prefix: '/' },
  { label: 'Network Address',        key: 'networkAddress',   mono: true  },
  { label: 'Broadcast Address',      key: 'broadcastAddress', mono: true  },
  { label: 'First Usable Host',      key: 'firstHost',        mono: true  },
  { label: 'Last Usable Host',       key: 'lastHost',         mono: true  },
  { label: 'Total Hosts',            key: 'totalHosts',       mono: false },
  { label: 'Usable Hosts',           key: 'usableHosts',      mono: false },
  { label: 'IP Class',               key: 'ipClass',          mono: false },
  { label: 'Binary Network Address', key: 'binaryNetwork',    mono: true  },
  { label: 'Binary Subnet Mask',     key: 'binaryMask',       mono: true  },
];

function getRefs(): DOMRefs {
  const get = <T extends HTMLElement>(id: string) =>
    document.getElementById(id) as T;

  return {
    ipInput:       get<HTMLInputElement>('ip-input'),
    cidrInput:     get<HTMLInputElement>('cidr-input'),
    maskInput:     get<HTMLInputElement>('mask-input'),
    cidrPanel:     get('cidr-panel'),
    maskPanel:     get('mask-panel'),
    tabCidr:       get<HTMLButtonElement>('tab-cidr'),
    tabMask:       get<HTMLButtonElement>('tab-mask'),
    ipError:       get('ip-error'),
    cidrError:     get('cidr-error'),
    maskError:     get('mask-error'),
    resultsSection: get('results-section'),
    resultSummary: get('result-summary'),
    resultBody:    get('results-section').querySelector('.divide-y') as HTMLElement,
    calculateBtn:  get<HTMLButtonElement>('calculate-btn'),
  };
}

function clearErrors(refs: DOMRefs): void {
  refs.ipError.classList.add('hidden');
  refs.cidrError.classList.add('hidden');
  refs.maskError.classList.add('hidden');
}

function switchInputMode(mode: InputMode, refs: DOMRefs): void {
  if (mode === 'cidr') {
    refs.cidrPanel.classList.remove('hidden');
    refs.maskPanel.classList.add('hidden');
    refs.tabCidr.className = 'px-3 py-1.5 font-medium transition tab-active';
    refs.tabMask.className = 'px-3 py-1.5 font-medium transition tab-inactive';
  } else {
    refs.cidrPanel.classList.add('hidden');
    refs.maskPanel.classList.remove('hidden');
    refs.tabCidr.className = 'px-3 py-1.5 font-medium transition tab-inactive';
    refs.tabMask.className = 'px-3 py-1.5 font-medium transition tab-active';
  }
  clearErrors(refs);
}

async function copyToClipboard(btn: HTMLButtonElement, value: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value);
    const origHTML = btn.innerHTML;
    btn.innerHTML = `<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
    </svg>`;
    setTimeout(() => { btn.innerHTML = origHTML; }, 1500);
  } catch {
    // Clipboard API unavailable — silently ignore
  }
}

function renderResults(result: SubnetResult, refs: DOMRefs): void {
  refs.resultSummary.textContent =
    `${result.ip}/${result.cidr} — ${result.networkAddress} network`;

  refs.resultBody.innerHTML = RESULT_ROWS.map((row) => {
    const raw = result[row.key];
    const value = row.prefix != null ? row.prefix + String(raw) : String(raw);
    const displayVal =
      typeof raw === 'number' ? (raw as number).toLocaleString() : value;

    return `
      <div class="result-row flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors group">
        <span class="text-sm text-slate-500 w-44 shrink-0">${row.label}</span>
        <span class="text-sm ${row.mono ? 'font-mono' : 'font-medium'} text-slate-800 flex-1 text-right pr-3 break-all">
          ${displayVal}
        </span>
        <button
          data-copy="${value.replace(/"/g, '&quot;')}"
          title="Copy ${row.label}"
          class="copy-icon shrink-0 p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
        </button>
      </div>
    `;
  }).join('');

  // Attach copy handlers
  refs.resultBody.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', () => copyToClipboard(btn, btn.dataset.copy ?? ''));
  });

  // Show with animation
  refs.resultsSection.classList.remove('hidden');
  refs.resultsSection.classList.remove('fade-in');
  void refs.resultsSection.offsetWidth; // reflow to restart CSS animation
  refs.resultsSection.classList.add('fade-in');
  refs.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function handleCalculate(refs: DOMRefs, mode: InputMode): void {
  clearErrors(refs);

  const ip = refs.ipInput.value.trim();
  if (!isValidIP(ip)) {
    refs.ipError.classList.remove('hidden');
    refs.ipInput.focus();
    return;
  }

  let cidr: number;

  if (mode === 'cidr') {
    const raw = refs.cidrInput.value.trim();
    const parsed = parseInt(raw, 10);
    if (raw === '' || isNaN(parsed) || parsed < 0 || parsed > 32) {
      refs.cidrError.classList.remove('hidden');
      refs.cidrInput.focus();
      return;
    }
    cidr = parsed;
  } else {
    const mask = refs.maskInput.value.trim();
    if (!isValidMask(mask)) {
      refs.maskError.classList.remove('hidden');
      refs.maskInput.focus();
      return;
    }
    cidr = maskToCIDR(mask);
  }

  const result = calculateSubnet(ip, cidr);
  renderResults(result, refs);
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

function bootstrap(): void {
  const refs = getRefs();
  let mode: InputMode = 'cidr';

  // Tab buttons
  refs.tabCidr.addEventListener('click', () => {
    mode = 'cidr';
    switchInputMode('cidr', refs);
  });
  refs.tabMask.addEventListener('click', () => {
    mode = 'mask';
    switchInputMode('mask', refs);
  });

  // Calculate button
  refs.calculateBtn.addEventListener('click', () => handleCalculate(refs, mode));

  // Enter key on any input
  [refs.ipInput, refs.cidrInput, refs.maskInput].forEach((el) => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleCalculate(refs, mode);
    });
  });

  // Footer year
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // URL parameter pre-fill (e.g. ?ip=10.0.0.0&cidr=8 or ?ip=10.0.0.0&mask=255.0.0.0)
  const params = new URLSearchParams(window.location.search);
  const paramIP   = params.get('ip');
  const paramCIDR = params.get('cidr');
  const paramMask = params.get('mask');

  if (paramIP) refs.ipInput.value = paramIP;

  if (paramMask && !paramCIDR) {
    mode = 'mask';
    switchInputMode('mask', refs);
    refs.maskInput.value = paramMask;
  } else if (paramCIDR) {
    refs.cidrInput.value = paramCIDR;
  }

  if (paramIP && (paramCIDR || paramMask)) {
    handleCalculate(refs, mode);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
