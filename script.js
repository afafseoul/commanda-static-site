import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://jgdsbsgajoidkqiwndnp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHNic2dham9pZGtxaXduZG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUwOTA4MTMsImV4cCI6MjAyMDY2NjgxM30.y25cXK8kuOlLDnbcrAnwXQ2UhhOpV3NuIXkNrrRZ5g'
);

// SIGNUP.HTML - Connexion avec Google
const googleBtn = document.getElementById("google-login");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) alert("Erreur de connexion : " + error.message);
  });
}

// DASHBOARD.HTML - Affichage des infos
const emailEl = document.getElementById("user-email");
const pseudoEl = document.getElementById("user-pseudo");
const planEl = document.getElementById("user-plan");
const trialEl = document.getElementById("user-trial");

if (emailEl && pseudoEl && planEl && trialEl) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (!session || sessionError || !session.user) {
    console.warn("Utilisateur non authentifié ou session absente", sessionError);
    return; // NE redirige pas pour debug
  }

  const user = session.user;
  emailEl.textContent = user.email;

  const { data, error: fetchError } = await supabase
    .from("users_web")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (fetchError) {
    console.error("Erreur lors du fetch Supabase :", fetchError);
  } else if (data) {
    pseudoEl.textContent = data.pseudo || "-";
    planEl.textContent = data.Plan || "-";
    trialEl.textContent = data.used_free_trial ? "Oui" : "Non";
  } else {
    pseudoEl.textContent = "-";
    planEl.textContent = "-";
    trialEl.textContent = "-";
  }

  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "/signup.html";
    });
  }
}
