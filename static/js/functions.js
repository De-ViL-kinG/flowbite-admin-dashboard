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

function renderStatusBadge(status) {
    const map = {
        "CREATED": {
            label: "Создан",
            class: "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300 border-gray-100 dark:border-gray-500"
        },
        "REGISTRED": {
            label: "Зарегистрирован",
            class: "bg-purple-100 text-purple-600 dark:bg-gray-900 dark:text-purple-300 border-purple-100 dark:border-purple-500"
        },
        "IN_PROGRESS": {
            label: "Открыта регистрация",
            class: "bg-yellow-100 text-yellow-800 dark:bg-gray-900 dark:text-yellow-400 border-yellow-100 dark:border-yellow-500"
        },
        "REGISTRATION_ENDED": {
            label: "Регистрация завершена",
            class: "bg-indigo-100 text-indigo-800 dark:bg-gray-900 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500"
        },
        "RAFFLED": {
            label: "Завершён",
            class: "bg-green-100 text-green-800 dark:bg-gray-900 dark:text-green-400 border-green-100 dark:border-green-500"
        },
        "CANCELLED": {
            label: "Отменён",
            class: "bg-red-100 text-red-800 dark:bg-gray-900 dark:text-red-400 border-red-100 dark:border-red-500"
        },

        // session states
        "menu": {
            label: "Меню",
            class: "bg-purple-100 text-purple-800 dark:bg-gray-900 dark:text-purple-300 border-purple-100 dark:border-purple-500"
        },
        "extra_menu": {
            label: "Доп. меню",
            class: "bg-purple-100 text-purple-800 dark:bg-gray-900 dark:text-purple-300 border-purple-100 dark:border-purple-500"
        },
        "awaiting_random_selection": {
            label: "Ожидание количества",
            class: "bg-yellow-100 text-yellow-800 dark:bg-gray-900 dark:text-yellow-400 border-yellow-100 dark:border-yellow-500"
        },
        "extra_random_selection": {
            label: "Доп. ожидание количества",
            class: "bg-yellow-100 text-yellow-800 dark:bg-gray-900 dark:text-yellow-400 border-yellow-100 dark:border-yellow-500"
        },
        "awaiting_random_approval": {
            label: "Подтверждение случайных",
            class: "bg-orange-100 text-orange-800 dark:bg-gray-900 dark:text-orange-400 border-orange-100 dark:border-orange-500"
        },
        "extra_awaiting_random_approval": {
            label: "Доп. подтверждение случайных",
            class: "bg-orange-100 text-orange-800 dark:bg-gray-900 dark:text-orange-400 border-orange-100 dark:border-orange-500"
        },
        "awaiting_manual_selection": {
            label: "Ожидание ручного ввода",
            class: "bg-yellow-100 text-yellow-800 dark:bg-gray-900 dark:text-yellow-400 border-yellow-100 dark:border-yellow-500"
        },
        "extra_manual_selection": {
            label: "Доп. ручной выбор",
            class: "bg-yellow-100 text-yellow-800 dark:bg-gray-900 dark:text-yellow-400 border-yellow-100 dark:border-yellow-500"
        },
        "awaiting_confirmation": {
            label: "Ожидание чека",
            class: "bg-purple-100 text-purple-800 dark:bg-gray-900 dark:text-purple-400 border-purple-100 dark:border-purple-500"
        },
        "extra_awaiting_confirmation": {
            label: "Доп. чек",
            class: "bg-purple-100 text-purple-800 dark:bg-gray-900 dark:text-purple-400 border-purple-100 dark:border-purple-500"
        },
        "finished": {
            label: "Завершено",
            class: "bg-green-100 text-green-800 dark:bg-gray-900 dark:text-green-400 border-green-100 dark:border-green-500"
        },
        "blocked": {
            label: "Заблокирован",
            class: "bg-red-100 text-red-800 dark:bg-gray-900 dark:text-red-400 border-red-100 dark:border-red-500"
        },
        "undefined": {
            label: "Не определен",
            class: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400 border-gray-100 dark:border-gray-500"
        }
    }

    const info = map[status] || {
        label: status,
        class: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-400 border-gray-100 dark:border-gray-500"
    }

    return `<span class="text-xs font-medium mr-2 px-2.5 py-0.5 rounded-md border ${info.class}">${info.label}</span>`
}

