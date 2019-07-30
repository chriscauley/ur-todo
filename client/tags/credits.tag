import uR from 'unrest.io'

uR.router.add({
  "/app/credits/": uR.router.routeElement("todo-credits")
})

<todo-credits>
  <div class={theme.outer}>
    <div class={theme.header}>
      <div class={theme.header_title}>Credits</div>
    </div>
    <div class={theme.content}>
      Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a>
      from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by
      <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0">CC BY 3.0</a>
    </div>
  </div>
<script>
  this.mixin(uR.css.ThemeMixin)

console.log(this.theme)
</script>
</todo-credits>