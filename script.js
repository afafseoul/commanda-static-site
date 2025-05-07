const supabaseUrl = 'https://jgdsbsgajoidkqiwndnp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // raccourci ici
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Gestion de l'inscription
const signupForm = document.querySelector("#signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = signupForm.querySelector("#email").value;
    const password = signupForm.querySelector("#password").value;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      window.location.href = "/dashboard.html";
    }
  });
}

// Connexion Google
const googleBtn = document.getElementById("google-login");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://cozy-maamoul-92d86f.netlify.app/dashboard.html"
      }
    });
    if (error) console.error("Erreur Google :", error);
  });
}

// Gestion de la session + récupération post-connexion OAuth
let sessionCheckAttempts = 0;
async function checkSession() {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (!session && sessionCheckAttempts < 3) {
    sessionCheckAttempts++;
    setTimeout(checkSession, 500);
    return;
  }

  if (!session || error) {
    window.location.href = "/signup.html";
  } else {
    // Si session valide, tu peux maintenant charger les données ici si besoin
    console.log("Session active :", session);
    // Par exemple : fetchUserData(); ou afficher le dashboard
  }
}

// Récupération automatique après redirection OAuth
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN" && session) {
    window.location.href = "/dashboard.html";
  }
});

// Redirection automatique si sur le dashboard
if (window.location.pathname.includes("dashboard.html")) {
  checkSession();
}
