import uR from 'unrest.io'
import { sortBy } from 'lodash'
import { format } from 'date-fns'
import lsq from 'least-squares'
import correlation from 'correlation-rank'

const { List, Boolean } = uR.db.fields

const normalize = (numbers, offset=0) => {
  const min = Math.min(...numbers)
  const max = Math.max(...numbers)
  return numbers.map(n => Math.round(100*n/max)-offset)
}

<todo-spinning>
  <div><canvas id="myChart" width="300" height="300"></canvas></div>
  <ur-form schema={schema} autosubmit={true} submit={submit} initial={formData} />
  <table class="table">
    <tr>
      <th></th>
      <th each={header in data_attrs}>{ header }</th>
    </tr>
    <tr each={row in correlations}>
      <td each={col in row}>{ col }</td>
    </tr>
  </table>
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
      <td each={col, i in row}>{ i === 0 ? col : Math.round(col)}</td>
    </tr>
  </table>
<script>
  this.activity = uR.db.server.Activity.objects.all().find( a => a.name === "Spinning")
  this.tasks = sortBy(uR.db.server.Task.objects.filter({activity: this.activity}), 'due')
  this.submit = form => {
    this.formData = form.getData()
    this.update()
    return new Promise(()=>{})
  }
  this.attrs = ['completed', 'minutes', 'points', 'ave_rpm', 'ave_mph', 'ave_watts', 'calories', 'distance']
  this.data_attrs = this.attrs.slice(2)
  this.formData = {
    x_attr: 'ave_watts',
    y_attrs: this.data_attrs,
    normalize_data: false,
  }
  const x_choices = this.attrs.filter(a => a !== 'minutes')
  this.schema = {
    x_attr: {choices: x_choices},
    y_attrs: List([], {choices: this.data_attrs}),
    normalize_data: Boolean(),
  }
  this.headers = ['date', 'min', 'points', 'rpm', 'mph', 'watts',  'kcal', 'mi']
  this.headers_map = {}
  this.attrs.forEach((attr, i) => this.headers_map[attr] = this.headers[i])
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
      if (!ic) {
        cols[this.attrs[ic]].push(ir)
        return col
      }
      const hours = this.tasks[ir].opts.minutes / 60
      const is_quantity = ['minutes', 'points', 'calories', 'distance'].includes(this.attrs[ic])
      const per_hour = is_quantity ? col / hours : col
      cols[this.attrs[ic]].push(per_hour)
      return per_hour
    })
  )
  this.on('mount', () => this.update())
  this.on('update', () => {
    this.chart && this.chart.destroy()
    const nextColor = (() => {
      let i = 0
      const colors = ['red', 'green', 'blue', 'black', 'purple', 'gray']
      return () => colors[i++%colors.length]
    })()
    const { x_attr, y_attrs, normalize_data } = this.formData
    const x_data = cols[x_attr]
    const datasets = y_attrs.filter(y_attr => y_attr !== x_attr).map( y_attr => {
      const label = this.headers_map[y_attr]
      let y_data = cols[y_attr]
      if (normalize_data) {
        y_data = normalize(y_data)
      }
      const data = x_data.map((x,i) => ({
        x,
        y: y_data[i],
      }))
      if (data[0].x !== 0) {
        const fx = lsq(x_data, y_data)
        data.unshift({
          x: 0,
          y: fx(0),
        })
      }
      return {
        label,
        data,
        borderColor: nextColor(),
      }
    })

    var ctx = document.getElementById('myChart').getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'scatter',
      data: { datasets },
      options: {
        animation: { duration: 0 },
      }
    })
  })

  this.correlations = this.data_attrs.map( attr1 => {
    const row = this.data_attrs.map(attr2 => correlation.rank(cols[attr1], cols[attr2]).toFixed(2))
    row.unshift(attr1)
    return row
  })
</todo-spinning>
