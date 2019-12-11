const axios = require('axios')
const bodyParser = require('body-parser')

module.exports = {
  devServer: {
    before(app) {
      app.get('/api/getSliderList', (req, res) => {
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
