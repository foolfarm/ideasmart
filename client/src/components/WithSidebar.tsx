/**
 * WithSidebar — wrapper che aggiunge la LeftSidebar a qualsiasi pagina
 * Usato dalle pagine che non usano il layout completo di AiHome/Home
 */
import LeftSidebar from "@/components/LeftSidebar";

interface WithSidebarProps {
  children: React.ReactNode;
}

export default function WithSidebar({ children }: WithSidebarProps) {
  return (
    <div className="flex min-h-screen" style={{ background: "#ffffff" }}>
      <LeftSidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
