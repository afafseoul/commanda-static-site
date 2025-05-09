import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://jgdsbsgajoidkqiwndnp.supabase.co',
  'public-anon-key-ici' // ← ⚠️ Remplace par TA PUBLIC ANON KEY (non l'admin secret key !)
);

// Connexion Google
const googleLoginBtn = document.getElementById("google-login");
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) alert("Erreur OAuth : " + error.message);
  });
}

// Dashboard
const emailEl = document.getElementById("user-email");
const pseudoEl = document.getElementById("user-pseudo");
const planEl = document.getElementById("user-plan");
const trialEl = document.getElementById("user-trial");

if (emailEl && pseudoEl && planEl && trialEl) {
  (async () => {
    // 1. Si token OAuth dans l’URL : on l’échange contre une session
    const hash = window.location.hash;
    if (hash.includes("access_token")) {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        console.error("Erreur d’échange de session :", error.message);
        return;
      }
      window.history.replaceState({}, document.title, "/dashboard.html");
    }

    // 2. Récupération session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (!session || sessionError) {
      console.warn("Utilisateur non authentifié ou session absente", sessionError);
      return;
    }

    const user = session.user;
    emailEl.textContent = user.email;

    // 3. Chargement ou insertion dans users_web
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