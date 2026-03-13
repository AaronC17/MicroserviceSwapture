// ─── Types ────────────────────────────────────────────────────────────────────

interface BMIResult {
  bmi: number;
  category: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obese';
  color: string; // CSS color
  healthyMin: number;    // kg
  healthyMax: number;    // kg
  healthyMinLbs: number;
  healthyMaxLbs: number;
}

type UnitSystem = 'metric' | 'imperial';

// ─── Unit conversions ─────────────────────────────────────────────────────────

function lbsToKg(lbs: number): number {
  return lbs / 2.20462;
}

function kgToLbs(kg: number): number {
  return kg * 2.20462;
}

function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet        = Math.floor(totalInches / 12);
  const inches      = Math.round(totalInches % 12);
  return { feet, inches };
}

// ─── Core calculation ─────────────────────────────────────────────────────────

function calculateBMI(weightKg: number, heightCm: number): BMIResult {
  const heightM = heightCm / 100;
  const bmi     = weightKg / (heightM * heightM);

  const healthyMin    = 18.5 * heightM * heightM;
  const healthyMax    = 24.9 * heightM * heightM;
  const healthyMinLbs = kgToLbs(healthyMin);
  const healthyMaxLbs = kgToLbs(healthyMax);

  let category: BMIResult['category'];
  let color: string;

  if (bmi < 18.5) {
    category = 'Underweight';
    color    = '#3b82f6'; // blue-500
  } else if (bmi < 25) {
    category = 'Normal weight';
    color    = '#22c55e'; // green-500
  } else if (bmi < 30) {
    category = 'Overweight';
    color    = '#eab308'; // yellow-500
  } else {
    category = 'Obese';
    color    = '#ef4444'; // red-500
  }

  return { bmi, category, color, healthyMin, healthyMax, healthyMinLbs, healthyMaxLbs };
}

// ─── Scale bar helper ─────────────────────────────────────────────────────────

/** Map BMI value to a 0–100 percentage across a scale of 15–40. */
function bmiToScalePercent(bmi: number): number {
  const scaleMin = 15;
  const scaleMax = 40;
  const clamped  = Math.min(scaleMax, Math.max(scaleMin, bmi));
  return ((clamped - scaleMin) / (scaleMax - scaleMin)) * 100;
}

// ─── DOM helpers ──────────────────────────────────────────────────────────────

function getElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id) as T | null;
  if (!el) throw new Error(`Element #${id} not found`);
  return el;
}

function showError(message: string): void {
  const el = getElement<HTMLParagraphElement>('error-msg');
  el.textContent = message;
  el.classList.remove('hidden');
}

function clearError(): void {
  const el = getElement<HTMLParagraphElement>('error-msg');
  el.textContent = '';
  el.classList.add('hidden');
}

// ─── Unit toggle ──────────────────────────────────────────────────────────────

let currentUnit: UnitSystem = 'metric';

function setUnit(unit: UnitSystem): void {
  currentUnit = unit;

  const metricInputs   = getElement<HTMLDivElement>('metric-inputs');
  const imperialInputs = getElement<HTMLDivElement>('imperial-inputs');
  const btnMetric      = getElement<HTMLButtonElement>('btn-metric');
  const btnImperial    = getElement<HTMLButtonElement>('btn-imperial');

  if (unit === 'metric') {
    metricInputs.classList.remove('hidden');
    imperialInputs.classList.add('hidden');
    btnMetric.classList.replace('tab-inactive', 'tab-active');
    btnImperial.classList.replace('tab-active', 'tab-inactive');
  } else {
    imperialInputs.classList.remove('hidden');
    metricInputs.classList.add('hidden');
    btnImperial.classList.replace('tab-inactive', 'tab-active');
    btnMetric.classList.replace('tab-active', 'tab-inactive');
  }

  // Hide stale results and errors when switching unit systems
  getElement<HTMLDivElement>('result-section').classList.add('hidden');
  clearError();
}

// ─── Display result ───────────────────────────────────────────────────────────

function displayResult(result: BMIResult): void {
  const section = getElement<HTMLDivElement>('result-section');
  const valueEl = getElement<HTMLSpanElement>('bmi-value');
  const box     = getElement<HTMLDivElement>('bmi-value-box');
  const catEl   = getElement<HTMLParagraphElement>('bmi-category');
  const rangeEl = getElement<HTMLParagraphElement>('bmi-healthy-range');
  const marker  = getElement<HTMLDivElement>('bmi-marker');

  valueEl.textContent       = result.bmi.toFixed(1);
  box.style.backgroundColor = result.color;
  catEl.textContent         = result.category;
  catEl.style.color         = result.color;

  if (currentUnit === 'metric') {
    rangeEl.textContent =
      `Healthy range for your height: ${result.healthyMin.toFixed(1)} – ${result.healthyMax.toFixed(1)} kg`;
  } else {
    rangeEl.textContent =
      `Healthy range for your height: ${result.healthyMinLbs.toFixed(1)} – ${result.healthyMaxLbs.toFixed(1)} lbs`;
  }

  // Position the scale-bar marker, offset by half its own width (8 px)
  const pct         = bmiToScalePercent(result.bmi);
  marker.style.left = `calc(${pct}% - 8px)`;

  // Re-trigger CSS animation
  section.classList.remove('hidden');
  section.classList.remove('result-animate');
  void (section as HTMLElement & { offsetWidth: number }).offsetWidth; // force reflow
  section.classList.add('result-animate');
}

// ─── Main handler ─────────────────────────────────────────────────────────────

function handleCalculate(): void {
  clearError();

  let weightKg: number;
  let heightCm: number;

  if (currentUnit === 'metric') {
    weightKg = parseFloat((getElement<HTMLInputElement>('weight-kg')).value);
    heightCm = parseFloat((getElement<HTMLInputElement>('height-cm')).value);

    if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
      showError('Please enter valid weight and height values.');
      return;
    }
  } else {
    const lbs    = parseFloat((getElement<HTMLInputElement>('weight-lbs')).value);
    const feet   = parseFloat((getElement<HTMLInputElement>('height-ft')).value) || 0;
    const inches = parseFloat((getElement<HTMLInputElement>('height-in')).value) || 0;

    if (!lbs || lbs <= 0 || (feet === 0 && inches === 0)) {
      showError('Please enter valid weight and height values.');
      return;
    }

    weightKg = lbsToKg(lbs);
    heightCm = feetInchesToCm(feet, inches);
  }

  if (heightCm < 50 || heightCm > 280) {
    showError('Please enter a realistic height (50–280 cm / ~1\'8″–9\'2″).');
    return;
  }
  if (weightKg < 10 || weightKg > 500) {
    showError('Please enter a realistic weight.');
    return;
  }

  const result = calculateBMI(weightKg, heightCm);
  displayResult(result);
}

// ─── Event listeners ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  getElement<HTMLButtonElement>('calculate-btn').addEventListener('click', handleCalculate);

  // Expose unit-toggle and calculate functions for inline HTML onclick attributes
  (window as Window & typeof globalThis & {
    setUnit: typeof setUnit;
    handleCalculate: typeof handleCalculate;
  }).setUnit           = setUnit;
  (window as Window & typeof globalThis & {
    setUnit: typeof setUnit;
    handleCalculate: typeof handleCalculate;
  }).handleCalculate   = handleCalculate;

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleCalculate();
  });

  getElement<HTMLSpanElement>('footer-year').textContent = String(new Date().getFullYear());
});

// ─── Exports (for testing / bundler consumption) ──────────────────────────────

export {
  calculateBMI,
  bmiToScalePercent,
  lbsToKg,
  kgToLbs,
  feetInchesToCm,
  cmToFeetInches,
  type BMIResult,
  type UnitSystem,
};
