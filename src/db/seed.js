import knex from "knex"
import config from "../config.js"
import hashPassword from "../hashPassword.js"

const db = knex(config.db)

await db("roles").insert([
  { name: "admin", permissionLevel: 1 },
  { name: "manager", permissionLevel: 2 },
  { name: "editor", permissionLevel: 3 },
])

const [passwordHash, passwordSalt] = hashPassword("BonneNoteSVP100!")
await db("users").insert([
  {
    firstName: "Killian",
    lastName: "VEL",
    email: "kiki@gmail.com",
    passwordHash: passwordHash,
    passwordSalt: passwordSalt,
    role: 1,
  },
  {
    firstName: "Jean",
    lastName: "Patrick",
    email: "JeanP@gmail.com",
    passwordHash: passwordHash,
    passwordSalt: passwordSalt,
    role: 2,
  },
  {
    firstName: "Baptiste",
    lastName: "Dupont",
    email: "BaptisteD@gmail.com",
    passwordHash: passwordHash,
    passwordSalt: passwordSalt,
    role: 3,
  },
])

process.exit(0)
