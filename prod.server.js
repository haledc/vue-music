const express = require('express')
const bodyParser = require('body-parser')
const fallback = require('express-history-api-fallback')
const axios = require('axios')

const port = process.env.PORT || 9095

const app = express()

const apiRoutes = express.Router()

apiRoutes.get('/getDiscList', function(req, res) {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
  axios
    .get(url, {
      headers: {
        referer: 'https://c.y.qq.com/',
        host: 'c.y.qq.com'
      },
      params: req.query
    })
    .then(response => {
      res.json(response.data)
    })
    .catch(err => {
      console.log(err)
    })
})

apiRoutes.get('/getCdInfo', function(req, res) {
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
    .catch(err => {
      console.log(err)
    })
})

apiRoutes.get('/lyric', function(req, res) {
  let url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'

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
        let matches = response.data.match(reg)
        if (matches) {
          ret = JSON.parse(matches[1])
        }
      }
      res.json(ret)
    })
    .catch(err => {
      console.log(err)
    })
})

apiRoutes.get('/search', function(req, res) {
  const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
  axios
    .get(url, {
      headers: {
        referer: 'https://c.y.qq.com/',
        host: 'c.y.qq.com'
      },
      params: req.query
    })
    .then(response => {
      res.json(response.data)
    })
    .catch(err => {
      console.log(err)
    })
})

apiRoutes.post('/getPurlUrl', bodyParser.json(), function(req, res) {
  const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
  axios
    .post(url, req.body, {
      headers: {
        referer: 'https://y.qq.com/',
        origin: 'https://y.qq.com',
        'Content-type': 'application/x-www-form-urlencoded'
      }
    })
    .then(response => {
      res.json(response.data)
    })
    .catch(err => {
      console.log(err)
    })
})

app.use('/api', apiRoutes)
app.use(express.static('./dist'))
app.use(fallback('dist/index.html', { root: __dirname }))

module.exports = app.listen(port, function(err) {
  if (err) {
    console.log(err)
    return
  }
  console.log('Server running at http://localhost:' + port + '\n')
})
