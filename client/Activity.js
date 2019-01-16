import uR from 'unrest.js'

const { Model, ForeignKey, Manager } = uR.db

export default class Activity extends Model {
  static app_label = "main"
  static model_name = "Activity"
  static manager = Manager
  static fields = {
    id: 0,
    name: "",
  }
  static editable_fieldnames = ['name']
  __str__() { return this.name }
}