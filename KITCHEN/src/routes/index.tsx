import { createFileRoute, redirect } from "@tanstack/react-router";
import { authService } from "@/kitchen/services";

export const Route = createFileRoute("/")({
  ssr: false,
  pendingComponent: () => (
    <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
      Loading kitchen…
    </div>
  ),
  beforeLoad: async () => {
    throw redirect({ to: (await authService.isSignedIn()) ? "/kitchen" : "/login" });
  },
  head: () => ({
    meta: [
      { title: "Crunch Box Kitchen" },
      { name: "description", content: "Crunch Box kitchen operations app." },
      { property: "og:title", content: "Crunch Box Kitchen" },
      { property: "og:description", content: "Crunch Box kitchen operations app." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
