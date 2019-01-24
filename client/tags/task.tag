import uR from 'unrest.io'

<task-tile class="tile tile-centered">
  <div class="tile-icon pointer" onclick={click}>
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
  <div class="tile-action" onclick={edit}>
    <i class={uR.css.icon('pencil pointer')} />
  </div>
  <div class="divider"></div>
<script>
this.task = opts.object
console.log(opts)
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
  clearTimeout(this.timeout)
  const time = Math.abs(this.task.seconds_to_next) < 120?1000:60000
  this.timeout = setTimeout(() => this.update(),time)
})
this.on("mount",() => {
  this.update()
})
</script>
</task-tile>
