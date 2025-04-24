(async function isAuth() {
    const path = window.location.pathname
    const loginPath = APP.loginPath
    const apiUrl = APP.api

    if (path.includes('/logout')) {
        setTimeout(() => {logout()}, 5000)
        return false
    }

    if (path.includes(loginPath)) return false
  
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = loginPath
      return false
    }
  
    try {
      const res = await fetch(`${apiUrl}/auth/check-auth`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
  
      if (!res.ok) throw new Error('Unauthorized')
  
      const data = await res.json()
      window.USER = data || null
      return true
    } catch (err) {
      console.warn('Проверка токена не пройдена:', err)
      localStorage.removeItem('token')
      window.location.href = loginPath
      return false
    }
  })()