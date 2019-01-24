import uR from 'unrest.io'

<todo-project>
  <div class={theme.outer}>
    <div class={theme.header}>
      <span class={theme.header_title}>{project.name}</span>
      <div class="float-right">
        <button onclick={toggleHistory} class={btn[show_past?'primary':'link']}>
          <i class={icon('history')} /></button>
      </div>
    </div>
    <div class={theme.content}>
      <div data-is={task.tag} object={task} each={task,it in tasks} submit={save} />
    </div>
    <div class={theme.footer}>
      <div if={!add_another} onclick={toggleAdd} class={btn.default}>
        <i class={icon('plus')} />
        Add Another
      </div>
      <ur-form if={add_another} model={Task} submit={saveNew} />
    </div>
  </div>

<script>
this.mixin(uR.css.ThemeMixin)
const { Project, Task } = uR.db.main
window.P = this.project = Project.objects.get(this.opts.matches[1])
this.on("mount", this.update)
this.on("update",() => {
  const filter = this.show_past?
        t => !t.isFresh():
        t => t.isFresh()
  this.tasks = Task.objects.filter(
    t => t.project === this.project && filter(t)
  )
})
this.submit = (tag) => {
  Task.objects.create({
    project_id: this.project.id,
    ...tag.getData(),
  }).then(this.update)
}
this.save = (tag) => {
  const task = tag.opts.object
  Object.assign(task,tag.getData())
  task.tag = 'task-tile'
  Task.objects
    .create(task.serialize())
    .then(() =>riot.update())
}
this.saveNew = (tag) => {
  tag.opts.object = new Task({project: this.project.id})
  this.save(tag)
  this.add_another = false
}
toggleAdd() {
  this.add_another = !this.add_another
}
toggleHistory() {
  this.show_past = !this.show_past
}
</script>
</todo-project>