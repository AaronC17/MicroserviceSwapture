import { removeBackground } from '@imgly/background-removal';

type Lang = 'en' | 'es';

const I18N: Record<Lang, Record<string, string>> = {
  en: {
    title: 'Background Remover',
    subtitle: 'AI background removal — fully in your browser, no upload required',
    dropMain: 'Drop your image here, or click to browse',
    dropSub: 'Supports PNG, JPG, JPEG, WEBP',
    beforeLabel: 'Original',
    afterLabel: 'Background Removed',
    downloadLabel: 'Download PNG',
    resetLabel: 'New Image',
    loadingModel: 'Loading AI model…',
    processing: 'Removing background…',
    modelHint: 'First run downloads the AI model (~20 MB). Subsequent runs are instant.',
    progressHint: 'This may take 10–30 seconds depending on image size.',
    f1Title: 'AI-Powered', f1Desc: 'Uses a machine learning model optimized for people, objects, and products.',
    f2Title: '100% Private', f2Desc: 'Your image never leaves your device. Processing is done locally via WebAssembly.',
    f3Title: 'Transparent PNG', f3Desc: 'Download your result as a high-quality PNG with a transparent background.',
    errFail: 'Background removal failed. Please try a different image.',
    backLink: '← All tools',
    langBtn: 'ES',
  },
  es: {
    title: 'Eliminador de Fondo',
    subtitle: 'Eliminación de fondo con IA — en tu navegador, sin subir archivos',
    dropMain: 'Arrastra tu imagen aquí, o haz clic para buscar',
    dropSub: 'Soporta PNG, JPG, JPEG, WEBP',
    beforeLabel: 'Original',
    afterLabel: 'Fondo Eliminado',
    downloadLabel: 'Descargar PNG',
    resetLabel: 'Nueva Imagen',
    loadingModel: 'Cargando modelo de IA…',
    processing: 'Eliminando el fondo…',
    modelHint: 'La primera vez descarga el modelo (~20 MB). Las siguientes ejecuciones son instantáneas.',
    progressHint: 'Esto puede tomar entre 10 y 30 segundos según el tamaño de la imagen.',
    f1Title: 'Impulsado por IA', f1Desc: 'Usa un modelo de aprendizaje automático optimizado para personas, objetos y productos.',
    f2Title: '100% Privado', f2Desc: 'Tu imagen nunca sale de tu dispositivo. El procesamiento es local vía WebAssembly.',
    f3Title: 'PNG Transparente', f3Desc: 'Descarga el resultado como PNG de alta calidad con fondo transparente.',
    errFail: 'La eliminación de fondo falló. Por favor intenta con otra imagen.',
    backLink: '← Todas las herramientas',
    langBtn: 'EN',
  },
};

let lang: Lang = navigator.language.startsWith('es') ? 'es' : 'en';

// DOM
const langToggle   = document.getElementById('lang-toggle')   as HTMLButtonElement;
const pageTitleEl  = document.getElementById('page-title')    as HTMLHeadingElement;
const pageSubEl    = document.getElementById('page-subtitle') as HTMLParagraphElement;
const dropZone     = document.getElementById('drop-zone')     as HTMLDivElement;
const dropMain     = document.getElementById('drop-main')     as HTMLParagraphElement;
const dropSub      = document.getElementById('drop-sub')      as HTMLParagraphElement;
const fileInput    = document.getElementById('file-input')    as HTMLInputElement;
const workArea     = document.getElementById('work-area')     as HTMLDivElement;
const progressArea = document.getElementById('progress-area') as HTMLDivElement;
const progressBar  = document.getElementById('progress-bar')  as HTMLDivElement;
const progressPct  = document.getElementById('progress-pct')  as HTMLSpanElement;
const progressLbl  = document.getElementById('progress-label')as HTMLParagraphElement;
const progressHint = document.getElementById('progress-hint') as HTMLParagraphElement;
const resultArea   = document.getElementById('result-area')   as HTMLDivElement;
const originalImg  = document.getElementById('original-img')  as HTMLImageElement;
const resultImg    = document.getElementById('result-img')    as HTMLImageElement;
const downloadBtn  = document.getElementById('download-btn')  as HTMLAnchorElement;
const downloadLbl  = document.getElementById('download-label')as HTMLSpanElement;
const resetBtn     = document.getElementById('reset-btn')     as HTMLButtonElement;
const resetLbl     = document.getElementById('reset-label')   as HTMLSpanElement;
const errorMsg     = document.getElementById('error-msg')     as HTMLParagraphElement;
const backLink     = document.getElementById('back-link')     as HTMLAnchorElement;
const footerBack   = document.getElementById('footer-back')   as HTMLAnchorElement;

function applyI18n(): void {
  const t = I18N[lang];
  pageTitleEl.textContent  = t.title;
  pageSubEl.textContent    = t.subtitle;
  dropMain.textContent     = t.dropMain;
  dropSub.textContent      = t.dropSub;
  downloadLbl.textContent  = t.downloadLabel;
  resetLbl.textContent     = t.resetLabel;
  langToggle.textContent   = t.langBtn;
  if (backLink)   backLink.textContent   = t.backLink;
  if (footerBack) footerBack.textContent = t.backLink;
  const bl = document.getElementById('before-label') as HTMLParagraphElement;
  const al = document.getElementById('after-label')  as HTMLParagraphElement;
  if (bl) bl.textContent = t.beforeLabel;
  if (al) al.textContent = t.afterLabel;
  document.getElementById('f1-title')!.textContent = t.f1Title;
  document.getElementById('f1-desc')!.textContent  = t.f1Desc;
  document.getElementById('f2-title')!.textContent = t.f2Title;
  document.getElementById('f2-desc')!.textContent  = t.f2Desc;
  document.getElementById('f3-title')!.textContent = t.f3Title;
  document.getElementById('f3-desc')!.textContent  = t.f3Desc;
}

function setProgress(pct: number, label: string, hint = ''): void {
  progressBar.style.width  = `${pct}%`;
  progressPct.textContent  = `${Math.round(pct)}%`;
  progressLbl.textContent  = label;
  progressHint.textContent = hint;
}

function reset(): void {
  dropZone.classList.remove('hidden');
  workArea.classList.add('hidden');
  resultArea.classList.add('hidden');
  progressArea.classList.remove('hidden');
  errorMsg.classList.add('hidden');
  fileInput.value = '';
  setProgress(0, '', '');
}

async function processFile(file: File): Promise<void> {
  const t = I18N[lang];

  // Show work area
  dropZone.classList.add('hidden');
  workArea.classList.remove('hidden');
  resultArea.classList.add('hidden');
  progressArea.classList.remove('hidden');
  errorMsg.classList.add('hidden');
  setProgress(5, t.loadingModel, t.modelHint);

  // Show original preview
  const originalUrl = URL.createObjectURL(file);
  originalImg.src = originalUrl;
  downloadBtn.download = file.name.replace(/\.[^.]+$/, '') + '-no-bg.png';

  try {
    let lastPct = 5;
    const blob = await removeBackground(file, {
      publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/dist/',
      model: 'isnet_quint8',
      output: { format: 'image/png', quality: 1 },
      progress: (key: string, current: number, total: number) => {
        const pct = total > 0 ? Math.min(95, 5 + (current / total) * 80) : lastPct;
        lastPct = pct;
        const label = key.includes('fetch') ? t.loadingModel : t.processing;
        setProgress(pct, label, key.includes('fetch') ? t.modelHint : t.progressHint);
      },
    });

    setProgress(98, t.processing, '');

    const resultUrl = URL.createObjectURL(blob);
    resultImg.src = resultUrl;
    downloadBtn.href = resultUrl;

    progressArea.classList.add('hidden');
    resultArea.classList.remove('hidden');
    setProgress(100, '', '');
  } catch (err) {
    console.error(err);
    progressArea.classList.add('hidden');
    errorMsg.textContent = t.errFail;
    errorMsg.classList.remove('hidden');
  }
}

function handleFile(file: File): void {
  const allowed = ['image/png', 'image/jpeg', 'image/webp'];
  if (!allowed.includes(file.type)) {
    alert('Please upload a PNG, JPG, or WEBP image.');
    return;
  }
  processFile(file);
}

// Events
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', ()  => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  if (e.dataTransfer?.files[0]) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', () => { if (fileInput.files?.[0]) handleFile(fileInput.files[0]); });
resetBtn.addEventListener('click', reset);
langToggle.addEventListener('click', () => { lang = lang === 'en' ? 'es' : 'en'; applyI18n(); });

applyI18n();

export {};
