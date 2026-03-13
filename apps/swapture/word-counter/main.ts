interface TextStats {
  words: number;
  charsWithSpaces: number;
  charsWithoutSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: string;
}

function analyzeText(text: string): TextStats {
  const words =
    text.trim() === ""
      ? []
      : text.trim().split(/\s+/).filter((w) => w.length > 0);

  const charsWithSpaces = text.length;
  const charsWithoutSpaces = text.replace(/\s/g, "").length;

  // Count sentence-ending punctuation followed by whitespace or end-of-string,
  // ignoring common decimal patterns (e.g. "3.14") and ellipses.
  const sentenceMatches = text.match(/[.!?]+(?=\s|$)/g);
  const sentences = sentenceMatches ? sentenceMatches.length : 0;

  // Split on one or more blank lines; keep only non-empty blocks.
  const paragraphs =
    text.trim() === ""
      ? 0
      : text
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter((p) => p.length > 0).length;

  const minutesRaw = words.length / 200;
  const readingTime =
    words.length === 0
      ? "—"
      : minutesRaw < 1
      ? "< 1 min read"
      : `${Math.ceil(minutesRaw)} min read`;

  return {
    words: words.length,
    charsWithSpaces,
    charsWithoutSpaces,
    sentences,
    paragraphs,
    readingTime,
  };
}

function animateStat(el: HTMLElement, newValue: string): void {
  el.classList.remove("scale-110");
  // Trigger reflow so the animation restarts each update.
  void el.offsetWidth;
  el.textContent = newValue;
  el.classList.add("scale-110");
  setTimeout(() => el.classList.remove("scale-110"), 150);
}

function updateStats(text: string): void {
  const stats = analyzeText(text);

  animateStat(wordsStat, stats.words.toLocaleString());
  animateStat(charsSpacesStat, stats.charsWithSpaces.toLocaleString());
  animateStat(charsNoSpacesStat, stats.charsWithoutSpaces.toLocaleString());
  animateStat(sentencesStat, stats.sentences.toLocaleString());
  animateStat(paragraphsStat, stats.paragraphs.toLocaleString());
  readingTimeStat.textContent = stats.readingTime;
}

function resetStats(): void {
  const zeros = ["0", "0", "0", "0", "0"];
  [
    wordsStat,
    charsSpacesStat,
    charsNoSpacesStat,
    sentencesStat,
    paragraphsStat,
  ].forEach((el, i) => (el.textContent = zeros[i]));
  readingTimeStat.textContent = "—";
}

// DOM references
const textarea = document.getElementById("text-input") as HTMLTextAreaElement;
const wordsStat = document.getElementById("stat-words") as HTMLElement;
const charsSpacesStat = document.getElementById(
  "stat-chars-spaces"
) as HTMLElement;
const charsNoSpacesStat = document.getElementById(
  "stat-chars-no-spaces"
) as HTMLElement;
const sentencesStat = document.getElementById(
  "stat-sentences"
) as HTMLElement;
const paragraphsStat = document.getElementById(
  "stat-paragraphs"
) as HTMLElement;
const readingTimeStat = document.getElementById(
  "stat-reading-time"
) as HTMLElement;
const clearBtn = document.getElementById("clear-btn") as HTMLButtonElement;
const copyBtn = document.getElementById("copy-btn") as HTMLButtonElement;
const copyLabel = document.getElementById("copy-label") as HTMLElement;

// Real-time update on every keystroke / paste
textarea.addEventListener("input", () => {
  if (textarea.value === "") {
    resetStats();
  } else {
    updateStats(textarea.value);
  }
});

// Clear button
clearBtn.addEventListener("click", () => {
  textarea.value = "";
  textarea.focus();
  resetStats();
});

// Copy button
copyBtn.addEventListener("click", async () => {
  if (!textarea.value) return;

  try {
    await navigator.clipboard.writeText(textarea.value);
    copyLabel.textContent = "Copied!";
    copyBtn.classList.replace("bg-purple-800", "bg-green-600");
    copyBtn.classList.replace("hover:bg-purple-900", "hover:bg-green-700");
  } catch {
    // Fallback for browsers without Clipboard API support
    textarea.select();
    document.execCommand("copy");
    copyLabel.textContent = "Copied!";
  }

  setTimeout(() => {
    copyLabel.textContent = "Copy Text";
    copyBtn.classList.replace("bg-green-600", "bg-purple-800");
    copyBtn.classList.replace("hover:bg-green-700", "hover:bg-purple-900");
  }, 2000);
});

export {};
