/**
 * useSiteAuth — hook per lo stato di autenticazione nativa IdeaSmart
 * Usa trpc.siteAuth.me per sapere se l'utente è loggato via cookie sessione
 */
import { trpc } from "@/lib/trpc";

export function useSiteAuth() {
  const { data: user, isLoading, refetch } = trpc.siteAuth.me.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const logoutMutation = trpc.siteAuth.logout.useMutation({
    onSuccess: () => refetch(),
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    logout: () => logoutMutation.mutate(),
    refetch,
  };
}
