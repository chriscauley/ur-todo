import uR from 'unrest.io'
import { sortBy } from 'lodash'

<todo-activities>
  <div class={theme.outer}>
    <div class={theme.header}>
      <div class={theme.header_title}>Activities</div>
    </div>
    <div class={theme.content}>
      <div each={group in groups}>
        <h3>{group.name}</h3>
        <div each={activity,i in group.activities}>
          <a href={activity.edit_link} class={css.icon('edit')}></a>
          {activity.name} - {activity.tasks.length} tasks
        </div>
      </div>
    </div>
  </div>

<script>
this.mixin(uR.css.ThemeMixin)
const activities = sortBy(uR.db.server.Activity.objects.all(), "name")
const tasks = sortBy(uR.db.server.Task.objects.all(), "due")
console.log(tasks[0].due)
const groups = {}
activities.forEach( activity => {
  if (!groups[activity.project]) {
    groups[activity.project] = {...activity.project, activities: []}
  }
  groups[activity.project].activities.push({
    ...activity,
    tasks: tasks.filter(t => t.activity === activity),
  })
})

this.groups = sortBy(Object.values(groups), "name")
</script>
</todo-activities>