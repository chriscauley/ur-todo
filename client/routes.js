import uR from "unrest.js"

uR.router.default_route = uR.auth.loginRequired(
  uR.router.routeElement("todo-home")
)