// QR Code Generator using qrserver.com API

type QRType = 'url' | 'text' | 'email' | 'phone' | 'sms' | 'wifi';

interface QRConfig {
  type: QRType;
  data: string;
  size: number; // 100-1000
  color: string; // hex without #
  bg: string; // hex without #
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
  const bg = encodeURIComponent(config.bg);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${config.size}x${config.size}&data=${data}&color=${color}&bgcolor=${bg}&format=png&margin=10`;
}

// ── DOM ──────────────────────────────────────────────────────────────────────

const typeSelect    = document.getElementById('qr-type') as HTMLSelectElement;
const dataInput     = document.getElementById('qr-data') as HTMLInputElement | HTMLTextAreaElement;
const sizeInput     = document.getElementById('qr-size') as HTMLInputElement;
const sizeDisplay   = document.getElementById('size-display') as HTMLSpanElement;
const colorInput    = document.getElementById('qr-color') as HTMLInputElement;
const bgInput       = document.getElementById('qr-bg') as HTMLInputElement;
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

sizeInput.addEventListener('input', () => {
  sizeDisplay.textContent = `${sizeInput.value}px`;
});

function getWifiData(): string {
  return `${wifiSsid.value}|${wifiPass.value}|${wifiEnc.value}`;
}

generateBtn.addEventListener('click', () => {
  errorMsg.classList.add('hidden');
  const type = typeSelect.value as QRType;
  const rawData = type === 'wifi' ? getWifiData() : (dataInput as HTMLInputElement).value.trim();

  if (!rawData || rawData === '||') {
    errorMsg.textContent = 'Please enter data to encode.';
    errorMsg.classList.remove('hidden');
    return;
  }

  const config: QRConfig = {
    type,
    data:  rawData,
    size:  parseInt(sizeInput.value, 10),
    color: colorInput.value.replace('#', ''),
    bg:    bgInput.value.replace('#', ''),
  };

  const url = buildQRUrl(config);

  // Show loading state
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating…';
  qrResult.classList.add('hidden');

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    qrImage.src = url;
    downloadBtn.href = url;
    downloadBtn.download = `qr-${type}-swapture.png`;
    qrResult.classList.remove('hidden');
    qrPlaceholder.classList.add('hidden');
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate QR Code';
  };
  img.onerror = () => {
    errorMsg.textContent = 'Failed to generate QR code. Please try again.';
    errorMsg.classList.remove('hidden');
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate QR Code';
  };
  img.src = url;
});

// Initialize
updateTypeUI('url');
sizeDisplay.textContent = `${sizeInput.value}px`;

export {};
