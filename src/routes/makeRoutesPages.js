import PageModel from "../db/models/PageModel.js"
import { InvalidSessionError, NotFoundError } from "../errors.js"
import auth from "../middlewares/auth.js"
import mw from "../middlewares/mw.js"
import permission from "../middlewares/permission.js"
import validate from "../middlewares/validate.js"
import { sanitizePage } from "../sanitizers.js"
import {
  queryLimitValidator,
  queryOffsetValidator,
  idValidator,
  contentValidator,
  titleValidator,
  StatusValidator,
} from "../validators.js"

const makeRoutespage = ({ app, db }) => {
  const checkIfPageExists = async (pageId) => {
    const page = await PageModel.query().findById(pageId)

    if (page) {
      return page
    }

    throw new NotFoundError()
  }

  app.post(
    "/create-page",
    auth,
    validate({
      body: {
        title: titleValidator.required(),
        content: contentValidator.required(),
        Status: StatusValidator.required(),
      },
    }),
    permission(2),
    mw(async (req, res) => {
      const { title, content, Status } = req.data.body
      const url = title.replace(/[\s]/g, "-")
      const {
        session: { user: sessionUser },
      } = req
      const creator = sessionUser.fullName
      const [page] = await db("pages")
        .insert({
          title,
          content,
          url,
          creator,
          Status,
        })
        .returning("*")
      res.send({ result: sanitizePage(page) })
    })
  )

  app.get(
    "/pages",
    validate({
      query: {
        limit: queryLimitValidator,
        offset: queryOffsetValidator,
      },
    }),
    mw(async (req, res) => {
      const { limit, offset } = req.data.query
      const page = await PageModel.query()
        .limit(limit)
        .offset(offset)
        .orderBy("id")

      if (req.headers.authorization === undefined) {
        const page = await PageModel.query()
          .limit(limit)
          .offset(offset)
          .where({ Status: "published" })
          .orderBy("id")

        return res.send({ result: sanitizePage(page) })
      }

      res.send({ result: sanitizePage(page) })
    })
  )

  app.get(
    "/page/:pageId",
    validate({
      params: { pageId: idValidator.required() },
    }),
    mw(async (req, res) => {
      const { pageId } = req.data.params
      const page = await PageModel.query().findById(pageId)

      if (!page) {
        return
      }

      if (
        req.headers.authorization === undefined &&
        page.Status !== "published"
      ) {
        throw new InvalidSessionError()
      }

      res.send({ result: sanitizePage(page) })
    })
  )

  app.patch(
    "/page/:pageId",
    auth,
    validate({
      params: { pageId: idValidator.required() },
      body: {
        title: titleValidator,
        content: contentValidator,
        Status: StatusValidator,
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          body: { title, content, Status },
          params: { pageId },
        },
        session: { user: sessionUser },
      } = req

      const modifier = sessionUser.fullName

      const page = await checkIfPageExists(pageId, res)

      if (!page) {
        return
      }

      const url = title ? title.replace(/[\s]/g, "-") : page.url
      const published = Status === "published" ? new Date() : null

      const updatedpage = await PageModel.query().updateAndFetchById(pageId, {
        ...(title ? { title } : {}),
        ...(content ? { content } : {}),
        ...(Status ? { Status } : {}),
        modifier,
        url,
        published,
      })

      res.send({ result: sanitizePage(updatedpage) })
    })
  )

  app.delete(
    "/page/:pageId",
    auth,
    validate({
      params: { pageId: idValidator.required() },
    }),
    permission(2),
    mw(async (req, res) => {
      const { pageId } = req.data.params
      const page = await checkIfPageExists(pageId, res)

      if (!page) {
        return
      }

      await PageModel.query().deleteById(pageId)

      res.send({ result: sanitizePage(page) })
    })
  )
}

export default makeRoutespage
