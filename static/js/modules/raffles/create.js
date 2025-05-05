
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("settings-start-date");
    const today = new Date();
    const formatted = today.toLocaleDateString("ru-RU").replace(/\//g, ".");
    if (input) {
        input.setAttribute("datepicker-min-date", formatted);
        input.value = formatted;
    }

    bindSummaryListeners();
    validateForm();

    const prizeList = document.getElementById("prize-list");
    const addPrizeBtn = document.getElementById("add-prize-button");

    if (prizeList && addPrizeBtn) {
        addPrizeBtn.addEventListener("click", () => {
            const row = createPrizeRow();
            prizeList.appendChild(row);
            updatePrizePositions();
            validateForm();
        });
    }

    function createPrizeRow() {
        const row = document.createElement("tr");
        row.className = "bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200";

        const positionCell = document.createElement("th");
        positionCell.scope = "row";
        positionCell.className = "px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white";
        positionCell.textContent = "-";

        const nameCell = document.createElement("td");
        nameCell.className = "px-6 py-4";
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.name = "prize[][title]";
        nameInput.placeholder = "Название приза";
        nameInput.className = "block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500";
        nameCell.appendChild(nameInput);

        const codeCell = document.createElement("td");
        codeCell.className = "px-6 py-4";
        const codeInput = document.createElement("input");
        codeInput.type = "text";
        codeInput.name = "prize[][code]";
        codeInput.placeholder = "Код победителя";
        codeInput.className = "block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500";
        codeCell.appendChild(codeInput);

        const actionsCell = document.createElement("td");
        actionsCell.className = "px-6 py-4 text-right space-x-2";
        const upBtn = createActionButton("⬆", "up");
        const downBtn = createActionButton("⬇", "down");
        const delBtn = createActionButton("✖", "delete");
        actionsCell.append(upBtn, downBtn, delBtn);

        row.append(positionCell, nameCell, codeCell, actionsCell);
        return row;
    }

    function createActionButton(label, action) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = label;
        btn.className = "text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline";
        btn.addEventListener("click", () => {
            const row = btn.closest("tr");
            if (!row) return;
            if (action === "up" && row.previousElementSibling) {
                row.parentNode.insertBefore(row, row.previousElementSibling);
            } else if (action === "down" && row.nextElementSibling) {
                row.parentNode.insertBefore(row.nextElementSibling, row);
            } else if (action === "delete") {
                row.remove();
            }
            updatePrizePositions();
            validateForm();
        });
        return btn;
    }

    function updatePrizePositions() {
        const rows = document.querySelectorAll("#prize-list tr");
        rows.forEach((row, i) => {
            const posCell = row.querySelector("th");
            const title = row.querySelector("input[name^='prize'][name$='[title]']");
            const code = row.querySelector("input[name^='prize'][name$='[code]']");
            if (posCell) posCell.textContent = i + 1;
            if (title) title.name = `prize[${i}][title]`;
            if (code) code.name = `prize[${i}][code]`;
        });
    }
});

// ===== Валидация формы и сводка =====

function validateForm() {
    let filled = 0;
    let total = 6;

    let textBlocksFilled = 0;

    const title = document.getElementById("about-title");
    const desc = document.getElementById("about-description");
    const annonce = document.getElementById("about-annonce");
    const text = document.getElementById("about-text");
    const rules = document.getElementById("about-rules");

    if (title?.value.trim().length >= 3) textBlocksFilled++;
    if (desc?.value.trim().length >= 10) textBlocksFilled++;
    if (annonce?.value.trim().length >= 10) textBlocksFilled++;
    if (text?.value.trim().length >= 10) textBlocksFilled++;
    if (rules?.value.trim().length >= 10) textBlocksFilled++;

    updateSummary("summary-info", `${100/5*textBlocksFilled} %`);
    filled += textBlocksFilled === 5 ? 1 : 0;
    //updateSummary("summary-info", `${textBlocksFilled}/5 заполнено`);
    //filled += textBlocksFilled === 5 ? 1 : 0;

    const participants = document.getElementById("settings-participants");
    const partOk = participants && Number(participants.value) >= 5 && Number(participants.value) <= 1000;
    updateSummary("summary-participants", partOk ? participants.value : "не заполнено");
    filled += partOk ? 1 : 0;

    const confirm = document.getElementById("instruction-auto_confirm");
    const confirmOk = confirm && confirm.value !== "";
    updateSummary("summary-confirm", confirmOk ? confirm.options[confirm.selectedIndex].text : "не указано");
    filled += confirmOk ? 1 : 0;

    const startDate = document.getElementById("settings-start-date")?.value;
    const startTime = document.getElementById("settings-start-time")?.value;
    const validStart = checkStartDateTime(startDate, startTime);
    updateSummary("summary-start", validStart ? `${startDate} ${startTime}` : "не указано");
    filled += validStart ? 1 : 0;

    const platform = document.getElementById("raffle-platform");
    const platformOk = platform && platform.value !== "";
    updateSummary("summary-platform", platformOk ? platform.options[platform.selectedIndex].text : "не указано");
    filled += platformOk ? 1 : 0;

    const prizeList = document.getElementById("prize-list");
    const prizeCount = prizeList?.querySelectorAll("tr").length || 0;
    updateSummary("summary-prizes", prizeCount > 0 ? prizeCount : "не указано");
    filled += prizeCount > 0 ? 1 : 0;

    const percent = Math.round((filled / total) * 100);
    updateSummary("summary-percent", `${percent}%`);
    const btn = document.getElementById("submit-btn");
    if (btn) {
        btn.disabled = percent !== 100;
        btn.classList.toggle("opacity-50", percent !== 100);
        btn.classList.toggle("cursor-not-allowed", percent !== 100);
    }
}

function updateSummary(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function checkStartDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return false;
    const [d, m, y] = dateStr.split(".").map(Number);
    const [h, min] = timeStr.split(":").map(Number);
    const start = new Date(y, m - 1, d, h, min);
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return start > now;
}

function bindSummaryListeners() {
    const ids = [
        "about-title", "about-description", "about-annonce", "about-text", "about-rules",
        "settings-participants", "settings-confirm", "settings-start-date",
        "settings-start-time", "raffle-platform"
    ];

    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", validateForm);
    });

    const prizeList = document.getElementById("prize-list");
    if (prizeList) {
        prizeList.addEventListener("input", validateForm);
        prizeList.addEventListener("click", validateForm);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = collectFormData();
        if (!payload) return;

        try {
            const res = await fetch(`${APP.api}/raffles/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (!res.ok) {
                alert(json.message || "Ошибка при создании розыгрыша");
                return;
            }

            alert("✅ Розыгрыш создан успешно");
            window.location.href = "/raffles/";
        } catch (err) {
            console.error(err);
            alert("Ошибка сети");
        }
    });
});

function collectFormData() {
    const title = document.getElementById("about-title")?.value.trim();
    const description = document.getElementById("about-description")?.value.trim();
    const annonce = document.getElementById("about-annonce")?.value.trim();
    const text = document.getElementById("about-text")?.value.trim();
    const rules = document.getElementById("about-rules")?.value.trim();
    const participants = document.getElementById("settings-participants")?.value;
    const startTime = document.getElementById("settings-start-time")?.value;
    const startDate = document.getElementById("settings-start-date")?.value;
    const platform = document.getElementById("raffle-platform")?.value;
    const number_pool_from = document.getElementById("instruction-pullstart")?.value;
    const number_pool_to = document.getElementById("instruction-pullend")?.value;
    const auto_confirm = document.getElementById("instruction-auto_confirm")?.value;
    const repeat_text = document.getElementById("instruction-repeat_text")?.value;
    const allow_manual_selection = document.getElementById("instruction-allow_manual_selection")?.value;

    // Призовые места
    const prizeRows = document.querySelectorAll("#prize-list tr");
    const prize = [];
    prizeRows.forEach((row, index) => {
        const titleInput = row.querySelector(`input[name="prize[${index}][title]"]`);
        const codeInput = row.querySelector(`input[name="prize[${index}][code]"]`);
        if (titleInput?.value && codeInput?.value) {
            prize.push({
                place: index + 1,
                title: titleInput.value,
                code: codeInput.value
            });
        }
    });

    if (!title || !description || !annonce || !text || !startDate || !startTime || !platform || prize.length === 0) {
        alert("❗Заполните все обязательные поля");
        return null;
    }

    const instructions = {
        number_pool_from: Number(number_pool_from),
        number_pool_to: Number(number_pool_to),
        auto_confirm: auto_confirm == "1",
        repeat_text: Number(repeat_text),
        allow_manual_selection: allow_manual_selection == "1"
    };

    return {
        about: {
            title,
            description,
            annonce,
            text,
            rules
        },
        platform: {
            type: platform
        },
        participants: [],
        settings: {
            participants: Number(participants),
            start_date: startDate,
            start_time: startTime,
            instructions
        },
        prize
    };
}