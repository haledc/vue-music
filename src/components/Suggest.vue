<template>
  <!-- 滚动组件 -->
  <Scroll
    class="suggest"
    :data="result"
    :pullup="pullup"
    :beforeScroll="beforeScroll"
    ref="suggest"
    @beforeScroll="listScroll"
    @scrollToEnd="searchMore"
  >
    <!-- 搜索列表结果 -->
    <ul class="suggest-list">
      <li
        class="suggest-item"
        @click="selectItem(item)"
        v-for="(item, index) in result"
        :key="index"
      >
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <!-- 上拉刷新时加载图标，出现在最下面 -->
      <Loading v-show="hasMore" title="" />
    </ul>
    <!-- 无搜索结果情况-无结果组件 -->
    <div class="no-result-wrapper" v-show="!hasMore && !result.length">
      <NoResult title="抱歉，暂无搜索结果" />
    </div>
  </Scroll>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'

import Scroll from '@/components/Scroll'
import Loading from '@/components/Loading'
import NoResult from '@/components/NoResult'

import Singer from '@/utils/singer'
import { genResult, checkMore } from '@/utils/search'
import { search } from '@/request/search'
import { ERR_OK } from '@/request/config'

const TYPE_SINGER = 'singer'
const PER_PAGE = 20

export default {
  components: {
    Scroll,
    Loading,
    NoResult
  },
  props: {
    query: {
      type: String,
      default: ''
    },

    // 是否搜索歌手（是否直达）
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      page: 1,
      result: [],
      // 上拉加载更多
      pullup: true,
      hasMore: true,
      beforeScroll: true
    }
  },
  watch: {
    // 监听 query 变化，执行搜索方法，获取搜索结果
    query(newQuery) {
      if (!newQuery) {
        return
      }
      this._search()
    }
  },
  methods: {
    // 搜索方法，获取搜索结果
    _search() {
      this.page = 1
      this.hasMore = true
      this.$refs.suggest.scrollTo(0, 0)
      search(this.query, this.page, this.showSinger, PER_PAGE).then(res => {
        if (res.code === ERR_OK) {
          genResult(res.data, this.page).then(result => {
            this.result = result
            this.hasMore = checkMore(res.data)
          })
        }
      })
    },

    // 搜索更多
    // 上拉刷新，加载更多的搜索数据
    searchMore() {
      if (!this.hasMore) {
        return
      }
      this.page++
      search(this.query, this.page, this.showSinger, PER_PAGE).then(res => {
        if (res.code === ERR_OK) {
          genResult(res.data, this.page).then(result => {
            this.result = this.result.concat(result)
            this.hasMore = checkMore(res.data)
          })
        }
      })
    },

    // 根据 type 切换 icon 图标样式
    getIconCls(item) {
      return item.type === TYPE_SINGER ? 'icon-mine' : 'icon-music'
    },

    // 根据 type 切换歌手和歌曲的显示名称
    getDisplayName(item) {
      return item.type === TYPE_SINGER
        ? item.singername
        : `${item.name}-${item.singer}`
    },

    // 选中歌手或者歌曲
    selectItem(item) {
      if (item.type === TYPE_SINGER) {
        const singer = new Singer({
          id: item.singermid,
          name: item.singername
        })
        this.$router.push({
          path: `/search/${singer.id}`
        })
        this.setSinger(singer)
      } else {
        this.insertSong(item)
      }
      this.$emit('select')
    },

    // 监听 beforeScroll 事件，用于滚动前隐藏手机端输入键盘
    listScroll() {
      this.$emit('listScroll')
    },

    refresh() {
      this.$refs.suggest.refresh()
    },

    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),

    ...mapActions(['insertSong'])
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variable.scss';
@import '@/assets/styles/mixin.scss';

.suggest {
  height: 100%;
  overflow: hidden;

  .suggest-list {
    padding: 0 30px;

    .suggest-item {
      display: flex;
      align-items: center;
      padding-bottom: 20px;
    }

    .icon {
      flex: 0 0 30px;
      width: 30px;

      [class^='icon-'] {
        font-size: 14px;
        color: $color-text-d;
      }
    }

    .name {
      flex: 1;
      font-size: $font-size-medium;
      color: $color-text-d;
      overflow: hidden;

      .text {
        @include no-wrap;
      }
    }
  }

  .no-result-wrapper {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
