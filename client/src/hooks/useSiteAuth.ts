/**
 * useSiteAuth — hook unificato per lo stato di autenticazione IdeaSmart
 * Accetta ENTRAMBI i sistemi:
 * 1. Autenticazione nativa IdeaSmart (cookie ideasmart_session → trpc.siteAuth.me)
 * 2. OAuth Manus (cookie app_session_id → trpc.auth.me)
 * Se uno dei due è autenticato, l'utente è considerato loggato.
 * Il logout gestisce entrambi i sistemi.
 */
import { trpc } from "@/lib/trpc";

export function useSiteAuth() {
  const utils = trpc.useUtils();

  // Sistema nativo IdeaSmart
  const {
    data: siteUser,
    isLoading: siteLoading,
  } = trpc.siteAuth.me.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Sistema OAuth Manus (admin/owner)
  const {
    data: oauthUser,
    isLoading: oauthLoading,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Logout nativo IdeaSmart
  const siteLogoutMutation = trpc.siteAuth.logout.useMutation();
  // Logout OAuth Manus
  const oauthLogoutMutation = trpc.auth.logout.useMutation();

  // L'utente è autenticato se ha almeno uno dei due sistemi attivi
  const isAuthenticated = !!siteUser || !!oauthUser;
  const isLoading = siteLoading && oauthLoading;

  // Preferisci il siteUser per i dati, fallback su oauthUser
  const user = siteUser ?? (oauthUser ? { id: oauthUser.id, username: oauthUser.name, email: oauthUser.email, emailVerified: true } : null);

  const logout = async () => {
    try {
      // Logout da entrambi i sistemi
      const promises: Promise<any>[] = [];
      if (siteUser) {
        promises.push(siteLogoutMutation.mutateAsync());
      }
      if (oauthUser) {
        promises.push(oauthLogoutMutation.mutateAsync());
      }
      // Se nessuno dei due è attivo, prova comunque entrambi
      if (promises.length === 0) {
        promises.push(siteLogoutMutation.mutateAsync().catch(() => {}));
        promises.push(oauthLogoutMutation.mutateAsync().catch(() => {}));
      }
      await Promise.allSettled(promises);
    } catch {
      // Ignora errori durante il logout
    }
    // Invalida le cache e ricarica la pagina per pulire lo stato
    utils.siteAuth.me.invalidate();
    utils.auth.me.invalidate();
    window.location.href = "/";
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
    refetch: () => {
      utils.siteAuth.me.invalidate();
      utils.auth.me.invalidate();
    },
  };
}
