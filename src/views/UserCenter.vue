<template>
  <transition name="slide">
    <div class="user-center">
      <!--后退-->
      <div class="back" @click="back">
        <i class="icon-back"></i>
      </div>
      <!--导航开关-->
      <div class="switches-wrapper">
        <Switches
          :currentIndex="currentIndex"
          :switches="switches"
          @switch="switchItem"
        />
      </div>
      <!--随机播放全部-->
      <div class="play-btn" ref="playBtn" @click="random">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
      <div class="list-wrapper" ref="listWrapper">
        <!--我喜欢的-->
        <Scroll
          class="list-scroll"
          v-if="currentIndex === 0"
          :data="favoriteList"
          ref="favoriteList"
        >
          <div class="list-inner">
            <SongList :songs="favoriteList" @select="selectSong" />
          </div>
        </Scroll>
        <!--最近听的-->
        <Scroll
          class="list-scroll"
          v-if="currentIndex === 1"
          :data="playHistory"
          ref="playList"
        >
          <div class="list-inner">
            <SongList :songs="playHistory" @select="selectSong" />
          </div>
        </Scroll>
      </div>
      <!--没有内容-->
      <div class="no-result-wrapper" v-show="noResult">
        <NoResult :title="noResultDesc" />
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import Switches from '@/components/Switches'
import NoResult from '@/components/NoResult'
import Scroll from '@/components/Scroll'
import SongList from '@/components/SongList'

import { playlistMixin } from '@/assets/helpers/mixin'

export default {
  mixins: [playlistMixin],
  components: {
    Switches,
    Scroll,
    SongList,
    NoResult
  },
  data() {
    return {
      currentIndex: 0,
      switches: [{ name: '我喜欢的' }, { name: '最近听的' }]
    }
  },
  computed: {
    // 没有数据显示的条件
    noResult() {
      if (this.currentIndex === 0) {
        return !this.favoriteList.length
      } else {
        return !this.playHistory.length
      }
    },

    // 没有数据显示的文本
    noResultDesc() {
      if (this.currentIndex === 0) {
        return '暂无收藏歌曲'
      } else {
        return '你还没有听过歌曲'
      }
    },

    ...mapGetters(['favoriteList', 'playHistory'])
  },
  methods: {
    // 列表新增 bottom=60px，使得 mini 播放器(高度60px)不会覆盖住播放列表底部
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.listWrapper.style.bottom = bottom
      this.$refs.favoriteList && this.$refs.favoriteList.refresh()
      this.$refs.playlist && this.$refs.playlist.refresh()
    },

    // 切换开关
    switchItem(index) {
      this.currentIndex = index
    },

    // 选中歌曲，插入到播放列表中
    selectSong(song) {
      this.insertSong(song)
    },

    // 返回
    back() {
      this.$router.back()
    },

    // 随机播放全部
    random() {
      let list = this.currentIndex === 0 ? this.favoriteList : this.playHistory
      if (list.length === 0) {
        return
      }
      this.randomPlay({
        list
      })
    },

    ...mapActions(['insertSong', 'randomPlay'])
  }
}
</script>

<style scoped lang="stylus">
@import '~@/assets/styles/variable.styl'

.user-center
  position: fixed
  top: 0
  bottom: 0
  z-index: 100
  width: 100%
  background: $color-background

  &.slide-enter-active, &.slide-leave-active
    transition: all 0.3s

  &.slide-enter, &.slide-leave-to
    transform: translate3d(100%, 0, 0)

  .back
    position: absolute
    top: 0
    left: 6px
    z-index: 50

    .icon-back
      display: block
      padding: 10px
      font-size: $font-size-large-x
      color: $color-theme

  .switches-wrapper
    margin: 10px 0 30px 0

  .play-btn
    box-sizing: border-box
    width: 135px
    padding: 7px 0
    margin: 0 auto
    text-align: center
    border: 1px solid $color-text-l
    color: $color-text-l
    border-radius: 100px
    font-size: 0

    .icon-play
      display: inline-block
      vertical-align: middle
      margin-right: 6px
      font-size: $font-size-medium-x

    .text
      display: inline-block
      vertical-align: middle
      font-size: $font-size-small

  .list-wrapper
    position: absolute
    top: 110px
    bottom: 0
    width: 100%

    .list-scroll
      height: 100%
      overflow: hidden

      .list-inner
        padding: 20px 30px

  .no-result-wrapper
    position: absolute
    width: 100%
    top: 50%
    transform: translateY(-50%)
</style>
