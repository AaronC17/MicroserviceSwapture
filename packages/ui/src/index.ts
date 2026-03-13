/** Shared UI components: Header and Footer */

export interface HeaderOptions {
  currentTool?: string;
}

export function createHeader(options: HeaderOptions = {}): string {
  return `
<header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
  <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
    <a href="https://swapture.com" class="flex items-center gap-2 text-indigo-600 font-bold text-xl hover:text-indigo-700 transition-colors">
      <svg class="w-7 h-7" viewBox="0 0 32 32" fill="currentColor">
        <rect width="32" height="32" rx="8" fill="currentColor" opacity="0.15"/>
        <path d="M8 12l8-4 8 4-8 4-8-4zm0 4l8 4 8-4M8 20l8 4 8-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>
      SwapTure
    </a>
    <nav class="hidden md:flex items-center gap-6 text-sm text-gray-600">
      <a href="https://password.swapture.com" class="hover:text-indigo-600 transition-colors">Password</a>
      <a href="https://pace.swapture.com" class="hover:text-indigo-600 transition-colors">Pace</a>
      <a href="https://bmi.swapture.com" class="hover:text-indigo-600 transition-colors">BMI</a>
      <a href="https://convert.swapture.com" class="hover:text-indigo-600 transition-colors">Converter</a>
      <a href="https://wordcount.swapture.com" class="hover:text-indigo-600 transition-colors">Word Counter</a>
    </nav>
    <button id="menu-toggle" class="md:hidden text-gray-600 hover:text-indigo-600" aria-label="Toggle menu">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>
  </div>
  <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-gray-100">
    <div class="max-w-6xl mx-auto px-4 py-2 flex flex-col gap-2 text-sm text-gray-600">
      <a href="https://password.swapture.com" class="py-1 hover:text-indigo-600">Password Checker</a>
      <a href="https://pace.swapture.com" class="py-1 hover:text-indigo-600">Pace Calculator</a>
      <a href="https://percentage.swapture.com" class="py-1 hover:text-indigo-600">Percentage Calculator</a>
      <a href="https://ip.swapture.com" class="py-1 hover:text-indigo-600">IP Analyzer</a>
      <a href="https://salary.swapture.com" class="py-1 hover:text-indigo-600">Salary Calculator</a>
      <a href="https://wordcount.swapture.com" class="py-1 hover:text-indigo-600">Word Counter</a>
      <a href="https://bmi.swapture.com" class="py-1 hover:text-indigo-600">BMI Calculator</a>
      <a href="https://subnet.swapture.com" class="py-1 hover:text-indigo-600">Subnet Calculator</a>
      <a href="https://startupname.swapture.com" class="py-1 hover:text-indigo-600">Startup Names</a>
      <a href="https://convert.swapture.com" class="py-1 hover:text-indigo-600">Unit Converter</a>
    </div>
  </div>
</header>`.trim();
}

export function createFooter(): string {
  const year = new Date().getFullYear();
  return `
<footer class="bg-gray-800 text-gray-300 mt-16">
  <div class="max-w-6xl mx-auto px-4 py-10">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
      <div>
        <h3 class="text-white font-semibold mb-3">SwapTure</h3>
        <p class="text-sm text-gray-400">Free microtools for everyday calculations and conversions.</p>
      </div>
      <div>
        <h3 class="text-white font-semibold mb-3">Tools</h3>
        <ul class="space-y-1 text-sm">
          <li><a href="https://password.swapture.com" class="hover:text-white transition-colors">Password Checker</a></li>
          <li><a href="https://pace.swapture.com" class="hover:text-white transition-colors">Pace Calculator</a></li>
          <li><a href="https://percentage.swapture.com" class="hover:text-white transition-colors">Percentage Calc</a></li>
          <li><a href="https://ip.swapture.com" class="hover:text-white transition-colors">IP Analyzer</a></li>
          <li><a href="https://salary.swapture.com" class="hover:text-white transition-colors">Salary Calculator</a></li>
        </ul>
      </div>
      <div>
        <h3 class="text-white font-semibold mb-3">More Tools</h3>
        <ul class="space-y-1 text-sm">
          <li><a href="https://wordcount.swapture.com" class="hover:text-white transition-colors">Word Counter</a></li>
          <li><a href="https://bmi.swapture.com" class="hover:text-white transition-colors">BMI Calculator</a></li>
          <li><a href="https://subnet.swapture.com" class="hover:text-white transition-colors">Subnet Calculator</a></li>
          <li><a href="https://startupname.swapture.com" class="hover:text-white transition-colors">Startup Names</a></li>
          <li><a href="https://convert.swapture.com" class="hover:text-white transition-colors">Unit Converter</a></li>
        </ul>
      </div>
      <div>
        <h3 class="text-white font-semibold mb-3">Legal</h3>
        <ul class="space-y-1 text-sm">
          <li><a href="https://swapture.com/privacy" class="hover:text-white transition-colors">Privacy Policy</a></li>
          <li><a href="https://swapture.com/terms" class="hover:text-white transition-colors">Terms of Use</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
      <p>&copy; ${year} SwapTure MicroTools. All rights reserved.</p>
    </div>
  </div>
</footer>`.trim();
}

export function initMobileMenu(): void {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });
  }
}
