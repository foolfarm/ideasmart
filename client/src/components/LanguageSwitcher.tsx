import { useTranslation } from "react-i18next";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Segoe UI', Arial, sans-serif";

interface LanguageSwitcherProps {
  variant?: "navbar" | "sidebar" | "compact";
}

export default function LanguageSwitcher({ variant = "navbar" }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith("en") ? "en" : "it";

  const toggle = () => {
    const next = currentLang === "it" ? "en" : "it";
    i18n.changeLanguage(next);
  };

  if (variant === "compact") {
    return (
      <button
        onClick={toggle}
        title={currentLang === "it" ? "Switch to English" : "Passa all'italiano"}
        style={{
          fontFamily: SF,
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.04em",
          color: "#1d1d1f",
          background: "none",
          border: "1px solid #d1d1d6",
          borderRadius: "4px",
          padding: "2px 7px",
          cursor: "pointer",
          lineHeight: 1.4,
          transition: "all 150ms ease",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "#f5f5f7";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "none";
        }}
      >
        {currentLang === "it" ? "EN" : "IT"}
      </button>
    );
  }

  if (variant === "sidebar") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "4px 8px",
        }}
      >
        <button
          onClick={() => i18n.changeLanguage("it")}
          style={{
            fontFamily: SF,
            fontSize: "11px",
            fontWeight: currentLang === "it" ? 700 : 500,
            color: currentLang === "it" ? "#1d1d1f" : "#8e8e93",
            background: currentLang === "it" ? "#f5f5f7" : "none",
            border: "none",
            borderRadius: "4px",
            padding: "2px 6px",
            cursor: "pointer",
          }}
        >
          IT
        </button>
        <span style={{ color: "#d1d1d6", fontSize: "10px" }}>|</span>
        <button
          onClick={() => i18n.changeLanguage("en")}
          style={{
            fontFamily: SF,
            fontSize: "11px",
            fontWeight: currentLang === "en" ? 700 : 500,
            color: currentLang === "en" ? "#1d1d1f" : "#8e8e93",
            background: currentLang === "en" ? "#f5f5f7" : "none",
            border: "none",
            borderRadius: "4px",
            padding: "2px 6px",
            cursor: "pointer",
          }}
        >
          EN
        </button>
      </div>
    );
  }

  // navbar variant — pill toggle
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "#f5f5f7",
        borderRadius: "6px",
        padding: "2px",
        gap: "1px",
      }}
    >
      {(["it", "en"] as const).map(lang => (
        <button
          key={lang}
          onClick={() => i18n.changeLanguage(lang)}
          style={{
            fontFamily: SF,
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.04em",
            color: currentLang === lang ? "#ffffff" : "#8e8e93",
            background: currentLang === lang ? "#1d1d1f" : "transparent",
            border: "none",
            borderRadius: "4px",
            padding: "3px 8px",
            cursor: "pointer",
            transition: "all 150ms ease",
            lineHeight: 1.4,
          }}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
