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
 // === DASHBOARD LOGIQUE ===
async function loadDashboard() {
  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    window.location.href = "/signup.html";
    return;
  }

  const { data, error } = await supabaseClient
    .from("users")
    .select("fullname, plan, free_used")
    .eq("id", user.id)
    .single();

  const welcome = document.getElementById("welcome-msg");
  const current = document.getElementById("current-plan");
  const available = document.getElementById("available-plans");

  if (error) {
    welcome.textContent = "Erreur de connexion.";
    return;
  }

  welcome.textContent = `Bienvenue ${data.fullname ?? ""} !`;

  if (data.plan) {
    current.innerHTML = `<p>🟢 Ton offre actuelle : <strong>${data.plan}</strong></p>`;
  } else {
    current.innerHTML = `<p>🔴 Aucune offre active.</p>`;
  }

  let html = `<h3>Offres disponibles :</h3><ul>`;
  if (!data.free_used && !data.plan) {
    html += `<li>✅ <strong>Essai gratuit</strong> (7 jours)</li>`;
  }
  html += `
    <li>💛 Starter – 6€</li>
    <li>🔵 Pro – 11€/mois</li>
    <li>🔴 Premium – 17€/mois</li>
    <li>⚫ Pack SMM – 49€/mois</li>
  `;
  html += `</ul>`;

  available.innerHTML = html;
}

// Déconnexion
const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.href = "/index.html";
  });
}

// Auto exécution sur dashboard
if (window.location.pathname.includes("dashboard.html")) {
  loadDashboard();
}
