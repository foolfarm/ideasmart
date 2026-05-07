import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";
import "./lib/i18n";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

// Prefissi di path tRPC per mutation non critiche (tracking, analytics)
// che possono fallire con 502/DNS transitorio senza impattare l'UX
const SILENT_MUTATION_PREFIXES = [
  ["banners", "trackImpression"],
  ["banners", "trackClick"],
  ["analytics", "track"],
  ["readers", "ping"],
];

/**
 * Controlla se il mutationKey tRPC corrisponde a una mutation silenziosa.
 * tRPC imposta mutationKey come [["namespace", "method"]] (array annidato).
 */
function isSilentMutation(mutationKey: unknown): boolean {
  if (!Array.isArray(mutationKey) || mutationKey.length === 0) return false;
  const pathParts = mutationKey[0];
  if (!Array.isArray(pathParts)) return false;
  return SILENT_MUTATION_PREFIXES.some(
    prefix => prefix.every((part, i) => pathParts[i] === part)
  );
}

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);

    // Non logga errori transitori di mutation di tracking (502 DNS sandbox, ecc.)
    if (!isSilentMutation(event.mutation.options.mutationKey)) {
      console.error("[API Mutation Error]", error);
    }
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    })
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
