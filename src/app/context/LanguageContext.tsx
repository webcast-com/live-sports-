import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'sw' | 'fr' | 'pt' | 'de';

interface Translations {
  [key: string]: Record<Language, string>;
}

// Phase 5: 5 languages
const translations: Translations = {
  'nav.liveScores': { en: 'Live Scores', sw: 'Matokeo ya Moja kwa Moja', fr: 'Scores en Direct', pt: 'Placar ao Vivo', de: 'Live Scores' },
  'nav.predictions': { en: 'Predictions', sw: 'Utabiri', fr: 'Prédictions', pt: 'Previsões', de: 'Vorhersagen' },
  'nav.results': { en: 'Results', sw: 'Matokeo', fr: 'Résultats', pt: 'Resultados', de: 'Ergebnisse' },
  'nav.sureBets': { en: 'Sure Bets', sw: 'Bet Uhakika', fr: 'Paris Sûrs', pt: 'Apostas Certeiras', de: 'Sichere Wetten' },
  'nav.premium': { en: 'Premium', sw: 'Premium', fr: 'Premium', pt: 'Premium', de: 'Premium' },
  'nav.search.placeholder': { en: 'Search teams, matches, leagues...', sw: 'Tafuta timu, mechi, ligi...', fr: 'Rechercher équipes, matchs, ligues...', pt: 'Buscar times, partidas, ligas...', de: 'Teams, Spiele, Ligen suchen...' },
  'nav.signIn': { en: 'Sign In', sw: 'Ingia', fr: 'Se Connecter', pt: 'Entrar', de: 'Anmelden' },
  'nav.referral': { en: 'Refer & Earn', sw: 'Alika & Pata', fr: 'Parrainer & Gagner', pt: 'Indique e Ganhe', de: 'Empfehlen & Verdienen' },

  'dashboard.title': { en: 'Live Scores', sw: 'Matokeo ya Moja kwa Moja', fr: 'Scores en Direct', pt: 'Placar ao Vivo', de: 'Live Scores' },
  'dashboard.premium.title': { en: 'Premium Predictions', sw: 'Utabiri wa Premium', fr: 'Prédictions Premium', pt: 'Previsões Premium', de: 'Premium Vorhersagen' },
  'dashboard.premium.desc': { en: 'Get expert picks, live API-powered predictions, and deeper match insights for just KSh 100.', sw: 'Pata chaguo za wataalamu, utabiri wa moja kwa moja, na maarifa zaidi kwa KSh 100 tu.', fr: 'Obtenez des picks d\'experts, prédictions en direct et analyses pour seulement KSh 100.', pt: 'Obtenha palpites de especialistas, previsões ao vivo por apenas KSh 100.', de: 'Erhalte Experten-Tipps, Live-Vorhersagen für nur KSh 100.' },
  'dashboard.premium.cta': { en: 'Unlock Premium', sw: 'Fungua Premium', fr: 'Débloquer Premium', pt: 'Desbloquear Premium', de: 'Premium Freischalten' },

  'sport.all': { en: 'All Sports', sw: 'Michezo Yote', fr: 'Tous Sports', pt: 'Todos Esportes', de: 'Alle Sportarten' },
  'sport.football': { en: 'Football', sw: 'Soka la Kimarekani', fr: 'Football Américain', pt: 'Futebol Americano', de: 'American Football' },
  'sport.basketball': { en: 'Basketball', sw: 'Mpira wa Kikapu', fr: 'Basketball', pt: 'Basquete', de: 'Basketball' },
  'sport.soccer': { en: 'Soccer', sw: 'Soka', fr: 'Football', pt: 'Futebol', de: 'Fußball' },
  'sport.baseball': { en: 'Baseball', sw: 'Baseball', fr: 'Baseball', pt: 'Beisebol', de: 'Baseball' },
  'sport.tennis': { en: 'Tennis', sw: 'Tennis', fr: 'Tennis', pt: 'Tênis', de: 'Tennis' },

  'action.search': { en: 'Search', sw: 'Tafuta', fr: 'Rechercher', pt: 'Buscar', de: 'Suchen' },
  'action.favorite': { en: 'Favorite', sw: 'Kipendwa', fr: 'Favori', pt: 'Favorito', de: 'Favorit' },
  'action.share': { en: 'Share', sw: 'Shiriki', fr: 'Partager', pt: 'Compartilhar', de: 'Teilen' },
  'action.comment': { en: 'Comment', sw: 'Maoni', fr: 'Commentaire', pt: 'Comentário', de: 'Kommentar' },

  'footer.tagline': { en: 'Your ultimate destination for live sports scores, stats, and breaking news.', sw: 'Mahali pa mwisho kwa matokeo ya moja kwa moja, takwimu, na habari muhimu za michezo.', fr: 'Votre destination ultime pour scores en direct, stats et actualités.', pt: 'Seu destino final para placar ao vivo, estatísticas e notícias.', de: 'Ihr ultimatives Ziel für Live-Scores, Statistiken und News.' },
  'footer.newsletter.title': { en: 'Never Miss a Score', sw: 'Usikose Matokeo', fr: 'Ne Manquez Jamais un Score', pt: 'Nunca Perca um Gol', de: 'Verpassen Sie keinen Score' },
  'footer.newsletter.desc': { en: 'Get live score alerts and breaking sports news delivered to your inbox.', sw: 'Pata arifa za matokeo na habari muhimu za michezo kwenye barua pepe yako.', fr: 'Recevez alertes scores en direct et actualités dans votre boîte mail.', pt: 'Receba alertas de placar e notícias no seu email.', de: 'Erhalten Sie Live-Score-Alarme und News per E-Mail.' },

  'premium.title': { en: 'Unlock Premium Access', sw: 'Fungua Ufikiaji wa Premium', fr: 'Débloquer Accès Premium', pt: 'Desbloquear Acesso Premium', de: 'Premium-Zugang Freischalten' },
  'premium.price': { en: 'KSh 100 / 24 hours', sw: 'KSh 100 / masaa 24', fr: 'KSh 100 / 24 heures', pt: 'KSh 100 / 24 horas', de: 'KSh 100 / 24 Stunden' },
  'premium.benefits.unlimited': { en: 'Unlimited predictions', sw: 'Utabiri usio na kikomo', fr: 'Prédictions illimitées', pt: 'Previsões ilimitadas', de: 'Unbegrenzte Vorhersagen' },
  'premium.benefits.live': { en: 'Live API-powered picks', sw: 'Chaguo za moja kwa moja', fr: 'Picks alimentés par API live', pt: 'Palpites ao vivo via API', de: 'Live API-Tipps' },
  'premium.benefits.support': { en: 'Priority support', sw: 'Msaada wa kipaumbele', fr: 'Support prioritaire', pt: 'Suporte prioritário', de: 'Prioritäts-Support' },

  'chat.title': { en: 'Match Chat', sw: 'Gumzo la Mechi', fr: 'Chat du Match', pt: 'Chat da Partida', de: 'Match Chat' },
  'chat.placeholder': { en: 'Type a message...', sw: 'Andika ujumbe...', fr: 'Tapez un message...', pt: 'Digite uma mensagem...', de: 'Nachricht eingeben...' },
  'chat.send': { en: 'Send', sw: 'Tuma', fr: 'Envoyer', pt: 'Enviar', de: 'Senden' },
  'chat.noMessages': { en: 'No messages yet. Be the first to comment!', sw: 'Hakuna ujumbe bado. Kuwa wa kwanza kutoa maoni!', fr: 'Pas encore de messages. Soyez le premier!', pt: 'Nenhuma mensagem ainda. Seja o primeiro!', de: 'Noch keine Nachrichten. Sei der Erste!' },
  'chat.signInToChat': { en: 'Sign in to join the chat', sw: 'Ingia ili ujiunge na gumzo', fr: 'Connectez-vous pour rejoindre le chat', pt: 'Entre para participar do chat', de: 'Anmelden um am Chat teilzunehmen' },

  'admin.title': { en: 'Admin Dashboard', sw: 'Dashibodi ya Msimamizi', fr: 'Tableau de Bord Admin', pt: 'Painel Admin', de: 'Admin Dashboard' },
  'admin.contacts': { en: 'Contact Messages', sw: 'Ujumbe wa Mawasiliano', fr: 'Messages de Contact', pt: 'Mensagens de Contato', de: 'Kontaktnachrichten' },
  'admin.payments': { en: 'Payment Logs', sw: 'Kumbukumbu za Malipo', fr: 'Journaux Paiement', pt: 'Registros Pagamento', de: 'Zahlungsprotokolle' },
  'admin.activity': { en: 'User Activity', sw: 'Shughuli za Mtumiaji', fr: 'Activité Utilisateur', pt: 'Atividade Usuário', de: 'Benutzeraktivität' },

  'referral.title': { en: 'Refer & Earn', sw: 'Alika Marafiki', fr: 'Parrainer & Gagner', pt: 'Indique e Ganhe', de: 'Empfehlen & Verdienen' },
  'referral.howItWorks': { en: 'How it Works', sw: 'Jinsi Inavyofanya Kazi', fr: 'Comment ça Marche', pt: 'Como Funciona', de: 'Wie es Funktioniert' },
  'referral.copy': { en: 'Copy Link', sw: 'Nakili Kiungo', fr: 'Copier Lien', pt: 'Copiar Link', de: 'Link Kopieren' },
  'referral.share': { en: 'Share', sw: 'Shiriki', fr: 'Partager', pt: 'Compartilhar', de: 'Teilen' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  toggleLanguage: () => void;
  languages: { code: Language; label: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const languagesList = [
  { code: 'en' as Language, label: 'English', flag: '🇬🇧' },
  { code: 'sw' as Language, label: 'Kiswahili', flag: '🇰🇪' },
  { code: 'fr' as Language, label: 'Français', flag: '🇫🇷' },
  { code: 'pt' as Language, label: 'Português', flag: '🇧🇷' },
  { code: 'de' as Language, label: 'Deutsch', flag: '🇩🇪' },
];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('scorehub_language') as Language | null;
    if (saved && ['en', 'sw', 'fr', 'pt', 'de'].includes(saved)) return saved;
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.includes('sw') || browserLang.includes('ke')) return 'sw';
    if (browserLang.startsWith('fr')) return 'fr';
    if (browserLang.startsWith('pt')) return 'pt';
    if (browserLang.startsWith('de')) return 'de';
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('scorehub_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) {
      if (import.meta.env.DEV) console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return entry[language] || entry.en;
  };

  const toggleLanguage = () => {
    // Cycle through languages: en -> sw -> fr -> pt -> de -> en
    const order: Language[] = ['en', 'sw', 'fr', 'pt', 'de'];
    const currentIndex = order.indexOf(language);
    const nextIndex = (currentIndex + 1) % order.length;
    setLanguage(order[nextIndex]);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage, languages: languagesList }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export { translations };
