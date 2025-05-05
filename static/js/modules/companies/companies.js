document.addEventListener('DOMContentLoaded', initCompanies)

async function initCompanies() {
    const table = document.getElementById('company-list')
    if (!table) return

    await loadCompanyList()

    // Автообновление таблицы каждые 5 секунд
    setInterval(async () => {
        await loadCompanyList(true)
    }, 5000);

    // Создание компании
    document.getElementById('create-company-form')?.addEventListener('submit', createCompany)

    // Обработка кнопок редактирования и удаления
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-edit-company]')
        const del = e.target.closest('[data-delete-company]')
        const usr = e.target.closest('[data-users-company]')

        if (btn) await openEditCompanyModal(btn.dataset.editCompany)
        if (del) await deleteCompany(del.dataset.deleteCompany)
        if (usr) window.location.href = `/companies/users/?company_id=${usr.dataset.usersCompany}`
    })

    // Обновление компании
    document.getElementById('edit-company-form')?.addEventListener('submit', updateCompany)
}

async function loadCompanyList(silent = false, page = 1) {
    try {
        const res = await fetch(`${APP.api}/companies/?page=${page}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)

        const tbody = document.getElementById('company-list')
        tbody.innerHTML = data.data.map(renderCompanyRow).join('')

        // ♻️ Переинициализация поповеров
        if (typeof window.initPopovers === 'function') {
            window.initPopovers();
        }

    } catch (err) {
        if (!silent) {
            showMessage('error', err.message, err.details)
        } else {
            console.warn('Автообновление списка компаний: ошибка загрузки', err)
        }
    }
}

function renderCompanyRow(company) {
    const wppSession = company.wpp_session;
    let wppSessionButton = 'Не задана';

    if (wppSession) {
        const confirmed = wppSession.group_options?.confirme;
        const uuid = wppSession.group_options?.uuid ?? '';
        const group = wppSession.group_options?.group ?? '';
        const phone = wppSession.session_metadata?.phone ?? 'Не указан';

        // Генерируем ID для popover
        const popoverId = `popover-wpp-${company.id}`;

        wppSessionButton = `
            <button data-popover-target="${popoverId}" 
                    data-popover-placement="right"
                    class="btn btn-blue text-xs">
                🔍 ${wppSession.name} ${confirmed ? '🟢' : '🟡'}
            </button>
            <div data-popover id="${popoverId}" role="tooltip" class="absolute z-10 invisible inline-block w-72 text-sm transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 dark:bg-gray-800 dark:border-gray-600">
                <div class="p-3">
                    ${confirmed ? `
                        <p class="text-base leading-relaxed text-green-600 dark:text-green-400">
                            ✅ Группа привязана.
                        </p>
                        <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            ID группы: ${group}
                        </p>
                    ` : `
                        <div class="text-gray-700 dark:text-gray-300 space-y-4">
                            <p class="text-base font-semibold">
                                📢 Для привязки группы к компании выполните следующие шаги:
                            </p>

                            <ul class="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                                <li>
                                    🟢 Добавьте в группу пользователя WhatsApp с номером:
                                    <span class="font-bold text-blue-600 dark:text-blue-400">${phone}</span>
                                </li>
                                <li>
                                    📋 Скопируйте ваш уникальный UUID:
                                    <span class="font-bold text-green-600 dark:text-green-400">${uuid}</span>
                                </li>
                                <li>
                                    ✉️ Отправьте <span class="font-semibold">этот UUID</span> в группу простым текстовым сообщением.
                                </li>
                                <li>
                                    ✅ Дождитесь ответа бота об успешной регистрации вашей группы.
                                </li>
                            </ul>
                        </div>
                    `}
                </div>
                <div data-popper-arrow></div>
            </div>
        `;
    }

    return `
        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <td class="px-4 py-2">${company.id}</td>
            <td class="px-4 py-2 font-medium text-gray-900 dark:text-white">${company.name}</td>
            <td class="px-4 py-2 font-medium text-gray-900 dark:text-white">${company.description}</td>
            <td class="px-4 py-2 font-medium text-gray-900 dark:text-white">${wppSessionButton}</td>
            <td class="px-4 py-2 space-x-2">
                <button class="btn btn-blue" data-users-company="${company.id}">👥</button>
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
    const wppSession = document.getElementById('create-wpp-sessions').value

    try {
        const res = await fetch(`${APP.api}/companies/`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description, wppSession })
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.message)

        showMessage('success', data.message)
        loadCompanyList()
        new Modal(document.getElementById('createCompanyModal')).hide()

    } catch (err) {
        showMessage('error', err.message, err.details)
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
        document.getElementById('edit-company-desc').value = data.description
        loadWppSessions('edit', data.wpp_session?.id ?? 0);

        new Modal(document.getElementById('editCompanyModal')).show()
    } catch (err) {
        console.log(err)
        showMessage('error', err.message, err.details)
    }
}

async function updateCompany(e) {
    e.preventDefault()
    const id = document.getElementById('edit-company-id').value
    const name = document.getElementById('edit-company-name').value
    const description = document.getElementById('edit-company-desc').value
    const wppSession = document.getElementById('edit-wpp-sessions').value

    try {
        const res = await fetch(`${APP.api}/companies/${id}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description, wppSession })
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.message)

        showMessage('success', data.message)
        loadCompanyList()
        new Modal(document.getElementById('editCompanyModal')).hide()
    } catch (err) {
        showMessage('error', err.message, err.details)
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
        showMessage('error', err.message, err.details)
    }
}

// Функция загрузки сессий
async function loadWppSessions(action, selectedId = null) {
    const wppSelect = document.getElementById(`${action}-wpp-sessions`);

    try {
        const response = await fetch(`${APP.api}/wpp/sessions/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка загрузки сессий');
        }

        const data = await response.json();
        if (data.data) {
            // Стартовый option
            wppSelect.innerHTML = `<option disabled ${selectedId ? '' : 'selected'}>Выберите сессию</option>`;

            data.data.forEach(session => {
                const option = document.createElement('option');
                option.value = session.id;
                option.textContent = `${session.name} (${session.description || 'без описания'})`;

                if (selectedId && session.id == selectedId) {
                    option.selected = true;
                }

                wppSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Ошибка при загрузке сессий:', error);
    }
}

document.addEventListener('DOMContentLoaded', function () {


    // Находим все кнопки, которые открывают модалку
    const openButtons = document.querySelectorAll('[data-modal-show="createCompanyModal"], [data-modal-toggle="createCompanyModal"]');
    openButtons.forEach(button => {
        button.addEventListener('click', function () {
            loadWppSessions('create');
        });
    });
});