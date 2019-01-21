import './setup'
import '../app'
import uR from 'unrest.js'
import df from 'date-fns'
import _ from 'lodash'

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
    repeat_delay: 1,
    ...opts,
  })

// most of this should be in the unrest tests
uR.db.ready(() => {
  describe('Activity', () => {
    it('.getNextTime() returns 9 am tomorrow', () => {
      const activity = newActivity()
      const next_time = activity.getNextTime()
      expect([
        df.getHours(next_time),
        df.getMinutes(next_time),
        df.getSeconds(next_time),
        df.getMilliseconds(next_time),
      ]).to.deep.equal([9, 0, 0, 0])
    })

    it('creates an activity with defaults', () => {
      const name = 'foo'
      const activity = newActivity({ name })
      expect(activity.name).to.equal(name)

      // first task made is due immediaetly, so skip it
      activity.makeNextTask().complete()

      // create a task and verify all props were set by activity
      const task = activity.makeNextTask()
      expect(task.activity).to.equal(activity)
      expect(task.name).to.equal(name)
      expect(!!task.due).to.equal(true)
      expect(df.getHours(task.due)).to.equal(9)
      expect(df.getSeconds(task.due)).to.equal(0)

      expect(Task.objects.filter({ activity: activity }).length).to.equal(2)
    })
  })

  describe('.fields.per_day', () => {
    it('repeats tasks multiple times in a day', () => {
      // create an Activity with 5x per day
      // complete task 5 times and check to make sure the 6th happens on the next day
      const activity = newActivity({ per_day: 3 })
      const today = new Date()
      const tomorrow = df.addDays(new Date(), 1)
      const tasks = _.range(4).map(_i => {
        const task = activity.makeNextTask()
        task.complete()
        return task
      })

      const tomorrows_dom = df.getDate(tomorrow)
      const todays_dom = df.getDate(today)

      // Make sure all the tasks are on the same day (tomorrow's day of month)
      tasks
        .slice(0, 3)
        .map(t => t.due)
        .map(df.getDate)
        .forEach(d => expect(d).to.equal(todays_dom))

      // We've now exceded the per_day, so the next task should be next_day
      expect(df.getDate(tasks[3].due)).to.equal(tomorrows_dom)
    })
  })

  it('repeats tasks interval days from now', () => {
    // create Activities with a bunch of intervals
    // check to make sure they create tasks each interval out
  })
})

uR.db.ready(() => {
  window.mocha.checkLeaks()
  window.mocha.run()
})
