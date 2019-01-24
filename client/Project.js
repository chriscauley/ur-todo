import uR from 'unrest.js'

const { APIManager, Model } = uR.db

export default class Project extends Model {
  static slug = 'main.Project'
  static fields = {
    name: '',
    id: 0,
  }
  static manager = APIManager
  static editable_fieldnames = ['name']
  edit_link = `#!/form/main.Project/${this.id}/`
  __str__() {
    return this.name
  }
}
