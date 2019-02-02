<template>
  <transition name="slide">
    <div class="user-center">
      <div
        class="back"
        @click="back"
      >
        <i class="icon-back"></i>
      </div>
      <div class="switches-wrapper">
        <Switches
          :currentIndex="currentIndex"
          :switches="switches"
          @switch="switchItem"
        />
      </div>
      <div
        class="play-btn"
        ref="playBtn"
        @click="random"
      >
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
      <div
        class="list-wrapper"
        ref="listWrapper"
      >
        <Scroll
          class="list-scroll"
          v-if="currentIndex === 0"
          :data="favoriteList"
          ref="favoriteList"
        >
          <div class="list-inner">
            <SongList
              :songs="favoriteList"
              @select="selectSong"
            />
          </div>
        </Scroll>
        <Scroll
          class="list-scroll"
          v-if="currentIndex === 1"
          :data="playHistory"
          ref="playHistory"
        >
          <div class="list-inner">
            <SongList
              :songs="playHistory"
              @select="selectSong"
            />
          </div>
        </Scroll>
      </div>
      <div
        class="no-result-wrapper"
        v-show="noResult"
      >
        <NoResult :title="noResultDesc" />
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator'
import Switches from '@/components/Switches.vue'
import Scroll from '@/components/Scroll.vue'
import SongList from '@/components/SongList.vue'
import NoResult from '@/components/NoResult.vue'
import { Getter, Action } from 'vuex-class'
import { PlaylistMixin } from '@/assets/utils/mixin'
import Song from '@/assets/utils/song'

@Component({
  components: {
    Switches,
    Scroll,
    SongList,
    NoResult
  }
})
export default class UserCenter extends Mixins(PlaylistMixin) {
  @Getter public favoriteList!: Song[]
  @Getter public playHistory!: Song[]
  @Action public insertSong!: (song: Song) => void
  @Action public randomPlay!: (params: { list: Song[] }) => void

  public currentIndex: number = 0
  public switches: object[] = [{ name: '我喜欢的' }, { name: '最近听的' }]
  public $refs!: {
    listWrapper: HTMLElement
    favoriteList: Scroll
    playHistory: Scroll
  }

  get noResult() {
    return this.currentIndex === 0
      ? !this.favoriteList.length
      : !this.playHistory.length
  }

  get noResultDesc() {
    return this.currentIndex === 0 ? '暂无收藏歌曲' : '你还没有听过歌曲'
  }

  public handlePlaylist(playlist: Song[]) {
    const bottom = playlist.length > 0 ? '60px' : ''
    this.$refs.listWrapper.style.bottom = bottom
    this.$refs.favoriteList && this.$refs.favoriteList.refresh()
    this.$refs.playHistory && this.$refs.playHistory.refresh()
  }

  public switchItem(index: number) {
    this.currentIndex = index
  }

  public selectItem(index: number) {
    this.currentIndex = index
  }

  public selectSong(song: Song) {
    this.insertSong(song)
  }

  public back() {
    this.$router.back()
  }

  public random() {
    const list = this.currentIndex === 0 ? this.favoriteList : this.playHistory
    if (list.length === 0) {
      return 0
    }
    this.randomPlay({
      list
    })
  }
}
</script>

<style lang="stylus" scoped>
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