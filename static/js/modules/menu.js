document.addEventListener('DOMContentLoaded', async function () {
    const container = document.getElementById('sidebar-toggle')
    if (!container) return

    try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${APP.api}/menu`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Ошибка получения меню')

        data.forEach(item => {
            if (item.parent === null) {
                addSidebarItem(container, item)
            } else if (item.parent === 0) {
                addSidebarParent(container, item)
            } else {
                addSidebarChild(item)
            }
        })

    } catch (err) {
        console.error('Ошибка загрузки меню:', err)
    }
})

// ✅ Обычный пункт
function addSidebarItem(container, item) {
    const li = document.createElement('li')
    const a = document.createElement('a')
    const span = document.createElement('span')
    const path = window.location.pathname

    span.innerHTML = item.name
    span.className = 'ml-3 sidebar-toggle-item'

    a.href = item.to || '#'
    a.className = `flex items-center p-2 text-base text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700 ${path === item.to ? 'bg-gray-100 dark:bg-gray-700' : ''
        }`

    a.innerHTML = item.icon
    a.appendChild(span)
    li.appendChild(a)
    container.appendChild(li)
}

// ✅ Родитель с выпадающим списком
function addSidebarParent(container, item) {
    const li = document.createElement('li')
    li.setAttribute('id', `side-parent-${item.id}`)

    const button = document.createElement('button')
    button.setAttribute('type', 'button')
    button.setAttribute('aria-controls', `side-dropdown-${item.id}`)
    button.setAttribute('data-collapse-toggle', `side-dropdown-${item.id}`)
    button.setAttribute('id', `side-parent-btn-${item.id}`)
    button.className = "flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"

    button.innerHTML = item.icon

    const span = document.createElement('span')
    span.className = "flex-1 ml-3 text-left whitespace-nowrap"
    span.innerText = item.name
    button.appendChild(span)

    const iconWrapper = document.createElement('span')
    iconWrapper.className = "ml-auto"
    iconWrapper.innerHTML = `
    <svg class="w-6 h-6 text-gray-400 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white transition" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
    </svg>`
    button.appendChild(iconWrapper)

    li.appendChild(button)
    container.appendChild(li)
}

// ✅ Подпункт (вложенный)
function addSidebarChild(item) {
    const path = window.location.pathname
    const parent = document.getElementById(`side-parent-${item.parent}`)

    if (!parent) return

    let ul = document.getElementById(`side-dropdown-${item.parent}`)
    if (!ul) {
        ul = document.createElement('ul')
        ul.setAttribute('id', `side-dropdown-${item.parent}`)
        ul.className = "hidden py-2 space-y-2"
        parent.appendChild(ul)
    }

    const li = document.createElement('li')
    const a = document.createElement('a')
    a.href = item.to || '#'
    a.className = `flex justify-end p-2 text-base text-gray-900 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700 ${path === item.to ? 'bg-gray-100 dark:bg-gray-700' : ''
        }`
    a.innerText = item.name
    li.appendChild(a)
    // Вставка иконки (если это HTML-строка SVG)
    if (item.icon) {
        const iconWrapper = document.createElement('span')
        iconWrapper.innerHTML = item.icon
        iconWrapper.className = 'mr-2'
        a.appendChild(iconWrapper)
    }
    ul.appendChild(li)

    // Программно раскрываем
    const dropdown = document.getElementById(`side-dropdown-${item.parent}`)
    if (dropdown && path === item.to) {
        dropdown.classList.remove('hidden')
    }
}