/**
 * VerifyBadge — Badge VERIFY con hash SHA-256 univoco per ogni articolo
 *
 * Mostra sotto ogni notizia:
 *   VERIFY HASH  #XXXXXXXXXXXXXXXX
 *
 * L'hash certifica il contenuto dell'articolo al momento della pubblicazione,
 * garantendo tracciabilita e verificabilita nel tempo.
 *
 * Il badge è cliccabile e porta direttamente alla pagina /verify?hash=...
 */
import { ShieldCheck } from "lucide-react";
import { Link } from "wouter";

interface VerifyBadgeProps {
  hash?: string | null;
  size?: "sm" | "md";
}

export default function VerifyBadge({ hash, size = "sm" }: VerifyBadgeProps) {
  if (!hash) return null;

  const displayHash = "#" + hash.substring(0, 16).toUpperCase();
  const verifyUrl = `/verify?hash=${encodeURIComponent(hash)}`;

  if (size === "sm") {
    return (
      <Link href={verifyUrl}>
        <span
          className="inline-flex items-center gap-1 cursor-pointer hover:opacity-75 transition-opacity select-none"
          title={"Verifica autenticità su IDEASMART VERIFY — Hash: " + hash}
        >
          <ShieldCheck
            size={10}
            strokeWidth={2.5}
            style={{ color: "#0066cc", flexShrink: 0 }}
          />
          <span
            style={{
              fontFamily: "JetBrains Mono, 'Courier New', monospace",
              fontSize: "9px",
              fontWeight: 600,
              letterSpacing: "0.05em",
              color: "#0066cc",
              lineHeight: 1,
              textDecoration: "none",
            }}
          >
            VERIFY {displayHash}
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Link href={verifyUrl}>
      <div
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded border cursor-pointer hover:opacity-80 transition-opacity"
        style={{ borderColor: "#0066cc20", background: "#f0f7ff" }}
        title={"Verifica autenticità su IDEASMART VERIFY — Hash: " + hash}
      >
        <ShieldCheck
          size={12}
          strokeWidth={2.5}
          style={{ color: "#0066cc", flexShrink: 0 }}
        />
        <span
          style={{
            fontFamily: "JetBrains Mono, 'Courier New', monospace",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: "#0066cc",
            lineHeight: 1,
          }}
        >
          VERIFY HASH {displayHash}
        </span>
      </div>
    </Link>
  );
}
