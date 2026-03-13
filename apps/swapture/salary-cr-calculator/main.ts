// Costa Rica Salary Calculator - 2024
// CCSS Obrero deduction: 10.67% of gross salary
// Income tax (Impuesto sobre la Renta) 2024 monthly brackets applied on (gross - CCSS):
//   Up to ₡929,000: 0%
//   ₡929,001 – ₡1,360,000: 10%
//   ₡1,360,001 – ₡2,383,000: 15%
//   ₡2,383,001 – ₡4,766,000: 20%
//   Over ₡4,766,000: 25%
// If employee has other jobs, the secondary employer withholds at a flat 25% on the full taxable amount.

interface TaxBracket {
  limit: number;
  rate: number;
}

interface SalaryResult {
  grossSalary: number;
  ccssDeduction: number;
  incomeTax: number;
  totalDeductions: number;
  netSalary: number;
  weekly: number;
  daily: number;
  hourly: number;
  effectiveTaxRate: number;
  bracket: string;
}

const CCSS_RATE = 0.1067;

const TAX_BRACKETS: TaxBracket[] = [
  { limit: 929_000, rate: 0 },
  { limit: 1_360_000, rate: 0.10 },
  { limit: 2_383_000, rate: 0.15 },
  { limit: 4_766_000, rate: 0.20 },
  { limit: Infinity, rate: 0.25 },
];

function calculateCCSS(grossSalary: number): number {
  return grossSalary * CCSS_RATE;
}

function calculateIncomeTax(taxableIncome: number, hasOtherJobs: boolean): number {
  if (taxableIncome <= 0) return 0;

  // Secondary employer withholds at a flat 25% on the entire taxable amount.
  if (hasOtherJobs) {
    return taxableIncome * 0.25;
  }

  let tax = 0;
  let previousLimit = 0;

  for (const bracket of TAX_BRACKETS) {
    if (taxableIncome <= previousLimit) break;

    const taxableInBracket = Math.min(taxableIncome, bracket.limit) - previousLimit;
    tax += taxableInBracket * bracket.rate;
    previousLimit = bracket.limit;
  }

  return tax;
}

function getBracketLabel(taxableIncome: number, hasOtherJobs: boolean): string {
  if (hasOtherJobs) return "25% (otros empleos)";
  if (taxableIncome <= 929_000) return "0% (exento)";
  if (taxableIncome <= 1_360_000) return "Hasta 10%";
  if (taxableIncome <= 2_383_000) return "Hasta 15%";
  if (taxableIncome <= 4_766_000) return "Hasta 20%";
  return "Hasta 25%";
}

function calculateSalary(grossSalary: number, hasOtherJobs: boolean): SalaryResult {
  const ccssDeduction = calculateCCSS(grossSalary);
  const taxableIncome = grossSalary - ccssDeduction;
  const incomeTax = calculateIncomeTax(taxableIncome, hasOtherJobs);
  const totalDeductions = ccssDeduction + incomeTax;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? (incomeTax / grossSalary) * 100 : 0;

  return {
    grossSalary,
    ccssDeduction,
    incomeTax,
    totalDeductions,
    netSalary,
    weekly: netSalary / 4.33,
    daily: netSalary / 30,
    // Assumes 8-hour workdays, 30 days/month = 240 hours/month (standard jornada ordinaria CR)
    hourly: netSalary / (30 * 8),
    effectiveTaxRate,
    bracket: getBracketLabel(taxableIncome, hasOtherJobs),
  };
}

function formatColones(amount: number): string {
  return "₡" + Math.round(amount).toLocaleString("es-CR");
}

function formatPercent(value: number): string {
  return value.toFixed(2) + "%";
}

// ── DOM setup ───────────────────────────────────────────────────────────────

function getElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} not found`);
  return el as T;
}

function setTextContent(id: string, value: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function updateResults(result: SalaryResult): void {
  setTextContent("result-ccss", formatColones(result.ccssDeduction));
  setTextContent("result-ccss-pct", `${(CCSS_RATE * 100).toFixed(2)}%`);
  setTextContent("result-total-deductions-left", formatColones(result.totalDeductions));

  setTextContent("result-income-tax", formatColones(result.incomeTax));
  setTextContent("result-bracket", result.bracket);
  setTextContent("result-effective-rate", formatPercent(result.effectiveTaxRate));

  setTextContent("result-gross", formatColones(result.grossSalary));
  setTextContent("result-total-deductions", formatColones(result.totalDeductions));
  setTextContent("result-net", formatColones(result.netSalary));
  setTextContent("result-weekly", formatColones(result.weekly));
  setTextContent("result-daily", formatColones(result.daily));
  setTextContent("result-hourly", formatColones(result.hourly));
}

function runCalculation(): void {
  const input = getElement<HTMLInputElement>("gross-salary");
  const toggle = getElement<HTMLInputElement>("other-jobs");
  const resultsSection = getElement<HTMLElement>("results");
  const errorEl = getElement<HTMLElement>("input-error");

  const raw = input.value.replace(/[^0-9.]/g, "");
  const grossSalary = parseFloat(raw);

  if (isNaN(grossSalary) || grossSalary < 0) {
    errorEl.classList.remove("hidden");
    resultsSection.classList.add("hidden");
    return;
  }

  errorEl.classList.add("hidden");

  const result = calculateSalary(grossSalary, toggle.checked);
  updateResults(result);
  resultsSection.classList.remove("hidden");
  resultsSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

document.addEventListener("DOMContentLoaded", () => {
  const calculateBtn = getElement<HTMLButtonElement>("calculate-btn");
  const grossInput = getElement<HTMLInputElement>("gross-salary");
  const otherJobsToggle = getElement<HTMLInputElement>("other-jobs");

  calculateBtn.addEventListener("click", runCalculation);

  grossInput.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Enter") runCalculation();
  });

  otherJobsToggle.addEventListener("change", () => {
    const resultsSection = document.getElementById("results");
    if (resultsSection && !resultsSection.classList.contains("hidden")) {
      runCalculation();
    }
  });
});
