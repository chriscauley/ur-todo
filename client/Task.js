import uR from 'unrest.io'
import element from '@unrest/element'

import Project from './Project'
import { differenceInSeconds, addDays } from 'date-fns'

const UNIT_CONVERSION = [
  [180, 1, 's'],
  [90, 60, 'm'],
  [36, 3600, 'h'],
  [1, 3600 * 24, 'd'],
]

export const shortTimeDiff = seconds => {
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
  if (!seconds) {
    return 'Now!'
  }
  const sd = shortTimeDiff(seconds)
  return seconds > 0 ? `in ${sd}` : `${sd} ago`
}

const { Model, APIManager, ForeignKey, DateTime, Int, String, List } = uR.db

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
    checklist: List('', { choices: [], required: false }),
    laps: List(undefined, { required: false }),
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

  getCompletedToday() {
    if (!this.activity) {
      return []
    }
    const tasks = this.activity.getTasks({ completed: new Date() })
    return tasks
  }

  getCompletedYesterday() {
    if (!this.activity) {
      return []
    }
    const tasks = this.activity.getTasks({ completed: addDays(new Date(), -1) })
    return tasks
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
    const completed_today = this.getCompletedToday().length
    if (completed_today) {
      out.push({
        className: 'chip',
        text: 'T ' + completed_today,
      })
    }
    const completed_yesterday = this.getCompletedYesterday().length
    if (completed_yesterday) {
      out.push({
        className: 'chip',
        text: 'Y ' + completed_yesterday,
      })
    }
    return out.map(element.text2obj)
  }

  isFresh() {
    // for now, hide everything completed more tha 5 minutes ago
    return !this.completed || new Date() - new Date(this.completed) < 3e5
  }

  _hasLaps() {
    return this.activity && this.activity.lap_items.length
  }

  click() {
    // moves task from stopped to started to complete
    if (this.started && !this.completed) {
      this.complete()
    } else if (!this.started) {
      this.started = new Date().valueOf()
      if (this._hasLaps()) {
        this.laps = [
          [this.activity.lap_items.split(',')[0], new Date().valueOf()],
        ]
      }
    }
    return this.constructor.objects.create(this)
  }

  complete() {
    this.completed = new Date().valueOf()
    if (this._hasLaps()) {
      this.laps.push(['completed', this.completed])
    }
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

  getFields() {
    const out = new Map(super.getFields())
    if (!this.activity) {
      return out
    }
    out.set(
      'checklist',
      List(String, {
        choices: this.activity.checklist_items.split(','),
        required: false,
      }),
    )
    out.set(
      'laps',
      List(String, {
        choices: this.activity.lap_items.split(','),
        required: false,
      }),
    )
    return out
  }

  getExtraFields() {
    if (!this.activity) {
      return []
    }
    const out = [...this.activity.measurements]
    if (this.activity.checklist_items) {
      out.push('checklist')
    }
    if (this.activity.lap_items) {
      out.push('laps')
    }
    return out
  }
  getRunningFields() {
    if (!this.started || this.completed) {
      return
    }
    return this.getExtraFields()
  }
}
