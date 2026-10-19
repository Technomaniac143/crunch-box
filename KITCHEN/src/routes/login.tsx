import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, AlertCircle, MailCheck } from "lucide-react";
import { authService } from "@/kitchen/services";
import { ActionButton, Logo } from "@/kitchen/components/ui";
import { unlockAudio } from "@/kitchen/notifications/alerts";

export const Route = createFileRoute("/login")({
  ssr: false,
  pendingComponent: () => (
    <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
      Loading kitchen…
    </div>
  ),
  beforeLoad: async () => {
    if (await authService.isSignedIn()) throw redirect({ to: "/kitchen" });
  },
  head: () => ({
    meta: [
      { title: "Sign in · Crunch Box Kitchen" },
      { name: "description", content: "Shared kitchen sign-in for Crunch Box staff on duty." },
      { property: "og:title", content: "Sign in · Crunch Box Kitchen" },
      {
        property: "og:description",
        content: "Shared kitchen sign-in for Crunch Box staff on duty.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "setup">("signin");
  const [canSetup, setCanSetup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    authService.kitchenAccountExists().then((exists) => setCanSetup(!exists));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    unlockAudio();
    if (mode === "setup") {
      const r = await authService.createKitchenAccount(email.trim(), password);
      setBusy(false);
      if (!r.ok) return setErrors({ form: r.error });
      if (r.needsConfirm) return setSent(true);
      return nav({ to: "/kitchen", replace: true });
    }
    const r = await authService.signIn(email.trim(), password);
    setBusy(false);
    if (!r.ok) return setErrors({ form: r.error });
    nav({ to: "/kitchen", replace: true });
  }

  const field =
    "mt-1.5 w-full min-h-12 rounded-xl border bg-card px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="bg-brand px-6 pb-16 pt-12 text-brand-foreground">
        <div className="mx-auto max-w-sm">
          <div className="inline-flex rounded-2xl bg-card p-2 pr-4">
            <Logo />
          </div>
          <h1 className="font-display mt-8 text-4xl font-bold leading-tight">
            {mode === "setup" ? (
              <>
                Set up the <span className="text-gold">kitchen</span>
              </>
            ) : (
              <>
                Ready for <span className="text-gold">service?</span>
              </>
            )}
          </h1>
          <p className="mt-2 text-sm opacity-80">
            {mode === "setup"
              ? "Create the one shared kitchen account. Only this account can edit the menu."
              : "Sign in with the shared kitchen account to start your shift."}
          </p>
        </div>
      </div>
      <form onSubmit={submit} noValidate className="mx-auto -mt-10 w-full max-w-sm px-4">
        {sent ? (
          <div className="space-y-2 rounded-2xl border border-border bg-card p-5 text-center shadow-card">
            <MailCheck className="mx-auto h-10 w-10 text-status-ready" />
            <p className="font-semibold">Check your email</p>
            <p className="text-sm text-muted-foreground">
              Open the confirmation link we sent to {email}, then sign in here.
            </p>
            <ActionButton
              type="button"
              block
              tone="ghost"
              onClick={() => {
                setSent(false);
                setMode("signin");
              }}
            >
              Back to sign in
            </ActionButton>
          </div>
        ) : (
          <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
            {errors.form && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl bg-status-new-soft p-3 text-sm font-medium text-primary"
              >
                <AlertCircle className="h-4 w-4 shrink-0" /> {errors.form}
              </div>
            )}
            <label className="block text-sm font-semibold">
              Email
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                className={`${field} ${errors.email ? "border-primary" : "border-border"}`}
                placeholder="kitchen@crunchbox.in"
              />
              {errors.email && (
                <span className="mt-1 block text-xs text-primary">{errors.email}</span>
              )}
            </label>
            <label className="block text-sm font-semibold">
              Password
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  autoComplete={mode === "setup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                  className={`${field} pr-12 ${errors.password ? "border-primary" : "border-border"}`}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-1 top-1.5 grid h-12 w-11 place-items-center text-muted-foreground"
                >
                  {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <span className="mt-1 block text-xs text-primary">{errors.password}</span>
              )}
            </label>
            <ActionButton type="submit" block busy={busy}>
              {busy ? "Please wait…" : mode === "setup" ? "Create kitchen account" : "Sign in"}
            </ActionButton>
          </div>
        )}
        {canSetup && !sent && (
          <button
            type="button"
            onClick={() => {
              setMode(mode === "setup" ? "signin" : "setup");
              setErrors({});
            }}
            className="mt-4 w-full rounded-xl border border-dashed border-gold bg-accent p-3 text-center text-sm font-semibold text-brand"
          >
            {mode === "setup"
              ? "Already have the kitchen account? Sign in"
              : "First time? Create the kitchen account"}
          </button>
        )}
      </form>
    </main>
  );
}
