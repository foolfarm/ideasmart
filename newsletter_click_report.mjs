import { config } from 'dotenv';
config();

const KEY = process.env.SENDGRID_API_KEY;
const TODAY = new Date().toISOString().split('T')[0]; // 2026-06-19

async function sg(path) {
  const r = await fetch(`https://api.sendgrid.com/v3${path}`, {
    headers: { Authorization: `Bearer ${KEY}` }
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`HTTP ${r.status} — ${t.substring(0, 200)}`);
  }
  return r.json();
}

// ─── 1. Stats generali di oggi ────────────────────────────────────────────────
const stats = await sg(`/stats?start_date=${TODAY}&end_date=${TODAY}&aggregated_by=day`);
const m = stats[0]?.stats[0]?.metrics || {};

// ─── 2. Browser stats (client email) ─────────────────────────────────────────
const browserStats = await sg(`/browsers/stats?start_date=${TODAY}&end_date=${TODAY}&aggregated_by=day`).catch(() => null);

// ─── 3. Client stats (email client) ──────────────────────────────────────────
const clientStats = await sg(`/clients/stats?start_date=${TODAY}&end_date=${TODAY}&aggregated_by=day`).catch(() => null);

// ─── 4. Geo stats (paese) ─────────────────────────────────────────────────────
const geoStats = await sg(`/geo/stats?start_date=${TODAY}&end_date=${TODAY}&aggregated_by=day`).catch(() => null);

// ─── 5. Device stats (mobile/desktop) ────────────────────────────────────────
const deviceStats = await sg(`/devices/stats?start_date=${TODAY}&end_date=${TODAY}&aggregated_by=day`).catch(() => null);

// ─── 6. Mailbox provider stats ───────────────────────────────────────────────
const providerStats = await sg(`/mailbox_providers/stats?start_date=${TODAY}&end_date=${TODAY}&aggregated_by=day`).catch(() => null);

// ─── OUTPUT ───────────────────────────────────────────────────────────────────
const result = {
  date: TODAY,
  overview: {
    requests: m.requests || 0,
    delivered: m.delivered || 0,
    opens: m.opens || 0,
    unique_opens: m.unique_opens || 0,
    clicks: m.clicks || 0,
    unique_clicks: m.unique_clicks || 0,
    bounces: m.bounces || 0,
    bounce_drops: m.bounce_drops || 0,
    spam_reports: m.spam_reports || 0,
    unsubscribes: m.unsubscribes || 0,
    open_rate: m.delivered > 0 ? ((m.unique_opens / m.delivered) * 100).toFixed(2) : 0,
    click_rate: m.delivered > 0 ? ((m.unique_clicks / m.delivered) * 100).toFixed(2) : 0,
    click_to_open: m.unique_opens > 0 ? ((m.unique_clicks / m.unique_opens) * 100).toFixed(2) : 0,
  },
  browsers: browserStats,
  clients: clientStats,
  geo: geoStats,
  devices: deviceStats,
  providers: providerStats
};

console.log(JSON.stringify(result, null, 2));
