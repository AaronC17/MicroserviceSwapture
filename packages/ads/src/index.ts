/** Google AdSense ad banner component */

export type AdPosition = 'top' | 'inline' | 'footer';

const AD_SLOT_IDS: Record<AdPosition, string> = {
  top: '1234567890',
  inline: '0987654321',
  footer: '1122334455',
};

export function createAdBanner(position: AdPosition): string {
  const slotId = AD_SLOT_IDS[position];
  const sizeClass =
    position === 'top'
      ? 'h-24 md:h-28'
      : position === 'inline'
      ? 'h-20 md:h-24'
      : 'h-24 md:h-28';

  return `
<div class="ad-banner ad-${position} w-full flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded-lg my-4 ${sizeClass}" data-ad-position="${position}">
  <ins class="adsbygoogle"
    style="display:block;width:100%;height:100%;"
    data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
    data-ad-slot="${slotId}"
    data-ad-format="auto"
    data-full-width-responsive="true">
  </ins>
  <span class="text-gray-400 text-xs absolute pointer-events-none select-none">Advertisement</span>
</div>`.trim();
}

export function initAds(): void {
  if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>)['adsbygoogle']) {
    const ads = document.querySelectorAll('.adsbygoogle');
    ads.forEach(() => {
      try {
        ((window as unknown as Record<string, unknown[]>)['adsbygoogle'] =
          (window as unknown as Record<string, unknown[]>)['adsbygoogle'] || []).push({});
      } catch (_e) {
        // AdSense not loaded
      }
    });
  }
}
