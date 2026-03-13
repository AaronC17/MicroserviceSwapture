// Calculator 1: What is X% of Y?
function whatIsPercentOf(percent: number, total: number): number {
  return (percent / 100) * total;
}

// Calculator 2: X is what % of Y?
function isWhatPercent(part: number, total: number): number {
  return (part / total) * 100;
}

// Calculator 3: Percentage change
function percentageChange(
  original: number,
  newValue: number
): { change: number; isIncrease: boolean } {
  const change = ((newValue - original) / Math.abs(original)) * 100;
  return { change, isIncrease: change >= 0 };
}

function formatResult(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}

// ── Card 1 ───────────────────────────────────────────────────────────────────

const c1Percent = document.getElementById("c1-percent") as HTMLInputElement;
const c1Total = document.getElementById("c1-total") as HTMLInputElement;
const c1Btn = document.getElementById("c1-btn") as HTMLButtonElement;
const c1ResultBox = document.getElementById("c1-result") as HTMLElement;
const c1ResultText = document.getElementById("c1-result-text") as HTMLElement;

function calculateCard1(): void {
  const percent = parseFloat(c1Percent.value);
  const total = parseFloat(c1Total.value);

  if (isNaN(percent) || isNaN(total)) {
    c1ResultBox.classList.add("hidden");
    return;
  }

  const result = whatIsPercentOf(percent, total);
  c1ResultText.textContent = `${formatResult(percent)}% of ${formatResult(total)} = ${formatResult(result)}`;
  c1ResultBox.classList.remove("hidden");
}

c1Btn.addEventListener("click", calculateCard1);
c1Percent.addEventListener("input", calculateCard1);
c1Total.addEventListener("input", calculateCard1);

// ── Card 2 ───────────────────────────────────────────────────────────────────

const c2Part = document.getElementById("c2-part") as HTMLInputElement;
const c2Total = document.getElementById("c2-total") as HTMLInputElement;
const c2Btn = document.getElementById("c2-btn") as HTMLButtonElement;
const c2ResultBox = document.getElementById("c2-result") as HTMLElement;
const c2ResultText = document.getElementById("c2-result-text") as HTMLElement;

function calculateCard2(): void {
  const part = parseFloat(c2Part.value);
  const total = parseFloat(c2Total.value);

  if (isNaN(part) || isNaN(total)) {
    c2ResultBox.classList.add("hidden");
    return;
  }

  if (total === 0) {
    c2ResultText.textContent = "Cannot divide by zero";
    c2ResultBox.classList.remove("hidden");
    return;
  }

  const result = isWhatPercent(part, total);
  c2ResultText.textContent = `${formatResult(part)} is ${formatResult(result)}% of ${formatResult(total)}`;
  c2ResultBox.classList.remove("hidden");
}

c2Btn.addEventListener("click", calculateCard2);
c2Part.addEventListener("input", calculateCard2);
c2Total.addEventListener("input", calculateCard2);

// ── Card 3 ───────────────────────────────────────────────────────────────────

const c3Original = document.getElementById("c3-original") as HTMLInputElement;
const c3New = document.getElementById("c3-new") as HTMLInputElement;
const c3Btn = document.getElementById("c3-btn") as HTMLButtonElement;
const c3ResultBox = document.getElementById("c3-result") as HTMLElement;
const c3ResultText = document.getElementById("c3-result-text") as HTMLElement;

function calculateCard3(): void {
  const original = parseFloat(c3Original.value);
  const newVal = parseFloat(c3New.value);

  if (isNaN(original) || isNaN(newVal)) {
    c3ResultBox.classList.add("hidden");
    return;
  }

  if (original === 0) {
    c3ResultText.textContent = "Original value cannot be zero";
    c3ResultText.className = "text-xl font-bold text-slate-500";
    c3ResultBox.className = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center";
    c3ResultBox.classList.remove("hidden");
    return;
  }

  const { change, isIncrease } = percentageChange(original, newVal);
  const arrow = isIncrease ? "↑" : "↓";
  const label = isIncrease ? "Increase" : "Decrease";

  c3ResultText.textContent = `${arrow} ${formatResult(Math.abs(change))}% ${label}`;
  c3ResultText.className = isIncrease
    ? "text-xl font-bold text-green-600"
    : "text-xl font-bold text-red-600";
  c3ResultBox.className = isIncrease
    ? "bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center"
    : "bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center";
  c3ResultBox.classList.remove("hidden");
}

c3Btn.addEventListener("click", calculateCard3);
c3Original.addEventListener("input", calculateCard3);
c3New.addEventListener("input", calculateCard3);
