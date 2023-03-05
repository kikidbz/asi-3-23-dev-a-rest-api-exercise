import BaseModel from "./BaseModel"

class RoleModel extends BaseModel {
  static tableName = "roles"
  static get relationMappings() {
    return {
      roleItem: {
        relation: BaseModel.HasManyRelation,
      },
    }
  }
}

export default RoleModel
