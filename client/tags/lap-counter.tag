import uR from 'unrest.io'

const { Input } = uR.form

export default class LapCounter extends Input {
  constructor(opts) {
    opts.tagName = 'lap-counter'
    super(opts)
    console.log(1)
  }
}

uR.form.config.name2class.laps = LapCounter

<lap-counter>
  <div>woo</div>
</lap-counter>