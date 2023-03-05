import UserModel from "../db/models/UserModel.js"
import { InvalidAccessError, NotFoundError } from "../errors.js"
import auth from "../middlewares/auth.js"
import hashPassword from "../hashPassword.js"
import mw from "../middlewares/mw.js"
import permission from "../middlewares/permission.js"
import validate from "../middlewares/validate.js"
import { sanitizeUser } from "../sanitizers.js"
import {
  emailValidator,
  idValidator,
  nameValidator,
  passwordValidator,
  queryLimitValidator,
  queryOffsetValidator,
} from "../validators.js"

const makeRoutesUsers = ({ app }) => {
  const checkIfUserExists = async (userId) => {
    const user = await UserModel.query().findById(userId)

    if (user) {
      return user
    }

    throw new NotFoundError()
  }

  app.get(
    "/users",
    auth,
    validate({
      query: {
        limit: queryLimitValidator,
        offset: queryOffsetValidator,
      },
    }),
    permission(1),
    mw(async (req, res) => {
      const { limit, offset } = req.data.query
      const users = await UserModel.query().limit(limit).offset(offset)
      res.send({ result: sanitizeUser(users) })
    })
  )

  app.get(
    "/users/:userId",
    auth,
    validate({
      params: { userId: idValidator.required() },
    }),
    mw(async (req, res) => {
      const { userId } = req.data.params
      const { session } = req

      if (userId !== session.user.id && session.user.role > 1) {
        throw new InvalidAccessError()
      }

      const user = await UserModel.query().findById(userId)

      if (!user) {
        return
      }

      res.send({ result: sanitizeUser(user) })
    })
  )

  app.patch(
    "/users/:userId",
    auth,
    validate({
      params: { userId: idValidator.required() },
      body: {
        firstName: nameValidator,
        lastName: nameValidator,
        email: emailValidator,
        passwprd: passwordValidator,
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          body: { firstName, lastName, email, password },
          params: { userId },
        },
        session: { user: sessionUser },
      } = req

      if (userId !== sessionUser.id && sessionUser.role > 1) {
        throw new InvalidAccessError()
      }

      const user = await checkIfUserExists(userId, res)

      if (!user) {
        return
      }

      const [passwordHash, passwordSalt] = hashPassword(password)

      const updatedUser = await UserModel.query().updateAndFetchById(userId, {
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        ...(email ? { email } : {}),
        ...(password ? { passwordHash, passwordSalt } : {}),
      })

      res.send({ result: sanitizeUser(updatedUser) })
    })
  )
  app.delete(
    "/users/:userId",
    auth,
    validate({
      params: { userId: idValidator.required() },
    }),
    permission(1),
    mw(async (req, res) => {
      const { userId } = req.data.params
      const user = await checkIfUserExists(userId, res)

      if (!user) {
        return
      }

      await UserModel.query().deleteById(userId)

      res.send({ result: sanitizeUser(user) })
    })
  )
}

export default makeRoutesUsers
