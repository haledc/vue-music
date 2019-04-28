const Koa = require('koa')
const Router = require('koa-router')
const axios = require('axios')
const bodyParser = require('koa-bodyparser')
const history = require('koa2-history-api-fallback')
const serve = require('koa-static')
const path = require('path')

const port = process.env.PORT || 9095

const app = new Koa()

const apiRoutes = new Router({
  prefix: '/api'
})

apiRoutes.get('/getDiscList', async ctx => {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
  await axios
    .get(url, {
      headers: {
        referer: 'https://c.y.qq.com/',
        host: 'c.y.qq.com'
      },
      params: ctx.query
    })
    .then(res => {
      ctx.body = res.data
    })
    .catch(err => {
      console.log(err)
    })
})

apiRoutes.get('/getCdInfo', async ctx => {
  const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
  await axios
    .get(url, {
      headers: {
        referer: 'https://c.y.qq.com/',
        host: 'c.y.qq.com'
      },
      params: ctx.query
    })
    .then(res => {
      let ret = res.data
      if (typeof ret === 'string') {
        let reg = /^\w+\(({.+})\)$/
        let matches = ret.match(reg)
        if (matches) {
          ret = JSON.parse(matches[1])
        }
      }
      ctx.body = ret
    })
    .catch(err => {
      console.log(err)
    })
})

apiRoutes.get('/lyric', async ctx => {
  const url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'

  await axios
    .get(url, {
      headers: {
        referer: 'https://c.y.qq.com/',
        host: 'c.y.qq.com'
      },
      params: ctx.query
    })
    .then(res => {
      let ret = res.data
      if (typeof ret === 'string') {
        let reg = /^\w+\(({.+})\)$/
        let matches = res.data.match(reg)
        if (matches) {
          ret = JSON.parse(matches[1])
        }
      }
      ctx.body = ret
    })
    .catch(err => {
      console.log(err)
    })
})

apiRoutes.get('/search', async ctx => {
  const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
  await axios
    .get(url, {
      headers: {
        referer: 'https://c.y.qq.com/',
        host: 'c.y.qq.com'
      },
      params: ctx.query
    })
    .then(res => {
      ctx.body = res.data
    })
    .catch(err => {
      console.log(err)
    })
})

apiRoutes.post('/getPurlUrl', async ctx => {
  const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
  await axios
    .post(url, ctx.request.body, {
      headers: {
        referer: 'https://y.qq.com/',
        origin: 'https://y.qq.com',
        'Content-type': 'application/x-www-form-urlencoded'
      }
    })
    .then(res => {
      ctx.body = res.data
    })
    .catch(err => {
      console.log(err)
    })
})

app.use(history())
app.use(bodyParser())

app.use(apiRoutes.routes()).use(apiRoutes.allowedMethods())

app.use(serve(path.join(__dirname, './dist')))

app.listen(port, err => {
  if (err) {
    console.log(err)
    return
  }
  console.log(`Server started at port:${port}!`)
})
