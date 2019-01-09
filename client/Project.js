import uR from 'unrest.js'

const { db } = uR
console.log(db)

export default class Project extends db.Object {
  static app_label = "main"
  static model_name = "Project"
  static fields = {
    name: "",
  }
  static manager = db.Manager
}