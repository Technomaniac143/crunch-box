import { supabase } from "@/integrations/supabase/client";

export const authService = {
  isMock: false,
  async signIn(
    email: string,
    password: string,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return {
        ok: false,
        error: error.message.includes("confirm")
          ? "Please confirm your email first — check your inbox."
          : "Incorrect email or password.",
      };
    }
    return { ok: true };
  },
  async createKitchenAccount(
    email: string,
    password: string,
  ): Promise<{ ok: true; needsConfirm: boolean } | { ok: false; error: string }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, needsConfirm: !data.session };
  },
  async kitchenAccountExists(): Promise<boolean> {
    const { data } = await supabase.rpc("kitchen_account_exists");
    return !!data;
  },
  async signOut() {
    await supabase.auth.signOut();
  },
  async isSignedIn(): Promise<boolean> {
    // Local session check with a timeout so a slow network never leaves a blank screen.
    const check = supabase.auth.getSession().then(({ data }) => !!data.session);
    const timeout = new Promise<boolean>((r) => setTimeout(() => r(false), 4000));
    return Promise.race([check, timeout]).catch(() => false);
  },
  async isKitchenAdmin(): Promise<boolean> {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return false;
    const { data } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    return !!data;
  },
};
