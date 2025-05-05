window.showMessage = function(type = 'info', message = '', list = []) {
    const id = `alert-${Date.now()}`
    const alertContainer = document.getElementById('alerts-container')
    let ul = renderList(list)
    if (!alertContainer) {
      console.warn('[showMessage] Контейнер #alerts-container не найден')
      return
    }
  
    
  
    const options = {
      success: {
        class: "inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200",
        svg: `<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
              </svg>`,
        span: "Успех"
      },
      error: {
        class: "inline-flex items-center justify-center shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200",
        svg: `<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
              </svg>`,
        span: "Ошибка"
      },
      warning: {
        class: "inline-flex items-center justify-center shrink-0 w-8 h-8 text-orange-500 bg-orange-100 rounded-lg dark:bg-orange-700 dark:text-orange-200",
        svg: `<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/>
              </svg>`,
        span: "Предупреждение"
      },
      info: {
        class: "inline-flex items-center justify-center shrink-0 w-8 h-8 text-blue-500 bg-blue-100 rounded-lg dark:bg-blue-700 dark:text-blue-200",
        svg: `<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
              </svg>`,
        span: "Информация"
      }
    }
  
  const html = `
      <div id="${id}" class="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800" role="alert">
        <div class="${options[type].class}">
          ${options[type].svg}
          <span class="sr-only">${options[type].span}</span>
        </div>
        <div class="ms-3 text-sm font-normal">${message}${ul}</div>
      </div>
    `
    
    const container = document.getElementById('alerts-container')
    container.insertAdjacentHTML('beforeend', html)
  
    setTimeout(() => {
      const el = document.getElementById(id)
      if (el) el.remove()
    }, 5000)
}
  
function renderList(list) {

  if (!list.length) return '';

  let ul = '<ul class="mt-1.5 list-disc list-inside">';

  list.forEach(item => {
    if (typeof item === 'string') {
      // Просто строка — сразу выводим
      ul += `<li>${item}</li>`;
    } else if (Array.isArray(item)) {
      // Вложенный массив — рекурсивно
      ul += renderList(item);
    } else if (typeof item === 'object' && item !== null) {
      // Объект — например, поле или описание ошибки
      Object.entries(item).forEach(([key, value]) => {
        ul += `<li><strong>${key}:</strong> ${value}</li>`;
      });
    } else {
      // Всё остальное (например, число) — просто выводим
      ul += `<li>${item}</li>`;
    }
  });

  ul += '</ul>';
  return ul;
}