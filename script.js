import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://jgdsbsgajoidkqiwndnp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHNic2dham9pZGtxaXduZG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNDg4NDcsImV4cCI6MjA2MTgyNDg0N30.7h5X4HUlX2hylPpcJfRxPeHezJYlPommJZIYLbu1kSY'
);

// Dashboard loading
const loadDashboard = async () => {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;

  if (!session) {
    console.log("Pas de session");
    return;
  }

  const user = session.user;
  const { data: userData, error } = await supabase
    .from('users_web')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!error && userData) {
    document.getElementById('email').textContent = user.email || '';
    document.getElementById('pseudo').textContent = userData.pseudo || '';
    document.getElementById('plan').textContent = userData.Plan || '';
    document.getElementById('free-trial').textContent = userData.used_free_trial ? 'Oui' : 'Non';
  }
};

// Auth form handlers
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const pseudo = document.getElementById("pseudo").value;

      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return alert("Erreur : " + error.message);

      await supabase.from("users_web").insert({
        id: data.user.id,
        email,
        pseudo,
        Plan: "Free",
        used_free_trial: false,
      });

      window.location.href = "dashboard.html";
    });
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const { data: loginData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return alert("Erreur : " + error.message);

      const user = loginData.user;
      const { data: existing } = await supabase
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
          used_free_trial: false,
        });
      }

      window.location.href = "dashboard.html";
    });
  }

  const googleSignupBtn = document.getElementById("google-signup") || document.getElementById("google-login");
  if (googleSignupBtn) {
    googleSignupBtn.addEventListener("click", async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard.html"
        }
      });
      if (error) alert("Erreur Google : " + error.message);
    });
  }

  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "index.html";
    });
  }

  const onDashboard = window.location.pathname.includes("dashboard.html");
  if (onDashboard) {
    loadDashboard();
  }
});
