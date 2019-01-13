import uR from "unrest.js"
import Project from './Project'
import { distanceInWordsToNow as toNow } from 'date-fns'

const { Model, Manager, ForeignKey } = uR.db

export default class Task extends Model {
  static app_label = "main"
  static model_name = "Task"
  static fields = {
    name: "monkey",
    project: ForeignKey(Project),
    completed: "",
    id: 0,
    due: uR.db.DateTime({auto_now: true}),
  }
  static manager = Manager
  static editable_fieldnames = [ 'name', 'due' ]
  tag = "task-tile"
  edit_link = `#!/form/main.Task/${this.id}/`
  getIcon() {
    return uR.icon(this.completed?'check-square-o':'square-o')
  }
  getSubtitle() {
    if (this.completed) {
      return toNow(this.completed) + " ago"
    }
    return "incomplete"
  }
  isFresh() {
    return !this.completed || (new Date() - new Date(this.completed)) < 3e5 // 5 minutes
  }
}