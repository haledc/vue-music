<template>
  <div class="search">
    <!-- 搜索栏组件 -->
    <div class="search-box-wrapper">
      <SearchBox ref="searchBox" @query="onQueryChange" />
    </div>
    <!-- 搜索主体部分-滚动组件 -->
    <div class="shortcut-wrapper" v-show="!_state.query" ref="shortcutWrapper">
      <Scroll
        class="shortcut"
        :data="shortcut"
        ref="shortcutRef"
        :refreshDelay="_state.refreshDelay"
      >
        <div>
          <!-- 热门搜索 -->
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li
                @click="addQuery(item.k)"
                class="item"
                v-for="item in hotKey"
                :key="item.k"
              >
                <span>{{ item.k }}</span>
              </li>
            </ul>
          </div>
          <!-- 搜索历史 -->
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="showConfirm">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <!-- 搜索历史列表组件 -->
            <SearchList
              @select="addQuery"
              @delete="deleteSearchHistory"
              :searches="searchHistory"
            />
          </div>
        </div>
      </Scroll>
    </div>
    <!-- 搜索结果-suggest组件 -->
    <div class="search-result" v-show="_state.query" ref="searchResult">
      <Suggest
        :query="_state.query"
        @listScroll="blurInput"
        @select="saveSearch"
        ref="suggestRef"
      />
    </div>
    <!-- 弹窗确认组件 -->
    <Confirm
      ref="confirm"
      text="是否清空所有搜索历史"
      confirmBtnText="清空"
      @confirm="clearSearchHistory"
    />
    <!-- 歌手详情二级路由 -->
    <router-view />
  </div>
</template>

<script>
import { ref, computed, watch } from '@vue/composition-api'
import SearchBox from '@/components/SearchBox'
import Suggest from '@/components/Suggest'
import SearchList from '@/components/SearchList'
import Confirm from '@/components/Confirm'
import Scroll from '@/components/Scroll'
import { getHotKey } from '@/request/search'
import { ERR_OK } from '@/request/config'
import { usePlaylist, useSearch, useActions } from '@/hooks'

export default {
  components: {
    SearchBox,
    Suggest,
    SearchList,
    Confirm,
    Scroll
  },
  setup(props, { root, refs }) {
    const clearSearchHistory = useActions(root, 'clearSearchHistory')

    const hotKey = ref([])

    const {
      _state,
      searchHistory,
      onQueryChange,
      addQuery,
      deleteSearchHistory,
      blurInput,
      saveSearch
    } = useSearch(root, refs)

    watch(
      () => _state.query,
      newVal => {
        if (!newVal) {
          setTimeout(() => {
            refs.shortcutRef.refresh()
          }, 20)
        }
      }
    )

    const shortcut = computed(() => hotKey.value.concat(searchHistory))

    function handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? '60px' : 0
      refs.shortcutWrapper.style.bottom = bottom
      refs.shortcutRef.refresh()
      refs.searchResult.style.bottom = bottom
      refs.suggestRef.refresh()
    }

    usePlaylist(root, handlePlaylist)

    function _getHotKey() {
      getHotKey().then(res => {
        if (res.code === ERR_OK) {
          hotKey.value = res.data.hotkey.slice(0, 10)
        }
      })
    }
    _getHotKey()

    function showConfirm() {
      refs.confirm.show()
    }

    return {
      hotKey,
      _state,
      searchHistory,
      shortcut,
      onQueryChange,
      addQuery,
      showConfirm,
      deleteSearchHistory,
      blurInput,
      saveSearch,
      clearSearchHistory
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variable.scss';
@import '@/assets/styles/mixin.scss';

.search {
  .search-box-wrapper {
    margin: 20px;
  }

  .shortcut-wrapper {
    position: fixed;
    top: 178px;
    bottom: 0;
    width: 100%;

    .shortcut {
      height: 100%;
      overflow: hidden;

      .hot-key {
        margin: 0 20px 20px 20px;

        .title {
          margin-bottom: 20px;
          font-size: $font-size-medium;
          color: $color-text-l;
        }

        .item {
          display: inline-block;
          padding: 5px 10px;
          margin: 0 20px 10px 0;
          border-radius: 6px;
          background: $color-highlight-background;
          font-size: $font-size-medium;
          color: $color-text-d;
        }
      }

      .search-history {
        position: relative;
        margin: 0 20px;

        .title {
          display: flex;
          align-items: center;
          height: 40px;
          font-size: $font-size-medium;
          color: $color-text-l;

          .text {
            flex: 1;
          }

          .clear {
            @include extend-click;

            .icon-clear {
              font-size: $font-size-medium;
              color: $color-text-d;
            }
          }
        }
      }
    }
  }

  .search-result {
    position: fixed;
    width: 100%;
    top: 178px;
    bottom: 0;
  }
}
</style>
