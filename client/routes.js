import uR from 'unrest.io'

// #! TODO this should be in uR.admin
const changeView = uR.auth.loginRequired(uR.router.routeElement('ur-form'))

uR.router.add({
  '#!/form/([^/]*)/(\\d+)/': changeView,
  '#/project/(overdue|\\d+)/': uR.router.routeElement('todo-project'),
  '/app/activities/': uR.router.routeElement('todo-activities'),
  '/app/spinning/': uR.router.routeElement('todo-spinning'),
  '/app/([\\.\\w]+)/(\\d+)/edit/$': uR.router.routeElement('ur-form'),
  '/app/scorecard/': uR.router.routeElement('scorecard'),
})

uR.router.default_route = uR.auth.loginRequired(
  uR.router.routeElement('todo-home'),
)

uR.router.default_url = '/'
