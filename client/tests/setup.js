// Disable ajax functionality and auth, so everything works with no ajax

import Activity from '../Activity'
import Task from '../Task'
import Project from '../Project'

import uR from 'unrest.io'

const { mocha } = window

mocha.setup('bdd')
const models = [Activity, Task, Project]
models.forEach(model => (model.manager = uR.db.BaseManager))
uR.auth.enabled = false
