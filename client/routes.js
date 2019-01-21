import uR from 'unrest.js'

// #! TODO this should be in uR.admin
const changeView = uR.auth.loginRequired(uR.router.routeElement('ur-form'))

uR.router.add({
  '#!/form/([^/]*)/(\\d+)/': changeView,
  '#/project/(\\d+)/': uR.router.routeElement('todo-project'),
})

uR.router.default_route = uR.auth.loginRequired(
  uR.router.routeElement('todo-home'),
)
