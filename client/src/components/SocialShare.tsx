import { useState } from "react";
import { Share2, Linkedin, Twitter, MessageCircle, Link, Check } from "lucide-react";

interface SocialShareProps {
  title: string;
  url?: string;
  accentColor?: string;
  compact?: boolean;
}

export default function SocialShare({ title, url, accentColor = "cyan", compact = false }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const links = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const accent =
    accentColor === "purple"
      ? { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30", hover: "hover:bg-purple-500/20" }
      : { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30", hover: "hover:bg-cyan-500/20" };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <a
          href={links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          title="Condividi su LinkedIn"
          className={`p-1.5 rounded-lg ${accent.bg} ${accent.hover} transition-colors`}
        >
          <Linkedin className={`w-3.5 h-3.5 ${accent.text}`} />
        </a>
        <a
          href={links.twitter}
          target="_blank"
          rel="noopener noreferrer"
          title="Condividi su X"
          className={`p-1.5 rounded-lg ${accent.bg} ${accent.hover} transition-colors`}
        >
          <Twitter className={`w-3.5 h-3.5 ${accent.text}`} />
        </a>
        <a
          href={links.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          title="Condividi su WhatsApp"
          className={`p-1.5 rounded-lg ${accent.bg} ${accent.hover} transition-colors`}
        >
          <MessageCircle className={`w-3.5 h-3.5 ${accent.text}`} />
        </a>
        <button
          onClick={copyLink}
          title="Copia link"
          className={`p-1.5 rounded-lg ${accent.bg} ${accent.hover} transition-colors`}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <Link className={`w-3.5 h-3.5 ${accent.text}`} />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg ${accent.bg} ${accent.border} border ${accent.hover} ${accent.text} font-medium transition-colors`}
      >
        <Share2 className="w-3.5 h-3.5" />
        Condividi
      </button>

      {open && (
        <div
          className="absolute bottom-full mb-2 left-0 bg-[#0d1628] border border-white/10 rounded-xl p-2 shadow-xl z-50 flex gap-1.5"
          onMouseLeave={() => setOpen(false)}
        >
          <a
            href={links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg ${accent.bg} ${accent.hover} ${accent.text} transition-colors whitespace-nowrap`}
          >
            <Linkedin className="w-3.5 h-3.5" /> LinkedIn
          </a>
          <a
            href={links.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg ${accent.bg} ${accent.hover} ${accent.text} transition-colors whitespace-nowrap`}
          >
            <Twitter className="w-3.5 h-3.5" /> X
          </a>
          <a
            href={links.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg ${accent.bg} ${accent.hover} ${accent.text} transition-colors whitespace-nowrap`}
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
          </a>
          <button
            onClick={copyLink}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg ${accent.bg} ${accent.hover} ${accent.text} transition-colors whitespace-nowrap`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Link className="w-3.5 h-3.5" />}
            {copied ? "Copiato!" : "Copia link"}
          </button>
        </div>
      )}
    </div>
  );
}
