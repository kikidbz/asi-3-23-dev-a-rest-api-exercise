import * as yup from "yup"
import config from "./config.js"

export const nameValidator = yup
  .string()
  .trim()
  .matches(/^[\p{L} -]+$/u, "Name is invalid")
  .label("Name")

export const pageMenuValidator = yup
  .string()
  .trim()
  .matches(/^[\p{L} -]+$/u, "Page Menu is invalid")
  .label("Pages")

export const firstNameValidator = nameValidator.label("First name")

export const lastNameValidator = nameValidator.label("Last name")

export const emailValidator = yup.string().email().label("E-mail")

export const roleValidator = yup.number().integer().min(1).max(3).label("Role")

export const idValidator = yup
  .number()
  .integer()
  .min(1)
  .label("ID")
  .typeError("Invalid ID")

export const passwordValidator = yup
  .string()
  .trim()
  .matches(
    /^(?=.*[^\p{L}0-9])(?=.*[0-9])(?=.*\p{Lu})(?=.*\p{Ll}).{8,}$/u,
    "Password must be at least 8 chars & contain at least one of each: lower case, upper case, digit, special char."
  )
  .label("Password")

export const queryLimitValidator = yup
  .number()
  .integer()
  .min(config.pagination.limit.min)
  .default(config.pagination.limit.default)
  .label("Query Limit")

export const queryOffsetValidator = yup
  .number()
  .integer()
  .min(0)
  .label("Query Offset")

export const contentValidator = yup.string().trim().label("Content")

export const titleValidator = yup
  .string()
  .trim()
  .matches(/^[\p{L} -]+$/u, "Title is invalid")
  .label("Title")

export const StatusValidator = yup
  .string()
  .trim()
  .matches(/^(draft|published)$/u, "Status is invalid")
  .label("Status")

export const pagesValidator = yup.array().label("Pages")
