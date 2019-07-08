import uR from 'unrest.io'

<todo-project>
  <div class={theme.outer}>
    <div class={theme.header}>
      <span class={theme.header_title}>{project.name}</span>
      <div class="float-right">
        <button onclick={toggle('_past')} class={btn[_past?'primary':'link']}>
          <i class={icon('history')} /></button>
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
      <div if={!_add} onclick={toggle('_add')} class={btn.default}>
        <i class={icon('plus')} />
        Add Another
      </div>
      <ur-form if={_add} model={Task} submit={saveNew} cancel={cancel} />
    </div>
  </div>

<script>
this.mixin(uR.css.ThemeMixin)
this.done = this.todo = []
const { Project, Task } = uR.db.server
window.P = this.project = Project.objects.get(this.opts.matches[1])
this.on("mount", this.update)
this.on("update",() => {
  const filter = this._past?
        t => !t.isFresh():
        t => t.isFresh()
  this.tasks = Task.objects.filter(
    t => t.project === this.project && filter(t)
  )
  this.todo = this.tasks.filter(t => !t.completed)
  this.done = this.tasks.filter(t => t.completed)
})
this.submit = (tag) => {
  Task.objects.create({
    project_id: this.project.id,
    ...tag.getData(),
  }).then(this.update)
}
this.cancelTask = (tag,event) => {
  event.item.task.tag = "task-tile"
  this.update()
}
this.cancel = (tag) => {
  tag.unmount()
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
  this._add = false
  return this.save(tag)
}
toggle(mode) {
  return () => {
    this[mode] = !this[mode]
  }
}
</script>
</todo-project>