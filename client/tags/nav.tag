import uR from "unrest.io"

<todo-nav>
  <header class="navbar">
    <div class="navbar-brand text-primary">
      <a href="/">uR.TODO</a>
      <a class="float-right fa fa-bars" onclick={toggle('open')} />
    </div>
    <ul class="menu {'d-none': !open}">
      <li class="menu-item">
        <a href="/app/scorecard/">Scorecard</a>
      </li>
      <li class="menu-item">
        <a href="/app/activities/">Activities</a>
      </li>
      <li class="divider"></li>
      <li class="menu-item">
        <a href={logout_url}>Logout</a>
      </li>
    </ul>
  </header>
  <script>
this.open = false
this.logout_url = uR.auth.urls.logout
this.toggle = mode => () => {
  this[mode] = !this[mode]
}
  </script>
</todo-nav>

uR.ready(() => riot.mount('todo-nav'))

