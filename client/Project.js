import uR from 'unrest.io'
import { startOfDay, endOfDay, isBefore } from 'date-fns'

const { APIManager, Model } = uR.db

export default class Project extends Model {
  static slug = 'server.Project'
  static fields = {
    name: '',
    id: 0,
  }
  static manager = APIManager
  static editable_fieldnames = ['name']
  edit_link = `#!/form/server.Project/${this.id}/`
  __str__() {
    return this.name
  }
  getSubtitles() {
    const now = new Date()
    const today = startOfDay(now)
    const tomorrow = endOfDay(today)
    const all_tasks = uR.db.server.Task.objects.filter({ project: this })
    const tasks = all_tasks
      .filter(t => !t.completed || isBefore(today, t.due))
      .filter(t => !t.due || isBefore(t.due, tomorrow))
    const running = tasks.filter(t => t.started && !t.completed)
    const completed = tasks.filter(t => t.completed)
    const out = [
      {
        icon: 'check-square-o',
        text: `${completed.length} / ${tasks.length}`,
      },
    ]
    if (running.length) {
      out.push({
        icon: 'spinner fa-spin',
        text: running.length,
      })
    }
    return out
  }
}
