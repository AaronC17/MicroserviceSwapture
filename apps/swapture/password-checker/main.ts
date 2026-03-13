interface Requirement {
  label: string;
  met: boolean;
}

interface PasswordAnalysis {
  score: number;
  strength: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
  bgColor: string;
  barWidth: string;
  requirements: Requirement[];
  crackTime: string;
  entropy: number;
}

const COMMON_PATTERNS = [
  'password', 'passwd', '123456', '12345678', '1234567890',
  'qwerty', 'qwertyuiop', 'abc123', 'iloveyou', 'admin',
  'letmein', 'welcome', 'monkey', 'dragon', 'master',
  'sunshine', 'princess', 'football', 'shadow', 'superman',
];

function calcCharsetSize(password: string): number {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/[0-9]/.test(password)) size += 10;
  if (/[^a-zA-Z0-9]/.test(password)) size += 32;
  return size || 1;
}

function calcEntropy(password: string): number {
  if (password.length === 0) return 0;
  const charsetSize = calcCharsetSize(password);
  return Math.floor(password.length * Math.log2(charsetSize));
}

function formatCrackTime(entropy: number): string {
  if (entropy === 0) return '—';
  const GUESSES_PER_SECOND = 10_000_000_000;
  const combinations = Math.pow(2, entropy);
  const seconds = combinations / GUESSES_PER_SECOND;

  if (seconds < 0.001) return 'instantly';
  if (seconds < 1) return 'less than a second';
  if (seconds < 60) return `${Math.ceil(seconds)} second${Math.ceil(seconds) === 1 ? '' : 's'}`;
  if (seconds < 3_600) return `${Math.ceil(seconds / 60)} minute${Math.ceil(seconds / 60) === 1 ? '' : 's'}`;
  if (seconds < 86_400) return `${Math.ceil(seconds / 3_600)} hour${Math.ceil(seconds / 3_600) === 1 ? '' : 's'}`;
  if (seconds < 2_592_000) return `${Math.ceil(seconds / 86_400)} day${Math.ceil(seconds / 86_400) === 1 ? '' : 's'}`;
  if (seconds < 31_536_000) return `${Math.ceil(seconds / 2_592_000)} month${Math.ceil(seconds / 2_592_000) === 1 ? '' : 's'}`;
  if (seconds < 3_153_600_000) return `${Math.ceil(seconds / 31_536_000)} year${Math.ceil(seconds / 31_536_000) === 1 ? '' : 's'}`;
  return 'centuries';
}

function hasNoCommonPatterns(password: string): boolean {
  const lower = password.toLowerCase();
  return !COMMON_PATTERNS.some((pattern) => lower.includes(pattern));
}

function analyzePassword(password: string): PasswordAnalysis {
  const hasLength8 = password.length >= 8;
  const hasLength12 = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const noCommon = password.length > 0 && hasNoCommonPatterns(password);

  const requirements: Requirement[] = [
    { label: 'At least 8 characters', met: hasLength8 },
    { label: 'At least 12 characters (bonus)', met: hasLength12 },
    { label: 'Uppercase letters (A–Z)', met: hasUppercase },
    { label: 'Lowercase letters (a–z)', met: hasLowercase },
    { label: 'Numbers (0–9)', met: hasNumbers },
    { label: 'Special characters (!@#$%…)', met: hasSpecial },
    { label: 'No common patterns', met: noCommon },
  ];

  // Score 0-5: base criteria (length8, upper, lower, numbers, special) each contribute,
  // length12 and no-common are bonuses that can push from 4→5 or 3→4.
  let score = 0;
  if (hasLength8) score++;
  if (hasUppercase) score++;
  if (hasLowercase) score++;
  if (hasNumbers) score++;
  if (hasSpecial) score++;
  // Bonus: common pattern failure drops score, length12 can cap it back
  if (!noCommon && password.length > 0) score = Math.max(0, score - 1);
  if (hasLength12 && score < 5) score = Math.min(5, score + 1);
  score = Math.min(5, score);

  const entropy = calcEntropy(password);
  const crackTime = formatCrackTime(entropy);

  type Strength = PasswordAnalysis['strength'];
  const strengthMap: Array<{ strength: Strength; color: string; bgColor: string; barWidth: string }> = [
    { strength: 'Very Weak', color: 'text-red-500',    bgColor: 'bg-red-500',    barWidth: '10%' },
    { strength: 'Weak',      color: 'text-orange-500', bgColor: 'bg-orange-500', barWidth: '30%' },
    { strength: 'Fair',      color: 'text-yellow-500', bgColor: 'bg-yellow-400', barWidth: '55%' },
    { strength: 'Strong',    color: 'text-blue-500',   bgColor: 'bg-blue-500',   barWidth: '80%' },
    { strength: 'Very Strong', color: 'text-green-500', bgColor: 'bg-green-500', barWidth: '100%' },
  ];

  const index = password.length === 0 ? 0 : Math.min(score === 0 ? 0 : score - 1, 4);
  const { strength, color, bgColor, barWidth } = password.length === 0
    ? { strength: 'Very Weak' as Strength, color: 'text-slate-400', bgColor: 'bg-slate-200', barWidth: '0%' }
    : strengthMap[index];

  return { score, strength, color, bgColor, barWidth, requirements, crackTime, entropy };
}

// ── DOM helpers ───────────────────────────────────────────────────────────────

function getElement<T extends HTMLElement>(id: string): T {
  const el = document.querySelector<T>(`#${id}`);
  if (!el) throw new Error(`Element #${id} not found`);
  return el;
}

function getSVGElement(id: string): SVGElement {
  const el = document.querySelector<SVGElement>(`#${id}`);
  if (!el) throw new Error(`SVG element #${id} not found`);
  return el;
}

function updateRequirement(id: string, met: boolean): void {
  const li = getElement<HTMLLIElement>(id);
  const icon = li.querySelector<HTMLSpanElement>('.req-icon');
  if (!icon) return;

  if (met) {
    icon.textContent = '✓';
    icon.className = 'req-icon w-5 h-5 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-xs font-bold flex-shrink-0';
    li.classList.remove('text-zinc-500');
    li.classList.add('text-zinc-700');
  } else {
    icon.textContent = '✗';
    icon.className = 'req-icon w-5 h-5 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-400 text-xs font-bold flex-shrink-0';
    li.classList.remove('text-zinc-700');
    li.classList.add('text-zinc-500');
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

const passwordInput = getElement<HTMLInputElement>('password-input');
const strengthBar   = getElement<HTMLDivElement>('strength-bar');
const strengthLabel = getElement<HTMLSpanElement>('strength-label');
const strengthScore = getElement<HTMLSpanElement>('strength-score');
const crackTimeEl   = getElement<HTMLSpanElement>('crack-time');
const entropyEl     = getElement<HTMLSpanElement>('entropy-value');
const toggleBtn     = getElement<HTMLButtonElement>('toggle-visibility');
const iconEye       = getSVGElement('icon-eye');
const iconEyeOff    = getSVGElement('icon-eye-off');
const copyBtn       = getElement<HTMLButtonElement>('copy-button');
const iconCopy      = getSVGElement('icon-copy');
const iconCheck     = getSVGElement('icon-check');

const REQ_IDS = [
  'req-length8',
  'req-length12',
  'req-uppercase',
  'req-lowercase',
  'req-numbers',
  'req-special',
  'req-no-common',
];

function render(analysis: PasswordAnalysis, empty: boolean): void {
  // Strength bar
  strengthBar.style.width = empty ? '0%' : analysis.barWidth;
  strengthBar.className = `h-full rounded-full transition-all duration-300 ${empty ? 'bg-slate-200' : analysis.bgColor}`;

  // Label & score
  strengthLabel.textContent = empty ? '—' : analysis.strength;
  strengthLabel.className = `text-sm font-semibold ${empty ? 'text-slate-400' : analysis.color}`;
  strengthScore.textContent = empty ? '0 / 5' : `${analysis.score} / 5`;

  // Requirements
  analysis.requirements.forEach((req, i) => {
    updateRequirement(REQ_IDS[i], req.met);
  });

  // Crack time & entropy
  crackTimeEl.textContent = analysis.crackTime;
  entropyEl.textContent   = String(analysis.entropy);
}

passwordInput.addEventListener('input', () => {
  const password = passwordInput.value;
  const analysis = analyzePassword(password);
  render(analysis, password.length === 0);
});

// Toggle password visibility
toggleBtn.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  iconEye.classList.toggle('hidden', isPassword);
  iconEyeOff.classList.toggle('hidden', !isPassword);
});

// Copy to clipboard
copyBtn.addEventListener('click', async () => {
  const value = passwordInput.value;
  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
    iconCopy.classList.add('hidden');
    iconCheck.classList.remove('hidden');
    setTimeout(() => {
      iconCopy.classList.remove('hidden');
      iconCheck.classList.add('hidden');
    }, 2000);
  } catch {
    // Clipboard API unavailable — silently ignore
  }
});

export {};
