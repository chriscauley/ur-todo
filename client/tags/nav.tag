import uR from "unrest.io"

<todo-nav>
  <header class="navbar">
    <div class="navbar-brand text-primary">
      <a href="/">uR.TODO</a>
      <a class="float-right fa fa-bars" onclick={toggle('open')} />
    </div>
    <ul class="menu {'d-none': !open}">
      <li class="menu-item">
        <a href={uR.auth.urls.logout}>Logout</a>
      </li>
    </ul>
  </header>
  <script>
this.open = false
this.toggle = mode => () => {
  this[mode] = !this[mode]
}
  </script>
</todo-nav>

uR.ready(() => riot.mount('todo-nav'))

