<template>
  <transition name="slide">
    <div class="add-song" v-show="state.isShowFlag" @click.stop>
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
          ref="searchBoxRef"
        />
      </div>
      <!-- 快捷方式 -->
      <div class="shortcut" v-show="!_state.query">
        <!-- 开关组件 -->
        <Switches
          :currentIndex="state.currentIndex"
          :switches="state.switches"
          @switch="switchItem"
        />
        <div class="list-wrapper">
          <!-- 最近播放 -->
          <Scroll
            class="list-scroll"
            v-if="state.currentIndex === 0"
            :data="playHistory"
            ref="songListRef"
          >
            <div class="list-inner">
              <SongList :songs="playHistory" @select="selectSong" />
            </div>
          </Scroll>
          <!-- 搜索历史 -->
          <Scroll
            class="list-scroll"
            v-if="state.currentIndex === 1"
            :refreshDelay="_state.refreshDelay"
            :data="searchHistory"
            ref="searchListRef"
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
      <div class="search-result" v-show="_state.query">
        <Suggest
          :query="_state.query"
          :isShowSinger="state.isShowSinger"
          @select="selectSuggest"
          @listScroll="blurInput"
        />
      </div>
      <!-- 提示组件 -->
      <TopTip ref="topTipRef" :delay="state.delay">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">1首歌曲已经添加到播放队列</span>
        </div>
      </TopTip>
    </div>
  </transition>
</template>

<script>
import { reactive, computed } from '@vue/composition-api'
import SearchBox from '@/components/SearchBox'
import Suggest from '@/components/Suggest'
import Switches from '@/components/Switches'
import Scroll from '@/components/Scroll'
import SongList from '@/components/SongList'
import SearchList from '@/components/SearchList'
import TopTip from '@/components/TopTip'
import Song from '@/utils/song'
import { useSearch, useActions } from '@/hooks'

export default {
  components: {
    SongList,
    SearchBox,
    Suggest,
    Switches,
    Scroll,
    SearchList,
    TopTip
  },
  setup(props, { root, refs }) {
    const insertSong = useActions(root, 'insertSong')

    const state = reactive({
      isShowFlag: false,
      isShowSinger: false,
      currentSwitchIndex: 0,
      switches: [{ name: '最近播放' }, { name: '搜索历史' }],
      delay: 2000
    })

    const {
      _state,
      searchHistory,
      addQuery,
      saveSearch,
      onQueryChange,
      deleteSearchHistory,
      blurInput
    } = useSearch(root, refs)

    const playHistory = computed(() => root.$store.getters.playHistory)

    function show() {
      state.isShowFlag = true
      setTimeout(() => {
        if (state.currentSwitchIndex === 0) {
          refs.songListRef.refresh()
        } else {
          refs.searchLisrRef.refresh()
        }
      }, 20)
    }

    function hide() {
      state.isShowFlag = false
    }

    function selectSuggest() {
      saveSearch()
      showTip()
    }

    function switchItem(index) {
      state.currentSwitchIndex = index
    }

    function selectSong(song, index) {
      if (index !== 0) {
        insertSong(new Song(song))
      }
      showTip()
    }

    function showTip() {
      refs.topTipRef.show()
    }

    return {
      state,
      _state,
      playHistory,
      searchHistory,
      hide,
      switchItem,
      selectSong,
      deleteSearchHistory,
      addQuery,
      selectSuggest,
      blurInput,
      onQueryChange
    }
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
