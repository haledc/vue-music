<template>
  <!--滚动组件-->
  <scroll class="suggest"
          :data="result"
          :pullup="pullup"
          :beforeScroll="beforeScroll"
          ref="suggest"
          @beforeScroll="listScroll"
          @scrollToEnd="searchMore">
    <!--搜索列表结果-->
    <ul class="suggest-list">
      <li class="suggest-item" @click="selectItem(item)" v-for="item in result">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <!--上拉刷新时加载图标，出现在最下面-->
      <loading v-show="hasMore" title=""/>
    </ul>
    <!--无搜索结果情况-无结果组件-->
    <div class="no-result-wrapper" v-show="!hasMore && !result.length">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import {search} from 'api/search'
  import {ERR_OK} from 'api/config'
  import {createSong, isValidMusic, processSongsUrl} from 'common/js/song'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import Singer from 'common/js/singer'
  import {mapMutations, mapActions} from 'vuex'
  import NoResult from 'base/no-result/no-result'

  const TYPE_SINGER = 'singer'
  const PER_PAGE = 20

  export default {
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
    methods: {
      /**
       * 搜索方法，获取搜索结果
       */
      search() {
        // 重置页面为1
        this.page = 1
        // 设置是否加载完成条件
        this.hasMove = true
        // 重置滚动到最上面
        this.$refs.suggest.scrollTo(0, 0)
        search(this.query, this.page, this.showSinger, PER_PAGE).then((res) => {
          if (res.code === ERR_OK) {
            this._genResult(res.data)
              .then(result => {
                this.result = result
              })
            // 检查是否加载完成
            this._checkMore(res.data)
          }
        })
      },
      /**
       * 搜索更多
       * 上拉刷新，加载更多的搜索数据，原来的数据和新加载的数据concat起来
       * this.page++ 增加页数
       */
      searchMore() {
        if (!this.hasMove) {
          return
        }
        this.page++
        search(this.query, this.page, this.showSinger, PER_PAGE).then((res) => {
          if (res.code === ERR_OK) {
            this._genResult(res.data)
              .then(result => {
                this.result = this.result.concat(result)
              })
            this._checkMore(res.data)
          }
        })
      },
      /**
       * 根据type切换icon图标样式
       * @param item
       * @return {String}
       */
      getIconCls(item) {
        if (item.type === TYPE_SINGER) {
          return 'icon-mine'
        } else {
          return 'icon-music'
        }
      },
      /**
       * 根据type切换歌手和歌曲的显示名称
       * @param item
       * @return {String}
       */
      getDisplayName(item) {
        if (item.type === TYPE_SINGER) {
          return item.singername
        } else {
          return `${item.name}-${item.singer}`
        }
      },
      /**
       * 选中歌手或者歌曲
       * 跳转到歌手详情页 或者 把歌曲插入到播放列表中
       * 并且派发一个事件，让父组件把当前的搜索关键字作为搜索历史数据保存到缓存中
       * @param item
       */
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
      /**
       * 继续派发事件，主要用于滚动前隐藏手机端输入键盘
       * 子组件的beforeScroll事件
       */
      listScroll() {
        this.$emit('listScroll')
      },
      /**
       * 调用子组件scroll的刷新方法
       * 代理方法
       */
      refresh() {
        this.$refs.suggest.refresh()
      },
      /**
       * 处理搜索的歌曲
       */
      _normalizeSongs(list) {
        let ret = []
        list.forEach((musicData) => {
          if (isValidMusic(musicData)) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      },
      /**
       * 处理搜索结果
       * @param data
       * @return {Array}
       * @private
       */
      _genResult(data) {
        let ret = []
        // 如果搜索到歌手，则设置一个type
        if (data.zhida && data.zhida.singerid && this.page === 1) {
          ret.push({...data.zhida, ...{type: TYPE_SINGER}})
        }
        return processSongsUrl(this._normalizeSongs(data.song.list))
          .then(songs => {
            ret = ret.concat(songs)
            return ret
          })
      },
      /**
       * 检查是否加载完成
       * 如果没有列表或者加载的实际歌曲显示比歌曲总数多的话，说明没有加载完成 ？？？
       */
      _checkMore(data) {
        const song = data.song
        if (!song.list.length || (song.curnum + song.curpage * PER_PAGE) >= song.totalnum) {
          this.hasMore = false
        }
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      }),
      ...mapActions([
        'insertSong'
      ])
    },
    watch: {
      /**
       * 监听query变化，执行搜索方法，获得搜索结果
       */
      query() {
        this.search()
      }
    },
    components: {
      Scroll,
      Loading,
      NoResult
    }
  }
</script>

<style scoped lang="stylus" type="text/stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
