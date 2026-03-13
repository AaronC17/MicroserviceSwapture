// Typing Speed Test – Bilingual EN/ES

type Lang = 'en' | 'es';

const TEXTS: Record<Lang, string[]> = {
  en: [
    "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump through the sky.",
    "Programming is not about typing, it is about thinking. The best code is code that does not need to exist. Write programs that do one thing and do it well.",
    "Technology is best when it brings people together. Innovation distinguishes between a leader and a follower. Stay hungry, stay foolish. Design is not just what it looks like.",
    "In the beginning there was chaos, and out of that chaos came order. The universe expanded and cooled, stars were born and died, producing the elements of life.",
    "The only way to do great work is to love what you do. Success is not final, failure is not fatal: it is the courage to continue that counts. Keep going forward.",
  ],
  es: [
    "El veloz murciélago hindú comía feliz cardillo y kiwi. La cigüeña tocaba el saxofón detrás del palenque de paja. Jovencillo emponzoñado de whisky.",
    "La programación no se trata de escribir código, se trata de resolver problemas. El mejor código es el que no necesita existir. Escribe programas que hagan una sola cosa y la hagan bien.",
    "La tecnología es mejor cuando une a las personas. La innovación distingue entre un líder y un seguidor. Mantente curioso, mantente aprendiendo siempre.",
    "En el principio había caos, y del caos surgió el orden. El universo se expandió y se enfrió, las estrellas nacieron y murieron, produciendo los elementos de la vida.",
    "La única forma de hacer un gran trabajo es amar lo que haces. El éxito no es definitivo, el fracaso no es fatal: es el coraje de continuar lo que importa en la vida.",
  ],
};

const I18N: Record<Lang, Record<string, string>> = {
  en: {
    title: 'Typing Speed Test',
    subtitle: 'Test your typing speed and accuracy',
    startHint: 'Click the text area below and start typing to begin the timer',
    wpm: 'WPM', accuracy: 'Accuracy', time: 'Time', chars: 'Chars',
    restart: 'New Test',
    resultsTitle: 'Test Complete!',
    yourWpm: 'WPM', yourAccuracy: 'Accuracy', yourTime: 'Time',
    tryAgain: 'Try Again',
    placeholder: 'Start typing here…',
    perfExcellent: 'Excellent! You are in the top 5% of typists.',
    perfGreat: 'Great speed! Well above average.',
    perfAverage: 'Average. Keep practicing to improve!',
    perfBeginner: 'Good start! Keep at it — practice makes perfect.',
    langBtn: 'ES',
    backLink: '← All tools',
  },
  es: {
    title: 'Test de Velocidad de Escritura',
    subtitle: 'Pon a prueba tu velocidad y precisión',
    startHint: 'Haz clic en el área de texto y empieza a escribir para iniciar el cronómetro',
    wpm: 'PPM', accuracy: 'Precisión', time: 'Tiempo', chars: 'Caract.',
    restart: 'Nuevo Test',
    resultsTitle: '¡Test Completado!',
    yourWpm: 'PPM', yourAccuracy: 'Precisión', yourTime: 'Tiempo',
    tryAgain: 'Intentar de Nuevo',
    placeholder: 'Empieza a escribir aquí…',
    perfExcellent: '¡Excelente! Estás en el top 5% de escritores.',
    perfGreat: '¡Muy bien! Bastante por encima del promedio.',
    perfAverage: 'Promedio. ¡Sigue practicando para mejorar!',
    perfBeginner: '¡Buen comienzo! Sigue — la práctica hace al maestro.',
    langBtn: 'EN',
    backLink: '← Todas las herramientas',
  },
};

let lang: Lang = navigator.language.startsWith('es') ? 'es' : 'en';
let currentText = '';
let startTime: number | null = null;
let timerInterval: number | null = null;
let testActive = false;
let testComplete = false;

// DOM
const langToggle      = document.getElementById('lang-toggle') as HTMLButtonElement;
const pageTitleEl     = document.getElementById('page-title') as HTMLHeadingElement;
const pageSubtitleEl  = document.getElementById('page-subtitle') as HTMLParagraphElement;
const startHintEl     = document.getElementById('start-hint') as HTMLParagraphElement;
const textDisplay     = document.getElementById('text-display') as HTMLDivElement;
const inputArea       = document.getElementById('input-area') as HTMLTextAreaElement;
const wpmVal          = document.getElementById('wpm-val') as HTMLSpanElement;
const wpmLbl          = document.getElementById('wpm-label') as HTMLSpanElement;
const accVal          = document.getElementById('accuracy-val') as HTMLSpanElement;
const accLbl          = document.getElementById('accuracy-label') as HTMLSpanElement;
const timeVal         = document.getElementById('time-val') as HTMLSpanElement;
const timeLbl         = document.getElementById('time-label') as HTMLSpanElement;
const charsVal        = document.getElementById('chars-val') as HTMLSpanElement;
const charsLbl        = document.getElementById('chars-label') as HTMLSpanElement;
const restartBtn      = document.getElementById('restart-btn') as HTMLButtonElement;
const resultsModal    = document.getElementById('results-modal') as HTMLDivElement;
const resultsTitleEl  = document.getElementById('results-title') as HTMLHeadingElement;
const resultWpm       = document.getElementById('result-wpm') as HTMLSpanElement;
const resultWpmLbl    = document.getElementById('result-wpm-label') as HTMLSpanElement;
const resultAcc       = document.getElementById('result-accuracy') as HTMLSpanElement;
const resultAccLbl    = document.getElementById('result-accuracy-label') as HTMLSpanElement;
const resultTime      = document.getElementById('result-time') as HTMLSpanElement;
const resultTimeLbl   = document.getElementById('result-time-label') as HTMLSpanElement;
const resultMsg       = document.getElementById('result-msg') as HTMLParagraphElement;
const tryAgainBtn     = document.getElementById('try-again-btn') as HTMLButtonElement;
const backLink        = document.getElementById('back-link') as HTMLAnchorElement;

function applyI18n(): void {
  const t = I18N[lang];
  pageTitleEl.textContent    = t.title;
  pageSubtitleEl.textContent = t.subtitle;
  startHintEl.textContent    = t.startHint;
  wpmLbl.textContent         = t.wpm;
  accLbl.textContent         = t.accuracy;
  timeLbl.textContent        = t.time;
  charsLbl.textContent       = t.chars;
  restartBtn.textContent     = t.restart;
  resultsTitleEl.textContent = t.resultsTitle;
  resultWpmLbl.textContent   = t.yourWpm;
  resultAccLbl.textContent   = t.yourAccuracy;
  resultTimeLbl.textContent  = t.yourTime;
  tryAgainBtn.textContent    = t.tryAgain;
  inputArea.placeholder      = t.placeholder;
  langToggle.textContent     = t.langBtn;
  if (backLink) backLink.textContent = t.backLink;
}

function pickText(): string {
  const list = TEXTS[lang];
  return list[Math.floor(Math.random() * list.length)];
}

function renderText(typed: string): void {
  const html = currentText.split('').map((char, i) => {
    const t = typed[i];
    if (i === typed.length) {
      // cursor position
      const escaped = char === ' ' ? '&nbsp;' : char.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      return `<span class="char-cursor text-zinc-400">${escaped}</span>`;
    }
    if (t === undefined) {
      const escaped = char === ' ' ? '&nbsp;' : char.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      return `<span class="text-zinc-300">${escaped}</span>`;
    }
    if (t === char) {
      const escaped = char === ' ' ? '&nbsp;' : char.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      return `<span class="text-zinc-900">${escaped}</span>`;
    }
    // incorrect
    const escaped = char === ' ' ? '&nbsp;' : char.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    return `<span class="bg-red-100 text-red-600 rounded-sm">${escaped}</span>`;
  }).join('');
  textDisplay.innerHTML = html;
}

function calcWPM(typedLen: number, elapsedMs: number): number {
  if (elapsedMs < 500) return 0;
  return Math.round((typedLen / 5) / (elapsedMs / 60000));
}

function calcAccuracy(typed: string): number {
  if (!typed.length) return 100;
  let correct = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === currentText[i]) correct++;
  }
  return Math.round((correct / typed.length) * 100);
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}:${String(s % 60).padStart(2, '0')}` : `${s}s`;
}

function startTimer(): void {
  startTime = Date.now();
  timerInterval = window.setInterval(() => {
    if (!startTime) return;
    const elapsed = Date.now() - startTime;
    const typed   = inputArea.value;
    timeVal.textContent  = formatTime(elapsed);
    wpmVal.textContent   = String(calcWPM(typed.length, elapsed));
    charsVal.textContent = `${typed.length}/${currentText.length}`;
  }, 200);
}

function stopTimer(): void {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

function showResults(): void {
  const elapsed = startTime ? Date.now() - startTime : 0;
  const typed   = inputArea.value;
  const wpm     = calcWPM(typed.length, elapsed);
  const acc     = calcAccuracy(typed);
  const t       = I18N[lang];

  resultWpm.textContent  = String(wpm);
  resultAcc.textContent  = `${acc}%`;
  resultTime.textContent = formatTime(elapsed);

  if (wpm >= 80)      resultMsg.textContent = t.perfExcellent;
  else if (wpm >= 50) resultMsg.textContent = t.perfGreat;
  else if (wpm >= 25) resultMsg.textContent = t.perfAverage;
  else                resultMsg.textContent = t.perfBeginner;

  resultsModal.classList.remove('hidden');
}

function initTest(): void {
  stopTimer();
  currentText  = pickText();
  startTime    = null;
  testActive   = false;
  testComplete = false;
  inputArea.value         = '';
  inputArea.disabled      = false;
  wpmVal.textContent      = '0';
  accVal.textContent      = '100%';
  timeVal.textContent     = '0s';
  charsVal.textContent    = `0/${currentText.length}`;
  resultsModal.classList.add('hidden');
  renderText('');
  inputArea.focus();
}

inputArea.addEventListener('input', () => {
  if (testComplete) return;
  const typed = inputArea.value;

  if (!testActive && typed.length > 0) {
    testActive = true;
    startTimer();
  }

  accVal.textContent   = `${calcAccuracy(typed)}%`;
  charsVal.textContent = `${typed.length}/${currentText.length}`;
  renderText(typed);

  if (typed.length >= currentText.length) {
    testComplete = true;
    testActive   = false;
    stopTimer();
    // Final stat update
    const elapsed = startTime ? Date.now() - startTime : 0;
    wpmVal.textContent  = String(calcWPM(typed.length, elapsed));
    timeVal.textContent = formatTime(elapsed);
    setTimeout(showResults, 400);
  }
});

restartBtn.addEventListener('click', initTest);
tryAgainBtn.addEventListener('click', initTest);

langToggle.addEventListener('click', () => {
  lang = lang === 'en' ? 'es' : 'en';
  applyI18n();
  initTest();
});

applyI18n();
initTest();

export {};
