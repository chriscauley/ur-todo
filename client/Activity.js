import df from 'date-fns'
import _ from 'lodash'
import uR from 'unrest.io'
import riot from 'riot'

const { Model, Int, APIManager, Time, ForeignKey } = uR.db
const daysSince = df.differenceInCalendarDays


export default class Activity extends Model {
  static slug = 'main.Activity'
  static manager = APIManager
  static fields = {
    id: 0,
    name: '',
    per_day: Int(1, { choices: _.range(1, 10) }),
    interval: Int(1, { choices: [1, 2, 3, 4, 5, 6, 7, 14, 21, 28] }),
    start_time: Time('9:00'),
    repeat_delay: Int(5, { choices: [0, 1, 5, 10, 15, 30, 60, 120] }),
    project: ForeignKey('main.Project'),
  }
  static editable_fieldnames = [
    'name',
    'per_day',
    'interval',
    'start_time',
    'repeat_delay',
    'project',
  ]
  __str__() {
    return this.name
  }

  constructor(opts) {
    super(opts)
    uR.db.ready.then(this.makeNextTask, () => riot.update())
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
    const Task = uR.db.main.Task
    const tasks = Task.objects.filter({ activity: this })

    // don't make another task if this one is incomplete
    const incomplete_task = tasks.find(t => !t.completed)
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
      return uR.db.main.Task.objects.create(kwargs)
    }

    // #! TODO GitHub Issue: #1
    const now = Math.max(last_task.completed, new Date())

    const todays_tasks = tasks.filter(
      t => t === last_task || !daysSince(t.completed, now),
    )
    if (this.per_day > todays_tasks.length) {
      // haven't completed this.per_day tasks today. Make the next one today
      kwargs.due = df.addMinutes(last_task.completed, this.repeat_delay)
    } else {
      // #! TODO GitHub Issue: #1 (remove now)
      kwargs.due = this.getNextTime(now)
    }

    return uR.db.main.Task.objects.create(kwargs)
  }
}
