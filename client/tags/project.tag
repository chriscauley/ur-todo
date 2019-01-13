import uR from 'unrest.js'

<todo-project>
  <div class={theme.outer}>
    <div class={theme.header}>
      <div class={theme.header_title}>{project.name}</div></div>
    <div class={theme.content}>
      <div each={task,it in tasks}>
        {task.name}
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
    console.log(Task.objects.all())
    this.update()
  })
}
</script>
</todo-project>