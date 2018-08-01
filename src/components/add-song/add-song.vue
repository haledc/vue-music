<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <!--头部-->
      <div class="header">
        <h1 class="title">添加歌曲列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <!--搜索栏-->
      <div class="search-box-wrapper">
        <search-box @query="onQueryChange" placeholder="搜索歌曲" ref="searchBox"></search-box>
      </div>
      <!--快捷方式-->
      <div class="shortcut" v-show="!query">
        <!--开关组件-->
        <switches :currentIndex="currentIndex" :switches="switches" @switch="switchItem"></switches>
        <div class="list-wrapper">
          <!--最近播放-->
          <scroll class="list-scroll" v-if="currentIndex===0" :data="playHistory" ref="songList">
            <div class="list-inner">
              <song-list :songs="playHistory" @select="selectSong"/>
            </div>
          </scroll>
          <!--搜索历史-->
          <scroll class="list-scroll"
                  v-if="currentIndex===1"
                  :refreshDelay="refreshDelay"
                  :data="searchHistory"
                  ref="searchList">
            <div class="list-inner">
              <search-list
                @delete="deleteSearchHistory"
                @select="addQuery"
                :searches="searchHistory"></search-list>
            </div>
          </scroll>
        </div>
      </div>
      <!--搜索结果-->
      <div class="search-result" v-show="query">
        <suggest
          :query="query"
          :showSinger="showSinger"
          @select="selectSuggest"
          @listScroll="blurInput"
        ></suggest>
      </div>
      <!--提示组件-->
      <top-tip ref="topTip" :delay="delay">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">1首歌曲已经添加到播放队列</span>
        </div>
      </top-tip>
    </div>
  </transition>

</template>

<script type="text/ecmascript-6">
  import SearchBox from 'base/search-box/search-box'
  import Suggest from 'components/suggest/suggest'
  import {searchMixin} from 'common/js/mixin'
  import Switches from 'base/switches/switches'
  import Scroll from 'base/scroll/scroll'
  import {mapGetters, mapActions} from 'vuex'
  import SongList from 'base/song-list/song-list'
  import Song from 'common/js/song'
  import SearchList from 'base/search-list/search-list'
  import TopTip from 'base/top-tip/top-tip'

  export default {
    mixins: [searchMixin],
    data() {
      return {
        showFlag: false,
        // 不搜索歌手
        showSinger: false,
        // 开关索引
        currentIndex: 0,
        // 开关文本
        switches: [
          {name: '最近播放'},
          {name: '搜索历史'}
        ],
        // 消息提示窗持续时间
        delay: 2000
      }
    },
    computed: {
      ...mapGetters([
        'playHistory'
      ])
    },
    methods: {
      /**
       * 显示窗口
       */
      show() {
        this.showFlag = true
        // 显示后需要刷新scroll才能滚动
        setTimeout(() => {
          if (this.currentIndex === 0) {
            this.$refs.songList.refresh()
          } else {
            this.$refs.searchLisr.refresh()
          }
        }, 20)
      },
      /**
       * 隐藏窗口
       */
      hide() {
        this.showFlag = false
      },
      /**
       * 选中搜索结果，保存到搜索历史
       * 监听子组件派发的select事件
       */
      selectSuggest() {
        this.saveSearch()
        this.showTip()
      },
      /**
       * 切换开关
       * @param index
       */
      switchItem(index) {
        this.currentIndex = index
      },
      /**
       * 选中歌曲，插入到播放列表中
       * 监听子组件派发的select事件
       * @param song
       * @param index
       */
      selectSong(song, index) {
        if (index !== 0) {
          this.insertSong(new Song(song))
        }
        this.showTip()
      },
      /**
       * 显示消息提示窗
       * 调用子组件方法
       */
      showTip() {
        this.$refs.topTip.show()
      },
      ...mapActions([
        'insertSong'
      ])
    },
    components: {
      SongList,
      SearchBox,
      Suggest,
      Switches,
      Scroll,
      SearchList,
      TopTip
    }
  }
</script>

<style scoped lang="stylus" type="text/stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .add-song
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    z-index: 200
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .header
      position: relative
      height: 44px
      text-align: center
      .title
        line-height: 44px
        font-size: $font-size-large
        color: $color-text
      .close
        position: absolute
        top: 0
        right: 8px
        .icon-close
          display: block
          padding: 12px
          font-size: 20px
          color: $color-theme

    .search-box-wrapper
      margin: 20px
    .shortcut
      .list-wrapper
        position: absolute
        top: 165px
        bottom: 0
        width: 100%
        .list-scroll
          height: 100%
          overflow: hidden
          .list-inner
            padding: 20px 30px
    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
    .tip-title
      text-align: center
      padding: 18px 0
      font-size: 0
      .icon-ok
        font-size: $font-size-medium
        color: $color-theme
        margin-right: 4px
      .text
        font-size: $font-size-medium
        color: $color-text
</style>
