import uR from 'unrest.js'
import Project from './Project'
import { distanceInWordsStrict as dt2words } from 'date-fns'

const { Model, APIManager, ForeignKey, DateTime } = uR.db

export default class Task extends Model {
  static app_label = 'main'
  static model_name = 'Task'
  static fields = {
    id: 0,
    name: '',
    project: ForeignKey(Project),
    started: DateTime({ required: false }),
    completed: DateTime({ required: false }),
    due: DateTime({ auto_now: true }),
    activity: ForeignKey('main.Activity', { required: false }),
  }
  static manager = APIManager
  static editable_fieldnames = ['name', 'due']
  tag = 'task-tile'
  edit_link = `#!/form/main.Task/${this.id}/`

  __str__() {
    return this.name
  }

  getIcon() {
    let icon = 'square-o'
    if (this.completed) {
      icon = 'check-square-o'
    } else if (this.started) {
      icon = 'spinner fa-spin'
    }
    return uR.css.icon(icon)
  }

  getSubtitles() {
    const now = new Date()
    const out = []
    if (this.completed) {
      out.push({
        text: dt2words(this.completed, now) + ' ago',
        icon: 'fa fa-calendar',
      })
      this.started &&
        out.push({
          text: dt2words(this.completed, this.started),
          icon: 'fa fa-hourglass',
        })
    } else if (this.due) {
      const is_past = now > this.due
      out.push(
        `Due: ${dt2words(this.due, now)} ${is_past ? 'over due' : 'from now'}`,
      )
    } else {
      out.push('incomplete')
    }
    return out.map(uR.element.text2obj)
  }

  isFresh() {
    // for now, hide everything completed more tha 5 minutes ago
    return !this.completed || new Date() - new Date(this.completed) < 3e5
  }

  click() {
    // moves task from stopped to started to complete
    if (this.started && !this.completed) {
      this.complete()
    } else if (!this.started) {
      this.started = new Date().valueOf()
    }
    return this.constructor.objects.save(this)
  }

  complete() {
    this.completed = new Date().valueOf()
  }
}
