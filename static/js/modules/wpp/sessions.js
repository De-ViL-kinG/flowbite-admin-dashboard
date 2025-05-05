// 📥 Получение всех сессий
async function fetchSessions() {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${APP.api}/wpp/sessions/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Ошибка получения списка сессий')
    return data.data || data
  } catch (err) {
    showMessage('error', err.message)
    return []
  }
}

// 🧱 Отрисовка строки сессии
function renderSessionRow(session) {
  
  const startBtn = `
    <button type="button" data-start-session="${session.session_id}" class="btn btn-blue" title="Запустить сессию">
      <svg class="w-6 h-6 text-gray-800 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 5 7 7-7 7" />
      </svg>
    </button>
  `

  const closeBtn = `
    <button type="button" data-close-session="${session.session_id}" class="btn btn-blue" title="Завершить сессию">
      <svg class="w-6 h-6 text-gray-800 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/>
      </svg>
    </button>
  `

  const qrBtn = `
    <button type="button" data-viewqr="${session.session_id}" class="btn btn-blue" title="Показать QR-код">
      <svg class="w-6 h-6 text-gray-800 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M4 4h6v6H4V4Zm10 10h6v6h-6v-6Zm0-10h6v6h-6V4Zm-4 10h.01v.01H10V14Zm0 4h.01v.01H10V18Zm-3 2h.01v.01H7V20Zm0-4h.01v.01H7V16Zm-3 2h.01v.01H4V18Zm0-4h.01v.01H4V14Z"/>
        <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M7 7h.01v.01H7V7Zm10 10h.01v.01H17V17Z"/>
      </svg>
    </button>
  `

  const deleteBtn = `
    <button type="button" data-delete="${session.session_id}" class="btn btn-red" title="Удалить сессию">
      <svg class="w-6 h-6 text-gray-800 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
      </svg>
    </button>
  `

  // 🔧 Логика выбора кнопок
  let actionButtons = ''
  switch (session.session_status?.toUpperCase()) {
    case 'CLOSED':
      actionButtons = `${startBtn}${deleteBtn}`
      break
    case 'QRCODE':
      actionButtons = `${qrBtn}${deleteBtn}`
      break
    case 'CONNECTED':
      actionButtons = `${closeBtn}${deleteBtn}`
      break
    default:
      actionButtons = `${startBtn}${deleteBtn}`
  }

  // 🔧 Логика выбора кнопок
  let sess_color = ''
  switch (session.session_status?.toUpperCase()) {
    case 'CLOSED':
      sess_color = 'red'
      break
    case 'QRCODE':
      sess_color = 'blue'
      break
    case 'CONNECTED':
      sess_color = 'green'
      break
    default:
      sess_color = 'yellow'
  }
  
  // 🔧 Логика выбора кнопок
  let con_color = ''
  switch (session.connection_status?.toUpperCase()) {
    case 'DISCONNECTED':
      con_color = 'red'
      break
    case 'CONNECTED':
      con_color = 'green'
      break
    default:
      con_color = 'yellow'
  }

  // 📦 HTML-ряд
  return `
    <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
      <td class="px-4 py-2">${session.id}</td>
      <td class="px-4 py-2 font-medium text-gray-900 dark:text-white">${session.name}</td>
      <td class="px-4 py-2 text-gray-500 dark:text-gray-400">${session.description || '-'}</td>
      <td class="px-4 py-2">${renderDot(sess_color, session.session_status) || '-'}</td>
      <td class="px-4 py-2">${renderDot(con_color, session.connection_status) || '-'}</td>
      <td class="px-4 py-2 space-x-2">${actionButtons}</td>
    </tr>
  `
}

// 🔄 Инициализация таблицы
async function initWppSessions(timer=false) {
  const tbody = document.getElementById('wpp-session-list')
  if (!tbody) return
  const sessions = await fetchSessions()
  tbody.innerHTML = (Array.isArray(sessions) ? sessions : sessions.items || []).map(renderSessionRow).join('')
  if (timer) setTimeout(() => initWppSessions(true), 10000)
}

// 🗑 Удаление
async function deleteSession(id) {
  if (!confirm('Удалить сессию?')) return

  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${APP.api}/wpp/sessions/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      method: "DELETE"
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Ошибка удаления')

    showMessage('success', 'Сессия удалена')
    initWppSessions()
  } catch (err) {
    showMessage('error', err.message)
  }
}

//  Запуск
async function startSession(id) {
  if (!confirm('Запустить сессию?')) return

  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${APP.api}/wpp/sessions/${id}/start`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      method: "GET"
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Ошибка запуска')

    showMessage('success', 'Сессия запущена')
    openQrModal(id)
    initWppSessions()
  } catch (err) {
    showMessage('error', err.message)
  }
}

// Остановка
async function closeSession(id) {
  if (!confirm('Закрть сессию?')) return

  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${APP.api}/wpp/sessions/${id}/close`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      method: "GET"
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Ошибка закрытия')

    showMessage('success', 'Сессия остановлена')
    initWppSessions()
  } catch (err) {
    showMessage('error', err.message)
  }
}

// ➕ Добавление
document.getElementById('create-wpp-form')?.addEventListener('submit', async function (e) {
  e.preventDefault()

  const name = document.getElementById('wpp-name').value.trim()
  const desc = document.getElementById('wpp-desc').value.trim()

  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${APP.api}/wpp/sessions/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify({ name, description: desc })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Ошибка создания')

    showMessage('success', 'Сессия создана')
    initWppSessions()
    new Modal(document.getElementById('drawer-create-session')).hide()
    if (!data.session_id) throw new Error('Не указан sessionId')
    openQrModal(data.session_id)

  } catch (err) {
    showMessage('error', err.message)
  }
})


// 🔄 Получение QR по таймеру
let qrPollingTimer = null

function openQrModal(sessionId) {
  const modal = document.getElementById('qrModal')
  const qrImage = document.getElementById('qr-image')
  const qrStatus = document.getElementById('qr-status')

  if (!modal || !qrImage || !qrStatus) return

  // Сброс состояния
  qrImage.classList.add('hidden')
  qrImage.src = ''
  qrStatus.innerText = 'Ожидание QR-кода...'

  // Показываем модалку
  modal.classList.remove('hidden')
  modal.classList.add('flex') // если используется flex
  document.body.classList.add('overflow-hidden')

  pollQRCode(sessionId)
}

function closeQrModal() {
  const modal = document.getElementById('qrModal')
  const qrImage = document.getElementById('qr-image')
  const qrStatus = document.getElementById('qr-status')

  if (!modal || !qrImage || !qrStatus) return

  modal.classList.add('hidden')
  modal.classList.remove('flex')
  document.body.classList.remove('overflow-hidden')

  // Сбросить картинку и текст
  qrImage.src = ''
  qrStatus.innerText = ''
  qrImage.classList.add('hidden')

  // Очистить таймер
  if (qrPollingTimer) clearTimeout(qrPollingTimer)
}

async function pollQRCode(sessionId) {
  const qrImage = document.getElementById('qr-image')
  const qrStatus = document.getElementById('qr-status')
  const modal = document.getElementById('qrModal')

  if (!qrImage || !qrStatus || !modal) return

  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${APP.api}/wpp/sessions/${sessionId}/qrcode`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      method: "GET"
    })
    const result = await res.json()

    // Если модалка уже закрыта — не продолжаем
    if (modal.classList.contains('hidden')) {
      return
    }

    if (res.ok && result.qr) {
      qrImage.src = `data:image/png;base64,${result.qr}`
      qrImage.classList.remove('hidden')
      qrStatus.innerText = 'Сканируйте код в WhatsApp'
    } else {
      // Продолжаем ждать
      qrPollingTimer = setTimeout(() => pollQRCode(sessionId), 2000)
    }
  } catch (err) {
    console.error(err)
    qrStatus.innerText = 'Ошибка загрузки QR-кода. Повторите попытку.'
  }
}

// Dot function
function renderDot(color,value) {
  return `<div class="flex items-center">
            <div class="h-2.5 w-2.5 rounded-full bg-${color}-500 me-2"></div> ${value}
          </div >`    
}

// 🧩 Обработчики действий
document.addEventListener('click', (e) => {
  const qrBtn = e.target.closest('[data-viewqr]')
  if (qrBtn) openQrModal(qrBtn.getAttribute('data-viewqr'))
  
  const startBtn = e.target.closest('[data-start-session]')
  if (startBtn) startSession(startBtn.getAttribute('data-start-session'))
  
  const closeBtn = e.target.closest('[data-close-session]')
  if (closeBtn) closeSession(closeBtn.getAttribute('data-close-session'))

  const delBtn = e.target.closest('[data-delete]')
  if (delBtn) deleteSession(delBtn.getAttribute('data-delete'))
})



// Закрытие модалки
document.getElementById('qr-close-btn')?.addEventListener('click', closeQrModal)

// 🟢 Запуск
initWppSessions(true)
