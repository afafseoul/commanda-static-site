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

  const { data: userData } = await supabase
    .from('users_web')
    .select('*')
    .eq('id', user.id)
    .single()

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

      const { error: signupError } = await supabase.auth.signUp({ email, password })
      if (signupError) return alert('Erreur : ' + signupError.message)

      await supabase.auth.signOut()

      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (loginError) return alert('Erreur login après signup : ' + loginError.message)

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

  // ⚡ Partie exécutée quand on arrive sur le dashboard
  if (window.location.pathname.includes('dashboard.html')) {
    const { data: sessionData } = await supabase.auth.getSession()
    const session = sessionData?.session
    if (!session) return

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) return

    const { data: existing } = await supabase
      .from('users_web')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (!existing) {
      const insertResponse = await supabase.from('users_web').insert({
        id: user.id,
        email: user.email,
        pseudo: user.user_metadata?.full_name || user.user_metadata?.name || '',
        Plan: 'Free',
        used_free_trial: false
      })

      if (insertResponse.error) {
        console.error('❌ Erreur insertion :', insertResponse.error.message)
      } else {
        console.log('✅ Utilisateur inséré automatiquement')
      }
    } else {
      console.log('ℹ️ Utilisateur déjà présent dans users_web')
    }

    await loadUserData()
  }
})
