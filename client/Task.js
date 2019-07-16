import uR from 'unrest.io'
import element from '@unrest/element'

import Project from './Project'
import { differenceInSeconds } from 'date-fns'

const UNIT_CONVERSION = [
  [180, 1, 's'],
  [90, 60, 'm'],
  [36, 3600, 'h'],
  [1, 3600 * 24, 'd'],
]

const shortTimeDiff = seconds => {
  seconds = Math.abs(seconds)
  let count, unit
  UNIT_CONVERSION.find(([max, mod, _unit], _i) => {
    count = seconds / mod
    unit = _unit
    return count < max
  })
  return `${Math.floor(count)}${unit}`
}

const relativeTimeDiff = seconds => {
  const end = seconds > 0 ? 'from now' : 'ago'
  if (!seconds) {
    return 'Now!'
  }
  return `${shortTimeDiff(seconds)} ${end}`
}

const { Model, APIManager, ForeignKey, DateTime, Int } = uR.db

export default class Task extends Model {
  static slug = 'server.Task'
  static fields = {
    id: 0,
    name: '',
    project: ForeignKey(Project),
    started: DateTime({ required: false }),
    completed: DateTime({ required: false }),
    deleted: DateTime({ required: false }),
    due: DateTime({ auto_now: true, required: false }),
    activity: ForeignKey('server.Activity', { required: false }),
    count: Int(0, { required: false }),
    weight: Int(0, { required: false }),
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
        text: 'Done: ' + relativeTimeDiff(this.seconds_to_next),
        icon: 'fa fa-calendar',
      })
      this.started &&
        out.push({
          text: shortTimeDiff(
            differenceInSeconds(this.completed, this.started),
          ),
          icon: 'fa fa-hourglass',
        })
    } else if (this.started) {
      this.seconds_to_next = differenceInSeconds(this.started, now)
      out.push({
        text: shortTimeDiff(this.seconds_to_next),
        icon: 'fa fa-hourglass',
      })
    } else if (this.due) {
      this.seconds_to_next = differenceInSeconds(this.due, now)
      out.push(`Due: ${relativeTimeDiff(this.seconds_to_next)}`)
    } else {
      out.push('incomplete')
    }
    if (this.activity) {
      out.push(`Activity: ${this.activity.name}`)
    }
    return out.map(element.text2obj)
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
      return ['name', 'started', 'completed', ...this.getExtraFields()]
    }
    if (this.started) {
      return ['name', 'started', ...this.getExtraFields()]
    }
    return super.getFieldnames()
  }
  getExtraFields() {
    return ['count', 'weight']
  }
  getRunningFields() {
    if (!this.started || this.completed) {
      return
    }
    return this.getExtraFields()
  }
}
