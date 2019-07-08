import uR from 'unrest.io'
import Project from './Project'
import { differenceInSeconds } from 'date-fns'

const UNIT_CONVERSION = [
  [90, 1, 's'],
  [90, 60, 'm'],
  [36, 3600, 'h'],
  [1, 3600 * 24, 'd'],
]

const shortTimeDiff = seconds => {
  if (!seconds) {
    return 'Now!'
  }
  const end = seconds > 0 ? 'from now' : 'ago'
  seconds = Math.abs(seconds)

  let count, unit
  UNIT_CONVERSION.find(([max, mod, _unit], _i) => {
    count = seconds / mod
    unit = _unit
    return count < max
  })
  return `${Math.floor(count)}${unit} ${end}`
}

const { Model, APIManager, ForeignKey, DateTime } = uR.db

export default class Task extends Model {
  static slug = 'server.Task'
  static fields = {
    id: 0,
    name: '',
    project: ForeignKey(Project),
    started: DateTime({ required: false }),
    completed: DateTime({ required: false }),
    due: DateTime({ auto_now: true, required: false }),
    activity: ForeignKey('server.Activity', { required: false }),
  }
  static manager = APIManager
  static editable_fieldnames = ['name', 'due']
  tag = 'task-tile'
  edit_link = `#!/form/server.Task/${this.id}/`

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
      this.seconds_to_next = differenceInSeconds(this.completed, now)
      out.push({
        text: 'Done: ' + shortTimeDiff(this.seconds_to_next),
        icon: 'fa fa-calendar',
      })
      this.started &&
        out.push({
          text: shortTimeDiff(
            differenceInSeconds(this.completed, this.started),
          ).split(' ')[0],
          icon: 'fa fa-hourglass',
        })
    } else if (this.due) {
      this.seconds_to_next = differenceInSeconds(this.due, now)
      out.push(`Due: ${shortTimeDiff(this.seconds_to_next)}`)
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
    return this.constructor.objects.create(this)
  }

  complete() {
    this.completed = new Date().valueOf()
  }
  getFieldnames() {
    if (this.completed) {
      return ['name', 'started', 'completed']
    }
    if (this.started) {
      return ['name', 'started']
    }
    return super.getFieldnames()
  }
}
