import uR from 'unrest.io'

window.uR = uR

<todo-icons>
  <table class="table table-striped">
    <tr each={icon in icons} key={icon}>
      <td>
        <i class="fi fi_{icon.name}" />
      </td>
      <td title={icon.title}>{icon.name} ({icon.count})</td>
    </tr>
  </table>
<script>
this.icons = uR.ICON_CHOICES.map( name => {
  const activities = uR.db.server.Activity.objects.all().filter(({icon}) => icon == name)
  return {
    name,
    title: activities.join(","),
    count: activities.length,
  }
})
</script>
</todo-icons>