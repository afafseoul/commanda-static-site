import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabase = createClient(
  'https://jgdsbsgajoidkqiwndnp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHNic2dham9pZGtxaXduZG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNDg4NDcsImV4cCI6MjA2MTgyNDg0N30.7h5X4HUlX2hylPpcJfRxPeHezJYlPommJZIYLbu1kSY'
)

const loadUserData = async () => {
  const { data: sessionData } = await supabase.auth.getSession()
  const session = sessionData?.session
  if (!session) return

  const user = session.user

  const { data: userData, error: userError } = await supabase
    .from('users_web')
    .select('*')
    .eq('id', user.id)
    .single()

  if (userError) {
    console.error("❌ Erreur lecture users_web :", userError.message)
    return
  }

  if (userData) {
    document.getElementById('user-email').textContent = userData.email || '-'
    document.getElementById('user-pseudo').textContent = userData.pseudo || '-'
    document.getElementById('user-plan').textContent = userData.Plan || '-'
    document.getElementById('user-trial').textContent = userData.used_free_trial ? 'Oui' : 'Non'
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const signupForm = document.getElementById('signup-form')
  const loginForm = document.getElementById('login-form')
  const googleLoginBtn = document.getElementById('google-login')
  const logoutBtn = document.getElementById('logout-btn')

  // ✅ SIGNUP email/mot de passe
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault()
      const pseudo = document.getElementById('pseudo').value
      const email = document.getElementById('email').value
      const password = document.getElementById('password').value

      localStorage.setItem('pending_pseudo', pseudo)

      const { error: signupError } = await supabase.auth.signUp({ email, password })
      if (signupError) return alert('Erreur : ' + signupError.message)

      alert('Un email de confirmation t’a été envoyé. Vérifie ta boîte mail 📩')
      window.location.href = 'login.html'
    })
  }

  // ✅ LOGIN email/mot de passe
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

  // ✅ LOGIN Google
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard.html'
        }
      })
      if (error) {
        console.error('Erreur Google :', error.message)
      } else {
        console.log('✅ Redirection vers Google OAuth...')
      }
    })
  }

  // ✅ LOGOUT
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut()
      window.location.href = 'index.html'
    })
  }

  // ✅ DASHBOARD : insert/update dans users_web
  if (window.location.pathname.includes('dashboard.html')) {
    const { data: sessionData } = await supabase.auth.getSession()
    const session = sessionData?.session
    if (!session) return

    const user = session.user
    const email = user.email
    const pseudoGoogle = user.user_metadata?.name || user.user_metadata?.full_name || ''
    const pseudoSignup = localStorage.getItem('pending_pseudo') || ''
    const pseudo = pseudoSignup || pseudoGoogle || 'Inconnu'

    const { data: existingUser, error: selectError } = await supabase
      .from('users_web')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Erreur SELECT users_web :', selectError)
      return
    }

    if (!existingUser) {
      const { error: insertError } = await supabase.from('users_web').insert({
        id: user.id,
        email,
        pseudo,
        Plan: 'Free',
        used_free_trial: false
      })
      if (insertError) {
        console.error('Erreur INSERT users_web :', insertError)
      } else {
        console.log('✅ Utilisateur inséré automatiquement')
      }
    } else {
      const updates = {}
      if (!existingUser.email || existingUser.email === '') updates.email = email
      if (!existingUser.pseudo || existingUser.pseudo === '') updates.pseudo = pseudo

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('users_web')
          .update(updates)
          .eq('id', user.id)

        if (updateError) {
          console.error('Erreur UPDATE users_web :', updateError)
        } else {
          console.log('✅ Utilisateur mis à jour automatiquement')
        }
      }
    }

    // Nettoyage après premier login
    localStorage.removeItem('pending_pseudo')

    await loadUserData()
  }
})
