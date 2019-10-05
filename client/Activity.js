import df from 'date-fns'
import _ from 'lodash'
import uR from 'unrest.io'
//import riot from 'riot'

import { ICON_CHOICES } from './icon'
const { Model, Int, APIManager, Time, ForeignKey, List, String } = uR.db

const DELAY_CHOICES = _.concat(
  [0, 1, 5, 10, 15, 30].map(i => [i, `${i} mins`]),
  _.range(1, 13).map(i => [i * 60, `${i} hrs`]),
)

const ALIGNMENT_CHOICES = ['good', 'neutral', 'evil']

export default class Activity extends Model {
  static slug = 'server.Activity'
  static manager = APIManager
  static fields = {
    id: 0,
    name: '',
    per_day: Int(1, { choices: _.range(1, 10) }),
    interval: Int(1, { choices: [0, 1, 2, 3, 4, 5, 6, 7, 14, 21, 28] }),
    start_time: Time('09:00'),
    repeat_delay: Int(5, { choices: DELAY_CHOICES }),
    project: ForeignKey('server.Project'),
    measurements: List('', { choices: ['count', 'weight'] }),
    alignment: String('neutral', { choices: ALIGNMENT_CHOICES }),
    icon: String('', { required: false, choices: ICON_CHOICES }),
    checklist_items: String(''),
  }
  static editable_fieldnames = [
    'name',
    'per_day',
    'interval',
    'start_time',
    'repeat_delay',
    'project',
    'alignment',
    'icon',
    'measurements',
    'checklist_items',
  ]
  __str__() {
    return this.name
  }

  constructor(opts) {
    super(opts)
    // uR.db.ready.then(this.makeNextTask, () => riot.update())
  }

  getTasks(opts = {}) {
    let tasks = uR.db.server.Task.objects
      .filter({ activity: this })
      .filter(t => (opts.deleted ? t.deleted : !t.deleted))
    const date_fields = ['due', 'completed']
    date_fields
      .filter(f => opts[f])
      .forEach(
        field =>
          (tasks = tasks.filter(t => df.isSameDay(opts[field], t[field]))),
      )
    return tasks
  }

  getNextTime(now = new Date()) {
    // #! TODO GitHub Issue: #1 (remove now as an argument and just use actual now)
    // get the due time this.interval days in the future
    const [hours, minutes] = this.start_time.split(':').map(i => parseInt(i))
    return _.flow(
      date => df.addDays(date, this.interval),
      date => df.setHours(date, hours),
      date => df.setMinutes(date, minutes),
      date => df.setSeconds(date, 0),
      date => df.setMilliseconds(date, 0),
    )(now)
  }

  makeNextTask = () => {
    const Task = uR.db.server.Task
    const tasks = Task.objects.filter({ activity: this })

    // don't make another task if this one is incomplete
    const incomplete_task = tasks.find(t => !t.completed && !t.deleted)
    if (incomplete_task) {
      return incomplete_task
    }

    const last_task = tasks[tasks.length - 1]
    const kwargs = {
      activity: this,
      name: this.name,
      due: new Date(),
      project: this.project,
    }
    if (!tasks.length) {
      // no last task, make one due now
      return uR.db.server.Task.objects.create(kwargs)
    }

    Object.assign(kwargs, _.pick(last_task, last_task.getExtraFields()))

    // #! TODO GitHub Issue: #1
    const now = Math.max(last_task.completed, new Date())

    const todays_tasks = tasks.filter(t => df.isToday(t.completed))
    if (this.per_day > todays_tasks.length) {
      // haven't completed this.per_day tasks today. Make the next one today
      kwargs.due = df.addMinutes(last_task.completed, this.repeat_delay)
    } else {
      // #! TODO GitHub Issue: #1 (remove now)
      kwargs.due = this.getNextTime(now)
    }

    return uR.db.server.Task.objects.create(kwargs)
  }

  serialize(opts) {
    // #! TODO this should be built into an taglist input
    const slugList = value =>
      value &&
      value
        .toLowerCase()
        .replace(/\s*,[,\s]*/g, ',') // remove dupliate commas and white-space
        .replace(/(^,+|,+$)/, '') // remove commas at start/end
    const value = super.serialize(opts)
    value.checklist_items = slugList(value.checklist_items)
    value.lap_items = slugList(value.lap_items)
    return value
  }
}
