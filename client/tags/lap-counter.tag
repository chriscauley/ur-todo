import uR from 'unrest.io'
import { shortTimeDiff } from '../Task'

const { Input } = uR.form

export default class LapCounter extends Input {
  constructor(opts) {
    opts.tagName = 'lap-counter'
    opts.input_type = 'hidden'
    super(opts)
  }
  getValue() {
    return this.value
  }
}

uR.form.config.name2class.laps = LapCounter

<lap-counter>
  <div>
    <button type="button" each={choice,i in choices} onclick={click} class={css.btn.default}>
      {choice}
    </button>
    <div class="card" if={items && items.length}>
      <div each={item,i in items}>
        { item.name } { item.dt }
      </div>
    </div>
  </div>
<script>
this.mixin("ThemeMixin")
this.on("mount", () => this.update())
this.on("before-mount", () => {
  this.opts.input.bindTag(this)
})
const getItems = array => {
  return array.map(([name, time],index) => {
    if (name === "completed") {
      return {}
    }
    const next_time = array[index+1]? array[index+1][1] : new Date().valueOf()
    return {
      name,
      dt: shortTimeDiff((next_time-time)/1000)
    }
  })
}
this.on("update", () => {
  const value = this.input.value || []
  this.items = getItems(value)

  this.choices = this.opts.input.choices
  if (value.find(v => v[0] === 'completed')) {
    this.choices = []
  }
})
click(e) {
  this.input.value.push([e.item.choice, new Date().valueOf()])
  this.parent.submit()
}
</script>
</lap-counter>