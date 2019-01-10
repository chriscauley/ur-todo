import uR from "unrest.js"
import Project from './Project'

const { Model, Manager, ForeignKey } = uR.db

export default class Task extends Model {
  static app_label = "main"
  static model_name = "Task"
  static fields = {
    done: false,
    name: "",
    project: ForeignKey(Project),
  }
  static manager = Manager
}