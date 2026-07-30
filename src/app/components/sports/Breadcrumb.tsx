import React, { useEffect } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { MainTab } from './TabNavigation';
import { Sport } from '@/app/data/sportsData';

interface BreadcrumbProps {
  activeTab: MainTab;
  activeSport?: Sport;
  onNavigate?: (href: string) => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ activeTab, activeSport, onNavigate }) => {
  const getBreadcrumbs = (): Array<{ label: string; href?: string }> => {
    const breadcrumbs: Array<{ label: string; href?: string }> = [{ label: 'Home', href: '/' }];

    switch (activeTab) {
      case 'dashboard':
        breadcrumbs.push({ label: 'Dashboard', href: '/' });
        if (activeSport && activeSport !== 'all') {
          breadcrumbs.push({ label: formatSportName(activeSport), href: `/sport/${activeSport}` });
        }
        break;
      case 'sure-bets':
        breadcrumbs.push({ label: 'Sure Bets', href: '/sure-bets' });
        break;
      case 'predictions':
        breadcrumbs.push({ label: 'Predictions', href: '/predictions' });
        break;
      case 'results':
        breadcrumbs.push({ label: 'Results & Performance', href: '/results' });
        break;
      case 'premium':
        breadcrumbs.push({ label: 'Premium', href: '/premium' });
        break;
      case 'settings':
        breadcrumbs.push({ label: 'Settings', href: '/settings' });
        break;
      case 'subscription':
        breadcrumbs.push({ label: 'Subscription Management', href: '/subscription' });
        break;
      case 'webhook':
        breadcrumbs.push({ label: 'Webhook Simulator', href: '/webhook' });
        break;
    }
    return breadcrumbs;
  };

  const formatSportName = (sport: Sport): string => sport.charAt(0).toUpperCase() + sport.slice(1);

  const breadcrumbs = getBreadcrumbs();

  // Inject Breadcrumb JSON-LD safely without window in render
  useEffect(() => {
    const existing = document.getElementById('breadcrumb-jsonld');
    if (existing) existing.remove();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://livescoresgames.netlify.app';
    const script = document.createElement('script');
    script.id = 'breadcrumb-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((b, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: b.label,
        item: b.href ? origin + b.href : undefined,
      })),
    });
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [activeTab, activeSport]);

  return (
    <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3" aria-label="breadcrumb">
      <ol className="flex items-center gap-2 text-sm flex-wrap">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={index} className="flex items-center gap-2">
            {index === 0 ? (
              <a
                href={breadcrumb.href}
                onClick={(event) => {
                  if (!onNavigate || !breadcrumb.href) return;
                  event.preventDefault();
                  onNavigate(breadcrumb.href);
                }}
                className="flex items-center gap-1 text-gray-400 hover:text-[#00d4ff] transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>{breadcrumb.label}</span>
              </a>
            ) : (
              <>
                <ChevronRight className="w-4 h-4 text-gray-600" />
                {breadcrumb.href ? (
                  <a
                    href={breadcrumb.href}
                    onClick={(event) => {
                      if (!onNavigate) return;
                      event.preventDefault();
                      onNavigate(breadcrumb.href!);
                    }}
                    className="text-gray-400 hover:text-[#00d4ff] transition-colors"
                  >
                    {breadcrumb.label}
                  </a>
                ) : (
                  <span className="text-[#00d4ff] font-medium">{breadcrumb.label}</span>
                )}
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
