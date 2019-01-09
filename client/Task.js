import uR from "unrest.js"
import Project from './Project'

const { db } = uR

export default class Task extends db.Object {
  static app_label = "main"
  static model_name = "Task"
  static fields = {
    done: false,
    name: "",
    project: db.ForeignKey(Project),
  }
  static manager = db.Manager
}