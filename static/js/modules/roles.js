// js/modules/roles-permissions.js

document.addEventListener("DOMContentLoaded", () => {
  loadRolesPermissions()
})

async function loadRolesPermissions() {
  try {
    const res = await fetch(`${APP.api}/roles/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    const json = await res.json()

    const table = document.querySelector("#roles-permissions-table")
    table.innerHTML = ""

    json.data.forEach(role => {
      const tr = document.createElement("tr")
      tr.innerHTML = `
        <td class="px-4 py-2 font-bold">${role.name}</td>
        <td class="px-4 py-2">${role.description || "-"}</td>
        <td class="px-4 py-2">
          <button class="btn btn-blue" data-edit-role="${role.id}" data-modal-target="permissionsModal" data-modal-toggle="permissionsModal">✏</button>
        </td>
      `
      table.appendChild(tr)
    })

    document.querySelectorAll("[data-edit-role]").forEach(button => {
      button.addEventListener("click", () => {
        const roleId = button.getAttribute("data-edit-role")
        openPermissionsModal(roleId)
      })
    })

  } catch (err) {
    showMessage('danger', err.message || "Ошибка получения ролей")
    console.error(err)
  }
}

async function openPermissionsModal(roleId) {
  try {
    const [roleRes, permsRes] = await Promise.all([
      fetch(`${APP.api}/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }),
      fetch(`${APP.api}/permissions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
    ])

    const { data: role } = await roleRes.json()
    const { data: permissions } = await permsRes.json()

    const modal = document.getElementById("permissionsModal")
    const permList = document.getElementById("permissions-list")
    const permSaveBtn = document.getElementById("savePermissionsBtn")

    if (!modal || !permList) return

    permList.innerHTML = ""

    const grouped = {}
    for (const perm of permissions) {
      if (!perm.name) continue
      const [module, action] = perm.name.split("_")
      if (!module || !action) continue

      if (!grouped[module]) grouped[module] = []
      grouped[module].push({ name: perm.name, action, summary: perm.summary || "" })
    }

    Object.entries(grouped).forEach(([module, items]) => {
      if (module === "auth") return // auth — пропускаем
      if (module === "menu") return // auth — пропускаем
      if (module === "permissions") return // auth — пропускаем

      const groupDiv = document.createElement("div")
      groupDiv.className = "mb-4"

      const title = document.createElement("h4")
      title.className = "font-bold mb-2 text-gray-700 dark:text-white"
      title.textContent = module.charAt(0).toUpperCase() + module.slice(1)
      groupDiv.appendChild(title)

      items.forEach(({ name, action, summary }) => {
        const wrapper = document.createElement("label")
        wrapper.className = "inline-flex items-center cursor-pointer mb-2 w-full"

        const isChecked = role.permissions.includes(name)

        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.className = "sr-only peer"
        checkbox.name = "permissions[]"
        checkbox.value = name
        checkbox.checked = isChecked
        checkbox.id = `perm_${name}`

        const toggle = document.createElement("div")
        toggle.className = `
          relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4
          peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer
          dark:bg-gray-700 peer-checked:after:translate-x-full
          rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white
          after:content-[''] after:absolute after:top-[2px] after:start-[2px]
          after:bg-white after:border-gray-300 after:border after:rounded-full
          after:h-5 after:w-5 after:transition-all dark:border-gray-600
          peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600
        `

        const labelText = document.createElement("span")
        labelText.className = "ms-3 text-sm font-medium text-gray-900 dark:text-gray-300"
        labelText.textContent = `${action} — ${summary}`

        wrapper.appendChild(checkbox)
        wrapper.appendChild(toggle)
        wrapper.appendChild(labelText)
        groupDiv.appendChild(wrapper)
      })

      permList.appendChild(groupDiv)
    })

    permSaveBtn.onclick = async () => {
      const checkedPermissions = Array.from(
        permList.querySelectorAll("input[type=checkbox]:checked")
      ).map(input => input.value)

      try {
        const resp = await fetch(`${APP.api}/roles/${roleId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({ permissions: checkedPermissions })
        })
        const result = await resp.json()
        if (resp.ok) {
          showMessage("success", "Права успешно обновлены")
          hideModal("permissionsModal")
          loadRolesPermissions()
        } else {
          showMessage("danger", result.message || "Ошибка при сохранении")
        }
      } catch (err) {
        console.error(err)
        showMessage("danger", "Ошибка соединения с сервером")
      }
    }

  } catch (err) {
    console.error(err)
    showMessage("danger", err.message || "Ошибка при открытии модального окна")
  }
}