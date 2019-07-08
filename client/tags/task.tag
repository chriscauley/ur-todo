import uR from 'unrest.io'
import { pick } from 'lodash'

<task-tile class="tile tile-centered">
  <div class="tile-icon pointer {disabled: trash_mode}" onclick={click}>
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
  <div class="tile-action" onclick={toggle('_actions')}>
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
  task.click().then(() => {
    if (task.activity) {
      task.activity.makeNextTask()
    }
    uR.db.ready.then(() => this.parent.update())
  })
}
this.on('update',() => {
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
