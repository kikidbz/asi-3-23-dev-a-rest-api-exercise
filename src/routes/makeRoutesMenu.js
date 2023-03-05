import MenuModel from "../db/models/MenuModel.js"
import PageModel from "../db/models/PageModel.js"
import { NotFoundError } from "../errors.js"
import auth from "../middlewares/auth.js"
import mw from "../middlewares/mw.js"
import permission from "../middlewares/permission.js"
import validate from "../middlewares/validate.js"
import { sanitizeMenu } from "../sanitizers.js"
import {
  nameValidator,
  queryLimitValidator,
  queryOffsetValidator,
  idValidator,
  pagesValidator,
} from "../validators.js"

const makeRoutesMenu = ({ app, db }) => {
  const checkIfMenuExists = async (menuId) => {
    const menu = await MenuModel.query().findById(menuId)

    if (menu) {
      return menu
    }

    throw new NotFoundError()
  }

  app.post(
    "/create-menu",
    auth,
    validate({
      body: {
        name: nameValidator.required(),
        pages: pagesValidator,
      },
    }),
    permission(2),
    mw(async (req, res) => {
      const { name, pages } = req.data.body
      const arbre = []

      if (pages !== undefined) {
        for (let i = 0; i < pages.length; i++) {
          const element = pages[i]
          const test = await PageModel.query().where("title", element)

          if (test.length === 0) {
            continue
          } else {
            arbre.push(element)
          }
        }
      }

      const [menu] = await db("menu")
        .insert({
          name,
          pages: arbre,
        })
        .returning("*")
      res.send({ result: sanitizeMenu(menu) })
    })
  )

  app.get(
    "/menu",
    validate({
      query: {
        limit: queryLimitValidator,
        offset: queryOffsetValidator,
      },
    }),
    mw(async (req, res) => {
      const { limit, offset } = req.data.query
      const menu = await MenuModel.query().limit(limit).offset(offset)
      res.send({ result: sanitizeMenu(menu) })
    })
  )

  app.get(
    "/menu/:menuId",
    validate({
      params: { menuId: idValidator.required() },
    }),
    mw(async (req, res) => {
      const { menuId } = req.data.params
      const menu = await MenuModel.query().findById(menuId)

      if (!menu) {
        return
      }

      res.send({ result: sanitizeMenu(menu) })
    })
  )

  app.patch(
    "/menu/:menuId",
    auth,
    validate({
      params: { menuId: idValidator.required() },
      body: {
        name: nameValidator,
        pages: pagesValidator,
      },
    }),
    permission(2),
    mw(async (req, res) => {
      const {
        data: {
          params: { menuId },
          body: { name, pages },
        },
      } = req

      const arbre = []

      if (pages !== undefined) {
        for (let i = 0; i < pages.length; i++) {
          const element = pages[i]
          const test = await PageModel.query().where("title", element)

          if (test.length === 0) {
            continue
          } else {
            arbre.push(element)
          }
        }
      }

      const menu = await checkIfMenuExists(menuId, res)

      if (!menu) {
        return
      }

      const updatedMenu = await MenuModel.query().updateAndFetchById(menuId, {
        ...(name ? { name } : {}),
        ...(pages ? { pages: pages.concat(arbre) } : {}),
      })

      res.send({ result: sanitizeMenu(updatedMenu) })
    })
  )

  app.delete(
    "/menu/:menuId",
    auth,
    validate({
      params: { menuId: idValidator.required() },
    }),
    permission(2),
    mw(async (req, res) => {
      const { menuId } = req.data.params
      const menu = await checkIfMenuExists(menuId, res)

      if (!menu) {
        return
      }

      await MenuModel.query().deleteById(menuId)

      res.send({ result: sanitizeMenu(menu) })
    })
  )
}

export default makeRoutesMenu
