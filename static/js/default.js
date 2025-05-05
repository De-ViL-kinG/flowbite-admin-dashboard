document.addEventListener('DOMContentLoaded', async () => {
    const userName = document.getElementById('user-name')
    const userEmail = document.getElementById('user-email')
    const userImg = document.getElementById('user-img')

    try {
        const res = await fetch(`${APP.api}/auth/check-auth`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })

        if (!res.ok) {
            throw new Error('Ошибка при получении данных пользователя')
        }

        const { data } = await res.json()

        if (userName) userName.textContent = data.full_name || 'Без имени'
        if (userEmail) userEmail.textContent = data.email || 'Без email'
        if (userImg) userImg.src = `/users-img/${data.img ?? 'default.png'}`

    } catch (error) {
        console.error('🔴 Ошибка загрузки пользователя:', error.message)
    }
})

