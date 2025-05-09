import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://jgdsbsgajoidkqiwndnp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHNic2dham9pZGtxaXduZG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUwOTA4MTMsImV4cCI6MjAyMDY2NjgxM30.y25cXK8kuOlLDnbcrAnwXQ2UhhOpV3NuIXkNrrRZ5g'
);

// === LOGIN ===
const googleLoginBtn = document.getElementById("google-login");
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) alert("Erreur OAuth : " + error.message);
  });
}

// === DASHBOARD ===
const emailEl = document.getElementById("user-email");
const pseudoEl = document.getElementById("user-pseudo");
const planEl = document.getElementById("user-plan");
const trialEl = document.getElementById("user-trial");

if (emailEl && pseudoEl && planEl && trialEl) {
  (async () => {
    // 1. Si URL contient un access_token (via Google OAuth), on valide la session via l’URL
    const hash = window.location.hash;
    if (hash.includes("access_token")) {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        console.error("Erreur d’échange de session :", error.message);
        return;
      }
      // Nettoie l’URL
      window.history.replaceState({}, document.title, "/dashboard.html");
    }

    // 2. Maintenant qu'on est sûr d’avoir échangé le token, on récupère la session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (!session || sessionError) {
      console.warn("Utilisateur non authentifié ou session absente", sessionError);
      return;
    }

    const user = session.user;
    emailEl.textContent = user.email;

    // 3. Vérifie si l'utilisateur existe déjà dans users_web
    const { data: existing, error: fetchError } = await supabase
      .from("users_web")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!existing) {
      await supabase.from("users_web").insert({
        id: user.id,
        email: user.email,
        pseudo: user.user_metadata?.full_name || '',
        Plan: "Free",
        used_free_trial: false
      });
      pseudoEl.textContent = user.user_metadata?.full_name || '-';
      planEl.textContent = "Free";
      trialEl.textContent = "Non";
    } else {
      pseudoEl.textContent = existing.pseudo || '-';
      planEl.textContent = existing.Plan || '-';
      trialEl.textContent = existing.used_free_trial ? "Oui" : "Non";
    }
  })();

  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "/signup.html";
    });
  }
}
