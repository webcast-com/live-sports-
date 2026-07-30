/**
 * Web Vitals reporting - Phase 2 performance monitoring
 * Logs CLS, FID, FCP, LCP, TTFB to console in dev, can be sent to analytics in prod
 */

export interface WebVitalMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
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
  // Dynamic import to avoid bundling web-vitals in initial chunk if not needed
  import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
    onCLS(logMetric);
    onFID(logMetric);
    onFCP(logMetric);
    onLCP(logMetric);
    onTTFB(logMetric);
    onINP?.(logMetric);
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
