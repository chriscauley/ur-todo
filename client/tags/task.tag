import uR from 'unrest.io'
import { pick } from 'lodash'

<task-tile class="tile tile-centered">
  <div class="tile-icon {pointer: !task.deleted, disabled: task.deleted}" onclick={click}>
    <i class={task.getIcon()} />
  </div>
  <div class="tile-content">
    <div class="tile-title">{task.name}</div>
    <div class="tile-subtitle text-gray">
      <span each={sub,it in task.getSubtitles()}>
        <i if={sub.icon} class={sub.icon} />
        {sub.text}
      </span>
    </div>
  </div>
  <div if={task.deleted} class="tile-action" onclick={restore}>
    <i class={uR.css.icon('recycle pointer')} />
  </div>
  <div if={!task.deleted} class="tile-action" onclick={toggle('_actions')}>
    <i class={uR.css.icon('ellipsis-v pointer')} />
    <ul class="menu {'d-none': !_actions}">
      <li class="menu-item">
        <a onclick={copy}>Copy</a>
      <li class="menu-item">
        <a onclick={edit}>Edit</a>
      </li>
      <li class="menu-item">
        <a onclick={delete}>Delete</a>
      </li>
      <li class="menu-item">
        <a onclick={createActivity}>Convert to Activity</a>
      </li>
      <li class="menu-item">
        <a onclick={editActivity}>Edit Activity</a>
      </li>
    </ul>
  </div>
  <div class="divider"></div>
<script>
this.task = opts.object
toggle(action) {
  return () => {
    this[action] = !this[action]
  }
}
copy() {
  uR.db.server.Task.objects.create(
    pick(this.task, ['name', 'project', 'activity'])
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
  const accept = () => {
    const { task } = e.item
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

this.on('update', () => {
  this.trash_mode = this.opts.trash_mode
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
      <div class={theme.header_content}>{title}</div>
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