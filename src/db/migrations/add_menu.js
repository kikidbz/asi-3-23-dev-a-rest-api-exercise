export const up = async (knex) => {
  await knex.schema.createTable("menu", (table) => {
    table.increments("id")
    table.text("name").notNullable()
    table.specificType("pages", "text[]").notNullable()
  })
}

export const down = async (knex) => {
  await knex.schema.dropTable("menu")
}
