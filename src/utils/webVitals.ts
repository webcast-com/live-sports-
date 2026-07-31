/**
 * Web Vitals reporting - Phase 2 performance monitoring
 * Logs CLS, FCP, LCP, TTFB, INP to console in dev, can be sent to analytics in prod
 * (FID was retired by Google and removed from web-vitals v4+; INP replaced it)
 */

export interface WebVitalMetric {
  name: 'CLS' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

function logMetric(metric: WebVitalMetric) {
  const { name, value, rating } = metric;
  const color = rating === 'good' ? '#00ff88' : rating === 'needs-improvement' ? '#ffb800' : '#ff4757';
  if (import.meta.env.DEV) {
    console.log(`%c[Web Vitals] ${name}: ${value.toFixed(2)} - ${rating}`, `color: ${color}; font-weight: bold;`);
  }
  // In prod, you could send to analytics:
  // gtag('event', name, { value: Math.round(name === 'CLS' ? value * 1000 : value), event_label: rating })
}

export function initWebVitals() {
  // Dynamic import to avoid bundling web-vitals in initial chunk if not needed.
  // Note: onFID was removed in web-vitals v4+ (FID was retired by Google in
  // favor of INP), so we report CLS/FCP/LCP/TTFB/INP only.
  import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
    onCLS(logMetric);
    onFCP(logMetric);
    onLCP(logMetric);
    onTTFB(logMetric);
    onINP(logMetric);
  }).catch(() => {
    // web-vitals not installed, skip silently
    if (import.meta.env.DEV) console.info('web-vitals package not installed, skipping metrics');
  });
}

// Performance observer for long tasks
export function initPerformanceObserver() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'longtask') {
          if (import.meta.env.DEV) {
            console.warn(`%c[Long Task] ${(entry as any).duration.toFixed(0)}ms`, 'color: #ffb800');
          }
        }
      }
    });
    observer.observe({ entryTypes: ['longtask'] });
  } catch {
    // ignore
  }
}
