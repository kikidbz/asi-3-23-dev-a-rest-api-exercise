import BaseModel from "./BaseModel.js"

class MenuModel extends BaseModel {
  static tableName = "menu"

  static get relationMappings() {
    return {
      menuItems: {
        relation: BaseModel.HasManyRelation,
      },
    }
  }
}

export default MenuModel
