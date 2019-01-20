import './setup'
import '../app'
import uR from 'unrest.js'
import df from 'date-fns'

import { expect } from 'chai'
import Activity from '../Activity'
import Task from '../Task'

const { describe, it } = window // to avoid lint error

const newActivity = opts =>
  Activity.objects.create({
    name: name,
    start_time: '9:00',
    interval: 1,
    per_day: 1,
    ...opts,
  })

// most of this should be in the unrest tests
uR.db.ready(() => {
  describe('Activity', () => {
    it('has a default date', () => {
      const activity = newActivity()
      const dt = activity.getNextTime()
      expect([
        df.getHours(dt),
        df.getMinutes(dt),
        df.getSeconds(dt),
        df.getMilliseconds(dt),
      ]).to.deep.equal([9, 0, 0, 0])
    })

    it('creates an activity with defaults', () => {
      const name = 'foo'
      const activity = newActivity({ name })
      expect(activity.name).to.equal(name)
      //#! TODO need to clear db in a setup step
      // expect(activity.id).to.equal(1)

      // create a task and verify all props were set by activity
      activity.makeTask()
      const task = Task.objects.all()[0]
      expect(task.id).to.equal(1)
      expect(task.activity).to.equal(activity)
      expect(task.name).to.equal(name)
      expect(!!task.due).to.equal(true)
      expect(df.getHours(task.due)).to.equal(9)
      expect(df.getSeconds(task.due)).to.equal(0)

      expect(Task.objects.filter({ activity: activity }).length).to.equal(1)
    })
  })
})

uR.db.ready(() => {
  window.mocha.checkLeaks()
  window.mocha.run()
})
