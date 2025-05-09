import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabase = createClient(
  'https://jgdsbsgajoidkqiwndnp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...REMPLACE_PAR_TON_VRAI_TOKEN...'
)

// 🔁 Charge les données du dashboard
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

  // ✅ SIGNUP
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
        await supabase.from('users_web').insert({
          id: user.id,
          email,
          pseudo,
          Plan: 'Free',
          used_free_trial: false
        })
      }

      window.location.href = 'dashboard.html'
    })
  }

  // ✅ LOGIN
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

  // ✅ GOOGLE LOGIN
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

  // ✅ LOGOUT
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut()
      window.location.href = 'index.html'
    })
  }

  // ✅ AUTO INSERT/APPLY si dashboard
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
      const insert = await supabase.from('users_web').insert({
        id: user.id,
        email: user.email,
        pseudo: user.user_metadata?.name || user.user_metadata?.full_name || '',
        Plan: 'Free',
        used_free_trial: false
      })

      if (insert.error) {
        console.error("❌ Erreur insert :", insert.error.message)
      } else {
        console.log("✅ Utilisateur inséré")
      }
    } else {
      console.log("ℹ️ Utilisateur déjà présent")
    }

    await loadUserData()
  }
})
