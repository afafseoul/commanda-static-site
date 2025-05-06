// === Supabase Auth Init ===
const { createClient } = supabase;

const supabaseUrl = 'https://jgdsbsgajoidkqiwndnp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHNic2dham9pZGtxaXduZG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNDg4NDcsImV4cCI6MjA2MTgyNDg0N30.7h5X4HUlX2hylPpcJfRxPeHezJYlPommJZIYLbu1kSY';

const supabaseClient = createClient(supabaseUrl, supabaseKey);

// === SIGNUP HANDLER ===
document.getElementById('signup-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const fullname = document.getElementById('fullname').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { fullname }
    }
  });

  if (error) {
    alert('Erreur: ' + error.message);
    console.error(error);
  } else {
    alert('Inscription réussie ! Vérifie ton e-mail ✉️');
    console.log('Success:', data);
  }
});

document.getElementById('google-login').addEventListener('click', async function () {
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://cozy-maamoul-92d86f.netlify.app/dashboard.html'
    }
  });

  if (error) {
    alert('Erreur Google: ' + error.message);
    console.error(error);
  }
});


// Redirection après connexion (ex: via mail ou Google)
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session && session.user) {
    window.location.href = "/dashboard.html";  // crée cette page si elle n'existe pas encore
  }
});

// Redirection post-OAuth directe (si token dans l'URL après retour Google)
const hashParams = new URLSearchParams(window.location.hash.substr(1));
const accessToken = hashParams.get("access_token");

if (accessToken) {
  window.location.href = "/dashboard.html";
}
