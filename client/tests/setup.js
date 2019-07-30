// Disable ajax functionality and auth, so everything works with no ajax

import Activity from '../Activity'
import Task from '../Task'
import Project from '../Project'

import uR from 'unrest.io'

const { mocha } = window

mocha.setup('bdd')
const models = [Activity, Task, Project]
uR.FAKE_IDS = true
models.forEach(model => {
  delete model.manager
  new uR.db.BaseManager(model)
})
uR.auth.enabled = false
