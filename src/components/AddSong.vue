<template>
  <transition name="slide">
    <div class="add-song" v-show="isShowFlag" @click.stop>
      <!-- 头部 -->
      <div class="header">
        <h1 class="title">添加歌曲列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <!-- 搜索栏 -->
      <div class="search-box-wrapper">
        <SearchBox
          @query="onQueryChange"
          placeholder="搜索歌曲"
          ref="searchBox"
        />
      </div>
      <!-- 快捷方式 -->
      <div class="shortcut" v-show="!query">
        <!-- 开关组件 -->
        <Switches
          :currentIndex="currentIndex"
          :switches="switches"
          @switch="switchItem"
        />
        <div class="list-wrapper">
          <!-- 最近播放 -->
          <Scroll
            class="list-scroll"
            v-if="currentIndex === 0"
            :data="playHistory"
            ref="songList"
          >
            <div class="list-inner">
              <SongList :songs="playHistory" @select="selectSong" />
            </div>
          </Scroll>
          <!-- 搜索历史 -->
          <Scroll
            class="list-scroll"
            v-if="currentIndex === 1"
            :refreshDelay="refreshDelay"
            :data="searchHistory"
            ref="searchList"
          >
            <div class="list-inner">
              <SearchList
                @delete="deleteSearchHistory"
                @select="addQuery"
                :searches="searchHistory"
              />
            </div>
          </Scroll>
        </div>
      </div>
      <!-- 搜索结果 -->
      <div class="search-result" v-show="query">
        <Suggest
          :query="query"
          :isShowSinger="isShowSinger"
          @select="selectSuggest"
          @listScroll="blurInput"
        />
      </div>
      <!-- 提示组件 -->
      <TopTip ref="topTip" :delay="delay">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">1首歌曲已经添加到播放队列</span>
        </div>
      </TopTip>
    </div>
  </transition>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import SearchBox from '@/components/SearchBox'
import Suggest from '@/components/Suggest'
import Switches from '@/components/Switches'
import Scroll from '@/components/Scroll'
import SongList from '@/components/SongList'
import SearchList from '@/components/SearchList'
import TopTip from '@/components/TopTip'

import Song from '@/utils/song'
import { searchMixin } from '@/utils/mixin'

export default {
  mixins: [searchMixin],
  components: {
    SongList,
    SearchBox,
    Suggest,
    Switches,
    Scroll,
    SearchList,
    TopTip
  },
  data() {
    return {
      isShowFlag: false,
      isShowSinger: false, // 是否搜索歌手
      currentIndex: 0, // 开关索引
      switches: [{ name: '最近播放' }, { name: '搜索历史' }], // 开关文本
      delay: 2000 // 消息提示窗持续时间
    }
  },
  computed: {
    ...mapGetters(['playHistory'])
  },
  methods: {
    // 显示
    show() {
      this.isShowFlag = true

      // 显示后需要刷新 scroll 才能滚动
      setTimeout(() => {
        if (this.currentIndex === 0) {
          this.$refs.songList.refresh()
        } else {
          this.$refs.searchLisr.refresh()
        }
      }, 20)
    },

    // 隐藏
    hide() {
      this.isShowFlag = false
    },

    // 选中搜索结果，保存到搜索历史
    selectSuggest() {
      this.saveSearch()
      this.showTip()
    },

    // 切换开关
    switchItem(index) {
      this.currentIndex = index
    },

    // 选中歌曲，插入到播放列表中
    selectSong(song, index) {
      if (index !== 0) {
        this.insertSong(new Song(song))
      }
      this.showTip()
    },

    // 显示消息提示窗
    showTip() {
      this.$refs.topTip.show()
    },

    ...mapActions(['insertSong'])
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variable.scss';

.add-song {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100%;
  z-index: 200;
  background: $color-background;

  &.slide-enter-active,
  &.slide-leave-active {
    transition: all 0.3s;
  }

  &.slide-enter,
  &.slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }

  .header {
    position: relative;
    height: 44px;
    text-align: center;

    .title {
      line-height: 44px;
      font-size: $font-size-large;
      color: $color-text;
    }

    .close {
      position: absolute;
      top: 0;
      right: 8px;

      .icon-close {
        display: block;
        padding: 12px;
        font-size: 20px;
        color: $color-theme;
      }
    }
  }

  .search-box-wrapper {
    margin: 20px;
  }

  .shortcut {
    .list-wrapper {
      position: absolute;
      top: 165px;
      bottom: 0;
      width: 100%;

      .list-scroll {
        height: 100%;
        overflow: hidden;

        .list-inner {
          padding: 20px 30px;
        }
      }
    }
  }

  .search-result {
    position: fixed;
    top: 124px;
    bottom: 0;
    width: 100%;
  }

  .tip-title {
    text-align: center;
    padding: 18px 0;
    font-size: 0;

    .icon-ok {
      font-size: $font-size-medium;
      color: $color-theme;
      margin-right: 4px;
    }

    .text {
      font-size: $font-size-medium;
      color: $color-text;
    }
  }
}
</style>
