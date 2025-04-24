window.showMessage = function(type = 'info', message = '') {
    const id = `alert-${Date.now()}`
    const alertContainer = document.getElementById('alerts-container')

    if (!alertContainer) {
      console.warn('[showMessage] Контейнер #alerts-container не найден')
      return
    }
  
    const colors = {
      success: 'bg-green-100 text-green-700 border-green-400',
      error: 'bg-red-100 text-red-700 border-red-400',
      warning: 'bg-yellow-100 text-yellow-700 border-yellow-400',
      info: 'bg-blue-100 text-blue-700 border-blue-400'
    }
  
    const html = `
      <div id="${id}" class="flex items-center p-4 text-sm border rounded-lg shadow-sm ${colors[type] || colors.info}" role="alert">
        <div class="flex-1">${message}</div>
        <button type="button" class="ml-4 text-xl font-bold focus:outline-none" onclick="document.getElementById('${id}').remove()">×</button>
      </div>
    `
    
    
    const container = document.getElementById('alerts-container')
    container.insertAdjacentHTML('beforeend', html)
  
    setTimeout(() => {
      const el = document.getElementById(id)
      if (el) el.remove()
    }, 5000)
  }