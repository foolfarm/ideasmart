import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import CookieBanner from "./components/CookieBanner";
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
import GossipHome from "./pages/GossipHome";
import CybersecurityHome from "./pages/CybersecurityHome";
import SondaggiHome from "./pages/SondaggiHome";
import Admin from "./pages/Admin";
import AdminNewsletterPerformance from "./pages/AdminNewsletterPerformance";
import AuditDashboard from "./pages/AuditDashboard";
import AdminRssMonitor from "./pages/AdminRssMonitor";
import AdminSendgridStats from "./pages/AdminSendgridStats";
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
import GenericNewsArticle from "./pages/GenericNewsArticle";
import Business from "./pages/Business";
import ChiSiamo from "./pages/ChiSiamo";
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
      <Route path="/gossip" component={GossipHome} />
      <Route path="/cybersecurity" component={CybersecurityHome} />
      <Route path="/sondaggi" component={SondaggiHome} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/newsletter-performance" component={AdminNewsletterPerformance} />
      <Route path="/admin/rss-monitor" component={AdminRssMonitor} />
      <Route path="/admin/audit" component={AuditDashboard} />
      <Route path="/admin/sendgrid-stats" component={AdminSendgridStats} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/unsubscribe" component={Unsubscribe} />
      <Route path="/preferenze-newsletter" component={ChannelPreferences} />
      <Route path="/notifiche" component={NotificationPreferences} />
      <Route path="/advertise" component={Advertise} />
      <Route path="/business" component={Business} />
      <Route path="/edicola" component={Edicola} />
      <Route path="/ai/news/:id" component={NewsArticle} />
      <Route path="/music/news/:id" component={MusicNewsArticle} />
      <Route path="/startup/news/:id" component={StartupNewsArticle} />
      {/* Route generica per tutti i canali — deve stare DOPO le route specifiche */}
      <Route path="/:section/news/:id" component={GenericNewsArticle} />
      <Route path="/:section/editoriale/:id" component={EditorialDetail} />
      <Route path="/:section/reportage/:id" component={ReportageDetail} />
      <Route path="/:section/analisi/:id" component={MarketAnalysisDetail} />
      <Route path="/:section/spotlight/:id" component={StartupOfDayDetail} />
      <Route path="/chi-siamo" component={ChiSiamo} />
      <Route path="/manifesto" component={Manifesto} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
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
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
