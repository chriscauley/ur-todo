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
    completed: "",
    id: 0,
  }
  static manager = Manager
  static editable_fieldnames = [ 'name' ]
  tag = "task-tile"
  edit_link = `#!/form/main.Task/${this.id}/`
  getIcon() {
    return uR.icon(this.done?'check-square-o':'square-o')
  }
}