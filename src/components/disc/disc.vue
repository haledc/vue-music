<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"/>
  </transition>
</template>

<script type="text/ecmascript-6">
  import MusicList from 'components/music-list/music-list'
  import {mapGetters} from 'vuex'
  import {getSongList} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import {createSong, isValidMusic, processSongsUrl} from 'common/js/song'

  export default {
    computed: {
      // 歌单名称
      title() {
        return this.disc.dissname
      },
      // 歌单图片
      bgImage() {
        return this.disc.imgurl
      },
      // 获取歌单
      ...mapGetters([
        'disc'
      ])
    },
    data() {
      return {
        songs: []
      }
    },
    created() {
      this._getSongList()
    },
    methods: {
      /**
       * 获取歌单详情-歌曲
       * @private
       */
      _getSongList() {
        if (!this.disc.dissid) {
          this.$router.push('/recommend')
          return
        }
        getSongList(this.disc.dissid).then((res) => {
          if (res.code === ERR_OK) {
            // this.songs = this._normalizeSongs(res.cdlist[0].songlist)
            processSongsUrl(this._normalizeSongs(res.cdlist[0].songlist))
              .then(songs => {
                this.songs = songs
              })
          }
        })
      },
      /**
       * 处理歌单的歌曲
       * @param list
       * @return {Array}
       * @private
       */
      _normalizeSongs(list) {
        let ret = []
        list.forEach((musicData) => {
          if (isValidMusic(musicData)) {
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
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
