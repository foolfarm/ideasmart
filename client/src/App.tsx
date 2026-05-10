import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Redirect } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import CookieBanner from "./components/CookieBanner";
import PWAInstallBanner from "./components/PWAInstallBanner";
import MobileBottomNav from "./components/MobileBottomNav";
import BreakingNewsTicker from "./components/BreakingNewsTicker";

// ─── Caricamento critico (above-the-fold) ─────────────────────────────────────
// Home è la pagina più visitata: caricamento sincrono per LCP ottimale
import Home from "./pages/Home";

// ─── Skeleton loader generico per le pagine lazy ──────────────────────────────
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#ffffff] animate-pulse">
      <div className="h-12 bg-[#1a1a1a]/10 w-full" />
      <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-6">
        <div className="h-8 bg-[#1a1a1a]/10 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-[#1a1a1a]/10 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Pagine sezione (lazy — caricate solo quando l'utente naviga) ─────────────
const AiHome = lazy(() => import("./pages/AiHome"));
const StartupHome = lazy(() => import("./pages/StartupHome"));
const DealroomHome = lazy(() => import("./pages/DealroomHome"));
const Research = lazy(() => import("./pages/Research"));
const ResearchDetail = lazy(() => import("./pages/ResearchDetail"));
const Verify = lazy(() => import("./pages/Verify"));
const ProofPressVerify = lazy(() => import("./pages/ProofPressVerify"));
const VerifyAgent = lazy(() => import("./pages/VerifyAgent"));
const VerifyPricing = lazy(() => import("./pages/VerifyPricing"));
const VerifyBusiness = lazy(() => import("./pages/VerifyBusiness"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const NewsVerify = lazy(() => import("./pages/NewsVerify"));
const InfoVerify = lazy(() => import("./pages/InfoVerify"));
const EmailVerify = lazy(() => import("./pages/EmailVerify"));

// ─── Pagine articolo (lazy) ───────────────────────────────────────────────────
const NewsArticle = lazy(() => import("./pages/NewsArticle"));
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
const AdminSystemHealth = lazy(() => import("./pages/AdminSystemHealth"));
const AdminNewsletterContent = lazy(() => import("./pages/AdminNewsletterContent"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const NotificationPreferences = lazy(() => import("./pages/NotificationPreferences"));
const Advertise = lazy(() => import("./pages/Advertise"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ChannelPreferences = lazy(() => import("./pages/ChannelPreferences"));
const Business = lazy(() => import("./pages/Business"));
const Offerta = lazy(() => import("./pages/Offerta"));
const OffertaCreator = lazy(() => import("./pages/OffertaCreator"));
const PreventivoCreator = lazy(() => import("./pages/PreventivoCreator"));
const PreventivoNewsVerify = lazy(() => import("./pages/PreventivoNewsVerify"));
const PreventivoInfoVerify = lazy(() => import("./pages/PreventivoInfoVerify"));
const PreventivoEmailVerify = lazy(() => import("./pages/PreventivoEmailVerify"));
const OffertaEditori = lazy(() => import("./pages/OffertaEditori"));
const OffertaAziende = lazy(() => import("./pages/OffertaAziende"));
const ChiSiamo = lazy(() => import("./pages/ChiSiamo"));
const PerGiornalisti = lazy(() => import("./pages/PerGiornalisti"));
const NewsletterAgentica = lazy(() => import("./pages/NewsletterAgentica"));
const Tecnologia = lazy(() => import("./pages/Tecnologia"));
const TrustScore = lazy(() => import("./pages/TrustScore"));
const AndreaCinelli = lazy(() => import("./pages/AndreaCinelli"));
const OsservatorioTech = lazy(() => import("./pages/OsservatorioTech"));
const BaseAlpha = lazy(() => import("./pages/BaseAlpha"));
const CentroStudi = lazy(() => import("./pages/CentroStudi"));
const Abbonamenti = lazy(() => import("./pages/Abbonamenti"));
const Registrati = lazy(() => import("./pages/Registrati"));
const Accedi = lazy(() => import("./pages/Accedi"));
const VerificaEmail = lazy(() => import("./pages/VerificaEmail"));
const Account = lazy(() => import("./pages/Account"));
const DemoSandwichClub = lazy(() => import("./pages/DemoSandwichClub"));
const EditorialVSI = lazy(() => import("./pages/EditorialVSI"));
const Dealflow = lazy(() => import("./pages/Dealflow"));
const SubmitTool = lazy(() => import("./pages/SubmitTool"));
const AdminToolsFeedback = lazy(() => import("./pages/AdminToolsFeedback"));
const AdminLeads = lazy(() => import("./pages/AdminLeads"));
const AdminAlertLog = lazy(() => import("./pages/AdminAlertLog"));
const AdminAmazonDeals = lazy(() => import("./pages/AdminAmazonDeals"));
const AdminPubblicita = lazy(() => import("./pages/AdminPubblicita"));
const AdminPromoNewsletter = lazy(() => import("./pages/AdminPromoNewsletter"));
const AdminJournalists = lazy(() => import("./pages/AdminJournalists"));
const AdminVerify = lazy(() => import("./pages/AdminVerify"));
const EbookPrompt = lazy(() => import("./pages/EbookPrompt"));
const NewsletterFeedback = lazy(() => import("./pages/NewsletterFeedback"));

// ─── Nuovi canali "AI Operating System" ──────────────────────────────────────
const StartHere = lazy(() => import("./pages/StartHere"));
const CopyPasteAI = lazy(() => import("./pages/CopyPasteAI"));
const AutomateWithAI = lazy(() => import("./pages/AutomateWithAI"));
const MakeMoneyWithAI = lazy(() => import("./pages/MakeMoneyWithAI"));
const DailyAITools = lazy(() => import("./pages/DailyAITools"));
const VerifiedAINews = lazy(() => import("./pages/VerifiedAINews"));
const AIOpportunities = lazy(() => import("./pages/AIOpportunities"));
const PromptLibraryLanding = lazy(() => import("./pages/PromptLibraryLanding"));
const PubblicitaPage = lazy(() => import("./pages/PubblicitaPage"));
const ChiSiamoStory = lazy(() => import("./pages/ChiSiamoStory"));
const Storia = lazy(() => import("./pages/Storia"));
const Piattaforma = lazy(() => import("./pages/Piattaforma"));
const Pianificazione = lazy(() => import("./pages/Pianificazione"));
const Investor = lazy(() => import("./pages/Investor"));
const NewsletterView = lazy(() => import("./pages/NewsletterView"));
const CosaFacciamo = lazy(() => import("./pages/CosaFacciamo"));
const VerifyReport = lazy(() => import("./pages/VerifyReport"));
const VerifyDemo = lazy(() => import("./pages/VerifyDemo"));
const Contatti = lazy(() => import("./pages/Contatti"));
const ScriviPerNoi = lazy(() => import("./pages/ScriviPerNoi"));
const JournalistPortal = lazy(() => import("./pages/JournalistPortal"));
const Methodology = lazy(() => import("./pages/Methodology"));
// ProofPress Verify SaaS
const VerifyDashboard = lazy(() => import("./pages/verify/Dashboard"));
const VerifyJoin = lazy(() => import("./pages/verify/Join"));
const VerifyRegistry = lazy(() => import("./pages/VerifyRegistry"));

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/ai" component={AiHome} />
        <Route path="/startup" component={StartupHome} />
        <Route path="/dealroom" component={DealroomHome} />
        <Route path="/admin/newsletter-performance" component={AdminNewsletterPerformance} />
        <Route path="/admin/rss-monitor" component={AdminRssMonitor} />
        <Route path="/admin/audit" component={AuditDashboard} />
        <Route path="/admin/sendgrid-stats" component={AdminSendgridStats} />
        <Route path="/admin/system-health" component={AdminSystemHealth} />
        <Route path="/admin/newsletter-content" component={AdminNewsletterContent} />
        <Route path="/admin/tools-feedback" component={AdminToolsFeedback} />
        <Route path="/admin/leads" component={AdminLeads} />
        <Route path="/admin/alert-log" component={AdminAlertLog} />
        <Route path="/admin/amazon-deals" component={AdminAmazonDeals} />
        <Route path="/admin/pubblicita" component={AdminPubblicita} />
        <Route path="/admin/promo-newsletter" component={AdminPromoNewsletter} />
        <Route path="/admin/journalists" component={AdminJournalists} />
        <Route path="/admin/verify" component={AdminVerify} />
        <Route path="/admin" component={Admin} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/unsubscribe" component={Unsubscribe} />
        <Route path="/preferenze-newsletter" component={ChannelPreferences} />
        <Route path="/notifiche" component={NotificationPreferences} />
        <Route path="/advertise" component={Advertise} />
        <Route path="/research/:id" component={ResearchDetail} />
        <Route path="/research" component={Research} />
        {/* /verify e /proofpress-verify reindirizzano al sito ufficiale proofpressverify.com */}
        <Route path="/verify">{() => { window.location.href = 'https://proofpressverify.com'; return null; }}</Route>
        <Route path="/proofpress-verify">{() => { window.location.href = 'https://proofpressverify.com'; return null; }}</Route>
        <Route path="/proofpress-verify/news">{() => { window.location.href = 'https://proofpressverify.com'; return null; }}</Route>
        <Route path="/proofpress-verify/info">{() => { window.location.href = 'https://proofpressverify.com'; return null; }}</Route>
        <Route path="/proofpress-verify/email">{() => { window.location.href = 'https://proofpressverify.com'; return null; }}</Route>
        <Route path="/verify-agent" component={VerifyAgent} />
        <Route path="/verify-pricing" component={VerifyPricing} />
        <Route path="/verify-business" component={VerifyBusiness} />
        <Route path="/verify-email" component={VerifyEmail} />
        {/* Route specifiche /verify/* DEVONO stare PRIMA di /verify/:cid */}
        <Route path="/verify/dashboard" component={VerifyDashboard} />
        <Route path="/verify/join" component={VerifyJoin} />
        <Route path="/verify/registry" component={VerifyRegistry} />
        <Route path="/verify/demo" component={VerifyDemo} />
        {/* Redirect /verify/admin → /admin/verify per evitare cattura da /verify/:cid */}
        <Route path="/verify/admin">{() => <Redirect to="/admin/verify" />}</Route>
        {/* Route generica /verify/:cid — cattura hash/CID, DEVE stare DOPO le route specifiche */}
        <Route path="/verify/:cid" component={VerifyReport} />
        <Route path="/andrea-cinelli" component={AndreaCinelli} />
        <Route path="/osservatorio-tech" component={OsservatorioTech} />
        <Route path="/base-alpha" component={BaseAlpha} />
        <Route path="/centro-studi" component={CentroStudi} />
        <Route path="/abbonamenti" component={Abbonamenti} />
        <Route path="/pianificazione" component={Pianificazione} />
        <Route path="/ai/news/:id" component={NewsArticle} />
        <Route path="/startup/news/:id" component={StartupNewsArticle} />
        {/* Route generica per tutti i canali — deve stare DOPO le route specifiche */}
        <Route path="/:section/news/:id" component={GenericNewsArticle} />
        <Route path="/:section/editoriale/:id" component={EditorialDetail} />
        <Route path="/:section/reportage/:id" component={ReportageDetail} />
        <Route path="/:section/analisi/:id" component={MarketAnalysisDetail} />
        <Route path="/:section/spotlight/:id" component={StartupOfDayDetail} />
        <Route path="/chi-siamo" component={ChiSiamo} />
        <Route path="/offerta" component={Offerta} />
        <Route path="/offerta/creator">{() => { window.location.replace('/offertacommerciale'); return null; }}</Route>
        <Route path="/preventivo-creator" component={PreventivoCreator} />
        <Route path="/preventivo-news-verify" component={PreventivoNewsVerify} />
        <Route path="/preventivo-info-verify" component={PreventivoInfoVerify} />
        <Route path="/preventivo-email-verify" component={PreventivoEmailVerify} />
        <Route path="/offerta/editori" component={OffertaEditori} />
        <Route path="/offerta/aziende" component={OffertaAziende} />
        <Route path="/offertacommerciale" component={PerGiornalisti} />
        <Route path="/newsletter-agentica" component={NewsletterAgentica} />
        <Route path="/tecnologia" component={Tecnologia} />
        <Route path="/trust-score" component={TrustScore} />
        <Route path="/piattaforma" component={Piattaforma} />
        <Route path="/investor" component={Investor} />
        <Route path="/account" component={Account} />
        <Route path="/registrati" component={Registrati} />
        <Route path="/accedi" component={Accedi} />
        <Route path="/demo/sandwichclub" component={DemoSandwichClub} />
        {/* /demo senza path specifico → redirect esterno proofpress.tech */}
        <Route path="/demo">{() => { window.location.replace("https://proofpress.tech/"); return null; }}</Route>
        <Route path="/dealflow" component={Dealflow} />
        <Route path="/editoriale/venture-studio-index" component={EditorialVSI} />
        <Route path="/start-here" component={StartHere} />
        <Route path="/copy-paste-ai" component={CopyPasteAI} />
        <Route path="/prompt-library" component={PromptLibraryLanding} />
        <Route path="/automate-with-ai" component={AutomateWithAI} />
        <Route path="/make-money-with-ai" component={MakeMoneyWithAI} />
        <Route path="/daily-ai-tools" component={DailyAITools} />
        <Route path="/verified-ai-news" component={VerifiedAINews} />
        <Route path="/ai-opportunities" component={AIOpportunities} />
        <Route path="/submit-tool" component={SubmitTool} />
        <Route path="/ebook/prompt-2026" component={EbookPrompt} />
        <Route path="/newsletter/:id" component={NewsletterView} />
        <Route path="/newsletter-feedback" component={NewsletterFeedback} />
        <Route path="/pubblicita" component={PubblicitaPage} />
        <Route path="/chi-siamo-story" component={ChiSiamoStory} />
        <Route path="/storia" component={Storia} />
        <Route path="/cosa-facciamo" component={CosaFacciamo} />
        <Route path="/contatti" component={Contatti} />
        <Route path="/scrivi-per-noi" component={ScriviPerNoi} />
        <Route path="/journalist-portal" component={JournalistPortal} />
        <Route path="/methodology/v1" component={Methodology} />
        <Route path="/verifica-email" component={VerificaEmail} />
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
          <BreakingNewsTicker />
          <Toaster />
          <Router />
          <MobileBottomNav />
          <CookieBanner />
          <PWAInstallBanner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
