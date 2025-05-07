document.addEventListener("DOMContentLoaded", () => {
    const raffleId = getRaffleIdFromURL()
    if (!raffleId) return showMessage("error", "Некорректный ID розыгрыша")

    loadRaffle(raffleId)
    setInterval(() => loadRaffle(raffleId), 3000)  // обновление каждые 15 сек
})

function getRaffleIdFromURL() {
    const url = new URL(window.location.href)
    return url.searchParams.get("id")
}

async function loadRaffle(id) {
    try {
        const res = await fetch(`${APP.api}/raffles/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })

        const json = await res.json()
        if (!json || !json.data) return

        renderRaffle(json.data)
    } catch (err) {
        console.error("Ошибка при загрузке розыгрыша", err)
        showMessage("error", "Не удалось загрузить розыгрыш")
    }
}

function renderRaffle(data) {
    // Основной заголовок
    document.querySelector("#raffle-title").textContent = data.about?.title || "Без названия"
    document.querySelector("#raffle-description").textContent = data.about?.description || "Описание отсутствует"

    // Текстовые блоки
    setText("#raffle-annonce", data.about?.annonce)
    setText("#raffle-text", data.about?.text)
    setText("#raffle-rules", data.about?.rules)

    // Призы

    renderPrizeList(data.prize)
    renderSettings(data.settings)

    document.getElementById("raffle-time").innerHTML = formatEventTime(data.settings.start_date, data.settings.start_time, data.raffled_at ?? null)

    // Участники
    const confirmed = document.querySelector("#raffle-participants")
    document.getElementById("raffle-participants-num").textContent = countSelectedNumbers(data.participants) || "—"
    document.getElementById("raffle-status").innerHTML = renderStatusBadge(data.status || "undefined")

    if (Array.isArray(data.participants)) {

        confirmed.innerHTML = data.participants.map(p =>{
        
            const vis_num = 10
            const numbers = p.pull?.split(",").map(n => n.trim()).filter(Boolean) || []
            const visible = numbers.slice(0, vis_num).join(", ")
            const hiddenCount = numbers.length > vis_num ? ` и ещё ${numbers.length - vis_num}` : ""
            const conf_time = formatDateTimeUtc12(p.time_confirm)

            return `
                <li class="py-3 sm:py-4">
                    <div class="flex items-center space-x-4">
                        <div class="flex-shrink-0">
                        <img class="w-8 h-8 rounded-full" src="/users-img/default.png" alt="Neil image">
                        </div>
                        <div class="flex-1 min-w-0">
                        <p class="font-medium text-gray-900 truncate dark:text-white">
                            +${p.phone}
                        </p>
                        <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                            ${visible}${hiddenCount}
                        </p>
                        </div>
                        <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                            ${conf_time}
                        </div>
                        <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                            {{ Part.action }}
                        </div>
                    </div>
                </li>
        `}).join("")
    }

    


    // Сессии
    const sessionBody = document.querySelector("#raffle-sessions")
    if (Array.isArray(data.sessions)) {
        sessionBody.innerHTML = data.sessions.map(s => {
            if (s.state == "finished") return;
            const upd_time = formatDateTimeUtc12(s.updated_at)

            return `
                <li class="py-3 sm:py-4">
                    <div class="flex items-center space-x-4">
                        <div class="flex-shrink-0">
                            <img class="w-8 h-8 rounded-full" src="/users-img/default.png" alt="Neil image">
                        </div>
                        <div class="flex-1 min-w-0">
                        <p class="font-medium text-gray-900 truncate dark:text-white">
                            +${s.phone}
                        </p>
                        <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                            ${renderStatusBadge(s.state)}
                        </p>
                        </div>
                        <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                            ${upd_time}
                        </div>
                        <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                            {{ Part.action }}
                        </div>
                    </div>
                </li>
        `}).join("")
    }
}

function setText(selector, text) {
    const el = document.querySelector(selector)
    if (el) el.innerHTML = formatMultiline(text) || "-"
}

function formatMultiline(text) {
    if (!text) return ''
    return text.replace(/\\n|(?:\r?\n)/g, "<br>")
}

function renderPrizeList(prizes = []) {
    const container = document.getElementById("raffle-prize-list")
    if (!container) return

    container.innerHTML = prizes.map((p, i) => `
        <li class="py-3 sm:py-4">
            <div class="flex items-center space-x-4">
                <div class="flex-shrink-0 text-2xl">${placeToEmoji(p.place)}</div>
                <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 truncate dark:text-white">${p.title}</p>
                    <p class="text-sm text-gray-500 truncate dark:text-gray-400" style="display:${p.winner?"block":"none"};">
                        Победитель: <a href="//wa.me/${p.winner?.phone}" target="_blank">+${p.winner?.phone}</a> (${p.winner?.number})
                    </p>
                </div>
                <div class="relative group">
                    <button class="text-sm hover:underline">
                        *******
                    </button>
                <div
                    class="absolute z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 mt-1"
                    style="white-space: nowrap;"
                >
                    ${p.code}
                </div>
            </div>
        </li>
    `).join("")
}



function placeToEmoji(place) {
    const medalMap = {
        1: "🥇",
        2: "🥈",
        3: "🥉"
    }

    if (medalMap[place]) {
        return medalMap[place]
    }

    const digits = String(place).split('')
    const digitEmojiMap = {
        "0": "0️⃣",
        "1": "1️⃣",
        "2": "2️⃣",
        "3": "3️⃣",
        "4": "4️⃣",
        "5": "5️⃣",
        "6": "6️⃣",
        "7": "7️⃣",
        "8": "8️⃣",
        "9": "9️⃣"
    }

    return digits.map(d => digitEmojiMap[d] || d).join('')
}

function formatDateTimeUtc12(isoString) {
    const date = new Date(isoString)

    // Добавим 12 часов
    date.setUTCHours(date.getUTCHours() + 12)

    const pad = n => String(n).padStart(2, '0')

    const hours = pad(date.getHours())
    const minutes = pad(date.getMinutes())
    const seconds = pad(date.getSeconds())
    const day = pad(date.getDate())
    const month = pad(date.getMonth() + 1)

    return `${hours}:${minutes}:${seconds} ${day}.${month}`
}

function showPrizeCode(index) {
    const el = document.getElementById(`prize-code-${index}`)
    if (el) el.textContent = el.dataset.code
}

function hidePrizeCode(index) {
    const el = document.getElementById(`prize-code-${index}`)
    if (el) el.textContent = "******"
}

function renderSettings(settings = {}) {

    document.getElementById("raffle-start-date").innerHTML = settings.start_date
    document.getElementById("raffle-start-time").innerHTML = settings.start_time

    
  

    const instr = settings.instructions || {}

    document.getElementById("raffle-pool-from").textContent = instr.number_pool_from || 1
    document.getElementById("raffle-pool-to").textContent = instr.number_pool_to || 100
    document.getElementById("raffle-repeat-text").textContent = instr.repeat_text || 300

    document.getElementById("raffle-allow-manual").textContent = instr.allow_manual_selection ? "Да" : "Нет"
    document.getElementById("raffle-auto-confirm").textContent = instr.auto_confirm ? "Да" : "Нет"
    document.getElementById("raffle-set-participants").textContent = settings.participants || "—"
}

function countSelectedNumbers(participants) {
    if (!Array.isArray(participants)) return 0;

    return participants.reduce((acc, p) => {
        if (typeof p.pull === "string" && p.pull.trim() !== "") {
            return acc + p.pull.split(",").filter(x => x.trim() !== "").length;
        }
        return acc;
    }, 0);
}

function formatEventTime(startDate, startTime, raffledAt = null) {
    if (!startDate || !startTime) return "-";

    const [d, m, y] = startDate.split(".").map(Number);
    const [h, min] = startTime.split(":").map(Number);
    const start = new Date(Date.UTC(y, m - 1, d, h - 12, min)); // UTC+12 смещение

    const now = new Date();

    if (raffledAt) {
        const finished = new Date(raffledAt);
        const diff = Math.max(0, finished - start);
        return "Длился " + formatDuration(diff);
    }

    if (now < start) {
        const diff = start - now;
        return "До старта " + formatDuration(diff);
    }

    const diff = now - start;
    return "Идёт " + formatDuration(diff);
}

function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
        return `${hours} ч ${minutes} мин`;
    }
    return `${minutes} мин`;
}