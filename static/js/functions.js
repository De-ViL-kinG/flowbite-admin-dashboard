function logout(){
    const loginPath = APP.loginPath
    
    localStorage.removeItem('token')
    window.location.href = loginPath
    showMessage('info', 'Выход выполнен. Перенаправляем на вход...')
}

const hash = '';

// в functions.js
if (hash === '#/roles') {
    import('./modules/roles.js').then(m => m.initRolesModule())
}

