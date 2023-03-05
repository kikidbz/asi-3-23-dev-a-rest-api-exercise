import { InvalidAccessError } from "../errors.js"

const permission = (int) => (req, res, next) => {
  const { session } = req

  if (session === undefined) {
    throw new InvalidAccessError()
  }

  if (session.user.role <= int) {
    next()
  } else {
    throw new InvalidAccessError()
  }
}

export default permission
