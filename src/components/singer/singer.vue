<template>
  <div class="singer" ref="singer">
    <list-view @select="selectSinger" :data="singers" ref="list"/>
    <!--歌手详情承载路由-->
    <router-view/>
  </div>
</template>

<script type="text/ecmascript-6">
  import {getSingerList} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import Singer from 'common/js/singer'
  import ListView from 'base/list-view/list-view'
  import {mapMutations} from 'vuex'
  import {playlistMixin} from 'common/js/mixin'

  const HOT_NAME = '热门'
  const HOT_SINGER_LEN = 10

  export default {
    mixins: [playlistMixin],
    data() {
      return {
        singers: []
      }
    },
    created() {
      this._getSingerList()
    },
    methods: {
      /**
       * 列表新增bottom=60px，使得mini播放器(高度60px)不会覆盖住播放列表底部
       * @param playlist
       */
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.singer.style.bottom = bottom
        this.$refs.list.refresh()
      },
      /**
       * 跳转到歌手详情页面
       * 路由跳转
       *@param singer
       */
      selectSinger(singer) {
        this.$router.push({
          path: `/singer/${singer.id}`
        })
        // 把数据保存到vuex中
        this.setSinger(singer)
      },
      /**
       * 获取歌手列表数据
       * @private
       */
      _getSingerList() {
        getSingerList().then((res) => {
          if (res.code === ERR_OK) {
            this.singers = this._normalizeSinger(res.data.list)
          }
        })
      },
      /**
       * 处理歌手列表数据
       * @param list
       * @return {*[]}
       * @private
       */
      _normalizeSinger(list) {
        // 新建歌手列表对象，其中包含一个hot类别对象
        let map = {
          hot: {
            title: HOT_NAME,
            items: []
          }
        }
        // 遍历歌手列表
        list.forEach((item, index) => {
          if (index < HOT_SINGER_LEN) {
            // 取出前10位歌手，放入到hot类别中
            map.hot.items.push(new Singer({
              id: item.Fsinger_mid,
              name: item.Fsinger_name
            }))
          }

          // 定义key键，key为[A-Z]
          const key = item.Findex

          // 如果对象中的[A-Z]不存在（目前只有一个key为hot），先创建一个对象，key为[A-Z]，其中的值暂为一个空数组
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          // 把歌手放入前面的空数组中 ★
          map[key].items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
        })
        // 为了得到有序列表， 我们需要处理 map
        let hot = []
        let ret = []
        for (let key in map) {
          let val = map[key]
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
          } else if (val.title === HOT_NAME) {
            hot.push(val)
          }
        }
        // 按照歌手的title的首字母升序排序
        ret.sort((a, b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })
        return hot.concat(ret)
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      })
    },
    components: {
      ListView
    }
  }
</script>

<style scoped lang="stylus" type="text/stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>
