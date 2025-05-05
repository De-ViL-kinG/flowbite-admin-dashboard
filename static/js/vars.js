 //urls

  var apiDomain      = `http://projectx:8000`;
  var siteDomain = `http://projectx:1313`;
  var statusMap = {
    CREATED: "Создан",
    REGISTRED: "Анонсирован",
    IN_PROGRESS: "Идёт регистрация",
    REGISTRATION_ENDED: "Регистрация завершена",
    RAFFLED: "Розыгрыш завершён",
    CANCELED: "Отменён",
    ERROR_BY_SUPERADMIN: "Отменен СУПЕРАДМИНОМ"
  }

const APP = {
  version: '1.0',
  api: apiDomain,
  site: siteDomain,
  loginPath: '/login',
  icons: {
    success: '✅',
    error: '❌',
  },
  raffles: {
    statusMap: statusMap
  }
};