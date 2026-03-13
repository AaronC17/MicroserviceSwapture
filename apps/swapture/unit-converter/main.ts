/**
 * Unit Converter – main.ts
 * Handles all conversion logic and DOM interactions for the SwapTure Unit Converter.
 */

// ---- TYPES ----

type Category = 'length' | 'weight' | 'temperature' | 'volume' | 'speed';

interface Unit {
  key: string;
  label: string;
  /** Convert a value expressed in this unit to the category base unit. */
  toBase: (value: number) => number;
  /** Convert a value expressed in the category base unit to this unit. */
  fromBase: (value: number) => number;
}

interface CategoryDefinition {
  label: string;
  units: Unit[];
}

// ---- UNIT DEFINITIONS ----

/** Base unit: meters (m) */
const LENGTH_UNITS: Unit[] = [
  { key: 'meters',         label: 'Meters (m)',            toBase: v => v,             fromBase: v => v },
  { key: 'kilometers',     label: 'Kilometers (km)',        toBase: v => v * 1000,      fromBase: v => v / 1000 },
  { key: 'centimeters',    label: 'Centimeters (cm)',       toBase: v => v / 100,       fromBase: v => v * 100 },
  { key: 'millimeters',    label: 'Millimeters (mm)',       toBase: v => v / 1000,      fromBase: v => v * 1000 },
  { key: 'miles',          label: 'Miles (mi)',             toBase: v => v * 1609.344,  fromBase: v => v / 1609.344 },
  { key: 'yards',          label: 'Yards (yd)',             toBase: v => v * 0.9144,    fromBase: v => v / 0.9144 },
  { key: 'feet',           label: 'Feet (ft)',              toBase: v => v * 0.3048,    fromBase: v => v / 0.3048 },
  { key: 'inches',         label: 'Inches (in)',            toBase: v => v * 0.0254,    fromBase: v => v / 0.0254 },
  { key: 'nautical_miles', label: 'Nautical Miles (nmi)',   toBase: v => v * 1852,      fromBase: v => v / 1852 },
];

/** Base unit: kilograms (kg) */
const WEIGHT_UNITS: Unit[] = [
  { key: 'kilograms',   label: 'Kilograms (kg)',     toBase: v => v,             fromBase: v => v },
  { key: 'grams',       label: 'Grams (g)',           toBase: v => v / 1000,      fromBase: v => v * 1000 },
  { key: 'milligrams',  label: 'Milligrams (mg)',     toBase: v => v / 1e6,       fromBase: v => v * 1e6 },
  { key: 'pounds',      label: 'Pounds (lb)',         toBase: v => v * 0.453592,  fromBase: v => v / 0.453592 },
  { key: 'ounces',      label: 'Ounces (oz)',         toBase: v => v * 0.0283495, fromBase: v => v / 0.0283495 },
  { key: 'metric_tons', label: 'Metric Tons (t)',     toBase: v => v * 1000,      fromBase: v => v / 1000 },
  { key: 'stones',      label: 'Stones (st)',         toBase: v => v * 6.35029,   fromBase: v => v / 6.35029 },
];

/**
 * Base unit: Celsius (°C).
 * Temperature is non-linear so toBase/fromBase encode the full formula directly.
 */
const TEMPERATURE_UNITS: Unit[] = [
  {
    key: 'celsius',
    label: 'Celsius (°C)',
    toBase:   v => v,
    fromBase: v => v,
  },
  {
    key: 'fahrenheit',
    label: 'Fahrenheit (°F)',
    toBase:   v => (v - 32) * 5 / 9,
    fromBase: v => v * 9 / 5 + 32,
  },
  {
    key: 'kelvin',
    label: 'Kelvin (K)',
    toBase:   v => v - 273.15,
    fromBase: v => v + 273.15,
  },
];

/** Base unit: liters (L) */
const VOLUME_UNITS: Unit[] = [
  { key: 'liters',        label: 'Liters (L)',           toBase: v => v,             fromBase: v => v },
  { key: 'milliliters',   label: 'Milliliters (mL)',      toBase: v => v / 1000,      fromBase: v => v * 1000 },
  { key: 'cubic_meters',  label: 'Cubic Meters (m³)',     toBase: v => v * 1000,      fromBase: v => v / 1000 },
  { key: 'gallons_us',    label: 'Gallons US (gal)',      toBase: v => v * 3.78541,   fromBase: v => v / 3.78541 },
  { key: 'quarts',        label: 'Quarts (qt)',           toBase: v => v * 0.946353,  fromBase: v => v / 0.946353 },
  { key: 'pints',         label: 'Pints (pt)',            toBase: v => v * 0.473176,  fromBase: v => v / 0.473176 },
  { key: 'cups',          label: 'Cups (c)',              toBase: v => v * 0.236588,  fromBase: v => v / 0.236588 },
  { key: 'fluid_ounces',  label: 'Fluid Ounces (fl oz)',  toBase: v => v * 0.0295735, fromBase: v => v / 0.0295735 },
];

/** Base unit: meters per second (m/s) */
const SPEED_UNITS: Unit[] = [
  { key: 'ms',    label: 'Meters/sec (m/s)',      toBase: v => v,            fromBase: v => v },
  { key: 'kmh',   label: 'Kilometers/hr (km/h)',  toBase: v => v / 3.6,      fromBase: v => v * 3.6 },
  { key: 'mph',   label: 'Miles/hr (mph)',         toBase: v => v * 0.44704,  fromBase: v => v / 0.44704 },
  { key: 'knots', label: 'Knots (kn)',             toBase: v => v * 0.514444, fromBase: v => v / 0.514444 },
  { key: 'fts',   label: 'Feet/sec (ft/s)',        toBase: v => v * 0.3048,   fromBase: v => v / 0.3048 },
];

const CATEGORIES: Record<Category, CategoryDefinition> = {
  length:      { label: 'Length Conversion',      units: LENGTH_UNITS },
  weight:      { label: 'Weight Conversion',       units: WEIGHT_UNITS },
  temperature: { label: 'Temperature Conversion',  units: TEMPERATURE_UNITS },
  volume:      { label: 'Volume Conversion',       units: VOLUME_UNITS },
  speed:       { label: 'Speed Conversion',        units: SPEED_UNITS },
};

// ---- CONVERSION FORMULAS (for formula hint display) ----

const FORMULA_HINTS: Partial<Record<Category, Record<string, string>>> = {
  length: {
    meters_feet:         '1 m = 3.28084 ft',
    meters_inches:       '1 m = 39.3701 in',
    meters_kilometers:   '1 m = 0.001 km',
    kilometers_miles:    '1 km ≈ 0.621371 mi',
    miles_kilometers:    '1 mi = 1.60934 km',
    feet_meters:         '1 ft = 0.3048 m',
    inches_meters:       '1 in = 0.0254 m',
    feet_inches:         '1 ft = 12 in',
    inches_feet:         '1 in = 0.0833 ft',
  },
  temperature: {
    celsius_fahrenheit:  '°F = (°C × 9/5) + 32',
    fahrenheit_celsius:  '°C = (°F − 32) × 5/9',
    celsius_kelvin:      'K = °C + 273.15',
    kelvin_celsius:      '°C = K − 273.15',
    fahrenheit_kelvin:   'K = (°F − 32) × 5/9 + 273.15',
    kelvin_fahrenheit:   '°F = (K − 273.15) × 9/5 + 32',
  },
  weight: {
    kilograms_pounds:    '1 kg ≈ 2.20462 lb',
    pounds_kilograms:    '1 lb ≈ 0.453592 kg',
    kilograms_grams:     '1 kg = 1000 g',
    grams_kilograms:     '1 g = 0.001 kg',
    ounces_grams:        '1 oz ≈ 28.3495 g',
    grams_ounces:        '1 g ≈ 0.035274 oz',
  },
  volume: {
    liters_gallons_us:   '1 L ≈ 0.264172 gal',
    gallons_us_liters:   '1 gal ≈ 3.78541 L',
    liters_milliliters:  '1 L = 1000 mL',
    milliliters_liters:  '1 mL = 0.001 L',
  },
  speed: {
    kmh_mph:    '1 km/h ≈ 0.621371 mph',
    mph_kmh:    '1 mph ≈ 1.60934 km/h',
    ms_kmh:     '1 m/s = 3.6 km/h',
    kmh_ms:     '1 km/h ≈ 0.27778 m/s',
    knots_kmh:  '1 kn ≈ 1.852 km/h',
    kmh_knots:  '1 km/h ≈ 0.539957 kn',
  },
};

// ---- PURE CONVERSION FUNCTION ----

/**
 * Convert a numeric value from one unit to another within the same category.
 * Uses the intermediate base unit strategy: value → base → target.
 */
export function convert(value: number, fromUnit: Unit, toUnit: Unit): number {
  const baseValue = fromUnit.toBase(value);
  return toUnit.fromBase(baseValue);
}

// ---- FORMATTING ----

/**
 * Format a conversion result for display.
 * - Very large (≥1e12) or very small (<1e-6) non-zero values use scientific notation.
 * - Results with many significant digits are trimmed to avoid floating-point noise.
 */
export function formatResult(value: number): string {
  if (!isFinite(value)) return '—';
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 1e12 || (abs < 1e-6 && abs > 0)) {
    return value.toExponential(6);
  }
  if (abs >= 1000) {
    return parseFloat(value.toPrecision(10)).toString();
  }
  return parseFloat(value.toFixed(8)).toString();
}

function getFormulaHint(fromKey: string, toKey: string, category: Category): string {
  const hints = FORMULA_HINTS[category];
  if (!hints) return '';
  return hints[`${fromKey}_${toKey}`] ?? '';
}

// ---- DOM HELPERS ----

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} not found`);
  return el as T;
}

function populateSelect(select: HTMLSelectElement, units: Unit[], selectedIndex = 0): void {
  select.innerHTML = '';
  units.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.key;
    opt.textContent = u.label;
    select.appendChild(opt);
  });
  select.selectedIndex = selectedIndex;
}

// ---- CONTROLLER ----

class UnitConverterApp {
  private currentCategory: Category = 'length';
  private tableVisible = false;

  private fromSelect  = getEl<HTMLSelectElement>('from-select');
  private toSelect    = getEl<HTMLSelectElement>('to-select');
  private fromInput   = getEl<HTMLInputElement>('from-input');
  private toOutput    = getEl<HTMLInputElement>('to-output');
  private swapBtn     = getEl<HTMLButtonElement>('swap-btn');
  private copyBtn     = getEl<HTMLButtonElement>('copy-btn');
  private categoryLabel  = getEl<HTMLParagraphElement>('category-label');
  private formulaHint    = getEl<HTMLParagraphElement>('formula-hint');
  private toggleTableBtn = getEl<HTMLButtonElement>('toggle-table-btn');
  private tableSection   = getEl<HTMLDivElement>('table-section');
  private tableHeaderRow = getEl<HTMLTableRowElement>('table-header-row');
  private tableBody      = getEl<HTMLTableSectionElement>('table-body');
  private tabBtns = document.querySelectorAll<HTMLButtonElement>('.tab-btn');

  constructor() {
    this.bindEvents();
    this.switchCategory('length');

    const footerYear = document.getElementById('footer-year');
    if (footerYear) footerYear.textContent = String(new Date().getFullYear());
  }

  private bindEvents(): void {
    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => this.switchCategory(btn.dataset.category as Category));
    });

    this.fromInput.addEventListener('input',   () => this.runConversion());
    this.fromSelect.addEventListener('change', () => this.runConversion());
    this.toSelect.addEventListener('change',   () => this.runConversion());

    this.swapBtn.addEventListener('click', () => this.swapUnits());
    this.copyBtn.addEventListener('click', () => this.copyResult());

    this.toggleTableBtn.addEventListener('click', () => this.toggleTable());
  }

  private switchCategory(category: Category): void {
    this.currentCategory = category;
    const { label, units } = CATEGORIES[category];
    this.categoryLabel.textContent = label;

    populateSelect(this.fromSelect, units, 0);
    populateSelect(this.toSelect,   units, Math.min(1, units.length - 1));

    this.fromInput.value = '';
    this.toOutput.value  = '';
    this.formulaHint.textContent = '';

    this.updateTabHighlight(category);
    if (this.tableVisible) this.buildTable();
  }

  private updateTabHighlight(active: Category): void {
    this.tabBtns.forEach(btn => {
      const isActive = btn.dataset.category === active;
      btn.classList.toggle('border-purple-800', isActive);
      btn.classList.toggle('text-purple-800',   isActive);
      btn.classList.toggle('bg-white',          isActive);
      btn.classList.toggle('border-transparent', !isActive);
      btn.classList.toggle('text-zinc-500',    !isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  private runConversion(): void {
    const { units } = CATEGORIES[this.currentCategory];
    const fromUnit = units.find(u => u.key === this.fromSelect.value);
    const toUnit   = units.find(u => u.key === this.toSelect.value);
    const raw = parseFloat(this.fromInput.value);

    if (!fromUnit || !toUnit || isNaN(raw)) {
      this.toOutput.value = '';
      this.formulaHint.textContent = '';
      return;
    }

    const result = convert(raw, fromUnit, toUnit);
    this.toOutput.value = formatResult(result);
    this.formulaHint.textContent = getFormulaHint(fromUnit.key, toUnit.key, this.currentCategory);

    if (this.tableVisible) this.buildTable();
  }

  private swapUnits(): void {
    const prevFrom = this.fromSelect.value;
    const prevTo   = this.toSelect.value;
    const prevResult = this.toOutput.value;

    this.fromSelect.value = prevTo;
    this.toSelect.value   = prevFrom;

    if (prevResult !== '') {
      this.fromInput.value = prevResult;
    }
    this.runConversion();
  }

  private copyResult(): void {
    const text = this.toOutput.value;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.copyBtn.title = 'Copied!';
      setTimeout(() => { this.copyBtn.title = 'Copy result'; }, 1500);
    });
  }

  private toggleTable(): void {
    this.tableVisible = !this.tableVisible;
    if (this.tableVisible) {
      this.tableSection.classList.remove('hidden');
      this.toggleTableBtn.textContent = 'Hide conversion table';
      this.buildTable();
    } else {
      this.tableSection.classList.add('hidden');
      this.toggleTableBtn.textContent = 'Show conversion table for all units';
    }
  }

  private buildTable(): void {
    const { units } = CATEGORIES[this.currentCategory];
    const raw = parseFloat(this.fromInput.value);
    const inputValue = isNaN(raw) ? 1 : raw;
    const fromUnit = units.find(u => u.key === this.fromSelect.value) ?? units[0];

    // Header
    this.tableHeaderRow.innerHTML = '';
    const thFrom = document.createElement('th');
    thFrom.textContent = fromUnit.label;
    thFrom.className = 'px-4 py-2 text-left font-semibold text-xs uppercase tracking-wide';
    const thEquals = document.createElement('th');
    thEquals.textContent = '=';
    thEquals.className = 'px-2 py-2 text-center text-xs text-indigo-400 font-bold';
    const thTo = document.createElement('th');
    thTo.textContent = 'Converted Value';
    thTo.className = 'px-4 py-2 text-left font-semibold text-xs uppercase tracking-wide';
    this.tableHeaderRow.append(thFrom, thEquals, thTo);

    // Body
    this.tableBody.innerHTML = '';
    units.forEach((u, i) => {
      const result = convert(inputValue, fromUnit, u);
      const tr = document.createElement('tr');
      tr.className = i % 2 === 0 ? 'bg-white' : 'bg-slate-50';

      const tdInput = document.createElement('td');
      tdInput.textContent = `${inputValue} ${fromUnit.label}`;
      tdInput.className = 'px-4 py-2 text-slate-500 text-sm';

      const tdEq = document.createElement('td');
      tdEq.textContent = '=';
      tdEq.className = 'px-2 py-2 text-center text-slate-300 font-bold';

      const tdResult = document.createElement('td');
      tdResult.textContent = `${formatResult(result)} ${u.label}`;
      tdResult.className = 'px-4 py-2 font-semibold text-slate-800 text-sm';

      tr.append(tdInput, tdEq, tdResult);
      this.tableBody.appendChild(tr);
    });
  }
}

// ---- INIT ----
// Runs after the DOM is ready (this script is loaded as a module with defer semantics)
document.addEventListener('DOMContentLoaded', () => {
  new UnitConverterApp();
});
