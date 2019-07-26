import uR from 'unrest.io'
import { startOfDay, endOfDay, isBefore, isPast } from 'date-fns'
import { sortBy } from 'lodash'

const { APIManager, Model } = uR.db

export default class Project extends Model {
  static slug = 'server.Project'
  static fields = {
    name: '',
    id: 0,
  }
  static manager = APIManager
  static editable_fieldnames = ['name']
  static OverDue = {
    id: 'overdue',
    name: 'Overdue',
    getTasks() {
      return uR.db.server.Task.objects.filter(
        t => !t.completed && !t.deleted && t.due && isPast(t.due),
      )
    },
    getSubtitles() {
      return [
        {
          text: this.getTasks().length + ' tasks',
        },
      ]
    },
  }
  edit_link = `#!/form/server.Project/${this.id}/`
  __str__() {
    return this.name
  }
  getSubtitles() {
    const now = new Date()
    const today = startOfDay(now)
    const tomorrow = endOfDay(today)
    const project_tasks = uR.db.server.Task.objects
      .filter({ project: this })
      .filter(t => !t.deleted)
    const due_today = project_tasks.filter(
      t =>
        !t.completed &&
        t.due &&
        isBefore(today, t.due) &&
        isBefore(t.due, tomorrow),
    )
    const running = project_tasks.filter(t => t.started && !t.completed)
    const completed_today = project_tasks.filter(
      t => t.completed && isBefore(today, t.completed),
    )
    const incomplete = due_today.filter(t => !t.completed)
    const overdue = project_tasks.filter(
      t => !t.completed && t.due && isBefore(t.due, now),
    )
    const out = [
      {
        icon: 'check-square-o mr-2',
        className: 'chip bg-success',
        text: completed_today.length,
      },
      {
        icon: 'calendar mr-2',
        className: 'chip',
        text: incomplete.length,
      },
      {
        icon: 'hourglass mr-2',
        className: 'chip bg-error',
        text: overdue.length,
      },
      {
        icon: 'spinner fa-spin mr-2',
        text: running.length,
      },
    ]
    return out.filter(sub => sub.text)
  }

  getTasks(opts = {}) {
    let tasks = uR.db.server.Task.objects.filter(t => t.project === this)
    if (opts.deleted) {
      return tasks.filter(t => t.deleted)
    }
    tasks = tasks.filter(t => !t.deleted)
    if (opts.past) {
      return sortBy(tasks.filter(t => !t.isFresh()), 'completed').reverse()
    } else {
      return tasks.filter(t => t.isFresh())
    }
  }
}
