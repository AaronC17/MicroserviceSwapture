interface MailMessage {
  id: number;
  from: string;
  subject: string;
  date: string;
}

interface MailBody {
  id: number;
  from: string;
  subject: string;
  date: string;
  body: string;
  textBody: string;
  htmlBody: string;
  attachments: Array<{ filename: string; contentType: string; size: number }>;
}

let currentLogin  = '';
let currentDomain = '';
let pollTimer: ReturnType<typeof setInterval> | null = null;
let selectedMessageId: number | null = null;

const API_BASE = 'https://www.1secmail.com/api/v1/';

async function generateAddress(): Promise<void> {
  const response = await fetch(`${API_BASE}?action=genRandomMailbox&count=1`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = (await response.json()) as string[];
  if (!data.length) throw new Error('No address received');
  const [email] = data;
  if (!email || !email.includes('@')) throw new Error('Invalid address received');
  const atIndex = email.indexOf('@');
  currentLogin  = email.slice(0, atIndex);
  currentDomain = email.slice(atIndex + 1);
}

async function fetchInbox(): Promise<MailMessage[]> {
  const url = `${API_BASE}?action=getMessages&login=${encodeURIComponent(currentLogin)}&domain=${encodeURIComponent(currentDomain)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<MailMessage[]>;
}

async function fetchMessage(id: number): Promise<MailBody> {
  const url = `${API_BASE}?action=readMessage&login=${encodeURIComponent(currentLogin)}&domain=${encodeURIComponent(currentDomain)}&id=${id}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<MailBody>;
}

function getEl<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

const emailDisplay    = getEl<HTMLSpanElement>('email-display');
const copyEmailBtn    = getEl<HTMLButtonElement>('copy-email-btn');
const newAddressBtn   = getEl<HTMLButtonElement>('new-address-btn');
const refreshBtn      = getEl<HTMLButtonElement>('refresh-btn');
const inboxList       = getEl<HTMLDivElement>('inbox-list');
const emptyInbox      = getEl<HTMLDivElement>('empty-inbox');
const messageView     = getEl<HTMLDivElement>('message-view');
const msgFrom         = getEl<HTMLSpanElement>('msg-from');
const msgSubject      = getEl<HTMLSpanElement>('msg-subject');
const msgDate         = getEl<HTMLSpanElement>('msg-date');
const msgBody         = getEl<HTMLDivElement>('msg-body');
const backBtn         = getEl<HTMLButtonElement>('back-btn');
const statusEl        = getEl<HTMLSpanElement>('status-msg');
const countdownEl     = getEl<HTMLSpanElement>('countdown-el');

let countdownVal = 30;
let countdownTimer: ReturnType<typeof setInterval> | null = null;

function setStatus(msg: string, isError = false): void {
  statusEl.textContent = msg;
  statusEl.className = isError ? 'text-sm text-red-500' : 'text-sm text-zinc-500';
}

function renderInbox(messages: MailMessage[]): void {
  if (messages.length === 0) {
    emptyInbox.classList.remove('hidden');
    inboxList.innerHTML = '';
    return;
  }
  emptyInbox.classList.add('hidden');
  inboxList.innerHTML = messages.map(m => {
    const date = new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isSelected = m.id === selectedMessageId;
    return `<div class="message-item flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-purple-50 border border-purple-200' : 'hover:bg-zinc-50 border border-transparent'}" data-id="${m.id}">
      <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 text-xs font-bold flex-shrink-0">
        ${(m.from[0] ?? '?').toUpperCase()}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <span class="text-sm font-medium text-zinc-900 truncate">${escapeHtml(m.from)}</span>
          <span class="text-xs text-zinc-400 flex-shrink-0">${date}</span>
        </div>
        <p class="text-sm text-zinc-500 truncate">${escapeHtml(m.subject || '(no subject)')}</p>
      </div>
    </div>`;
  }).join('');

  inboxList.querySelectorAll('.message-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = parseInt(el.getAttribute('data-id') ?? '0', 10);
      openMessage(id);
    });
  });
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function openMessage(id: number): Promise<void> {
  selectedMessageId = id;
  try {
    const msg = await fetchMessage(id);
    msgFrom.textContent    = msg.from;
    msgSubject.textContent = msg.subject || '(no subject)';
    msgDate.textContent    = new Date(msg.date).toLocaleString();
    if (msg.htmlBody) {
      msgBody.innerHTML = `<iframe sandbox="allow-same-origin" class="w-full border-0 min-h-48" srcdoc="${escapeHtml(msg.htmlBody)}"></iframe>`;
    } else {
      msgBody.innerHTML = `<pre class="whitespace-pre-wrap text-sm text-zinc-700 font-sans">${escapeHtml(msg.textBody || msg.body || '')}</pre>`;
    }
    messageView.classList.remove('hidden');
    inboxList.classList.add('hidden');
    emptyInbox.classList.add('hidden');
    backBtn.classList.remove('hidden');
  } catch {
    setStatus('Failed to load message.', true);
  }
}

async function doRefresh(): Promise<void> {
  if (!currentLogin) return;
  setStatus('Checking inbox…');
  try {
    const msgs = await fetchInbox();
    renderInbox(msgs);
    setStatus(`Last checked: ${new Date().toLocaleTimeString()}`);
  } catch {
    setStatus('Failed to check inbox.', true);
  }
}

function startPolling(): void {
  if (pollTimer) clearInterval(pollTimer);
  if (countdownTimer) clearInterval(countdownTimer);
  
  countdownVal = 30;
  countdownEl.textContent = '30s';
  
  countdownTimer = setInterval(() => {
    countdownVal--;
    countdownEl.textContent = `${countdownVal}s`;
    if (countdownVal <= 0) countdownVal = 30;
  }, 1000);

  pollTimer = setInterval(async () => {
    await doRefresh();
    countdownVal = 30;
  }, 30_000);
}

async function init(): Promise<void> {
  setStatus('Generating address…');
  try {
    await generateAddress();
    emailDisplay.textContent = `${currentLogin}@${currentDomain}`;
    setStatus('Address ready. Waiting for emails…');
    await doRefresh();
    startPolling();
  } catch {
    setStatus('Failed to generate address. Try refreshing the page.', true);
  }
}

copyEmailBtn.addEventListener('click', async () => {
  const email = `${currentLogin}@${currentDomain}`;
  if (!email) return;
  try {
    await navigator.clipboard.writeText(email);
    copyEmailBtn.textContent = 'Copied!';
    setTimeout(() => { copyEmailBtn.textContent = 'Copy'; }, 2000);
  } catch {
    // ignore
  }
});

newAddressBtn.addEventListener('click', async () => {
  if (pollTimer) clearInterval(pollTimer);
  if (countdownTimer) clearInterval(countdownTimer);
  selectedMessageId = null;
  messageView.classList.add('hidden');
  backBtn.classList.add('hidden');
  inboxList.classList.remove('hidden');
  inboxList.innerHTML = '';
  await init();
});

refreshBtn.addEventListener('click', async () => {
  await doRefresh();
  countdownVal = 30;
});

backBtn.addEventListener('click', () => {
  messageView.classList.add('hidden');
  backBtn.classList.add('hidden');
  inboxList.classList.remove('hidden');
  selectedMessageId = null;
  doRefresh();
});

init();
