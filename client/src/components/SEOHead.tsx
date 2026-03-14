/**
 * SEOHead — Componente per la gestione dinamica dei meta tag SEO
 *
 * Ogni pagina/canale ha la propria identità SEO indipendente:
 * - title, description, keywords
 * - Open Graph (og:title, og:description, og:url, og:image, og:site_name)
 * - Twitter Card
 * - Canonical URL
 * - robots
 *
 * Usa document.head direttamente (compatibile con SPA React + wouter)
 */

import { useEffect } from "react";

export interface SEOProps {
  /** Titolo della pagina — appare nel tab del browser e nei risultati Google */
  title: string;
  /** Meta description — snippet nei risultati di ricerca (max 160 caratteri) */
  description: string;
  /** Parole chiave SEO */
  keywords?: string;
  /** URL canonico assoluto della pagina */
  canonical?: string;
  /** URL immagine Open Graph (1200×630px consigliato) */
  ogImage?: string;
  /** Nome del sito per Open Graph */
  ogSiteName?: string;
  /** Tipo Open Graph */
  ogType?: "website" | "article";
  /** Istruzioni per i crawler */
  robots?: string;
  /** Schema.org JSON-LD structured data */
  structuredData?: object;
}

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setStructuredData(data: object) {
  const id = "seo-structured-data";
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export default function SEOHead({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogSiteName = "IDEASMART",
  ogType = "website",
  robots = "index, follow",
  structuredData,
}: SEOProps) {
  useEffect(() => {
    // Title
    document.title = title;

    // Standard meta
    setMeta("description", description);
    if (keywords) setMeta("keywords", keywords);
    setMeta("robots", robots);

    // Open Graph
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", ogType, "property");
    setMeta("og:site_name", ogSiteName, "property");
    setMeta("og:locale", "it_IT", "property");
    if (canonical) setMeta("og:url", canonical, "property");
    if (ogImage) setMeta("og:image", ogImage, "property");

    // Twitter Card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    if (ogImage) setMeta("twitter:image", ogImage);

    // Canonical
    if (canonical) setLink("canonical", canonical);

    // Structured Data (JSON-LD)
    if (structuredData) setStructuredData(structuredData);
  }, [title, description, keywords, canonical, ogImage, ogSiteName, ogType, robots, structuredData]);

  return null;
}
