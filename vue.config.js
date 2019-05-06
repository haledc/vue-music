/**
 * 注意 Vue 的配置文件必须是 js 文件，而且是使用 Commonjs 模块
 */

const axios = require('axios')
const bodyParser = require('body-parser')

module.exports = {
  devServer: {
    before(app) {
      app.get('/api/getDiscList', (req, res) => {
        const url =
          'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'

        axios
          .get(url, {
            headers: {
              referer: 'https://c.y.qq.com/',
              host: 'c.y.qq.com'
            },
            params: req.query
          })
          .then(response => res.json(response.data))
          .catch(err => console.log(err))
      })

      app.get('/api/getCdInfo', (req, res) => {
        const url =
          'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'

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
              const reg = /^\w+\((.+)\)$/
              const matches = ret.match(reg)
              matches && (ret = JSON.parse(matches[1]))
              res.json(ret)
            }
          })
          .catch(err => console.log(err))
      })

      app.get('/api/lyric', (req, res) => {
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
              const reg = /^\w+\(({.+})\)$/
              const matches = ret.match(reg)
              matches && (ret = JSON.parse(matches[1]))
            }
            res.json(ret)
          })
          .catch(err => console.log(err))
      })

      app.post('/api/getPurlUrl', bodyParser.json(), (req, res) => {
        const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'

        axios
          .post(url, req.body, {
            headers: {
              referer: 'https://y.qq.com/',
              origin: 'https://y.qq.com',
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          })
          .then(response => res.json(response.data))
          .catch(err => console.log(err))
      })

      app.get('/api/search', (req, res) => {
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
          .catch(err => console.log(err))
      })
    }
  }
}
