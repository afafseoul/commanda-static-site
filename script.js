const { createClient } = supabase;

const supabaseUrl = 'https://jgdsbsgajoidkqiwndnp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // raccourci ici
const supabaseClient = createClient(supabaseUrl, supabaseKey);

async function loadDashboard() {
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
  if (!user) {
    window.location.href = "/signup.html";
    return;
  }

  const { data, error } = await supabaseClient
    .from("users_web")
    .select("pseudo, Plan, used_free_trial")
    .eq("id", user.id)
    .single();

  const welcome = document.getElementById("welcome-msg");
  const current = document.getElementById("current-plan");
  const available = document.getElementById("available-plans");

  if (error) {
    console.error("Erreur récupération user:", error);
    welcome.textContent = "Erreur de connexion.";
    return;
  }

  welcome.textContent = `Bienvenue ${data.pseudo ?? ""} !`;

  if (data.Plan) {
    current.innerHTML = `<p>🟢 Ton offre actuelle : <strong>${data.Plan}</strong></p>`;
  } else {
    current.innerHTML = `<p>🔴 Aucune offre active.</p>`;
  }

  let html = `<h3>Offres disponibles :</h3><ul>`;
  if (!data.used_free_trial && !data.Plan) {
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

if (window.location.pathname.includes("dashboard.html")) {
  loadDashboard();
}
