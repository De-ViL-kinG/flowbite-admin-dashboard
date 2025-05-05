function logout(){
    const loginPath = APP.loginPath
    
    localStorage.removeItem('token')
    window.location.href = loginPath
}

const hash = '';

// в functions.js
if (hash === '#/roles') {
    import('./modules/roles.js').then(m => m.initRolesModule())
}

