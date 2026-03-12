/** Analytics: Google Analytics and Microsoft Clarity injection */

export function injectGoogleAnalytics(measurementId: string): void {
  if (typeof document === 'undefined') return;

  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(script2);
}

export function injectMicrosoftClarity(projectId: string): void {
  if (typeof document === 'undefined') return;

  const script = document.createElement('script');
  script.textContent = `
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "${projectId}");
  `;
  document.head.appendChild(script);
}

export function trackEvent(eventName: string, params: Record<string, unknown> = {}): void {
  if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>)['gtag']) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', eventName, params);
  }
}
