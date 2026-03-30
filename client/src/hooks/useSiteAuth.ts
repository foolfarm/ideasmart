/**
 * useSiteAuth — hook unificato per lo stato di autenticazione IdeaSmart
 * Accetta ENTRAMBI i sistemi:
 * 1. Autenticazione nativa IdeaSmart (cookie ideasmart_session → trpc.siteAuth.me)
 * 2. OAuth Manus (cookie app_session_id → trpc.auth.me)
 * Se uno dei due è autenticato, l'utente è considerato loggato.
 */
import { trpc } from "@/lib/trpc";

export function useSiteAuth() {
  // Sistema nativo IdeaSmart
  const {
    data: siteUser,
    isLoading: siteLoading,
    refetch: siteRefetch,
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

  const logoutMutation = trpc.siteAuth.logout.useMutation({
    onSuccess: () => siteRefetch(),
  });

  // L'utente è autenticato se ha almeno uno dei due sistemi attivi
  const isAuthenticated = !!siteUser || !!oauthUser;
  const isLoading = siteLoading && oauthLoading;

  // Preferisci il siteUser per i dati, fallback su oauthUser
  const user = siteUser ?? (oauthUser ? { id: oauthUser.id, username: oauthUser.name, email: oauthUser.email, emailVerified: true } : null);

  return {
    user,
    isLoading,
    isAuthenticated,
    logout: () => logoutMutation.mutate(),
    refetch: siteRefetch,
  };
}
