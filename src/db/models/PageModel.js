import BaseModel from "./BaseModel.js"

class PageModel extends BaseModel {
  static tableName = "pages"

  static get relationMappings() {
    return {
      pageItem: {
        relation: BaseModel.HasManyRelation,
      },
    }
  }
}

export default PageModel
