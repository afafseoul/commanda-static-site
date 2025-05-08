import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabase = createClient(
  'https://jgdsbsgajoidkqiwndnp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHNic2dham9pZGtxaXduZG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUwOTA4MTMsImV4cCI6MjAyMDY2NjgxM30.y25cXK8kuOlLDnbcrAnwXQ2UhhOpV3NuIXkNrrRZ5g'
);

// Bouton Google
const googleLoginBtn = document.getElementById("google-login");
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) alert("Erreur OAuth : " + error.message);
  });
}

// DASHBOARD
const emailEl = document.getElementById("user-email");
const pseudoEl = document.getElementById("user-pseudo");
const planEl = document.getElementById("user-plan");
const trialEl = document.getElementById("user-trial");

if (emailEl && pseudoEl && planEl && trialEl) {
  (async () => {
    // 🚨 Capture du token si dans l'URL (obligatoire après login OAuth)
    await supabase.auth.getSessionFromUrl();

    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

    if (!session || sessionError || !session.user) {
      console.warn("Utilisateur non authentifié ou session absente", session);
      return;
    }

    const user = session.user;
    emailEl.textContent = user.email;

    const { data, error: fetchError } = await supabase
      .from("users_web")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Erreur DB :", fetchError);
    } else if (data) {
      pseudoEl.textContent = data.pseudo || "-";
      planEl.textContent = data.Plan || "-";
      trialEl.textContent = data.used_free_trial ? "Oui" : "Non";
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
