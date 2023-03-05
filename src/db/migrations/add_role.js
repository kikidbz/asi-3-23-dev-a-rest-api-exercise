export const up = async (knex) => {
  await knex.schema.createTable("roles", (table) => {
    table.increments("id")
    table.text("name").notNullable()
    table.integer("permissionLevel").notNullable()
  })
}

export const down = async (knex) => {
  await knex.schema.dropTable("roles")
}
