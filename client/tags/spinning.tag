import uR from 'unrest.io'
import { sortBy } from 'lodash'
import { format } from 'date-fns'

<todo-spinning>
  <img src="https://chart.googleapis.com/chart?cht=lc&chs=500x300&chd=t:{chart_data}&chdl={chl}&chco={chco}" style="max-width: 100%" />
  <table class="table">
    <tr>
      <th each={header in headers}>{ header }</th>
    </tr>
    <tr each={row in rows}>
      <td each={col in row}>{ col }</td>
    </tr>
  </table>
  <table class="table">
    <tr>
      <th each={header in headers}>{ header }</th>
    </tr>
    <tr each={row in norm_rows}>
      <td each={col in row}>{ col }</td>
    </tr>
  </table>
<script>
  this.activity = uR.db.server.Activity.objects.all().find( a => a.name === "Spinning")
  this.tasks = sortBy(uR.db.server.Task.objects.filter({activity: this.activity}), 'due')
  this.attrs = ['completed', 'minutes', 'points', 'ave_rpm', 'ave_mph', 'ave_watts', 'calories', 'distance']
  this.headers = ['date', 'min', 'points', 'rpm', 'mph', 'watts',  'kcal', 'mi']
  const process = {
    distance: parseFloat,
    ave_mph: parseFloat,
    completed: v => format(v, 'M/D')
  }
  this.rows = this.tasks.map( task => {
    return this.attrs.map( attr => {
      const value = task.opts[attr]
      return process[attr] ? process[attr](value) : value
    })
  })
  const cols = {}
  this.attrs.forEach(attr => cols[attr] = [])
  this.norm_rows = this.rows.map(
    (row, ir) => row.map( (col, ic) => {
      if (!ic) { return col }
      const hours = this.tasks[ir].opts.minutes / 60
      const normalize = ['minutes', 'points', 'calories', 'distance'].includes(this.attrs[ic])
      if (this.attrs[ic] == 'minutes') {
        console.log(ic, col, hours, this.tasks[ir].opts.minutes)
      }
      const per_hour = normalize ? (col / hours).toFixed(2) : col
      cols[this.attrs[ic]].push(per_hour)
      return per_hour
    })
  )
  const percentages = this.attrs.slice(2).map(
    attr => console.log(cols[attr]) || cols[attr].map(
      value => 100 * value / Math.max(...cols[attr])
    )
  )
  this.chl = this.headers.slice(2).join('|')
  this.chart_data = percentages.map(row => row.join(',')).join('|')
  this.chco="888888,00FF00,0000FF,888888,888888,FF0000"
</script>
</todo-spinning>