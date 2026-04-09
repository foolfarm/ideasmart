/**
 * RSS Sources Whitelist — Proof Press
 * ─────────────────────────────────────────────────────────────────────────────
 * 250 fonti certificate con feed RSS verificati per le cinque sezioni:
 *   1. Startup e innovazione in Italia
 *   2. AI / Machine Learning / DeepTech
 *   3. Venture Capital / Investimenti Startup
 *   4. Tecnologia / Innovazione Globale
 *   5. Musica Rock / Indie / Alternative
 *
 * Aggiornato 15 Mar 2026: integrazione completa 250 feed RSS da lista curata.
 * Nessuna notizia viene inventata: tutto deriva da feed RSS reali.
 */
export interface RssSource {
  name: string;
  homepage: string;
  feedUrl: string;
  section: "ai" | "startup" | "health" | "news" | "dealroom" | "dealroom";
  language: "it" | "en";
  priority: number;
  tags?: string[];
}

// ─── 1. AI / Machine Learning / DeepTech ─────────────────────────────────────
export const AI_SOURCES: RssSource[] = [
  // Fonti AI principali (da lista 1 e lista 2)
  { name: "OpenAI Blog", homepage: "https://openai.com", feedUrl: "https://openai.com/blog/rss", section: "ai", language: "en", priority: 1 },
  { name: "OpenAI News", homepage: "https://openai.com", feedUrl: "https://openai.com/news/rss", section: "ai", language: "en", priority: 1 },
  { name: "DeepMind Blog", homepage: "https://deepmind.google", feedUrl: "https://deepmind.google/blog/rss.xml", section: "ai", language: "en", priority: 1 },
  { name: "MarkTechPost", homepage: "https://www.marktechpost.com", feedUrl: "https://www.marktechpost.com/feed", section: "ai", language: "en", priority: 2 },
  { name: "Unite.AI", homepage: "https://www.unite.ai", feedUrl: "https://www.unite.ai/feed", section: "ai", language: "en", priority: 2 },
  { name: "VentureBeat AI", homepage: "https://venturebeat.com", feedUrl: "https://venturebeat.com/category/ai/feed", section: "ai", language: "en", priority: 1 },
  { name: "VentureBeat AI (alt)", homepage: "https://venturebeat.com", feedUrl: "https://venturebeat.com/ai/feed", section: "ai", language: "en", priority: 1 },
  { name: "Synced Review", homepage: "https://syncedreview.com", feedUrl: "https://syncedreview.com/feed", section: "ai", language: "en", priority: 2 },
  { name: "Analytics Vidhya", homepage: "https://www.analyticsvidhya.com", feedUrl: "https://www.analyticsvidhya.com/feed", section: "ai", language: "en", priority: 2 },
  { name: "Machine Learning Mastery", homepage: "https://machinelearningmastery.com", feedUrl: "https://machinelearningmastery.com/blog/feed", section: "ai", language: "en", priority: 2 },
  { name: "KDnuggets", homepage: "https://www.kdnuggets.com", feedUrl: "https://www.kdnuggets.com/feed", section: "ai", language: "en", priority: 2 },
  { name: "AI News", homepage: "https://www.artificialintelligence-news.com", feedUrl: "https://www.artificialintelligence-news.com/feed", section: "ai", language: "en", priority: 1 },
  { name: "AI News (alt)", homepage: "https://artificialintelligence-news.com", feedUrl: "https://artificialintelligence-news.com/feed", section: "ai", language: "en", priority: 1 },
  { name: "Google AI Blog", homepage: "https://ai.googleblog.com", feedUrl: "https://ai.googleblog.com/feeds/posts/default", section: "ai", language: "en", priority: 1 },
  { name: "Google Research Blog", homepage: "https://research.google", feedUrl: "https://research.google/blog/rss", section: "ai", language: "en", priority: 1 },
  { name: "NVIDIA AI Blog", homepage: "https://blogs.nvidia.com", feedUrl: "https://blogs.nvidia.com/blog/category/ai/feed", section: "ai", language: "en", priority: 1 },
  { name: "InfoQ AI/ML", homepage: "https://www.infoq.com", feedUrl: "https://www.infoq.com/ai-ml/feed", section: "ai", language: "en", priority: 2 },
  { name: "HuggingFace Blog", homepage: "https://huggingface.co", feedUrl: "https://huggingface.co/blog/feed.xml", section: "ai", language: "en", priority: 1 },
  { name: "Towards Data Science", homepage: "https://towardsdatascience.com", feedUrl: "https://towardsdatascience.com/feed", section: "ai", language: "en", priority: 2 },
  { name: "Wired AI", homepage: "https://www.wired.com", feedUrl: "https://www.wired.com/tag/artificial-intelligence/rss", section: "ai", language: "en", priority: 1 },
  { name: "The Verge AI", homepage: "https://www.theverge.com", feedUrl: "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml", section: "ai", language: "en", priority: 1 },
  { name: "TechBuzz AI", homepage: "https://www.techbuzz.ai", feedUrl: "https://www.techbuzz.ai/api/rss/articles", section: "ai", language: "en", priority: 2 },
  // Lista 2 — AI/DeepTech/Research
  { name: "MIT Technology Review", homepage: "https://www.technologyreview.com", feedUrl: "https://www.technologyreview.com/feed", section: "ai", language: "en", priority: 1 },
  { name: "MIT Tech Review AI", homepage: "https://www.technologyreview.com", feedUrl: "https://www.technologyreview.com/topic/artificial-intelligence/feed", section: "ai", language: "en", priority: 1 },
  { name: "AI Weekly", homepage: "https://aiweekly.co", feedUrl: "https://aiweekly.co/rss", section: "ai", language: "en", priority: 2 },
  { name: "Last Week in AI", homepage: "https://lastweekin.ai", feedUrl: "https://lastweekin.ai/feed", section: "ai", language: "en", priority: 2 },
  { name: "LessWrong", homepage: "https://www.lesswrong.com", feedUrl: "https://www.lesswrong.com/feed.xml", section: "ai", language: "en", priority: 3, tags: ["research"] },
  { name: "Distill.pub", homepage: "https://distill.pub", feedUrl: "https://distill.pub/rss.xml", section: "ai", language: "en", priority: 2, tags: ["research"] },
  { name: "Anthropic News", homepage: "https://www.anthropic.com", feedUrl: "https://www.anthropic.com/news/rss.xml", section: "ai", language: "en", priority: 1 },
  { name: "Stability AI", homepage: "https://stability.ai", feedUrl: "https://stability.ai/blog/rss", section: "ai", language: "en", priority: 2 },
  { name: "Meta AI Blog", homepage: "https://ai.facebook.com", feedUrl: "https://ai.facebook.com/blog/rss", section: "ai", language: "en", priority: 2 },
  { name: "Apple ML Research", homepage: "https://machinelearning.apple.com", feedUrl: "https://machinelearning.apple.com/rss.xml", section: "ai", language: "en", priority: 2 },
  { name: "Microsoft Research", homepage: "https://www.microsoft.com/en-us/research", feedUrl: "https://www.microsoft.com/en-us/research/feed", section: "ai", language: "en", priority: 2 },
  { name: "Papers With Code", homepage: "https://paperswithcode.com", feedUrl: "https://paperswithcode.com/rss", section: "ai", language: "en", priority: 2, tags: ["research"] },
  { name: "Towards AI", homepage: "https://towardsai.net", feedUrl: "https://towardsai.net/feed", section: "ai", language: "en", priority: 2 },
  { name: "The Algorithmic Bridge", homepage: "https://thealgorithmicbridge.substack.com", feedUrl: "https://thealgorithmicbridge.substack.com/feed", section: "ai", language: "en", priority: 2 },
  { name: "Analytics India Magazine", homepage: "https://analyticsindiamag.com", feedUrl: "https://analyticsindiamag.com/feed", section: "ai", language: "en", priority: 2 },
  { name: "The Decoder", homepage: "https://the-decoder.com", feedUrl: "https://the-decoder.com/feed", section: "ai", language: "en", priority: 1 },
  { name: "Datanami", homepage: "https://www.datanami.com", feedUrl: "https://www.datanami.com/feed", section: "ai", language: "en", priority: 2 },
  { name: "Inside Big Data", homepage: "https://insidebigdata.com", feedUrl: "https://insidebigdata.com/feed", section: "ai", language: "en", priority: 3 },
  { name: "AI Trends", homepage: "https://www.aitrends.com", feedUrl: "https://www.aitrends.com/feed", section: "ai", language: "en", priority: 2 },
  // Italiani AI/Tech
  { name: "Il Sole 24 Ore Tecnologia", homepage: "https://www.ilsole24ore.com", feedUrl: "https://www.ilsole24ore.com/rss/tecnologia.xml", section: "ai", language: "it", priority: 1 },
  { name: "Agenda Digitale", homepage: "https://www.agendadigitale.eu", feedUrl: "https://www.agendadigitale.eu/feed", section: "ai", language: "it", priority: 1 },
  { name: "Wired Italia", homepage: "https://www.wired.it", feedUrl: "https://www.wired.it/feed", section: "ai", language: "it", priority: 1 },
  { name: "Corriere Comunicazioni", homepage: "https://www.corrierecomunicazioni.it", feedUrl: "https://www.corrierecomunicazioni.it/feed", section: "ai", language: "it", priority: 2 },
  { name: "Digital4.biz", homepage: "https://www.digital4.biz", feedUrl: "https://www.digital4.biz/feed", section: "ai", language: "it", priority: 2 },
  { name: "Innovation Post", homepage: "https://www.innovationpost.it", feedUrl: "https://www.innovationpost.it/feed", section: "ai", language: "it", priority: 2 },
  { name: "Industry 4 Business", homepage: "https://www.industry4business.it", feedUrl: "https://www.industry4business.it/feed", section: "ai", language: "it", priority: 2 },
  { name: "Forbes Italia", homepage: "https://forbes.it", feedUrl: "https://forbes.it/feed", section: "ai", language: "it", priority: 1 },
  { name: "Repubblica Tecnologia", homepage: "https://www.repubblica.it", feedUrl: "https://www.repubblica.it/rss/tecnologia/rss2.0.xml", section: "ai", language: "it", priority: 2 },
  { name: "Tom's Hardware Italia", homepage: "https://www.tomshw.it", feedUrl: "https://www.tomshw.it/feed", section: "ai", language: "it", priority: 2 },
  { name: "Punto Informatico", homepage: "https://www.punto-informatico.it", feedUrl: "https://www.punto-informatico.it/feed", section: "ai", language: "it", priority: 2 },
  { name: "Tech Princess", homepage: "https://www.techprincess.it", feedUrl: "https://www.techprincess.it/feed", section: "ai", language: "it", priority: 3 },
  // Nuove fonti italiane AI/Tech (da lista 15 Mar 2026)
  { name: "AI4Business", homepage: "https://www.ai4business.it", feedUrl: "https://www.ai4business.it/feed", section: "ai", language: "it", priority: 1 },
  { name: "BigData4Innovation", homepage: "https://www.bigdata4innovation.it", feedUrl: "https://www.bigdata4innovation.it/feed", section: "ai", language: "it", priority: 2 },
  { name: "HDBlog", homepage: "https://www.hdblog.it", feedUrl: "https://www.hdblog.it/feed", section: "ai", language: "it", priority: 2 },
  { name: "SmartWorld", homepage: "https://www.smartworld.it", feedUrl: "https://www.smartworld.it/feed", section: "ai", language: "it", priority: 2 },
  { name: "WebNews", homepage: "https://www.webnews.it", feedUrl: "https://www.webnews.it/feed", section: "ai", language: "it", priority: 2 },
  { name: "Cybersecurity360", homepage: "https://www.cybersecurity360.it", feedUrl: "https://www.cybersecurity360.it/feed", section: "ai", language: "it", priority: 1 },
  { name: "SecurityOpenLab", homepage: "https://www.securityopenlab.it", feedUrl: "https://www.securityopenlab.it/feed", section: "ai", language: "it", priority: 2 },
  { name: "TechCompany360", homepage: "https://www.techcompany360.it", feedUrl: "https://www.techcompany360.it/feed", section: "ai", language: "it", priority: 2 },
  { name: "Internet4Things", homepage: "https://www.internet4things.it", feedUrl: "https://www.internet4things.it/feed", section: "ai", language: "it", priority: 2 },
  { name: "Blockchain4Innovation", homepage: "https://www.blockchain4innovation.it", feedUrl: "https://www.blockchain4innovation.it/feed", section: "ai", language: "it", priority: 2 },
  { name: "HealthTech360", homepage: "https://www.healthtech360.it", feedUrl: "https://www.healthtech360.it/feed", section: "ai", language: "it", priority: 2 },
  { name: "HardwareUpgrade", homepage: "https://www.hardwareupgrade.it", feedUrl: "https://www.hardwareupgrade.it/rss", section: "ai", language: "it", priority: 2 },
  { name: "Macitynet", homepage: "https://www.macitynet.it", feedUrl: "https://www.macitynet.it/feed", section: "ai", language: "it", priority: 2 },
  { name: "iPhoneItalia", homepage: "https://www.iphoneitalia.com", feedUrl: "https://www.iphoneitalia.com/feed", section: "ai", language: "it", priority: 2 },
  { name: "Melablog", homepage: "https://www.melablog.it", feedUrl: "https://www.melablog.it/feed", section: "ai", language: "it", priority: 2 },
  { name: "AndroidWorld", homepage: "https://www.androidworld.it", feedUrl: "https://www.androidworld.it/feed", section: "ai", language: "it", priority: 2 },
  { name: "Androidiani", homepage: "https://www.androidiani.com", feedUrl: "https://www.androidiani.com/feed", section: "ai", language: "it", priority: 2 },
  { name: "Telefonino.net", homepage: "https://www.telefonino.net", feedUrl: "https://www.telefonino.net/feed", section: "ai", language: "it", priority: 3 },
  { name: "Corriere Tecnologia", homepage: "https://www.corriere.it", feedUrl: "https://www.corriere.it/rss/tecnologia.xml", section: "ai", language: "it", priority: 1 },
  { name: "Il Post Tecnologia", homepage: "https://www.ilpost.it", feedUrl: "https://www.ilpost.it/tag/tecnologia/feed", section: "ai", language: "it", priority: 2 },
  { name: "Panorama", homepage: "https://www.panorama.it", feedUrl: "https://www.panorama.it/feed", section: "ai", language: "it", priority: 2 },
  { name: "AINnews.it", homepage: "https://ainews.it", feedUrl: "https://ainews.it/feed", section: "ai", language: "it", priority: 1 },
  { name: "CloudComputing News IT", homepage: "https://www.cloudcomputing-news.it", feedUrl: "https://www.cloudcomputing-news.it/feed", section: "ai", language: "it", priority: 2 },
  { name: "Innovation Nation", homepage: "https://www.innovation-nation.it", feedUrl: "https://www.innovation-nation.it/feed", section: "ai", language: "it", priority: 2 },
  { name: "Italian Tech", homepage: "https://www.italian.tech", feedUrl: "https://www.italian.tech/feed", section: "ai", language: "it", priority: 1 },
  // Tech globale (alimenta sezione AI)
  { name: "The Verge (full)", homepage: "https://www.theverge.com", feedUrl: "https://www.theverge.com/rss/index.xml", section: "ai", language: "en", priority: 2, tags: ["tech"] },
  { name: "Ars Technica", homepage: "https://arstechnica.com", feedUrl: "https://arstechnica.com/feed", section: "ai", language: "en", priority: 1, tags: ["tech"] },
  { name: "TechRadar", homepage: "https://www.techradar.com", feedUrl: "https://techradar.com/rss", section: "ai", language: "en", priority: 2, tags: ["tech"] },
  { name: "Engadget", homepage: "https://www.engadget.com", feedUrl: "https://www.engadget.com/rss.xml", section: "ai", language: "en", priority: 2, tags: ["tech"] },
  { name: "CNET", homepage: "https://www.cnet.com", feedUrl: "https://www.cnet.com/rss/news", section: "ai", language: "en", priority: 2, tags: ["tech"] },
  { name: "ZDNet", homepage: "https://www.zdnet.com", feedUrl: "https://www.zdnet.com/news/rss.xml", section: "ai", language: "en", priority: 2, tags: ["tech"] },
  { name: "ZDNet AI", homepage: "https://www.zdnet.com", feedUrl: "https://www.zdnet.com/topic/artificial-intelligence/rss.xml", section: "ai", language: "en", priority: 1, tags: ["tech"] },
  { name: "The Next Web", homepage: "https://thenextweb.com", feedUrl: "https://thenextweb.com/feed", section: "ai", language: "en", priority: 2, tags: ["tech"] },
  { name: "Gizmodo", homepage: "https://www.gizmodo.com", feedUrl: "https://www.gizmodo.com/rss", section: "ai", language: "en", priority: 2, tags: ["tech"] },
  { name: "Wired (full)", homepage: "https://www.wired.com", feedUrl: "https://www.wired.com/feed/rss", section: "ai", language: "en", priority: 2, tags: ["tech"] },
  { name: "Fast Company", homepage: "https://www.fastcompany.com", feedUrl: "https://www.fastcompany.com/rss", section: "ai", language: "en", priority: 2, tags: ["tech"] },
  { name: "Computerworld", homepage: "https://www.computerworld.com", feedUrl: "https://www.computerworld.com/index.rss", section: "ai", language: "en", priority: 3, tags: ["tech"] },
  { name: "InfoWorld", homepage: "https://www.infoworld.com", feedUrl: "https://www.infoworld.com/index.rss", section: "ai", language: "en", priority: 3, tags: ["tech"] },
  { name: "MakeUseOf", homepage: "https://www.makeuseof.com", feedUrl: "https://www.makeuseof.com/feed", section: "ai", language: "en", priority: 3, tags: ["tech"] },
  { name: "Slashdot", homepage: "https://slashdot.org", feedUrl: "https://www.slashdot.org/index.rss", section: "ai", language: "en", priority: 3, tags: ["tech"] },
  { name: "Hacker News", homepage: "https://news.ycombinator.com", feedUrl: "https://news.ycombinator.com/rss", section: "ai", language: "en", priority: 2, tags: ["tech"] },
  { name: "Techmeme", homepage: "https://techmeme.com", feedUrl: "https://techmeme.com/feed.xml", section: "ai", language: "en", priority: 2, tags: ["tech"] },
  { name: "Product Hunt", homepage: "https://www.producthunt.com", feedUrl: "https://www.producthunt.com/feed", section: "ai", language: "en", priority: 2, tags: ["tech"] },
  { name: "Google Blog", homepage: "https://blog.google", feedUrl: "https://blog.google/rss", section: "ai", language: "en", priority: 2, tags: ["tech"] },
  { name: "Microsoft Blog", homepage: "https://blogs.microsoft.com", feedUrl: "https://blogs.microsoft.com/feed", section: "ai", language: "en", priority: 2, tags: ["tech"] },
  { name: "AWS Blog", homepage: "https://aws.amazon.com", feedUrl: "https://aws.amazon.com/blogs/feed", section: "ai", language: "en", priority: 2, tags: ["tech"] },
  { name: "TechSpot", homepage: "https://www.techspot.com", feedUrl: "https://www.techspot.com/backend.xml", section: "ai", language: "en", priority: 3, tags: ["tech"] },
  { name: "Digital Trends", homepage: "https://www.digitaltrends.com", feedUrl: "https://www.digitaltrends.com/feed", section: "ai", language: "en", priority: 2, tags: ["tech"] },
  { name: "SiliconAngle", homepage: "https://siliconangle.com", feedUrl: "https://siliconangle.com/feed", section: "ai", language: "en", priority: 2, tags: ["tech"] },
  { name: "TechDirt", homepage: "https://www.techdirt.com", feedUrl: "https://www.techdirt.com/feed", section: "ai", language: "en", priority: 3, tags: ["tech"] },
  { name: "BetaNews", homepage: "https://betanews.com", feedUrl: "https://betanews.com/feed", section: "ai", language: "en", priority: 3, tags: ["tech"] },
  { name: "NetworkWorld", homepage: "https://www.networkworld.com", feedUrl: "https://www.networkworld.com/index.rss", section: "ai", language: "en", priority: 3, tags: ["tech"] },
  { name: "ITPro Today", homepage: "https://www.itprotoday.com", feedUrl: "https://www.itprotoday.com/rss.xml", section: "ai", language: "en", priority: 3, tags: ["tech"] },
  { name: "How-To Geek", homepage: "https://www.howtogeek.com", feedUrl: "https://www.howtogeek.com/feed", section: "ai", language: "en", priority: 3, tags: ["tech"] },
  { name: "9to5Mac", homepage: "https://9to5mac.com", feedUrl: "https://9to5mac.com/feed", section: "ai", language: "en", priority: 2, tags: ["tech"] },
  { name: "9to5Google", homepage: "https://9to5google.com", feedUrl: "https://9to5google.com/feed", section: "ai", language: "en", priority: 2, tags: ["tech"] },
  { name: "AppleInsider", homepage: "https://appleinsider.com", feedUrl: "https://appleinsider.com/rss", section: "ai", language: "en", priority: 2, tags: ["tech"] }
];

// ─── 2. Startup / VC Sources ──────────────────────────────────────────────────
export const STARTUP_SOURCES: RssSource[] = [
  // Startup Italia (lista 1, #1-20)
  { name: "StartupBusiness", homepage: "https://www.startupbusiness.it", feedUrl: "https://www.startupbusiness.it/feed", section: "startup", language: "it", priority: 1 },
  { name: "Startup News IT", homepage: "https://www.startup-news.it", feedUrl: "https://www.startup-news.it/feed", section: "startup", language: "it", priority: 2 },
  { name: "EconomyUp", homepage: "https://www.economyup.it", feedUrl: "https://www.economyup.it/feed", section: "startup", language: "it", priority: 1 },
  { name: "Agenda Digitale Startup", homepage: "https://www.agendadigitale.eu", feedUrl: "https://www.agendadigitale.eu/startup/feed", section: "startup", language: "it", priority: 2 },
  { name: "Ninja Marketing", homepage: "https://www.ninjamarketing.it", feedUrl: "https://www.ninjamarketing.it/feed", section: "startup", language: "it", priority: 1 },
  { name: "Il Post Startup", homepage: "https://www.ilpost.it", feedUrl: "https://www.ilpost.it/tag/startup/feed", section: "startup", language: "it", priority: 2 },
  { name: "HuffPost Innovazione", homepage: "https://www.huffingtonpost.it", feedUrl: "https://www.huffingtonpost.it/section/innovazione/feed", section: "startup", language: "it", priority: 2 },
  { name: "Founders Factory", homepage: "https://www.foundersfactory.com", feedUrl: "https://www.foundersfactory.com/feed", section: "startup", language: "en", priority: 2 },
  { name: "ScaleUp Italy", homepage: "https://scaleupitaly.com", feedUrl: "https://scaleupitaly.com/feed", section: "startup", language: "it", priority: 2 },
  { name: "StartupItalia", homepage: "https://www.startupitalia.eu", feedUrl: "https://www.startupitalia.eu/feed", section: "startup", language: "it", priority: 1 },
  { name: "Econopoly", homepage: "https://www.econopoly.ilsole24ore.com", feedUrl: "https://www.econopoly.ilsole24ore.com/feed", section: "startup", language: "it", priority: 2 },
  { name: "Milano Investment", homepage: "https://milanoinvestment.com", feedUrl: "https://milanoinvestment.com/feed", section: "startup", language: "it", priority: 2 },
  // VC / Startup globale (lista 1, #41-60)
  { name: "TechCrunch Startups", homepage: "https://techcrunch.com", feedUrl: "https://techcrunch.com/startups/feed", section: "startup", language: "en", priority: 1 },
  { name: "TechCrunch VC", homepage: "https://techcrunch.com", feedUrl: "https://techcrunch.com/tag/venture-capital/feed", section: "startup", language: "en", priority: 1, tags: ["vc"] },
  { name: "Crunchbase News", homepage: "https://news.crunchbase.com", feedUrl: "https://news.crunchbase.com/feed", section: "startup", language: "en", priority: 1, tags: ["vc"] },
  { name: "Sifted", homepage: "https://sifted.eu", feedUrl: "https://www.sifted.eu/feed", section: "startup", language: "en", priority: 1 },
  { name: "EU Startups", homepage: "https://www.eu-startups.com", feedUrl: "https://www.eu-startups.com/feed", section: "startup", language: "en", priority: 1 },
  { name: "VentureBeat (full)", homepage: "https://venturebeat.com", feedUrl: "https://www.venturebeat.com/feed", section: "startup", language: "en", priority: 1, tags: ["vc"] },
  { name: "Both Sides of the Table", homepage: "https://bothsidesofthetable.com", feedUrl: "https://bothsidesofthetable.com/feed", section: "startup", language: "en", priority: 1, tags: ["vc"] },
  { name: "AVC (Fred Wilson)", homepage: "https://avc.com", feedUrl: "https://avc.com/feed", section: "startup", language: "en", priority: 1, tags: ["vc"] },
  { name: "Tom Tunguz", homepage: "https://tomtunguz.com", feedUrl: "https://tomtunguz.com/feed", section: "startup", language: "en", priority: 1, tags: ["vc"] },
  { name: "Feld Thoughts", homepage: "https://www.feld.com", feedUrl: "https://www.feld.com/feed", section: "startup", language: "en", priority: 2, tags: ["vc"] },
  { name: "a16z Blog", homepage: "https://a16z.com", feedUrl: "https://a16z.com/feed", section: "startup", language: "en", priority: 1, tags: ["vc"] },
  { name: "BVP Atlas", homepage: "https://www.bvp.com", feedUrl: "https://www.bvp.com/atlas/feed", section: "startup", language: "en", priority: 2, tags: ["vc"] },
  { name: "Index Ventures", homepage: "https://www.indexventures.com", feedUrl: "https://www.indexventures.com/news/feed", section: "startup", language: "en", priority: 2, tags: ["vc"] },
  { name: "Seedcamp", homepage: "https://seedcamp.com", feedUrl: "https://seedcamp.com/feed", section: "startup", language: "en", priority: 2, tags: ["vc"] },
  { name: "Y Combinator Blog", homepage: "https://www.ycombinator.com", feedUrl: "https://www.ycombinator.com/blog/rss", section: "startup", language: "en", priority: 1, tags: ["vc"] },
  { name: "Dealroom Blog", homepage: "https://dealroom.co", feedUrl: "https://dealroom.co/blog/feed", section: "startup", language: "en", priority: 2, tags: ["vc"] },
  { name: "PitchBook News", homepage: "https://pitchbook.com", feedUrl: "https://pitchbook.com/news/rss", section: "startup", language: "en", priority: 1, tags: ["vc"] },
  { name: "CB Insights Research", homepage: "https://www.cbinsights.com", feedUrl: "https://www.cbinsights.com/research/feed", section: "startup", language: "en", priority: 1, tags: ["vc"] },
  // Lista 2 — Startup globale (#101-130)
  { name: "Tech.eu", homepage: "https://tech.eu", feedUrl: "https://tech.eu/feed", section: "startup", language: "en", priority: 1 },
  { name: "Silicon Canals", homepage: "https://siliconcanals.com", feedUrl: "https://siliconcanals.com/feed", section: "startup", language: "en", priority: 1 },
  { name: "UK Tech News", homepage: "https://www.uktech.news", feedUrl: "https://www.uktech.news/feed", section: "startup", language: "en", priority: 2 },
  { name: "Startup Daily", homepage: "https://www.startupdaily.net", feedUrl: "https://www.startupdaily.net/feed", section: "startup", language: "en", priority: 2 },
  { name: "Betakit", homepage: "https://betakit.com", feedUrl: "https://betakit.com/feed", section: "startup", language: "en", priority: 2 },
  { name: "Vator.tv", homepage: "https://www.vator.tv", feedUrl: "https://www.vator.tv/rss.xml", section: "startup", language: "en", priority: 3 },
  { name: "Startup Nation", homepage: "https://startupnation.com", feedUrl: "https://startupnation.com/feed", section: "startup", language: "en", priority: 3 },
  { name: "Startups Magazine UK", homepage: "https://startupsmagazine.co.uk", feedUrl: "https://startupsmagazine.co.uk/feed", section: "startup", language: "en", priority: 2 },
  { name: "Business Cloud UK", homepage: "https://www.businesscloud.co.uk", feedUrl: "https://www.businesscloud.co.uk/feed", section: "startup", language: "en", priority: 2 },
  { name: "Tech Funding News", homepage: "https://www.techfundingnews.com", feedUrl: "https://www.techfundingnews.com/feed", section: "startup", language: "en", priority: 2 },
  { name: "Startup Founder", homepage: "https://www.thestartupfounder.com", feedUrl: "https://www.thestartupfounder.com/feed", section: "startup", language: "en", priority: 3 },
  { name: "Startup Grind", homepage: "https://www.startupgrind.com", feedUrl: "https://www.startupgrind.com/feed", section: "startup", language: "en", priority: 2 },
  // Lista 2 — VC (#161-190)
  { name: "Hunter Walk", homepage: "https://hunterwalk.com", feedUrl: "https://hunterwalk.com/feed", section: "startup", language: "en", priority: 2, tags: ["vc"] },
  { name: "Sequoia Capital", homepage: "https://www.sequoiacap.com", feedUrl: "https://www.sequoiacap.com/article/feed", section: "startup", language: "en", priority: 1, tags: ["vc"] },
  { name: "Greylock", homepage: "https://greylock.com", feedUrl: "https://greylock.com/feed", section: "startup", language: "en", priority: 2, tags: ["vc"] },
  { name: "Not Boring", homepage: "https://notboring.co", feedUrl: "https://notboring.co/feed", section: "startup", language: "en", priority: 1, tags: ["vc"] },
  { name: "Lenny's Newsletter", homepage: "https://newsletter.lennysnewsletter.com", feedUrl: "https://newsletter.lennysnewsletter.com/feed", section: "startup", language: "en", priority: 2, tags: ["vc"] },
  { name: "Strictly VC", homepage: "https://strictlyvc.com", feedUrl: "https://strictlyvc.com/feed", section: "startup", language: "en", priority: 2, tags: ["vc"] },
  { name: "Fortune Venture", homepage: "https://www.fortune.com", feedUrl: "https://www.fortune.com/venture/feed", section: "startup", language: "en", priority: 2, tags: ["vc"] },
  { name: "Business Insider VC", homepage: "https://www.businessinsider.com", feedUrl: "https://www.businessinsider.com/venture-capital/rss", section: "startup", language: "en", priority: 2, tags: ["vc"] },
  { name: "Fortune Startups", homepage: "https://fortune.com", feedUrl: "https://fortune.com/startups/feed", section: "startup", language: "en", priority: 1, tags: ["vc"] },
  { name: "WSJ Venture", homepage: "https://www.wsj.com", feedUrl: "https://www.wsj.com/xml/rss/3_7085.xml", section: "startup", language: "en", priority: 2, tags: ["vc"] },
  { name: "VentureBeat Entrepreneur", homepage: "https://venturebeat.com", feedUrl: "https://venturebeat.com/category/entrepreneur/feed", section: "startup", language: "en", priority: 2, tags: ["vc"] },
  { name: "Private Equity Wire", homepage: "https://www.privateequitywire.co.uk", feedUrl: "https://www.privateequitywire.co.uk/feed", section: "startup", language: "en", priority: 3, tags: ["vc"] },
  { name: "TechCrunch (all)", homepage: "https://techcrunch.com", feedUrl: "https://techcrunch.com/feed", section: "startup", language: "en", priority: 1 },
  // Nuove fonti Startup italiane (da lista 15 Mar 2026)
  { name: "Forbes Italia Startup", homepage: "https://forbes.it", feedUrl: "https://forbes.it/feed", section: "startup", language: "it", priority: 1 },
  { name: "Il Sole 24 Ore Economia", homepage: "https://www.ilsole24ore.com", feedUrl: "https://www.ilsole24ore.com/rss/economia.xml", section: "startup", language: "it", priority: 1 },
  { name: "Open Online", homepage: "https://www.open.online", feedUrl: "https://www.open.online/feed", section: "startup", language: "it", priority: 2 },
  { name: "Panorama Economia", homepage: "https://www.panorama.it", feedUrl: "https://www.panorama.it/feed", section: "startup", language: "it", priority: 2 },
  // Nuove fonti Startup/VC internazionali (da lista 15 Mar 2026)
  { name: "Finsmes", homepage: "https://www.finsmes.com", feedUrl: "https://www.finsmes.com/feed", section: "startup", language: "en", priority: 2 },
  { name: "Startup Genome", homepage: "https://startupgenome.com", feedUrl: "https://startupgenome.com/feed", section: "startup", language: "en", priority: 2 },
  { name: "Venture Burn", homepage: "https://ventureburn.com", feedUrl: "https://ventureburn.com/feed", section: "startup", language: "en", priority: 2 },
  { name: "FT Technology", homepage: "https://www.ft.com", feedUrl: "https://www.ft.com/technology?format=rss", section: "startup", language: "en", priority: 1 },
  { name: "Mark SV", homepage: "https://marksv.com", feedUrl: "https://marksv.com/feed", section: "startup", language: "en", priority: 3, tags: ["vc"] },
  { name: "Lenny's Newsletter", homepage: "https://newsletter.lennysnewsletter.com", feedUrl: "https://newsletter.lennysnewsletter.com/feed", section: "startup", language: "en", priority: 2, tags: ["vc"] }
];

// ─── 3. Music Rock / Indie / Alternative Sources ──────────────────────────────
// ─── Whitelist domini → homepage ─────────────────────────────────────────────
export const DOMAIN_FALLBACKS: Record<string, string> = {
  // AI internazionale
  "techcrunch.com": "https://techcrunch.com", "www.techcrunch.com": "https://techcrunch.com",
  "venturebeat.com": "https://venturebeat.com", "www.venturebeat.com": "https://venturebeat.com",
  "technologyreview.com": "https://www.technologyreview.com", "www.technologyreview.com": "https://www.technologyreview.com",
  "theverge.com": "https://www.theverge.com", "www.theverge.com": "https://www.theverge.com",
  "wired.com": "https://www.wired.com", "www.wired.com": "https://www.wired.com",
  "arstechnica.com": "https://arstechnica.com", "www.arstechnica.com": "https://arstechnica.com",
  "reuters.com": "https://www.reuters.com", "www.reuters.com": "https://www.reuters.com",
  "zdnet.com": "https://www.zdnet.com", "www.zdnet.com": "https://www.zdnet.com",
  "artificialintelligence-news.com": "https://www.artificialintelligence-news.com",
  "www.artificialintelligence-news.com": "https://www.artificialintelligence-news.com",
  "openai.com": "https://openai.com",
  "deepmind.google": "https://deepmind.google",
  "anthropic.com": "https://www.anthropic.com", "www.anthropic.com": "https://www.anthropic.com",
  "blogs.microsoft.com": "https://blogs.microsoft.com",
  "microsoft.com": "https://www.microsoft.com", "www.microsoft.com": "https://www.microsoft.com",
  "google.com": "https://www.google.com",
  "ai.googleblog.com": "https://ai.googleblog.com",
  "research.google": "https://research.google",
  "blogs.nvidia.com": "https://blogs.nvidia.com",
  "huggingface.co": "https://huggingface.co",
  "stability.ai": "https://stability.ai",
  "ai.facebook.com": "https://ai.facebook.com",
  "machinelearning.apple.com": "https://machinelearning.apple.com",
  "bloomberg.com": "https://www.bloomberg.com", "www.bloomberg.com": "https://www.bloomberg.com",
  "wsj.com": "https://www.wsj.com", "www.wsj.com": "https://www.wsj.com",
  "hbr.org": "https://hbr.org",
  "nature.com": "https://www.nature.com", "www.nature.com": "https://www.nature.com",
  "marktechpost.com": "https://www.marktechpost.com", "www.marktechpost.com": "https://www.marktechpost.com",
  "unite.ai": "https://www.unite.ai", "www.unite.ai": "https://www.unite.ai",
  "syncedreview.com": "https://syncedreview.com",
  "analyticsvidhya.com": "https://www.analyticsvidhya.com",
  "machinelearningmastery.com": "https://machinelearningmastery.com",
  "kdnuggets.com": "https://www.kdnuggets.com", "www.kdnuggets.com": "https://www.kdnuggets.com",
  "infoq.com": "https://www.infoq.com",
  "towardsdatascience.com": "https://towardsdatascience.com",
  "towardsai.net": "https://towardsai.net",
  "the-decoder.com": "https://the-decoder.com",
  "aitrends.com": "https://www.aitrends.com",
  "analyticsindiamag.com": "https://analyticsindiamag.com",
  "lastweekin.ai": "https://lastweekin.ai",
  "aiweekly.co": "https://aiweekly.co",
  "datanami.com": "https://www.datanami.com",
  "insidebigdata.com": "https://insidebigdata.com",
  "paperswithcode.com": "https://paperswithcode.com",
  "distill.pub": "https://distill.pub",
  "lesswrong.com": "https://www.lesswrong.com",
  "engadget.com": "https://www.engadget.com", "www.engadget.com": "https://www.engadget.com",
  "cnet.com": "https://www.cnet.com", "www.cnet.com": "https://www.cnet.com",
  "techradar.com": "https://www.techradar.com", "www.techradar.com": "https://www.techradar.com",
  "thenextweb.com": "https://thenextweb.com",
  "gizmodo.com": "https://www.gizmodo.com", "www.gizmodo.com": "https://www.gizmodo.com",
  "fastcompany.com": "https://www.fastcompany.com", "www.fastcompany.com": "https://www.fastcompany.com",
  "computerworld.com": "https://www.computerworld.com",
  "infoworld.com": "https://www.infoworld.com",
  "slashdot.org": "https://slashdot.org",
  "news.ycombinator.com": "https://news.ycombinator.com",
  "techmeme.com": "https://techmeme.com",
  "producthunt.com": "https://www.producthunt.com", "www.producthunt.com": "https://www.producthunt.com",
  "blog.google": "https://blog.google",
  "aws.amazon.com": "https://aws.amazon.com",
  "techspot.com": "https://www.techspot.com",
  "digitaltrends.com": "https://www.digitaltrends.com",
  "siliconangle.com": "https://siliconangle.com",
  "techdirt.com": "https://www.techdirt.com",
  "betanews.com": "https://betanews.com",
  "networkworld.com": "https://www.networkworld.com",
  "itprotoday.com": "https://www.itprotoday.com",
  "howtogeek.com": "https://www.howtogeek.com",
  "9to5mac.com": "https://9to5mac.com",
  "9to5google.com": "https://9to5google.com",
  "appleinsider.com": "https://appleinsider.com",
  "makeuseof.com": "https://www.makeuseof.com",
  "techbuzz.ai": "https://www.techbuzz.ai",
  "thealgorithmicbridge.substack.com": "https://thealgorithmicbridge.substack.com",
  // AI italiano
  "ilsole24ore.com": "https://www.ilsole24ore.com", "www.ilsole24ore.com": "https://www.ilsole24ore.com",
  "corriere.it": "https://www.corriere.it", "www.corriere.it": "https://www.corriere.it",
  "tomshw.it": "https://www.tomshw.it", "www.tomshw.it": "https://www.tomshw.it",
  "agendadigitale.eu": "https://www.agendadigitale.eu", "www.agendadigitale.eu": "https://www.agendadigitale.eu",
  "wired.it": "https://www.wired.it", "www.wired.it": "https://www.wired.it",
  "punto-informatico.it": "https://www.punto-informatico.it", "www.punto-informatico.it": "https://www.punto-informatico.it",
  "digital4.biz": "https://www.digital4.biz", "www.digital4.biz": "https://www.digital4.biz",
  "corrierecomunicazioni.it": "https://www.corrierecomunicazioni.it", "www.corrierecomunicazioni.it": "https://www.corrierecomunicazioni.it",
  "innovationpost.it": "https://www.innovationpost.it", "www.innovationpost.it": "https://www.innovationpost.it",
  "industry4business.it": "https://www.industry4business.it", "www.industry4business.it": "https://www.industry4business.it",
  "techprincess.it": "https://www.techprincess.it", "www.techprincess.it": "https://www.techprincess.it",
  "forbes.it": "https://forbes.it",
  // Music internazionale
  "billboard.com": "https://www.billboard.com", "www.billboard.com": "https://www.billboard.com",
  "rollingstone.com": "https://www.rollingstone.com", "www.rollingstone.com": "https://www.rollingstone.com",
  "nme.com": "https://www.nme.com", "www.nme.com": "https://www.nme.com",
  "pitchfork.com": "https://pitchfork.com",
  "consequence.net": "https://consequence.net",
  "musicbusinessworldwide.com": "https://www.musicbusinessworldwide.com", "www.musicbusinessworldwide.com": "https://www.musicbusinessworldwide.com",
  "variety.com": "https://variety.com",
  "stereogum.com": "https://stereogum.com",
  "spin.com": "https://www.spin.com",
  "loudersound.com": "https://www.loudersound.com",
  "metalsucks.net": "https://www.metalsucks.net",
  "metalinjection.net": "https://www.metalinjection.net",
  "brooklynvegan.com": "https://www.brooklynvegan.com",
  "altpress.com": "https://www.altpress.com",
  "kerrang.com": "https://www.kerrang.com",
  "loudwire.com": "https://www.loudwire.com",
  "ultimateclassicrock.com": "https://ultimateclassicrock.com",
  "guitarworld.com": "https://www.guitarworld.com",
  "musicradar.com": "https://www.musicradar.com",
  "clashmusic.com": "https://www.clashmusic.com",
  "gigwise.com": "https://www.gigwise.com",
  "musicfeeds.com.au": "https://musicfeeds.com.au",
  "thelineofbestfit.com": "https://www.thelineofbestfit.com",
  "undertheradarmag.com": "https://www.undertheradarmag.com",
  "indie88.com": "https://www.indie88.com",
  "drownedinsound.com": "https://drownedinsound.com",
  "sputnikmusic.com": "https://www.sputnikmusic.com",
  "pastemagazine.com": "https://www.pastemagazine.com",
  "npr.org": "https://www.npr.org", "www.npr.org": "https://www.npr.org",
  "songkick.com": "https://www.songkick.com",
  // Music italiano
  "rockol.it": "https://www.rockol.it", "www.rockol.it": "https://www.rockol.it",
  "soundsblog.it": "https://www.soundsblog.it", "www.soundsblog.it": "https://www.soundsblog.it",
  "rollingstone.it": "https://www.rollingstone.it", "www.rollingstone.it": "https://www.rollingstone.it",
  "rumoremag.com": "https://www.rumoremag.com", "www.rumoremag.com": "https://www.rumoremag.com",
  "sentireascoltare.com": "https://www.sentireascoltare.com", "www.sentireascoltare.com": "https://www.sentireascoltare.com",
  "allmusicitalia.it": "https://www.allmusicitalia.it", "www.allmusicitalia.it": "https://www.allmusicitalia.it",
  // Startup internazionale
  "sifted.eu": "https://sifted.eu",
  "news.crunchbase.com": "https://news.crunchbase.com",
  "crunchbase.com": "https://www.crunchbase.com",
  "forbes.com": "https://www.forbes.com", "www.forbes.com": "https://www.forbes.com",
  "eu-startups.com": "https://www.eu-startups.com", "www.eu-startups.com": "https://www.eu-startups.com",
  "tech.eu": "https://tech.eu",
  "siliconcanals.com": "https://siliconcanals.com",
  "uktech.news": "https://www.uktech.news", "www.uktech.news": "https://www.uktech.news",
  "a16z.com": "https://a16z.com",
  "ycombinator.com": "https://www.ycombinator.com", "www.ycombinator.com": "https://www.ycombinator.com",
  "sequoiacap.com": "https://www.sequoiacap.com",
  "bothsidesofthetable.com": "https://bothsidesofthetable.com",
  "avc.com": "https://avc.com",
  "tomtunguz.com": "https://tomtunguz.com",
  "feld.com": "https://www.feld.com",
  "bvp.com": "https://www.bvp.com",
  "indexventures.com": "https://www.indexventures.com",
  "seedcamp.com": "https://seedcamp.com",
  "greylock.com": "https://greylock.com",
  "notboring.co": "https://notboring.co",
  "dealroom.co": "https://dealroom.co",
  "pitchbook.com": "https://pitchbook.com",
  "cbinsights.com": "https://www.cbinsights.com", "www.cbinsights.com": "https://www.cbinsights.com",
  "strictlyvc.com": "https://strictlyvc.com",
  "hunterwalk.com": "https://hunterwalk.com",
  "betakit.com": "https://betakit.com",
  "vator.tv": "https://www.vator.tv",
  "techfundingnews.com": "https://www.techfundingnews.com", "www.techfundingnews.com": "https://www.techfundingnews.com",
  "techinasia.com": "https://www.techinasia.com",
  "businessinsider.com": "https://www.businessinsider.com", "www.businessinsider.com": "https://www.businessinsider.com",
  "fortune.com": "https://www.fortune.com", "www.fortune.com": "https://www.fortune.com",
  "startupgrind.com": "https://www.startupgrind.com",
  "foundersfactory.com": "https://www.foundersfactory.com",
  // Startup italiano
  "startupitalia.eu": "https://www.startupitalia.eu", "www.startupitalia.eu": "https://www.startupitalia.eu",
  "repubblica.it": "https://www.repubblica.it", "www.repubblica.it": "https://www.repubblica.it",
  "startupbusiness.it": "https://www.startupbusiness.it", "www.startupbusiness.it": "https://www.startupbusiness.it",
  "ninjamarketing.it": "https://www.ninjamarketing.it", "www.ninjamarketing.it": "https://www.ninjamarketing.it",
  "economyup.it": "https://www.economyup.it", "www.economyup.it": "https://www.economyup.it",
  "econopoly.ilsole24ore.com": "https://www.econopoly.ilsole24ore.com",
  "scaleupitaly.com": "https://scaleupitaly.com",
  "milanoinvestment.com": "https://milanoinvestment.com",
  "huffingtonpost.it": "https://www.huffingtonpost.it", "www.huffingtonpost.it": "https://www.huffingtonpost.it",
  "ilpost.it": "https://www.ilpost.it", "www.ilpost.it": "https://www.ilpost.it",
  "startup-news.it": "https://www.startup-news.it",
  // Istituzionali
  "europarl.europa.eu": "https://www.europarl.europa.eu",
  "commission.europa.eu": "https://commission.europa.eu",
  "nato.int": "https://www.nato.int", "www.nato.int": "https://www.nato.int"
};

/// ─── Fallback di sezione ────────────────────────────────────────────
export const SECTION_FALLBACKS: Record<string, string> = {
  ai: "https://techcrunch.com",
  startup: "https://techcrunch.com",
};

/**
 * Estrae il dominio da un URL e restituisce la homepage sicura dalla whitelist.
 * Se il dominio non è in whitelist, restituisce la homepage del dominio stesso.
 */
export function getHomepageForUrl(url: string, section: "ai" | "startup" | "health" | "news" | "dealroom"): string {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace(/^www\./, "");
    return (
      DOMAIN_FALLBACKS[parsed.hostname] ||
      DOMAIN_FALLBACKS[domain] ||
      `${parsed.protocol}//${parsed.hostname}` ||
      SECTION_FALLBACKS[section]
    );
  } catch {
    return SECTION_FALLBACKS[section];
  }
}

// ─── 4. Finance & Markets ─────────────────────────────────────────────────────
// ─── 5. Health & Biotech ──────────────────────────────────────────────────────
// ─── 6. Sport & Business ──────────────────────────────────────────────────────
// ─── 7. Lifestyle & Luxury Economy ───────────────────────────────────────────
// ─── 8. News Generali ────────────────────────────────────────────────────────
// ─── 9. Motori ───────────────────────────────────────────────────────────────
// ─── 10. Tennis ──────────────────────────────────────────────────────────────
// ─── 11. Basket ──────────────────────────────────────────────────────────────
// ─── DEALROOM — Round, Funding, VC, M&A, Seed, Series, Exit ─────────────────
// Fonti verificate al 29 Mar 2026 (HTTP 200 confermato dal sandbox)
export const DEALROOM_SOURCES: RssSource[] = [
  // ── 🇮🇹 ITALIA — Core dealflow (priorità massima) ────────────────────────────────────────
  { name: "BeBeez", homepage: "https://bebeez.it", feedUrl: "https://bebeez.it/feed", section: "dealroom", language: "it", priority: 1 },
  { name: "DealFlower", homepage: "https://dealflower.it", feedUrl: "https://dealflower.it/feed", section: "dealroom", language: "it", priority: 1 },
  { name: "StartupBusiness", homepage: "https://www.startupbusiness.it", feedUrl: "https://www.startupbusiness.it/feed", section: "dealroom", language: "it", priority: 1 },
  { name: "StartupItalia", homepage: "https://startupitalia.eu", feedUrl: "https://startupitalia.eu/rss", section: "dealroom", language: "it", priority: 1 },
  { name: "EconomyUp", homepage: "https://www.economyup.it", feedUrl: "https://www.economyup.it/feed", section: "dealroom", language: "it", priority: 1 },
  { name: "Il Sole 24 Ore Economia", homepage: "https://www.ilsole24ore.com", feedUrl: "https://www.ilsole24ore.com/rss/economia.xml", section: "dealroom", language: "it", priority: 1, tags: ["funding", "m&a"] },
  { name: "Corriere Economia", homepage: "https://www.corriere.it", feedUrl: "https://www.corriere.it/rss/economia.xml", section: "dealroom", language: "it", priority: 1, tags: ["funding", "startup"] },
  { name: "ANSA Economia", homepage: "https://www.ansa.it", feedUrl: "https://www.ansa.it/sito/notizie/economia/economia_rss.xml", section: "dealroom", language: "it", priority: 1, tags: ["m&a", "funding"] },
  { name: "AIFI", homepage: "https://www.aifi.it", feedUrl: "https://www.aifi.it/feed", section: "dealroom", language: "it", priority: 1, tags: ["private equity", "vc"] },
  // ── 🇪🇺 EUROPA — Dealflow verificato (200) ────────────────────────────────────────
  { name: "Sifted", homepage: "https://sifted.eu", feedUrl: "https://sifted.eu/feed", section: "dealroom", language: "en", priority: 1 },
  { name: "Tech.eu", homepage: "https://tech.eu", feedUrl: "https://tech.eu/feed", section: "dealroom", language: "en", priority: 1 },
  { name: "ArcticStartup", homepage: "https://arcticstartup.com", feedUrl: "https://arcticstartup.com/feed/", section: "dealroom", language: "en", priority: 1, tags: ["nordic", "funding"] },
  { name: "Silicon Republic", homepage: "https://www.siliconrepublic.com", feedUrl: "https://www.siliconrepublic.com/feed", section: "dealroom", language: "en", priority: 1, tags: ["europe", "funding"] },
  { name: "UKTN", homepage: "https://www.uktech.news", feedUrl: "https://www.uktech.news/feed", section: "dealroom", language: "en", priority: 1, tags: ["uk", "funding"] },
  { name: "Startups.co.uk", homepage: "https://startups.co.uk", feedUrl: "https://startups.co.uk/feed/", section: "dealroom", language: "en", priority: 2, tags: ["uk", "startup"] },
  { name: "Balderton Capital", homepage: "https://www.balderton.com", feedUrl: "https://www.balderton.com/feed", section: "dealroom", language: "en", priority: 1, tags: ["vc", "europe"] },
  { name: "Seedcamp", homepage: "https://seedcamp.com", feedUrl: "https://seedcamp.com/feed", section: "dealroom", language: "en", priority: 1, tags: ["seed", "europe"] },
  // ── 🌍 GLOBAL — Deal signal diretto (verificato 200) ───────────────────────────────
  { name: "TechCrunch Funding", homepage: "https://techcrunch.com", feedUrl: "https://techcrunch.com/tag/funding/feed", section: "dealroom", language: "en", priority: 1 },
  { name: "TechCrunch Venture", homepage: "https://techcrunch.com", feedUrl: "https://techcrunch.com/category/venture/feed", section: "dealroom", language: "en", priority: 1 },
  { name: "TechCrunch M&A", homepage: "https://techcrunch.com", feedUrl: "https://techcrunch.com/tag/mergers-and-acquisitions/feed/", section: "dealroom", language: "en", priority: 1, tags: ["m&a", "acquisition"] },
  { name: "TechCrunch Startups", homepage: "https://techcrunch.com", feedUrl: "https://techcrunch.com/category/startups/feed/", section: "dealroom", language: "en", priority: 1, tags: ["startups", "funding"] },
  { name: "Crunchbase News", homepage: "https://news.crunchbase.com", feedUrl: "https://news.crunchbase.com/feed", section: "dealroom", language: "en", priority: 1 },
  { name: "FinSMEs", homepage: "https://www.finsmes.com", feedUrl: "https://www.finsmes.com/feed", section: "dealroom", language: "en", priority: 1, tags: ["funding", "seed", "series"] },
  { name: "TechFundingNews", homepage: "https://techfundingnews.com", feedUrl: "https://techfundingnews.com/feed/", section: "dealroom", language: "en", priority: 1, tags: ["funding", "vc"] },
  { name: "VentureBeat", homepage: "https://venturebeat.com", feedUrl: "https://venturebeat.com/feed/", section: "dealroom", language: "en", priority: 1, tags: ["tech", "funding"] },
  { name: "CB Insights Research", homepage: "https://www.cbinsights.com", feedUrl: "https://www.cbinsights.com/research/feed", section: "dealroom", language: "en", priority: 1 },
  { name: "Business Insider", homepage: "https://www.businessinsider.com", feedUrl: "https://feeds.businessinsider.com/custom/all", section: "dealroom", language: "en", priority: 2, tags: ["business", "deals"] },
  { name: "Sequoia Capital", homepage: "https://www.sequoiacap.com", feedUrl: "https://www.sequoiacap.com/feed", section: "dealroom", language: "en", priority: 1 },
  { name: "Y Combinator Blog", homepage: "https://www.ycombinator.com", feedUrl: "https://www.ycombinator.com/blog/feed", section: "dealroom", language: "en", priority: 1 },
  { name: "PE Hub", homepage: "https://www.pehub.com", feedUrl: "https://www.pehub.com/feed", section: "dealroom", language: "en", priority: 1, tags: ["private equity", "m&a", "buyout"] },
  { name: "TechCrunch Main", homepage: "https://techcrunch.com", feedUrl: "https://techcrunch.com/feed", section: "dealroom", language: "en", priority: 2 },
  // ── 📰 AGGREGATORI — Segnali deal da fonti multiple ───────────────────────────────
  { name: "Google News Funding", homepage: "https://news.google.com", feedUrl: "https://news.google.com/rss/search?q=startup+funding+OR+acquisition+OR+series+A+OR+venture+capital&hl=en", section: "dealroom", language: "en", priority: 1, tags: ["aggregator", "funding"] },
  { name: "Google News M&A", homepage: "https://news.google.com", feedUrl: "https://news.google.com/rss/search?q=merger+acquisition+startup+OR+tech+company&hl=en", section: "dealroom", language: "en", priority: 2, tags: ["aggregator", "m&a"] },
  { name: "Google News VC Italia", homepage: "https://news.google.com", feedUrl: "https://news.google.com/rss/search?q=startup+italiana+finanziamento+OR+round+OR+investimento&hl=it&gl=IT", section: "dealroom", language: "it", priority: 1, tags: ["aggregator", "italia"] },
  { name: "HackerNews", homepage: "https://news.ycombinator.com", feedUrl: "https://hnrss.org/frontpage", section: "dealroom", language: "en", priority: 2, tags: ["aggregator", "tech"] }
];

export const ALL_SOURCES = [...AI_SOURCES, ...STARTUP_SOURCES, ...DEALROOM_SOURCES];
