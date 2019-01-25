import uR from 'unrest.io'
import { startOfDay, endOfDay, isBefore } from 'date-fns'

const { APIManager, Model } = uR.db

export default class Project extends Model {
  static slug = 'main.Project'
  static fields = {
    name: '',
    id: 0,
  }
  static manager = APIManager
  static editable_fieldnames = ['name']
  edit_link = `#!/form/main.Project/${this.id}/`
  __str__() {
    return this.name
  }
  getSubtitles() {
    const now = new Date()
    const today = startOfDay(now)
    const tomorrow = endOfDay(today)
    const tasks = uR.db.main.Task.objects
      .filter({ project: this })
      .filter(t => !t.completed || isBefore(today, t.due))
      .filter(t => !t.due || isBefore(t.due, tomorrow))
    const completed = tasks.filter(t => t.completed)
    const out = []
    out.push({
      icon: 'check',
      text: `${completed.length} / ${tasks.length}`,
    })
    return out
  }
}
