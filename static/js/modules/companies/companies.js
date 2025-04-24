document.addEventListener('DOMContentLoaded', initCompanies)

async function initCompanies() {
    const table = document.getElementById('company-list')
    if (!table) return

    await loadCompanyList()

    // Создание компании
    document.getElementById('create-company-form')?.addEventListener('submit', createCompany)

    // Обработка кнопок редактирования и удаления
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-edit-company]')
        const del = e.target.closest('[data-delete-company]')

        if (btn) await openEditCompanyModal(btn.dataset.editCompany)
        if (del) await deleteCompany(del.dataset.deleteCompany)
    })

    // Обновление
    document.getElementById('edit-company-form')?.addEventListener('submit', updateCompany)
}

async function loadCompanyList(page = 1) {
    try {
        const res = await fetch(`${APP.api}/companies/?page=${page}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)

        const tbody = document.getElementById('company-list')
        tbody.innerHTML = data.data.map(renderCompanyRow).join('')

    } catch (err) {
        showMessage('error', err.message)
    }
}

function renderCompanyRow(company) {
    
    // 📦 HTML-ряд
    return `
        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <td class="px-4 py-2">${company.id}</td>
            <td class="px-4 py-2 font-medium text-gray-900 dark:text-white">${company.name}</td>
            <td class="px-4 py-2 font-medium text-gray-900 dark:text-white">${company.description}</td>
            <td class="px-4 py-2 space-x-2">
                <button class="btn btn-blue" data-edit-company="${company.id}">✏</button>
                <button class="btn btn-red" data-delete-company="${company.id}">🗑</button>
            </td>
        </tr>
    `
}

async function createCompany(e) {
    e.preventDefault()
    const name = document.getElementById('create-company-name').value
    const description = document.getElementById('create-company-desc').value

    try {
        const res = await fetch(`${APP.api}/companies/`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description })
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.message)

        showMessage('success', data.message)
        loadCompanyList()
        new Modal(document.getElementById('createCompanyModal')).hide()

    } catch (err) {
        showMessage('error', err.message)
    }
}

async function openEditCompanyModal(companyId) {
    try {
        const res = await fetch(`${APP.api}/companies/${companyId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const { data } = await res.json()

        document.getElementById('edit-company-id').value = data.id
        document.getElementById('edit-company-name').value = data.name

        new Modal(document.getElementById('editCompanyModal')).show()
    } catch (err) {
        showMessage('error', 'Ошибка загрузки данных компании')
    }
}

async function updateCompany(e) {
    e.preventDefault()
    const id = document.getElementById('edit-company-id').value
    const name = document.getElementById('edit-company-name').value

    try {
        const res = await fetch(`${APP.api}/companies/${id}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.message)

        showMessage('success', data.message)
        loadCompanyList()
        new Modal(document.getElementById('editCompanyModal')).hide()
    } catch (err) {
        showMessage('error', err.message)
    }
}

async function deleteCompany(id) {
    if (!confirm('Удалить компанию?')) return

    try {
        const res = await fetch(`${APP.api}/companies/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)

        showMessage('success', data.message)
        loadCompanyList()
    } catch (err) {
        showMessage('error', err.message)
    }
}