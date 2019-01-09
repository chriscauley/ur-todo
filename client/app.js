import uR from "unrest.js"
import Task from "./Task"
import Project from "./Project"

uR.auth.enabled = false

uR.ready(() => {
  window.Task = Task
  Task.__makeMeta()
  Project.__makeMeta()
})