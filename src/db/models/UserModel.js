import BaseModel from "./BaseModel.js"

class UserModel extends BaseModel {
  static tableName = "users"

  static get relationMappings() {
    return {
      UserItem: {
        relation: BaseModel.HasManyRelation,
      },
    }
  }
}

export default UserModel
