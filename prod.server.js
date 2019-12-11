const express = require('express')
const bodyParser = require('body-parser')
const history = require('connect-history-api-fallback')
const axios = require('axios')
const path = require('path')

const server = express()

const apiRouter = new express.Router()

apiRouter.get('/api/getSliderList', (req, res) => {
  const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
  const jumpPrefix = 'https://y.qq.com/n/yqq/album/'

  axios
    .get(url, {
      headers: {
        referer: 'https://u.y.qq.com/',
        host: 'u.y.qq.com'
      },
      params: req.query
    })
    .then(response => {
      response = response.data
      if (response.code === 0) {
        const slider = []
        const content = response.focus.data && response.focus.data.content
        if (content && content.length) {
          for (let i = 0; i < content.length; i++) {
            const item = content[i]
            const sliderItem = {}
            sliderItem.id = item.id
            sliderItem.linkUrl = jumpPrefix + item.jump_info.url + '.html'
            sliderItem.picUrl = item.pic_info.url
            slider.push(sliderItem)
          }
        }
        res.json({
          code: 0,
          data: { slider }
        })
      } else {
        res.json(response)
      }
    })
    .catch(err => console.log(err))
})

apiRouter.get('/api/getDiscList', (req, res) => {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
  axios
    .get(url, {
      headers: {
        referer: 'https://c.y.qq.com/',
        host: 'c.y.qq.com'
      },
      params: req.query
    })
    .then(response => res.json(response.data))
    .catch(error => console.log(error))
})

apiRouter.get('/api/getCdInfo', (req, res) => {
  const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
  axios
    .get(url, {
      headers: {
        referer: 'https://c.y.qq.com/',
        host: 'c.y.qq.com'
      },
      params: req.query
    })
    .then(response => {
      let ret = response.data
      if (typeof ret === 'string') {
        let reg = /^\w+\(({.+})\)$/
        let matches = ret.match(reg)
        if (matches) {
          ret = JSON.parse(matches[1])
        }
      }
      res.json(ret)
    })
    .catch(error => console.log(error))
})

apiRouter.get('/api/lyric', (req, res) => {
  const url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'

  axios
    .get(url, {
      headers: {
        referer: 'https://c.y.qq.com/',
        host: 'c.y.qq.com'
      },
      params: req.query
    })
    .then(response => {
      let ret = response.data
      if (typeof ret === 'string') {
        let reg = /^\w+\(({.+})\)$/
        let matches = ret.data.match(reg)
        if (matches) {
          ret = JSON.parse(matches[1])
        }
      }
      res.json(ret)
    })
    .catch(error => console.log(error))
})

apiRouter.get('/api/search', (req, res) => {
  const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
  axios
    .get(url, {
      headers: {
        referer: 'https://c.y.qq.com/',
        host: 'c.y.qq.com'
      },
      params: req.query
    })
    .then(response => res.json(response.data))
    .catch(error => console.log(error))
})

apiRouter.post('/api/getPurlUrl', bodyParser.json(), (req, res) => {
  const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
  axios
    .post(url, req.body, {
      headers: {
        referer: 'https://y.qq.com/',
        origin: 'https://y.qq.com',
        'Content-type': 'application/x-www-form-urlencoded'
      }
    })
    .then(response => res.json(response.data))
    .catch(error => console.log(error))
})

server.use(history())
server.use(apiRouter)
server.use(express.static(path.resolve(__dirname, 'dist')))

const PORT = process.env.PORT || 9095

server.listen(PORT, error => {
  if (error) console.error(error)
  console.log(`Server started at http://127.0.0.1:${PORT}!`)
})
