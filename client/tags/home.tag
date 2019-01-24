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
          <small class="tile-subtitle text-gray">14MB  Public  1 Jan, 2017</small>
        </div>
        <div class="tile-action">
          <a href={obj.edit_link}><i class={icon('ellipsis-v')} /></a>
        </div>
      </div>
    </div>
  </div>
  <ur-form model={model} submit={submit} title={title}></ur-form>

<script>
this.mixin(uR.css.ThemeMixin)
this.model = uR.db.main.Project
this.title = `New ${this.model.model_name}`
this.on("mount", this.update)
this.on("update",() => {
  this.objects = this.model.objects.all()
})
this.submit = (tag) => {
  this.model.objects.create(tag.getData()).then(() => {
    this.update()
  })
}
</todo-home>
