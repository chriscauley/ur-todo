import uR from "unrest.js"


const changeView = uR.auth.loginRequired(
  uR.router.routeElement("ur-form")
)

uR.router.add({
  "#!/form/([^/]*)/(\\d+)/": changeView,
})

uR.router.default_route = uR.auth.loginRequired(
  uR.router.routeElement("todo-home")
)