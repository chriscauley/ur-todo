import Task from '../Task'
import Project from '../Project'
import { isToday } from 'date-fns'
import { sortBy } from 'lodash'

<count-x>
  <b if={opts.count > 1}>{opts.count}x</b>
</count-x>

<scorecard>
  <div class={theme.outer}>
    <div class={theme.header}>
      <div class={theme.header_title}>Today&rsquo; Score</div>
    </div>
    <div class={theme.content}>
      <h5 class="h5">Overdue Tasks: {overdue_tasks.length}</h5>
      <div class="divider"></div>
      <h5 class="h5">Tasks Completed: {completed_tasks.length}</h5>
      <div class="columns">
        <div each={group, i in task_groups} class="col-6">
          <div class="card mb-2 mr-2">
            <div class="card-body">
              <div>
                <count-x count={group.count}/>
                {group.name}
                <div>
                  <span each={count, key in group.checkcounts} class="chip">
                    <i class={icon(key.trim())} />
                    <count-x count={count} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
<script>
this.mixin("ThemeMixin")
this.completed_tasks = Task.objects.all()
      .filter(t => t.completed && isToday(t.completed))
const _groups = {}
const misc = { name: "misc" }

const groupChecks = (activity, list) => {
  const counts = activity.checkcounts
  list.forEach(string => {
    counts[string] = (counts[string] || 0) + 1
  })
}

this.completed_tasks.forEach( task => {
  const activity = task.activity || misc
  if (!_groups[activity.id]) {
    _groups[activity.id] = {
      count: 0,
      name: activity.name,
      id: activity.id,
      checkcounts: {},
    }
  }
  _groups[activity.id].count ++
  groupChecks(_groups[activity.id], task.checklist)
})
this.task_groups = sortBy(_groups, 'name')
this.overdue_tasks = Project.OverDue.getTasks()
</scorecard>