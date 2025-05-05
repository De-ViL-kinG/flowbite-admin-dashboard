document.addEventListener("DOMContentLoaded", async () => {
  const url = new URL(window.location.href)
  var companyId = url.searchParams.get("company_id")

  if (!companyId) {
    const usr = await fetch(`${APP.api}/auth/check-auth`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    const user = await usr.json()
    if (user.data.company == null) {
      showMessage("error", "Не указан company_id")
      window.history.back()
      return
    } else if (user.data.company.id) { 
      companyId = user.data.company.id
    } else {
      showMessage("error", "Не указан company_id")
      window.history.back()
      return
    }
    
  }

  await loadCompanyUsers(companyId)
})

// Обработка кнопок редактирования и удаления
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-delete-user]')

  if (btn) await deleteUser(btn.dataset.deleteUser)
})

async function loadCompanyUsers(companyId) {
  try {
    const res = await fetch(`${APP.api}/companies/${companyId}/users/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    const json = await res.json()

    const com = await fetch(`${APP.api}/companies/${companyId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    const company = await com.json()

    const list = document.getElementById("company-users-list")
    const comName = document.getElementById("companyName")

    // 👇 здесь была ошибка: innerHTML — это не функция
    comName.innerHTML = company.data.name

    if (!json.data || !Array.isArray(json.data) || json.data.length == 0) {
      list.innerHTML = `<tr><td colspan="4" class="text-center py-4">Нет данных</td></tr>`
      return
    }



    list.innerHTML = ""

    json.data.forEach(user => {
      const tr = document.createElement("tr")
      tr.innerHTML = `
        <td class="px-4 py-2">${user.id}</td>
        <td class="px-4 py-2">${user.full_name || "-"}</td>
        <td class="px-4 py-2">${user.email}</td>
        <td class="px-4 py-2">${user.role}</td>
        <td class="px-4 py-2">
          <button class="btn btn-red" data-delete-user="${user.id}">🗑</button>
        </td>
      `
      list.appendChild(tr)
    })
  } catch (err) {
    showMessage("error", "Ошибка при загрузке пользователей компании")
    console.error(err)
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("create-user-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    var companyId = new URLSearchParams(window.location.search).get("company_id");

    if (!companyId) {
      const usr = await fetch(`${APP.api}/auth/check-auth`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      const user = await usr.json()
      if (user.data.company == null) {
        showMessage("error", "Не указан company_id")
        return;
      } else if (user.data.company.id) {
        companyId = user.data.company.id
      } else {
        showMessage("error", "Не указан company_id")
        return;
      }

    }

    const payload = {
      full_name: document.getElementById("user-fullname").value,
      email: document.getElementById("user-email").value,
      password: document.getElementById("user-password").value,
      role: document.getElementById("user-role").value
    };

    try {
      const res = await fetch(`${APP.api}/companies/${companyId}/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (res.ok) {
        showMessage("success", "Пользователь успешно добавлен");
        new Modal(document.getElementById('createUserModal')).hide()
        loadCompanyUsers(companyId)
      } else {
        showMessage("error", json.message || "Ошибка при добавлении пользователя");
      }
    } catch (err) {
      console.error(err);
      showMessage("error", "Ошибка соединения с сервером");
    }
  });
});

async function deleteUser(id) {
  if (!confirm('Удалить пользователя?')) return

  var companyId = new URLSearchParams(window.location.search).get("company_id");

  if (!companyId) {
    const usr = await fetch(`${APP.api}/auth/check-auth`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    const user = await usr.json()
    if (user.data.company == null) {
      showMessage("error", "Не указан company_id")
      return;
    } else if (user.data.company.id) {
      companyId = user.data.company.id
    } else {
      showMessage("error", "Не указан company_id")
      return;
    }

  }

  try {
    const res = await fetch(`${APP.api}/companies/${companyId}/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    showMessage('success', data.message)
    loadCompanyUsers(companyId)
  } catch (err) {
    showMessage('error', err.message)
  }
}