<template>
  <div class="search">
    <!-- 搜索栏组件 -->
    <div class="search-box-wrapper">
      <SearchBox ref="searchBox" @query="onQueryChange" />
    </div>
    <!-- 搜索主体部分-滚动组件 -->
    <div class="shortcut-wrapper" v-show="!query" ref="shortcutWrapper">
      <Scroll
        class="shortcut"
        :data="shortcut"
        ref="shortcut"
        :refreshDelay="refreshDelay"
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
    <div class="search-result" v-show="query" ref="searchResult">
      <Suggest
        :query="query"
        @listScroll="blurInput"
        @select="saveSearch"
        ref="suggest"
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
import { mapActions } from 'vuex'

import SearchBox from '@/components/SearchBox'
import Suggest from '@/components/Suggest'
import SearchList from '@/components/SearchList'
import Confirm from '@/components/Confirm'
import Scroll from '@/components/Scroll'

import { getHotKey } from '@/request/search'
import { ERR_OK } from '@/request/config'
import { playlistMixin, searchMixin } from '@/utils/mixin'

export default {
  mixins: [playlistMixin, searchMixin],
  components: {
    SearchBox,
    Suggest,
    SearchList,
    Confirm,
    Scroll
  },
  data() {
    return {
      hotKey: []
    }
  },
  computed: {
    shortcut() {
      return this.hotKey.concat(this.searchHistory)
    }
  },
  created() {
    this._getHotKey()
  },
  watch: {
    // 监听 query 变化
    query(newQuery) {
      if (!newQuery) {
        setTimeout(() => {
          this.$refs.shortcut.refresh()
        }, 20)
      }
    }
  },
  methods: {
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? '60px' : 0
      this.$refs.shortcutWrapper.style.bottom = bottom
      this.$refs.shortcut.refresh()
      this.$refs.searchResult.style.bottom = bottom
      this.$refs.suggest.refresh()
    },

    // 显示确认窗口
    showConfirm() {
      this.$refs.confirm.show()
    },

    // 获取搜索关键词
    _getHotKey() {
      getHotKey().then(res => {
        if (res.code === ERR_OK) {
          this.hotKey = res.data.hotkey.slice(0, 10)
        }
      })
    },

    ...mapActions(['clearSearchHistory'])
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
