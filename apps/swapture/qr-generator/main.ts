// QR Code Generator using qrserver.com API

type QRType = 'url' | 'text' | 'email' | 'phone' | 'sms' | 'wifi';

interface QRConfig {
  type: QRType;
  data: string;
  size: number; // 100-1000
  color: string; // hex without #
}

function buildQRData(config: QRConfig): string {
  switch (config.type) {
    case 'url':
      return config.data.startsWith('http') ? config.data : `https://${config.data}`;
    case 'email':
      return `mailto:${config.data}`;
    case 'phone':
      return `tel:${config.data}`;
    case 'sms':
      return `sms:${config.data}`;
    case 'wifi': {
      // Expected format: "SSID|PASSWORD|WPA"
      const parts = config.data.split('|');
      const ssid = parts[0] ?? '';
      const pass = parts[1] ?? '';
      const enc  = parts[2] ?? 'WPA';
      return `WIFI:S:${ssid};T:${enc};P:${pass};;`;
    }
    default:
      return config.data;
  }
}

function buildQRUrl(config: QRConfig): string {
  const data = encodeURIComponent(buildQRData(config));
  const color = encodeURIComponent(config.color);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${config.size}x${config.size}&data=${data}&color=${color}&bgcolor=ffffff&format=png&margin=10`;
}

// ── DOM ──────────────────────────────────────────────────────────────────────

const typeSelect    = document.getElementById('qr-type') as HTMLSelectElement;
const dataInput     = document.getElementById('qr-data') as HTMLInputElement | HTMLTextAreaElement;
const colorInput    = document.getElementById('qr-color') as HTMLInputElement;
const generateBtn   = document.getElementById('generate-btn') as HTMLButtonElement;
const qrResult      = document.getElementById('qr-result') as HTMLDivElement;
const qrImage       = document.getElementById('qr-image') as HTMLImageElement;
const downloadBtn   = document.getElementById('download-btn') as HTMLAnchorElement;
const errorMsg      = document.getElementById('error-msg') as HTMLParagraphElement;
const dataLabel     = document.getElementById('data-label') as HTMLLabelElement;
const dataHint      = document.getElementById('data-hint') as HTMLSpanElement;
const wifiFields    = document.getElementById('wifi-fields') as HTMLDivElement;
const wifiSsid      = document.getElementById('wifi-ssid') as HTMLInputElement;
const wifiPass      = document.getElementById('wifi-pass') as HTMLInputElement;
const wifiEnc       = document.getElementById('wifi-enc') as HTMLSelectElement;
const qrPlaceholder = document.getElementById('qr-placeholder') as HTMLDivElement;
const sizeBtns      = document.querySelectorAll<HTMLButtonElement>('.size-btn');

// ── Size selection ────────────────────────────────────────────────────────────

let selectedSize = 300;

sizeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Deactivate all
    sizeBtns.forEach(b => {
      b.classList.remove('border-2', 'border-purple-700', 'bg-purple-50', 'font-semibold', 'text-purple-800');
      b.classList.add('border', 'border-zinc-200', 'font-medium', 'text-zinc-600');
      const sub = b.querySelector('span');
      if (sub) { sub.classList.remove('text-purple-600'); sub.classList.add('text-zinc-400'); }
    });
    // Activate selected
    btn.classList.add('border-2', 'border-purple-700', 'bg-purple-50', 'font-semibold', 'text-purple-800');
    btn.classList.remove('border', 'border-zinc-200', 'font-medium', 'text-zinc-600');
    const sub = btn.querySelector('span');
    if (sub) { sub.classList.add('text-purple-600'); sub.classList.remove('text-zinc-400'); }
    selectedSize = parseInt(btn.dataset.size ?? '300', 10);
  });
});

// ── Type UI ───────────────────────────────────────────────────────────────────

const TYPE_META: Record<QRType, { label: string; hint: string; placeholder: string }> = {
  url:   { label: 'URL',            hint: 'Enter a full URL',                   placeholder: 'https://example.com' },
  text:  { label: 'Text',           hint: 'Enter any text',                      placeholder: 'Hello, World!' },
  email: { label: 'Email address',  hint: 'Enter an email address',              placeholder: 'user@example.com' },
  phone: { label: 'Phone number',   hint: 'Include country code, e.g. +1',       placeholder: '+15551234567' },
  sms:   { label: 'Phone number',   hint: 'Include country code for SMS target', placeholder: '+15551234567' },
  wifi:  { label: 'Wi-Fi network',  hint: 'Fill in the network fields below',    placeholder: '' },
};

function updateTypeUI(type: QRType): void {
  const meta = TYPE_META[type];
  dataLabel.textContent = meta.label;
  dataHint.textContent  = meta.hint;
  if (dataInput instanceof HTMLInputElement) {
    dataInput.placeholder = meta.placeholder;
  }
  wifiFields.classList.toggle('hidden', type !== 'wifi');
  const dataRow = document.getElementById('data-row') as HTMLDivElement;
  dataRow.classList.toggle('hidden', type === 'wifi');
}

typeSelect.addEventListener('change', () => updateTypeUI(typeSelect.value as QRType));

function getWifiData(): string {
  return `${wifiSsid.value}|${wifiPass.value}|${wifiEnc.value}`;
}

generateBtn.addEventListener('click', () => {
  errorMsg.classList.add('hidden');
  const type = typeSelect.value as QRType;

  // Validate input
  if (type === 'wifi') {
    if (!wifiSsid.value.trim()) {
      errorMsg.textContent = 'Please enter a Wi-Fi network name (SSID).';
      errorMsg.classList.remove('hidden');
      return;
    }
  } else {
    const val = (dataInput as HTMLInputElement).value.trim();
    if (!val) {
      errorMsg.textContent = 'Please enter data to encode.';
      errorMsg.classList.remove('hidden');
      return;
    }
  }

  const rawData = type === 'wifi' ? getWifiData() : (dataInput as HTMLInputElement).value.trim();

  const config: QRConfig = {
    type,
    data:  rawData,
    size:  selectedSize,
    color: colorInput.value.replace('#', ''),
  };

  const url = buildQRUrl(config);

  // Show loading state
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating…';
  qrResult.classList.add('hidden');

  qrImage.onload = () => {
    qrResult.classList.remove('hidden');
    qrPlaceholder.classList.add('hidden');
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate QR Code';
    // Fix cross-origin download: fetch as blob and use object URL
    fetch(url)
      .then(r => r.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        downloadBtn.href = blobUrl;
        downloadBtn.download = `qr-${type}-swapture.png`;
      })
      .catch(() => {
        downloadBtn.href = url;
        downloadBtn.download = `qr-${type}-swapture.png`;
      });
  };
  qrImage.onerror = () => {
    errorMsg.textContent = 'Failed to generate QR code. Please try again.';
    errorMsg.classList.remove('hidden');
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate QR Code';
  };
  qrImage.src = url;
});

// Initialize
updateTypeUI('url');

export {};
