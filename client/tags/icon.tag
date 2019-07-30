import uR from 'unrest.io'

<todo-icons>
  <table class="table table-striped">
    <tr each={icon in icons} key={icon}>
      <td>
        <i class="fi fi_{icon}" />
      </td>
      <td>{icon}</td>
    </tr>
  </table>
<script>
this.icons = uR.ICON_CHOICES
</script>
</todo-icons>