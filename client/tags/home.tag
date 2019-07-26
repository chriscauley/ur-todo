import uR from "unrest.io"

<todo-home>
  <div class={theme.outer}>
    <div class={theme.content}>
      <div each={obj in objects} class="tile tile-centered">
        <div class="tile-icon {bg.primary}">
          <a class={icon('list')} href="#/project/{obj.id}/"></a>
        </div>
        <div class="tile-content">
          <a href="#/project/{obj.id}/" class="tile-title">{obj.name}</a>
          <div class="tile-subtitle justify-left">
            <span each={sub,it in obj.getSubtitles()} class={sub.className} title={sub.title}>
              <i if={sub.icon} class={icon(sub.icon)} />
              {sub.text}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ur-form model={model} submit={submit} title={title}></ur-form>

<script>
this.mixin(uR.css.ThemeMixin)
this.model = uR.db.server.Project
this.title = `New ${this.model.model_name}`
this.on("mount", this.update)
this.on("update",() => {
  this.objects = this.model.objects.all()
  this.objects.unshift(this.model.OverDue)
})
this.submit = (tag) => {
  return this.model.objects.create(tag.getData()).then(() => {
    this.update()
  })
}
</todo-home>
