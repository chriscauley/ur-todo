import uR from 'unrest.io'
import { startOfDay, endOfDay, isBefore, isPast } from 'date-fns'
import { sortBy } from 'lodash'

const { APIManager, Model } = uR.db

const Logger = () => {
  const func = key => {
    func[key] = (func[key] || 0) + 1
  }
  return func
}

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
  getSubtitles(opts = {}) {
    const now = opts.date ? new Date(opts.date) : new Date()
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
    const count = Logger()
    completed_today
      .map(task => {
        if (task.activity) {
          return task.activity.icon || task.activity.alignment
        }
        return 'neutral'
      })
      .forEach(count)
    let out = [
      {
        icon: 'smile-o',
        className: 'chip bg-success',
        text: count.good,
        title: 'Completed Today',
      },
      {
        icon: 'check',
        className: 'chip bg-success',
        text: count.neutral,
        title: 'Completed Today',
      },
      {
        icon: 'smoking',
        className: 'chip bg-error',
        text: count.smoking,
        title: 'Smoking',
      },
      {
        icon: 'smile-o',
        className: 'chip bg-error',
        text: count.evil,
        title: 'Vices Completed Today',
      },
      {
        icon: 'calendar',
        className: 'chip',
        text: incomplete.length,
        title: 'Later Today',
      },
      {
        icon: 'hourglass',
        className: 'chip bg-warning',
        text: overdue.length,
        title: 'Overdue',
      },
      {
        icon: 'spinner fa-spin',
        text: running.length,
        title: 'Running',
      },
    ]
    out = out.filter(sub => sub.text)
    out.forEach(sub => {
      if (sub.text === 1) {
        delete sub.text
      }
    })
    return out
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
