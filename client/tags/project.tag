import uR from 'unrest.js'
import { format } from 'date-fns'

<todo-project>
  <div class={theme.outer}>
    <div class={theme.header}>
      <div class={theme.header_title}>{project.name}</div>
    </div>
    <div class={theme.content}>
      <div each={task,it in tasks} class="tile tile-centered">
        <div class="tile-icon pointer" onclick={markDone}>
          <i class={task.getIcon()} />
        </div>
        <div class="tile-content">
          <div class="tile-title">{task.name}</div>
        </div>
        <div class="tile-action">
          <a href={task.edit_link}><i class={uR.icon('ellipsis-v')} /></a>
        </div>
      </div>
    </div>
  </div>
  <ur-form model={Task} submit={submit} title="New Task"></ur-form>
<script>
this.mixin(uR.css.ThemeMixin)
const { Project, Task } = uR.db.main
window.P = this.project = Project.objects.get(this.opts.matches[1])
this.on("mount", this.update)
this.on("update",() => {
  this.tasks = Task.objects.all().filter(t => t.project === this.project.id)
})
this.submit = (tag) => {
  Task.objects.create({
    project_id: this.project.id,
    ...tag.getData(),
  }).then((a,b,c) => {
    this.update()
  })
}

markDone(e) {
  const task = e.item.task;
  task.done = !task.done;
  task.completed = task.done?format(new Date()):undefined
  Task.objects.save(task);
}
</script>
</todo-project>