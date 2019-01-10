import uR from "unrest.js"
import Task from "./Task"
import Project from "./Project"

import "./routes"
import "./tags"

uR.ready(() => {
  window.Task = Task
  Task.__makeMeta()
  Project.__makeMeta()
})