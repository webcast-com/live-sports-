import { createBrowserRouter } from "react-router";
import AppLayout from "./components/sports/AppLayout";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import AccessibilityStatement from "./pages/AccessibilityStatement";
import HelpCenter from "./pages/HelpCenter";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Press from "./pages/Press";
import Contact from "./pages/Contact";
import Advertise from "./pages/Advertise";
import Partners from "./pages/Partners";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import { MatchDetail } from "./components/MatchDetail";

// Phase 5: Includes referral, admin, leaderboard, etc.

export const router = createBrowserRouter([
  { path: "/", Component: AppLayout },
  { path: "/sport/:sport", Component: AppLayout },
  { path: "/predictions", Component: AppLayout },
  { path: "/results", Component: AppLayout },
  { path: "/leaderboard", Component: AppLayout },
  { path: "/sure-bets", Component: AppLayout },
  { path: "/premium", Component: AppLayout },
  { path: "/settings", Component: AppLayout },
  { path: "/subscription", Component: AppLayout },
  { path: "/webhook", Component: AppLayout },
  { path: "/referral", Component: AppLayout }, // Phase 5
  { path: "/admin", Component: AppLayout }, // Phase 5 - now via AppLayout tab for consistency
  { path: "/match/:id", Component: MatchDetail },
  // Informational pages
  { path: "/about", Component: About },
  { path: "/careers", Component: Careers },
  { path: "/press", Component: Press },
  { path: "/contact", Component: Contact },
  { path: "/advertise", Component: Advertise },
  { path: "/partners", Component: Partners },
  { path: "/help", Component: HelpCenter },
  { path: "/terms", Component: TermsOfService },
  { path: "/privacy", Component: PrivacyPolicy },
  { path: "/cookies", Component: CookiePolicy },
  { path: "/accessibility", Component: AccessibilityStatement },
  // Direct access
  { path: "/admin-direct", Component: AdminDashboard },
  { path: "*", Component: NotFound },
]);
