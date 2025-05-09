import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  'https://jgdsbsgajoidkqiwndnp.supabase.co',
  'SUPABASE_ANON_KEY'
);

document.getElementById('logout-btn').addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
});

async function initDashboard() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Erreur utilisateur : ', userError);
    return (window.location.href = 'login.html');
  }

  const userId = user.id;

  // Vérifie si le user est déjà dans users_web
  const { data: existingUser, error: existingError } = await supabase
    .from('users_web')
    .select('*')
    .eq('id', userId)
    .single();

  if (existingError && existingError.code !== 'PGRST116') {
    console.error('Erreur de vérification :', existingError);
    return;
  }

  if (!existingUser) {
    // Insert automatique si absent
    const { error: insertError } = await supabase.from('users_web').insert({
      id: userId,
      email: user.email,
      pseudo: user.user_metadata.full_name,
    });

    if (insertError) {
      console.error('Erreur d’insertion :', insertError);
    } else {
      console.log('✅ Utilisateur ajouté automatiquement');
    }
  } else {
    // Update automatique si email ou pseudo sont null
    const updates = {};
    if (!existingUser.email) updates.email = user.email;
    if (!existingUser.pseudo) updates.pseudo = user.user_metadata.full_name;

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('users_web')
        .update(updates)
        .eq('id', userId);

      if (updateError) {
        console.error('Erreur de mise à jour automatique :', updateError);
      } else {
        console.log('✅ Utilisateur mis à jour automatiquement');
      }
    }
  }

  // Relecture finale
  const { data: userData, error: readError } = await supabase
    .from('users_web')
    .select('*')
    .eq('id', userId)
    .single();

  if (readError) {
    console.error('Erreur de récupération finale :', readError);
    return;
  }

  document.getElementById('user-email').textContent = userData.email || '–';
  document.getElementById('user-pseudo').textContent = userData.pseudo || '–';
  document.getElementById('user-plan').textContent = userData.Plan || '–';
  document.getElementById('user-trial').textContent = userData.used_free_trial ? 'Oui' : 'Non';
}

initDashboard();
