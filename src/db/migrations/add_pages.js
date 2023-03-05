export const up = async (knex) => {
  await knex.schema.createTable("pages", (table) => {
    table.increments("id")
    table.text("title").notNullable()
    table.text("content").notNullable()
    table.text("url").notNullable()
    table.text("creator").notNullable()
    table.text("modifier")
    table.timestamp("published")
    table.text("Status").notNullable()
  })
}

export const down = async (knex) => {
  await knex.schema.dropTable("pages")
}
