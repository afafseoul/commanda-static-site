import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://jgdsbsgajoidkqiwndnp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHNic2dham9pZGtxaXduZG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUwOTA4MTMsImV4cCI6MjAyMDY2NjgxM30.y25cXK8kuOlLDnbcrAnwXQ2UhhOpV3NuIXkNrrRZ5g'
);

// ========== PAGE SIGNUP / LOGIN ==========

const googleLoginBtn = document.getElementById("google-login");
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard.html'
      }
    });
    if (error) alert("Erreur OAuth : " + error.message);
  });
}

// ========== PAGE DASHBOARD ==========

const dashboardEmail = document.getElementById("user-email");
const logoutBtn = document.getElementById("logout");

if (dashboardEmail && logoutBtn) {
  // Attend que l'utilisateur soit chargé proprement
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user || error) {
    window.location.href = "/signup.html";
  } else {
    dashboardEmail.textContent = "Connecté : " + user.email;

    // Vérifie si user déjà dans users_web
    const { data: existing, error: fetchError } = await supabase
      .from("users_web")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!existing) {
      const { error: insertError } = await supabase.from("users_web").insert({
        id: user.id,
        email: user.email,
        pseudo: user.user_metadata?.full_name || "",
        Plan: "Free",
        used_free_trial: false
      });
      if (insertError) console.error("Erreur insertion user :", insertError.message);
    }
  }

  // Déconnexion
  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "/login.html";
  });
}
