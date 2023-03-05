import jsonwebtoken from "jsonwebtoken"
import config from "../config.js"
import { InvalidCredentialsError } from "../errors.js"
import hashPassword from "../hashPassword.js"
import auth from "../middlewares/auth.js"
import mw from "../middlewares/mw.js"
import permission from "../middlewares/permission.js"
import validate from "../middlewares/validate.js"
import { sanitizeUser } from "../sanitizers.js"
import {
  emailValidator,
  firstNameValidator,
  lastNameValidator,
  passwordValidator,
  roleValidator,
} from "../validators.js"

const makeRoutesSign = ({ app, db }) => {
  app.post(
    "/create-user",
    auth,
    validate({
      body: {
        firstName: firstNameValidator.required(),
        lastName: lastNameValidator.required(),
        email: emailValidator.required(),
        password: passwordValidator.required(),
        role: roleValidator.required(),
      },
    }),
    permission(1),
    mw(async (req, res) => {
      const { firstName, lastName, email, password, role } = req.data.body
      const [passwordHash, passwordSalt] = hashPassword(password)
      const [user] = await db("users")
        .insert({
          firstName,
          lastName,
          email,
          passwordHash,
          passwordSalt,
          role,
        })
        .returning("*")
      res.send({ result: sanitizeUser(user) })
    })
  )

  app.post(
    "/connect",
    validate({
      body: {
        email: emailValidator.required(),
        password: passwordValidator.required(),
      },
    }),
    mw(async (req, res) => {
      const { email, password } = req.data.body
      const [user] = await db("users").where({ email })

      if (!user) {
        throw new InvalidCredentialsError()
      }

      const [passwordHash] = hashPassword(password, user.passwordSalt)

      if (user.passwordHash !== passwordHash) {
        throw new InvalidCredentialsError()
      }

      const jwt = jsonwebtoken.sign(
        {
          payload: {
            user: {
              id: user.id,
              fullName: `${user.firstName} ${user.lastName}`,
              role: user.role,
            },
          },
        },
        config.security.session.jwt.secret,
        { expiresIn: config.security.session.jwt.expiresIn }
      )

      res.send({ Token: jwt })
    })
  )
}

export default makeRoutesSign
