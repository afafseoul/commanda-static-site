import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://jgdsbsgajoidkqiwndnp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHNic2dham9pZGtxaXduZG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUwOTA4MTMsImV4cCI6MjAyMDY2NjgxM30.y25cXK8kuOlLDnbcrAnwXQ2UhhOpV3NuIXkNrrRZ5g'
);

// BOUTON LOGIN GOOGLE
const googleLoginBtn = document.getElementById("google-login");
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) alert("Erreur OAuth : " + error.message);
  });
}

// DASHBOARD LOGIC
const emailEl = document.getElementById("user-email");
const pseudoEl = document.getElementById("user-pseudo");
const planEl = document.getElementById("user-plan");
const trialEl = document.getElementById("user-trial");

if (emailEl && pseudoEl && planEl && trialEl) {
  (async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const session = sessionData?.session;

    if (!session || sessionError) {
      console.warn("Utilisateur non authentifié ou session absente", session);
      return; // Pas de redirection brutale pour pouvoir débugger
    }

    const user = session.user;
    if (!user?.id) {
      console.error("User ID manquant");
      return;
    }

    emailEl.textContent = user.email;

    const { data: existingUser, error: fetchError } = await supabase
      .from("users_web")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Erreur DB fetch", fetchError);
      return;
    }

    if (!existingUser) {
      const { error: insertError } = await supabase.from("users_web").insert({
        id: user.id,
        email: user.email,
        pseudo: user.user_metadata?.full_name || "",
        Plan: "Free",
        used_free_trial: false
      });

      if (insertError) {
        console.error("Erreur DB insert", insertError);
      } else {
        console.log("Nouvel utilisateur inséré");
      }

      // Recharge les infos après insertion
      pseudoEl.textContent = user.user_metadata?.full_name || "-";
      planEl.textContent = "Free";
      trialEl.textContent = "Non";
    } else {
      pseudoEl.textContent = existingUser.pseudo || "-";
      planEl.textContent = existingUser.Plan || "-";
      trialEl.textContent = existingUser.used_free_trial ? "Oui" : "Non";
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
