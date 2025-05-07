document.addEventListener("DOMContentLoaded", () => {
    loadRaffles()
})

async function loadRaffles() {
    try {
        const res = await fetch(`${APP.api}/raffles/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        const json = await res.json()
        const container = document.querySelector(".lg\\:grid")

        if (!container || !json.data) return
      
        container.innerHTML = ""
      
        const allowedStatuses = ["CREATED", "REGISTRED", "IN_PROGRESS", "REGISTRATION_ENDED"]
        const statusMap = APP.raffles.statusMap     

        const raffles = json.data
          .filter(r => allowedStatuses.includes(r.status))
          .sort((a, b) => new Date(a.settings.start_date + ' ' + a.settings.start_time) - new Date(b.settings.start_date + ' ' + b.settings.start_time))
      
        raffles.forEach(raffle => {
            const card = document.createElement("div")
            card.className = "raffle-card flex flex-col p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white"
          
            var start = new Date();
          
            card.innerHTML = `
        <h3 class="mb-4 font-semibold">${raffle.about.title}</h3>
        <p class="font-light text-gray-500 sm:text-sm dark:text-gray-400">${raffle.about.description || "Описание отсутствует"}</p>
        <div class="flex justify-center items-baseline my-4">
          <span class="mr-2 text-md font-bold">Начало:</span>
          <span class="text-sm text-gray-700 dark:text-gray-300">${raffle.settings.start_date} ${raffle.settings.start_time}</span>
        </div>
        <div class="text-sm mb-3">Платформа: <span class="font-semibold">${raffle.platform.type}</span></div>
        <div class="text-sm mb-3">Статус: <span class="font-semibold">${statusMap[raffle.status] || raffle.status}</span></div>
        <ul role="list" class="mb-4 space-y-2 text-left text-sm">
          ${Array.isArray(raffle.prizes) ? raffle.prizes.map(p => `
            <li class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 01.0 1.414l-8 8a1 1 0 01-1.414 0L3.293 9.707A1 1 0 014.707 8.293L8 11.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              <span>${p.place} место: ${p.prize}</span>
            </li>
          `).join('') : ''}
        </ul>
        <a href="/raffles/single/?id=${raffle.id}" class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800">
          Подробнее
        </a>
      `
            container.appendChild(card)
        })
      setTimeout(1000, loadRaffles)
    } catch (err) {
        console.error("Ошибка при загрузке розыгрышей", err)
        showMessage("danger", "Не удалось загрузить список розыгрышей")
    }
}