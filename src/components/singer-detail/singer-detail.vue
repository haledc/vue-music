<template>
  <transition name="slide">
    <music-list :bg-image="bgImage" :title="title" :songs="songs"/>
  </transition>
</template>

<script type="text/ecmascript-6">
  import {getSingerDetail} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import {mapGetters} from 'vuex'
  import {createSong, isValidMusic, processSongsUrl} from 'common/js/song'
  import MusicList from 'components/music-list/music-list'

  export default {
    computed: {
      title() {
        return this.singer.name
      },
      bgImage() {
        return this.singer.avatar
      },
      ...mapGetters([
        'singer'
      ])
    },
    data() {
      return {
        songs: []
      }
    },
    created() {
      this._getDetail()
    },
    methods: {
      /**
       * 获取歌手详情方法
       * @private
       */
      _getDetail() {
        // 没有歌手id时回退到歌手列表页
        if (!this.singer.id) {
          this.$router.push('/singer')
          return
        }
        getSingerDetail(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {
            processSongsUrl(this._normalizeSongs(res.data.list))
              .then(songs => {
                this.songs = songs
              })
          }
        })
      },
      /**
       * 处理歌手的歌曲
       * @param list
       * @return {Array}
       * @private
       */
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          // 解构赋值，只处理list下面的musicData对象
          let {musicData} = item
          // songid，albummid必须要有 ？？？
          if (isValidMusic(musicData)) {
            // 通过创建类的实例来创建歌曲列表 createSong
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    components: {
      MusicList
    }
  }
</script>

<style scoped lang="stylus" type="text/stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition all 0.3s

  .slide-enter, .slier-leave-to
    transform translate3d(100%, 0, 0)
</style>
