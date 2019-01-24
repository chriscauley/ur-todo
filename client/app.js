import uR from 'unrest.io'
import Activity from './Activity'
import Task from './Task'
import Project from './Project'

import './routes'
import './tags'

uR.ready(() => {
  uR.admin.start()
  window.Task = Task
  Activity.__makeMeta()
  Task.__makeMeta()
  Project.__makeMeta()
})
