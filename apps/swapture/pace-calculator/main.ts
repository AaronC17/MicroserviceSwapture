// Types
interface PaceResult {
  pacePerKm: string;   // "5:30" format
  pacePerMile: string; // "8:51" format
  speedKmh: number;
  speedMph: number;
  finishTimes: { distance: string; time: string }[];
}

const KM_PER_MILE = 1.60934;

const RACE_DISTANCES: { label: string; km: number }[] = [
  { label: "5K", km: 5 },
  { label: "10K", km: 10 },
  { label: "Half Marathon", km: 21.0975 },
  { label: "Marathon", km: 42.195 },
];

function timeToSeconds(hours: number, minutes: number, seconds: number): number {
  return hours * 3600 + minutes * 60 + seconds;
}

function formatTime(totalSeconds: number): string {
  const rounded = Math.round(totalSeconds);
  const h = Math.floor(rounded / 3600);
  const m = Math.floor((rounded % 3600) / 60);
  const s = rounded % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  if (h > 0) {
    return `${h}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

function formatPace(paceSeconds: number): string {
  const m = Math.floor(paceSeconds / 60);
  const s = Math.round(paceSeconds % 60);
  // Handle edge case where rounding pushes seconds to 60
  if (s === 60) {
    return `${m + 1}:00`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

function calculatePace(distanceKm: number, totalSeconds: number): PaceResult {
  const paceSecondsPerKm = totalSeconds / distanceKm;
  const distanceMiles = distanceKm / KM_PER_MILE;
  const paceSecondsPerMile = totalSeconds / distanceMiles;
  const speedKmh = distanceKm / (totalSeconds / 3600);
  const speedMph = speedKmh / KM_PER_MILE;

  const finishTimes = RACE_DISTANCES.map(({ label, km }) => ({
    distance: label,
    time: formatTime(paceSecondsPerKm * km),
  }));

  return {
    pacePerKm: formatPace(paceSecondsPerKm),
    pacePerMile: formatPace(paceSecondsPerMile),
    speedKmh: Math.round(speedKmh * 100) / 100,
    speedMph: Math.round(speedMph * 100) / 100,
    finishTimes,
  };
}

function showError(message: string): void {
  const el = document.querySelector<HTMLParagraphElement>("#error-msg");
  if (!el) return;
  el.textContent = message;
  el.classList.remove("hidden");
}

function hideError(): void {
  const el = document.querySelector<HTMLParagraphElement>("#error-msg");
  if (!el) return;
  el.classList.add("hidden");
  el.textContent = "";
}

function showResults(result: PaceResult): void {
  const resultsEl = document.querySelector<HTMLElement>("#results");
  if (!resultsEl) return;

  const setText = (id: string, value: string) => {
    const el = document.querySelector<HTMLElement>(id);
    if (el) el.textContent = value;
  };

  setText("#result-pace-km", result.pacePerKm);
  setText("#result-pace-mile", result.pacePerMile);
  setText("#result-speed-kmh", String(result.speedKmh));
  setText("#result-speed-mph", String(result.speedMph));

  const finishContainer = document.querySelector<HTMLElement>("#finish-times");
  if (finishContainer) {
    finishContainer.innerHTML = result.finishTimes
      .map(
        ({ distance, time }, i) => `
        <div class="flex items-center justify-between px-4 py-3 ${
          i % 2 === 0 ? "bg-white" : "bg-slate-50"
        }">
          <span class="text-sm font-medium text-slate-700">${distance}</span>
          <span class="text-sm font-bold text-slate-900 tabular-nums">${time}</span>
        </div>`
      )
      .join("");
  }

  resultsEl.classList.remove("hidden");
  resultsEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function getInputValue(id: string): number {
  const el = document.querySelector<HTMLInputElement>(id);
  const val = el ? parseFloat(el.value) : NaN;
  return isNaN(val) ? 0 : val;
}

function getSelectedUnit(): "km" | "miles" {
  const el = document.querySelector<HTMLInputElement>(
    'input[name="unit"]:checked'
  );
  return el?.value === "miles" ? "miles" : "km";
}

function handleCalculate(): void {
  hideError();

  const distance = getInputValue("#distance");
  const hours = getInputValue("#hours");
  const minutes = getInputValue("#minutes");
  const seconds = getInputValue("#seconds");
  const unit = getSelectedUnit();

  if (distance <= 0) {
    showError("Please enter a valid distance greater than zero.");
    return;
  }

  const totalSeconds = timeToSeconds(hours, minutes, seconds);

  if (totalSeconds <= 0) {
    showError("Please enter a valid time greater than zero.");
    return;
  }

  const distanceKm = unit === "miles" ? distance * KM_PER_MILE : distance;

  const result = calculatePace(distanceKm, totalSeconds);
  showResults(result);
}

function init(): void {
  const btn = document.querySelector<HTMLButtonElement>("#calculate-btn");
  btn?.addEventListener("click", handleCalculate);

  // Allow Enter key on any input to trigger calculation
  const inputs = document.querySelectorAll<HTMLInputElement>(
    "#distance, #hours, #minutes, #seconds"
  );
  inputs.forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleCalculate();
    });
  });

  // Set footer year (also handled inline in HTML as fallback)
  const yearEl = document.querySelector<HTMLElement>("#footer-year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", init);

export {};
