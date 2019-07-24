import uR from 'unrest.io'
import { sortBy } from 'lodash'

<todo-project>
  <div class={theme.outer}>
    <div class={theme.header}>
      <a href={project.edit_link} class={theme.header_title}>{project.name}</a>
      <div class="float-right" if={project.id}>
        <button onclick={toggle('_past')} class={btn[_past?'primary':'link']}>
          <i class={icon('history')} /></button>
        <button onclick={toggle('_deleted')} class={btn[_deleted?'cancel':'link']}>
          <i class={icon('trash')} /></button>
      </div>
    </div>
    <div class={theme.content}>
      <div each={task,it in todo} data-is={task.tag} object={task}
           submit={save} cancel={cancelTask}/>
      <div if={done.length} class="divider text-dark text-center"
           data-content="done"></div>
      <div each={task,it in done} data-is={task.tag} object={task}
           submit={save} cancel={cancelTask} />
    </div>
    <div class={theme.footer}>
      <div if={!model}>
        <div onclick={setModel('server.Task')} class={btn.default}>
          <i class={icon('plus')} />
          Task
        </div>
        <div onclick={setModel('server.Activity')} class={btn.default}>
          <i class={icon('plus')} />
          Activity
        </div>
      </div>
      <ur-form if={model} model={model} submit={saveNew} cancel={cancel} />
    </div>
  </div>

<script>
this.setModel = model => () => {
  this.model = model
}
this.mixin(uR.css.ThemeMixin)
this.done = this.todo = []
const { Project, Task, Activity } = uR.db.server
if (this.opts.matches[1] === 'overdue') {
  this.OVERDUE = true
  window.P = this.project = Project.OverDue
} else {
  window.P = this.project = Project.objects.get(this.opts.matches[1])
}
this.on("mount", this.update)

getFilteredTasks() {
  let tasks = Task.objects.filter(t => t.project === this.project)
  if (this.OVERDUE) {
    tasks = this.project.getTasks()
  }
  if (this._deleted) {
    return tasks.filter(t => t.deleted)
  }
  tasks = tasks.filter(t => !t.deleted)
  if (this._past) {
    return sortBy(
        tasks.filter( t=> !t.isFresh()),
      'completed'
    ).reverse()
  } else {
    return tasks.filter(t => t.isFresh())
  }
}

this.on("update",() => {
  this._past = this.mode === "_past"
  this._deleted = this.mode === "_deleted"
  this.tasks = this.getFilteredTasks()
  this.todo = this.tasks.filter(t => !t.completed)
  this.done = this.tasks.filter(t => t.completed)
})
this.submit = (tag) => {
  Task.objects.create({
    project_id: this.project.id,
    ...tag.getData(),
  }).then(this.update)
}
this.cancelTask = (event) => {
  event.item.task.tag = "task-tile"
  this.update()
}
this.cancel = (tag) => {
  delete this.model
  this.update()
}
this.save = (tag) => {
  const task = tag.opts.object
  Object.assign(task,tag.getData())
  task.tag = 'task-tile'
  return Task.objects
    .create(task.serialize())
    .then(() =>riot.update())
}
this.saveNew = (tag) => {
  tag.opts.object = new Task({project: this.project.id})
  delete this.model
  return this.save(tag)
}
toggle(mode) {
  return () => {
    if (this.mode === mode) {
      delete this.mode
    } else {
      this.mode = mode
    }
  }
}
</script>
</todo-project>