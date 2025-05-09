import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabase = createClient(
  'https://jgdsbsgajoidkqiwndnp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHNic2dham9pZGtxaXduZG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNDg4NDcsImV4cCI6MjA2MTgyNDg0N30.7h5X4HUlX2hylPpcJfRxPeHezJYlPommJZIYLbu1kSY'
)

const loadUserData = async () => {
  const { data: sessionData } = await supabase.auth.getSession()
  const session = sessionData.session
  if (!session) return

  const user = session.user
  document.getElementById('user-email').textContent = user.email

  const { data: userData, error: userError } = await supabase
    .from('users_web')
    .select('*')
    .eq('id', user.id)
    .single()

  if (userError) {
    console.error("❌ Erreur lecture users_web :", userError.message)
  }

  if (userData) {
    document.getElementById('user-pseudo').textContent = userData.pseudo || '-'
    document.getElementById('user-plan').textContent = userData.Plan || '-'
    document.getElementById('user-trial').textContent = userData.used_free_trial ? 'Oui' : 'Non'
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const signupForm = document.getElementById('signup-form')
  const loginForm = document.getElementById('login-form')
  const googleBtn = document.getElementById('google-login') || document.getElementById('google-signup')
  const logoutBtn = document.getElementById('logout')

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault()
      const pseudo = document.getElementById('pseudo').value
      const email = document.getElementById('email').value
      const password = document.getElementById('password').value

      const { data: signupData, error: signupError } = await supabase.auth.signUp({ email, password })
      if (signupError) return alert('Erreur : ' + signupError.message)

      const user = signupData.user
      if (user) {
        const { error: insertError } = await supabase.from('users_web').insert({
          id: user.id,
          email,
          pseudo,
          Plan: 'Free',
          used_free_trial: false
        })

        if (insertError) console.error("❌ Erreur insert (signup) :", insertError.message)
        else console.log("✅ Signup insert OK")
      }

      window.location.href = 'dashboard.html'
    })
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault()
      const email = document.getElementById('email').value
      const password = document.getElementById('password').value

      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return alert('Erreur : ' + error.message)

      window.location.href = 'dashboard.html'
    })
  }

  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard.html'
        }
      })
      if (error) alert('Erreur Google : ' + error.message)
    })
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut()
      window.location.href = 'index.html'
    })
  }

  if (window.location.pathname.includes('dashboard.html')) {
    const { data: sessionData } = await supabase.auth.getSession()
    const session = sessionData?.session
    if (!session) return

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) return

    const pseudo = user.user_metadata?.name || user.user_metadata?.full_name || ''
    const email = user.email

    const { data: existing, error: existingError } = await supabase
      .from('users_web')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (existingError) {
      console.error("❌ Erreur SELECT users_web :", existingError.message)
    }

    if (!existing) {
      const { error: insertError } = await supabase.from('users_web').insert({
        id: user.id,
        email,
        pseudo,
        Plan: 'Free',
        used_free_trial: false
      })

      if (insertError) {
        console.error("❌ Erreur insert (Google) :", insertError.message)
      } else {
        console.log("✅ Google insert OK")
      }
    } else {
      console.log("ℹ️ Utilisateur déjà présent dans users_web")
    }

    await loadUserData()

    // ✅ Formulaire de mise à jour du pseudo ou email
    const updateForm = document.getElementById('update-form')
    if (updateForm) {
      updateForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        const newPseudo = document.getElementById('new-pseudo').value
        const newEmail = document.getElementById('new-email').value
        const updates = {}
        if (newPseudo) updates.pseudo = newPseudo
        if (newEmail) updates.email = newEmail

        const { error: updateError } = await supabase
          .from('users_web')
          .update(updates)
          .eq('id', user.id)

        if (updateError) {
          console.error("❌ Erreur UPDATE :", updateError.message)
          document.getElementById('update-status').textContent = '❌ Erreur : ' + updateError.message
        } else {
          console.log("✅ UPDATE effectué")
          document.getElementById('update-status').textContent = '✅ Informations mises à jour'
          await loadUserData()
        }
      })
    }
  }
})
