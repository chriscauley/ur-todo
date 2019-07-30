import uR from 'unrest.io'
import { pick } from 'lodash'

<task-tile>
  <div class="tile tile-centered">
    <div class="tile-icon {pointer: !task.deleted, disabled: task.deleted}" onclick={click}>
      <i class={task.getIcon()} />
    </div>
    <div class="tile-content">
      <div class="tile-title">
        <span if={task.activity} class="chip">
          <i class="{icon(task.activity.icon||'question')}" />
        </span>
        {task.name}
      </div>
      <div class="tile-subtitle text-gray">
        <span each={sub,it in task.getSubtitles()} class={sub.className}>
          <i if={sub.icon} class={sub.icon} />
          {sub.text}
        </span>
      </div>
    </div>
    <div if={task.deleted} class="tile-action" onclick={restore}>
      <i class={uR.css.icon('recycle pointer')} />
    </div>
    <div if={!task.deleted} class="tile-action" onclick={toggleActions}>
      <i class={uR.css.icon('ellipsis-v pointer')} />
    </div>
    <ul class="menu {'d-none': parent.openTask !== task}">
      <li class="menu-item">
        <a onclick={copy}>Copy</a>
      <li class="menu-item">
        <a onclick={edit}>Edit</a>
      </li>
      <li class="menu-item">
        <a onclick={delete}>Delete</a>
      </li>
      <li class="menu-item" if={task.due}>
        <a onclick={removeDue}>Remove Due</a>
      </li>
      <li class="menu-item" if={!task.activity}>
        <a onclick={createActivity}>Create Activity</a>
      </li>
      <li class="menu-item" if={task.activity}>
        <a href="/app/server.Activity/{task.activity.id}/edit/">Edit Activity</a>
      </li>
    </ul>
  </div>
  <div if={fields && fields.length} class="flex-full">
    <ur-form object={task} editable_fieldnames={fields} submit={saveRunning} autosubmit={true}></ur-form>
  </div>
<script>
this.mixin(uR.css.Mixin)
const { Task, Activity } = uR.db.server
this.task = opts.object
this.closeMenu = () => {
  delete this.parent.openTask
  window.removeEventListener('click', this.closeMenu)
  this.parent.update()
}
toggleActions(e) {
  if (this.parent.openTask === this.task) {
    this.closeMenu()
  } else {
    window.addEventListener('click', this.closeMenu)
    this.parent.openTask = this.task
  }
  this.parent.update()
  e.stopPropagation()
}
copy() {
  Task.objects.create(
    pick(this.task, ['name', 'project', 'activity', ...this.task.getExtraFields()])
  ).then(() => this.parent.update())
}
edit() {
  this.task.tag = "ur-form"
  this.parent.update()
}
click(e) {
  const { task } = this
  if (task.deleted) {
    return
  }
  task.click().then(() => {
    if (task.activity) {
      task.activity.makeNextTask()
    }
    uR.db.ready.then(() => this.parent.update())
  })
}
restore(e) {
  const { task } = e.item
  delete task.deleted
  task.constructor.objects.create(task).then(
    () => this.parent.update()
  )
}
delete(e) {
  const { task } = e.item
  const accept = () => {
    task.deleted = new Date().valueOf()
    task.constructor.objects.create(task).then(
      () => this.parent.update()
    )
  }
  uR.element.alert(
    'tw-confirm',
    { innerHTML: `Are you sure you want to delete "${e.item.task}"`},
    { accept }
  )
}

removeDue(e) {
  const { task } = e.item
  task.due = ''
  task.constructor.objects.create(task).then(
    () => this.parent.update()
  )
}

createActivity(e) {
  const { task } = e.item
  const tasks = Task.objects.all().filter(t => t.name === task.name)
  Activity.objects.create({
    name: task.name,
    project: task.project
  }).then(
    activity => Promise.all(
      tasks.map(t => {
        t.activity = activity
        return Task.objects.create(t)
      })
    )
  ).then(() => this.parent.update())
}
saveRunning(form) {
  const data = form.getData()
  Object.assign(this.task, data)
  return this.task.constructor.objects.create(this.task)
}

this.on('update', () => {
  this.trash_mode = this.opts.trash_mode
  this.fields = this.task.getRunningFields()
  clearTimeout(this.timeout)
  const time = Math.abs(this.task.seconds_to_next) < 120?1000:60000
  this.timeout = setTimeout(() => this.update(),time)
})
this.on("mount",() => {
  this.update()
})
</script>
</task-tile>

<tw-confirm>
  <div class={theme.outer}>
    <div class={theme.header}>
      <div class={theme.header_title}>{title}</div>
    </div>
    <div class={theme.content}>
      <yield />
    </div>
    <div class={theme.footer}>
      <button onclick={accept} class={css.btn.primary}>Accept</button>
      <button onclick={reject} class={css.btn.cancel}>Reject</button>
    </div>
  </div>
<script>
this.mixin(uR.css.ThemeMixin)
accept() {
  this.opts.accept()
  this.unmount()
}
reject() {
  this.opts.reject && this.opts.reject()
  this.unmount()
}
</script>
</tw-confirm>