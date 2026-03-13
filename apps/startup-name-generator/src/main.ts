// ──────────────────────────────────────────────
//  Startup Name Generator — Core Logic & DOM
// ──────────────────────────────────────────────

const TECH_PREFIXES: string[] = [
  'Tech', 'Digi', 'Cyber', 'Neo', 'Meta', 'Hyper', 'Omni', 'Sync', 'Flux', 'Byte',
];

const TECH_SUFFIXES: string[] = [
  'Labs', 'Hub', 'AI', 'Go', 'Flux', 'Wave', 'Forge', 'Stack', 'Base', 'Ly', 'ify', 'io',
];

const INDUSTRY_WORDS: Record<string, string[]> = {
  Technology:    ['Tech', 'Digital', 'Cyber', 'Data', 'Cloud', 'AI', 'Code', 'Dev'],
  Finance:       ['Capital', 'Vest', 'Fund', 'Pay', 'Cash', 'Coin', 'Trade', 'Rich'],
  Health:        ['Med', 'Care', 'Health', 'Well', 'Vita', 'Cure', 'Life', 'Fit'],
  Education:     ['Learn', 'Edu', 'Teach', 'Mentor', 'Study', 'Bright', 'Smart', 'Know'],
  Food:          ['Bite', 'Feast', 'Yum', 'Taste', 'Fresh', 'Nourish', 'Cook', 'Chef'],
  Travel:        ['Roam', 'Trek', 'Voyage', 'Globe', 'Journey', 'Wander', 'Fly', 'Tour'],
  Fashion:       ['Style', 'Chic', 'Vogue', 'Trend', 'Glam', 'Dress', 'Mode', 'Look'],
  Environment:   ['Green', 'Eco', 'Earth', 'Sustain', 'Nature', 'Pure', 'Clean', 'Bio'],
  Entertainment: ['Fun', 'Play', 'Joy', 'Spark', 'Vibe', 'Beat', 'Zap', 'Pop'],
  Other:         ['Nova', 'Apex', 'Prime', 'Zen', 'Vista', 'Aura', 'Core', 'Peak'],
};

export interface GeneratedName {
  name: string;
  /** Describes the naming strategy used, e.g. 'Prefix + Keyword' */
  pattern: string;
}

// ── Utility helpers ────────────────────────────

export function capitalize(word: string): string {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/** Removes vowels from a word for abbreviation-style names (e.g. Tumblr, Flickr). */
export function removeVowels(word: string): string {
  // Always keep the first character even if it's a vowel so the result is readable.
  if (!word) return '';
  const first = word.charAt(0);
  const rest = word.slice(1).replace(/[aeiou]/gi, '');
  return (first + rest) || word;
}

export function camelCase(...parts: string[]): string {
  return parts
    .filter(Boolean)
    .map((p, i) => (i === 0 ? capitalize(p) : capitalize(p)))
    .join('');
}

// ── Random helpers ─────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ── Portmanteau helper ─────────────────────────

/** Blends the first ~60 % of wordA with the last ~50 % of wordB. */
function portmanteau(a: string, b: string): string {
  const splitA = Math.ceil(a.length * 0.6);
  const splitB = Math.floor(b.length * 0.5);
  return capitalize(a.slice(0, splitA)) + b.slice(b.length - splitB).toLowerCase();
}

// ── Core generation function ───────────────────

export function generateNames(keywords: string[], industry: string): GeneratedName[] {
  const clean = keywords.map(k => k.trim()).filter(Boolean);
  if (clean.length === 0) return [];

  const industryPool: string[] = INDUSTRY_WORDS[industry] ?? INDUSTRY_WORDS['Other'];
  const candidates: GeneratedName[] = [];
  const seen = new Set<string>();

  function add(name: string, pattern: string): void {
    // Sanitise: letters only, 3–20 chars, unique (case-insensitive)
    const sanitised = name.replace(/[^a-zA-Z0-9]/g, '');
    if (sanitised.length < 3 || sanitised.length > 20) return;
    const key = sanitised.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push({ name: sanitised, pattern });
  }

  // Shuffle pools to produce different results on each call (regenerate).
  const prefixes = shuffle(TECH_PREFIXES);
  const suffixes = shuffle(TECH_SUFFIXES);
  const indWords = shuffle(industryPool);

  for (const kw of clean) {
    const kCap = capitalize(kw);

    // Strategy 1 – Keyword + Suffix
    add(camelCase(kCap, pick(suffixes)), 'Keyword + Suffix');
    add(camelCase(kCap, pick(suffixes)), 'Keyword + Suffix');

    // Strategy 2 – Prefix + Keyword
    add(camelCase(pick(prefixes), kCap), 'Prefix + Keyword');
    add(camelCase(pick(prefixes), kCap), 'Prefix + Keyword');

    // Strategy 4 – Industry Word + Keyword
    add(camelCase(pick(indWords), kCap), 'Industry + Keyword');
    add(camelCase(kCap, pick(indWords)), 'Keyword + Industry');

    // Strategy 5 – Vowel-removed keyword + suffix (abbreviation style)
    const stripped = capitalize(removeVowels(kw));
    if (stripped.length >= 2) {
      add(camelCase(stripped, pick(suffixes)), 'Modified');
      add(camelCase(stripped, 'io'),           'Modified');
      add(camelCase(stripped, 'ly'),           'Modified');
    }

    // Strategy 6 – Keyword + "ly" / "ify" style
    add(kCap + 'ly',  'Suffix Style');
    add(kCap + 'ify', 'Suffix Style');

    // Strategy 8 – Prefix + Industry Word
    add(camelCase(pick(prefixes), pick(indWords)), 'Prefix + Industry');
    add(camelCase(pick(prefixes), pick(indWords)), 'Prefix + Industry');
  }

  // Strategy 3 – Compound: keyword pairs
  if (clean.length >= 2) {
    for (let i = 0; i < clean.length - 1; i++) {
      for (let j = i + 1; j < clean.length; j++) {
        add(camelCase(capitalize(clean[i]), capitalize(clean[j])), 'Compound');
        add(camelCase(capitalize(clean[j]), capitalize(clean[i])), 'Compound');
      }
    }
  }

  // Strategy 7 – Double keyword (same keyword repeated, modified)
  for (const kw of clean) {
    const kCap = capitalize(kw);
    add(camelCase(kCap, kCap.slice(0, 3)), 'Double Blend');
  }

  // Strategy 9 – Portmanteau of two keywords
  if (clean.length >= 2) {
    for (let i = 0; i < clean.length - 1; i++) {
      add(portmanteau(clean[i], clean[i + 1]), 'Portmanteau');
      add(portmanteau(clean[i + 1], clean[i]), 'Portmanteau');
    }
  }

  // Strategy 10 – Keyword reversed + suffix
  for (const kw of clean) {
    const rev = capitalize(kw.split('').reverse().join(''));
    if (rev.length >= 3) {
      add(camelCase(rev, pick(suffixes)), 'Reversed');
    }
  }

  // Fallback: fill remaining slots with prefix + random industry combos
  while (candidates.length < 10) {
    add(camelCase(pick(prefixes), pick(indWords)), 'Prefix + Industry');
    // Guard against infinite loop if all combos are exhausted
    if (candidates.length >= seen.size) break;
  }

  return candidates.slice(0, 10);
}

// ──────────────────────────────────────────────
//  DOM layer
// ──────────────────────────────────────────────

const MAX_KEYWORDS = 3;
const TLD_BADGES = ['.com', '.io', '.co'];

const keywordContainer = document.getElementById('keyword-inputs') as HTMLDivElement;
const addKeywordBtn    = document.getElementById('add-keyword-btn') as HTMLButtonElement;
const industrySelect   = document.getElementById('industry-select') as HTMLSelectElement;
const generateBtn      = document.getElementById('generate-btn') as HTMLButtonElement;
const regenerateBtn    = document.getElementById('regenerate-btn') as HTMLButtonElement;
const errorMsg         = document.getElementById('error-msg') as HTMLParagraphElement;
const resultsSection   = document.getElementById('results-section') as HTMLDivElement;
const resultsGrid      = document.getElementById('results-grid') as HTMLDivElement;
const resultCount      = document.getElementById('result-count') as HTMLSpanElement;

// ── Keyword input management ──────────────────

function getKeywordRows(): HTMLDivElement[] {
  return Array.from(keywordContainer.querySelectorAll('.keyword-row'));
}

function updateAddButton(): void {
  const count = getKeywordRows().length;
  addKeywordBtn.style.display = count >= MAX_KEYWORDS ? 'none' : '';
}

function createKeywordRow(): HTMLDivElement {
  const row = document.createElement('div');
  row.className = 'flex items-center gap-2 keyword-row';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'e.g. connect, spark, nova';
  input.maxLength = 30;
  input.className =
    'keyword-input flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm ' +
    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-slate-50';

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.title = 'Remove keyword';
  removeBtn.className =
    'text-slate-400 hover:text-red-500 transition-colors flex-shrink-0 p-1 rounded';
  removeBtn.innerHTML = `
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
    </svg>`;
  removeBtn.addEventListener('click', () => {
    row.remove();
    updateAddButton();
  });

  row.appendChild(input);
  row.appendChild(removeBtn);
  return row;
}

addKeywordBtn.addEventListener('click', () => {
  if (getKeywordRows().length >= MAX_KEYWORDS) return;
  keywordContainer.appendChild(createKeywordRow());
  updateAddButton();
});

// ── Card rendering ────────────────────────────

const PATTERN_COLORS: Record<string, string> = {
  'Prefix + Keyword':   'bg-indigo-100 text-indigo-700',
  'Keyword + Suffix':   'bg-purple-100 text-purple-700',
  'Compound':           'bg-emerald-100 text-emerald-700',
  'Modified':           'bg-amber-100 text-amber-700',
  'Industry + Keyword': 'bg-sky-100 text-sky-700',
  'Keyword + Industry': 'bg-cyan-100 text-cyan-700',
  'Prefix + Industry':  'bg-rose-100 text-rose-700',
  'Portmanteau':        'bg-fuchsia-100 text-fuchsia-700',
  'Reversed':           'bg-orange-100 text-orange-700',
  'Suffix Style':       'bg-teal-100 text-teal-700',
  'Double Blend':       'bg-lime-100 text-lime-700',
};

function patternColorClass(pattern: string): string {
  return PATTERN_COLORS[pattern] ?? 'bg-slate-100 text-slate-600';
}

function createNameCard(item: GeneratedName, index: number): HTMLDivElement {
  const card = document.createElement('div');
  card.className =
    'name-card card-hover bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 shadow-sm';
  card.style.animationDelay = `${index * 40}ms`;

  // Pattern badge
  const badge = document.createElement('span');
  badge.className =
    `pattern-badge inline-block px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider w-fit ${patternColorClass(item.pattern)}`;
  badge.textContent = item.pattern;

  // Name display
  const nameEl = document.createElement('p');
  nameEl.className = 'text-xl font-extrabold text-slate-800 break-all leading-tight';
  nameEl.textContent = item.name;

  // TLD badges
  const tldsEl = document.createElement('div');
  tldsEl.className = 'flex flex-wrap gap-1';
  TLD_BADGES.forEach(tld => {
    const t = document.createElement('span');
    t.className =
      'tld-badge px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-mono border border-slate-200';
    t.textContent = item.name.toLowerCase() + tld;
    tldsEl.appendChild(t);
  });

  // Copy button
  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className =
    'mt-auto flex items-center justify-center gap-1.5 w-full bg-indigo-50 hover:bg-indigo-100 ' +
    'text-indigo-700 font-semibold text-sm py-2 rounded-lg transition-colors border border-indigo-100';
  copyBtn.innerHTML = `
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
    </svg>
    Copy`;

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(item.name);
      copyBtn.innerHTML = `
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        Copied!`;
      copyBtn.classList.replace('bg-indigo-50', 'bg-green-50');
      copyBtn.classList.replace('hover:bg-indigo-100', 'hover:bg-green-100');
      copyBtn.classList.replace('text-indigo-700', 'text-green-700');
      copyBtn.classList.replace('border-indigo-100', 'border-green-200');
      setTimeout(() => {
        copyBtn.innerHTML = `
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
          Copy`;
        copyBtn.classList.replace('bg-green-50', 'bg-indigo-50');
        copyBtn.classList.replace('hover:bg-green-100', 'hover:bg-indigo-100');
        copyBtn.classList.replace('text-green-700', 'text-indigo-700');
        copyBtn.classList.replace('border-green-200', 'border-indigo-100');
      }, 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = item.name;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  });

  card.appendChild(badge);
  card.appendChild(nameEl);
  card.appendChild(tldsEl);
  card.appendChild(copyBtn);
  return card;
}

// ── Render results ────────────────────────────

function renderResults(names: GeneratedName[]): void {
  resultsGrid.innerHTML = '';
  names.forEach((item, i) => {
    resultsGrid.appendChild(createNameCard(item, i));
  });
  resultCount.textContent = `(${names.length} names)`;
  resultsSection.classList.remove('hidden');
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Validation ────────────────────────────────

function showError(msg: string): void {
  errorMsg.textContent = msg;
  errorMsg.classList.remove('hidden');
}

function clearError(): void {
  errorMsg.textContent = '';
  errorMsg.classList.add('hidden');
}

function getKeywords(): string[] {
  return Array.from(keywordContainer.querySelectorAll<HTMLInputElement>('.keyword-input'))
    .map(el => el.value.trim())
    .filter(Boolean);
}

// ── Generate handler ──────────────────────────

let lastKeywords: string[] = [];
let lastIndustry = '';

function handleGenerate(): void {
  clearError();

  const keywords = getKeywords();
  const industry = industrySelect.value;

  if (keywords.length === 0) {
    showError('Please enter at least one keyword to generate names.');
    return;
  }
  if (!industry) {
    showError('Please select an industry.');
    return;
  }

  lastKeywords = keywords;
  lastIndustry = industry;

  const names = generateNames(keywords, industry);
  renderResults(names);
  regenerateBtn.disabled = false;
}

generateBtn.addEventListener('click', handleGenerate);

regenerateBtn.addEventListener('click', () => {
  if (lastKeywords.length === 0 || !lastIndustry) return;
  clearError();
  const names = generateNames(lastKeywords, lastIndustry);
  renderResults(names);
});

// Allow Enter key in keyword inputs to trigger generation
keywordContainer.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') handleGenerate();
});
