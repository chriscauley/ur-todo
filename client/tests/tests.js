import './setup'
import '../app'
import uR from 'unrest.io'
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
    id: Math.floor(Math.random() * 1e6),
    ...opts,
  })

// most of this should be in the unrest tests
uR.db.ready(() => {
  describe('Activity', () => {
    it('.getNextTime() returns 9 am tomorrow', done => {
      newActivity().then(activity => {
        const next_time = activity.getNextTime()
        expect([
          df.getHours(next_time),
          df.getMinutes(next_time),
          df.getSeconds(next_time),
          df.getMilliseconds(next_time),
        ]).to.deep.equal([9, 0, 0, 0])
        done()
      })
    })

    it('creates an activity with defaults', done => {
      const name = 'foo'
      newActivity({ name }).then(activity => {
        expect(activity.name).to.equal(name)

        // first task made is due immediaetly, so skip it
        activity.makeNextTask().then(_task => {
          _task.complete()

          // create a task and verify all props were set by activity
          activity.makeNextTask().then(task => {
            expect(task.activity).to.equal(activity)
            expect(task.name).to.equal(name)
            expect(df.isEqual(task.due, activity.getNextTime())).to.equal(true)

            expect(Task.objects.filter({ activity: activity }).length).to.equal(
              2,
            )
            done()
          })
        })
      })
    })
  })

  describe('.fields.per_day', () => {
    it('repeats tasks multiple times in a day', done => {
      // create an Activity with 5x per day
      // complete task 5 times and check to make sure the 6th happens on the next day
      newActivity({ per_day: 3 }).then(activity => {
        const today = new Date()
        const tomorrow = df.addDays(new Date(), 1)
        const completeAndNextTask = task => {
          task.complete()
          return activity.makeNextTask()
        }
        activity
          .makeNextTask()
          .then(completeAndNextTask)
          .then(completeAndNextTask)
          .then(completeAndNextTask)
          .then(last_task => {
            const tasks = Task.objects.filter({ activity })

            const tomorrows_dom = df.getDate(tomorrow)
            const todays_dom = df.getDate(today)

            // Make sure all the tasks are on the same day (tomorrow's day of month)
            tasks
              .slice(0, 3)
              .map(t => t.due)
              .map(df.getDate)
              .forEach(d => expect(d).to.equal(todays_dom))

            // We've now exceded the per_day, so the next task should be next_day
            expect(df.getDate(last_task.due)).to.equal(tomorrows_dom)
            done()
          })
      })
    })
  })

  it('Incomplete previous days tasks count for today if completed today', async () => {
    const activity = await newActivity({ per_day: 2 })
    const today = new Date()
    const yesterday = df.addDays(today, -1)

    const yesterdays_completed_task = await activity.makeNextTask()
    Object.assign(yesterdays_completed_task, {
      completed: yesterday,
      due: yesterday,
    })
    const yesterdays_incomplete_task = await activity.makeNextTask()
    yesterdays_incomplete_task.due = yesterday
    yesterdays_incomplete_task.complete()
    const todays_second_task = await activity.makeNextTask()
    todays_second_task.complete()

    const tomorrows_task = await activity.makeNextTask()
    const due_days = [
      yesterdays_completed_task,
      yesterdays_incomplete_task,
      todays_second_task,
      tomorrows_task,
    ].map(t => df.differenceInCalendarDays(t.due, today))

    expect(due_days).to.deep.equal([-1, -1, 0, 1])
    const completed_days = [
      yesterdays_completed_task,
      yesterdays_incomplete_task,
      todays_second_task,
    ].map(t => df.differenceInCalendarDays(t.completed, today))
    expect(completed_days).to.deep.equal([-1, 0, 0])
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
