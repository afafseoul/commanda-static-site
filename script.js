
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabase = createClient(
  'https://jgdsbsgajoidkqiwndnp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHNic2dham9pZGtxaXduZG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUwOTA4MTMsImV4cCI6MjAyMDY2NjgxM30.y25cXK8kuOlLDnbcrAnwXQ2UhhOpV3NuIXkNrrRZ5g'
);

const { data: { session }, error } = await supabase.auth.getSession();

if (!session || error) {
  window.location.href = "/signup.html";
} else {
  const user = session.user;
  console.log("Utilisateur connecté :", user);

  // Vérification et insertion éventuelle dans users_web
  try {
    const { data: userRecord, error: userFetchError } = await supabase
      .from('users_web')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!userRecord) {
      console.log("Utilisateur non présent dans users_web. Insertion en cours…");
      const { error: insertError } = await supabase
        .from('users_web')
        .insert({
          id: user.id,
          email: user.email,
          pseudo: user.user_metadata?.full_name || "",
          Plan: "Free",
          used_free_trial: false
        });

      if (insertError) {
        console.error("Échec de l'insertion dans users_web :", insertError.message);
      } else {
        console.log("Utilisateur inséré avec succès dans users_web.");
      }
    }
  } catch (e) {
    console.error("Erreur inattendue lors de la vérification users_web :", e);
  }

  document.getElementById("user-email").textContent = "Connecté : " + user.email;
}

document.getElementById("logout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "/login.html";
});
