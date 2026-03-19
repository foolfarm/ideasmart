import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import CookieBanner from "./components/CookieBanner";
import PWAInstallBanner from "./components/PWAInstallBanner";

// ─── Caricamento critico (above-the-fold) ─────────────────────────────────────
// Home è la pagina più visitata: caricamento sincrono per LCP ottimale
import Home from "./pages/Home";

// ─── Skeleton loader generico per le pagine lazy ──────────────────────────────
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#faf8f3] animate-pulse">
      <div className="h-12 bg-[#1a1a2e]/10 w-full" />
      <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-6">
        <div className="h-8 bg-[#1a1a2e]/10 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-[#1a1a2e]/10 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Pagine sezione (lazy — caricate solo quando l'utente naviga) ─────────────
const AiHome = lazy(() => import("./pages/AiHome"));
const MusicHome = lazy(() => import("./pages/MusicHome"));
const StartupHome = lazy(() => import("./pages/StartupHome"));
const FinanceHome = lazy(() => import("./pages/FinanceHome"));
const HealthHome = lazy(() => import("./pages/HealthHome"));
const SportHome = lazy(() => import("./pages/SportHome"));
const LuxuryHome = lazy(() => import("./pages/LuxuryHome"));
const NewsHome = lazy(() => import("./pages/NewsHome"));
const MotoriHome = lazy(() => import("./pages/MotoriHome"));
const TennisHome = lazy(() => import("./pages/TennisHome"));
const BasketHome = lazy(() => import("./pages/BasketHome"));
const GossipHome = lazy(() => import("./pages/GossipHome"));
const CybersecurityHome = lazy(() => import("./pages/CybersecurityHome"));
const SondaggiHome = lazy(() => import("./pages/SondaggiHome"));

// ─── Pagine articolo (lazy) ───────────────────────────────────────────────────
const NewsArticle = lazy(() => import("./pages/NewsArticle"));
const MusicNewsArticle = lazy(() => import("./pages/MusicNewsArticle"));
const StartupNewsArticle = lazy(() => import("./pages/StartupNewsArticle"));
const GenericNewsArticle = lazy(() => import("./pages/GenericNewsArticle"));
const EditorialDetail = lazy(() => import("./pages/EditorialDetail"));
const ReportageDetail = lazy(() => import("./pages/ReportageDetail"));
const MarketAnalysisDetail = lazy(() => import("./pages/MarketAnalysisDetail"));
const StartupOfDayDetail = lazy(() => import("./pages/StartupOfDayDetail"));

// ─── Pagine statiche / admin (lazy) ──────────────────────────────────────────
const Admin = lazy(() => import("./pages/Admin"));
const AdminNewsletterPerformance = lazy(() => import("./pages/AdminNewsletterPerformance"));
const AuditDashboard = lazy(() => import("./pages/AuditDashboard"));
const AdminRssMonitor = lazy(() => import("./pages/AdminRssMonitor"));
const AdminSendgridStats = lazy(() => import("./pages/AdminSendgridStats"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const NotificationPreferences = lazy(() => import("./pages/NotificationPreferences"));
const Advertise = lazy(() => import("./pages/Advertise"));
const Edicola = lazy(() => import("./pages/Edicola"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Manifesto = lazy(() => import("./pages/Manifesto"));
const ChannelPreferences = lazy(() => import("./pages/ChannelPreferences"));
const Business = lazy(() => import("./pages/Business"));
const ChiSiamo = lazy(() => import("./pages/ChiSiamo"));

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<PageSkeleton />}>
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
    </Suspense>
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
