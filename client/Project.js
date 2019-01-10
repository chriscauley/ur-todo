import uR from 'unrest.js'

const { Manager, Model } = uR.db

export default class Project extends Model {
  static app_label = "main"
  static model_name = "Project"
  static fields = {
    name: "",
  }
  static manager = Manager
}