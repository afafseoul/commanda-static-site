import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabase = createClient(
  'https://jgdsbsgajoidkqiwndnp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHNic2dham9pZGtxaXduZG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUwOTA4MTMsImV4cCI6MjAyMDY2NjgxM30.y25cXK8kuOlLDnbcrAnwXQ2UhhOpV3NuIXkNrrRZ5g'
);

// 🔁 Dashboard (lecture session + insertion dans users_web)
const emailEl = document.getElementById("user-email");
const pseudoEl = document.getElementById("user-pseudo");
const planEl = document.getElementById("user-plan");
const trialEl = document.getElementById("user-trial");

if (emailEl && pseudoEl && planEl && trialEl) {
  (async () => {
    // 1. Si on vient d'un login Google, on échange l’access_token
    const hash = window.location.hash;
    if (hash.includes("access_token")) {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        console.error("Erreur exchangeCodeForSession :", error.message);
        return;
      }
      window.history.replaceState({}, document.title, "/dashboard.html");
    }

    // 2. Récupération de session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (!session || sessionError) {
      console.warn("Pas de session", sessionError);
      return;
    }

    const user = session.user;
    emailEl.textContent = user.email;

    // 3. Enregistrement ou lecture dans users_web
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

  // Déconnexion
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "/signup.html";
    });
  }
}

// 🔐 Google Login (signup.html)
const googleLoginBtn = document.getElementById("google-login");
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://cozy-maamoul-92d86f.netlify.app/dashboard.html'
      }
    });
    if (error) alert("Erreur OAuth : " + error.message);
  });
}

// ✍️ Formulaire signup manuel
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const pseudo = document.getElementById("pseudo").value;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: pseudo }
      }
    });

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      alert("Inscription réussie ! Vérifie ton email.");
      window.location.href = "dashboard.html";
    }
  });
}
