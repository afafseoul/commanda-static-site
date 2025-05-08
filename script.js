<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@1.35.6/dist/umd/supabase.min.js"></script>
<script>
  const supabase = supabase.createClient(
    'https://jgdsbsgajoidkqiwndnp.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHNic2dham9pZGtxaXduZG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUwOTA4MTMsImV4cCI6MjAyMDY2NjgxM30.y25cXK8kuOlLDnbcrAnwXQ2UhhOpV3NuIXkNrrRZ5g'
  );

  supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (!session || error) {
      window.location.href = "/signup.html";
    } else {
      const user = session.user;
      console.log("Utilisateur connecté :", user);

      // Check if user exists in users_web
      supabase
        .from('users_web')
        .select('*')
        .eq('id', user.id)
        .then(({ data, error }) => {
          if (!data || data.length === 0) {
            supabase
              .from('users_web')
              .insert([{
                id: user.id,
                email: user.email,
                pseudo: user.user_metadata?.full_name || "",
                Plan: "Free",
                used_free_trial: false
              }])
              .then(({ error }) => {
                if (error) {
                  console.error("Échec de l'insertion :", error.message);
                } else {
                  console.log("Utilisateur inséré !");
                }
              });
          }
        });

      const userEmail = document.getElementById("user-email");
      if (userEmail) userEmail.textContent = "Connecté : " + user.email;
    }
  });

  const logout = document.getElementById("logout");
  if (logout) {
    logout.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "/login.html";
    });
  }
</script>
