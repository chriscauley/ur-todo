import uR from 'unrest.js'

const { Manager, Model } = uR.db

export default class Project extends Model {
  static app_label = "main"
  static model_name = "Project"
  static fields = {
    name: "",
    id: 0,
  }
  static manager = Manager
  static editable_fieldnames = ['name']
  edit_link = `#!/form/main.Project/${this.id}/`
}