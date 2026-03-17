import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import CookieBanner from "./components/CookieBanner";
import { useCookieConsent } from "./hooks/useCookieConsent";
import Home from "./pages/Home";
import AiHome from "./pages/AiHome";
import MusicHome from "./pages/MusicHome";
import StartupHome from "./pages/StartupHome";
import FinanceHome from "./pages/FinanceHome";
import HealthHome from "./pages/HealthHome";
import SportHome from "./pages/SportHome";
import LuxuryHome from "./pages/LuxuryHome";
import NewsHome from "./pages/NewsHome";
import MotoriHome from "./pages/MotoriHome";
import TennisHome from "./pages/TennisHome";
import BasketHome from "./pages/BasketHome";
import Admin from "./pages/Admin";
import AdminNewsletterPerformance from "./pages/AdminNewsletterPerformance";
import AuditDashboard from "./pages/AuditDashboard";
import AdminRssMonitor from "./pages/AdminRssMonitor";
import Privacy from "./pages/Privacy";
import Unsubscribe from "./pages/Unsubscribe";
import NotificationPreferences from "./pages/NotificationPreferences";
import Advertise from "./pages/Advertise";
import NewsArticle from "./pages/NewsArticle";
import MusicNewsArticle from "./pages/MusicNewsArticle";
import StartupNewsArticle from "./pages/StartupNewsArticle";
import EditorialDetail from "./pages/EditorialDetail";
import ReportageDetail from "./pages/ReportageDetail";
import MarketAnalysisDetail from "./pages/MarketAnalysisDetail";
import StartupOfDayDetail from "./pages/StartupOfDayDetail";
import Edicola from "./pages/Edicola";
import NotFound from "./pages/NotFound";
import Manifesto from "./pages/Manifesto";
import ChannelPreferences from "./pages/ChannelPreferences";
import PWAInstallBanner from "./components/PWAInstallBanner";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/ai" component={AiHome} />
      <Route path="/music" component={MusicHome} />
      <Route path="/startup" component={StartupHome} />
      <Route path="/finance" component={FinanceHome} />
      <Route path="/health" component={HealthHome} />
      <Route path="/sport" component={SportHome} />
      <Route path="/luxury" component={LuxuryHome} />
      <Route path="/news" component={NewsHome} />
      <Route path="/motori" component={MotoriHome} />
      <Route path="/tennis" component={TennisHome} />
      <Route path="/basket" component={BasketHome} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/newsletter-performance" component={AdminNewsletterPerformance} />
      <Route path="/admin/rss-monitor" component={AdminRssMonitor} />
      <Route path="/admin/audit" component={AuditDashboard} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/unsubscribe" component={Unsubscribe} />
      <Route path="/preferenze-newsletter" component={ChannelPreferences} />
      <Route path="/notifiche" component={NotificationPreferences} />
      <Route path="/advertise" component={Advertise} />
      <Route path="/edicola" component={Edicola} />
      <Route path="/ai/news/:id" component={NewsArticle} />
      <Route path="/music/news/:id" component={MusicNewsArticle} />
      <Route path="/startup/news/:id" component={StartupNewsArticle} />
      <Route path="/:section/editoriale/:id" component={EditorialDetail} />
      <Route path="/:section/reportage/:id" component={ReportageDetail} />
      <Route path="/:section/analisi/:id" component={MarketAnalysisDetail} />
      <Route path="/:section/spotlight/:id" component={StartupOfDayDetail} />
      <Route path="/manifesto" component={Manifesto} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * Gestisce il caricamento condizionale di Google AdSense
 * in base al consenso ai cookie pubblicitari
 */
function AdSenseManager() {
  const { consent, hasDecided } = useCookieConsent();

  useEffect(() => {
    if (!hasDecided) return;
    const scriptId = "google-adsense-script";
    const existing = document.getElementById(scriptId);

    if (consent?.advertising) {
      // Carica AdSense solo se l'utente ha accettato i cookie pubblicitari
      if (!existing) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.async = true;
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7185482526978993";
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);
      }
    } else {
      // Rimuovi AdSense se l'utente ha rifiutato
      if (existing) existing.remove();
    }
  }, [consent, hasDecided]);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <CookieBanner />
          <PWAInstallBanner />
          <AdSenseManager />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
