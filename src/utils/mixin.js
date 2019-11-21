import { mapGetters, mapMutations, mapActions } from 'vuex'
import { playMode } from './config'
import { shuffle } from './util'

// 播放列表 mixin
export const playlistMixin = {
  computed: {
    ...mapGetters(['playlist'])
  },
  mounted() {
    // 在挂载 dom 时，调用 handlePlaylist 方法增加 bottom
    this.handlePlaylist(this.playlist)
  },
  activated() {
    // 在 keep-alive 激活时，调用 handlePlaylist 方法增加 bottom
    this.handlePlaylist(this.playlist)
  },
  watch: {
    // 监听 playlist 变化，调用 handlePlaylist 方法增加 bottom
    playlist(newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    // 这个方法需要被组件的同名方法所覆盖，否则会报错
    // 组件方法：播放列表新增 bottom=60px，同时刷新对应的 scroll 组件，更新高度
    // 结果使得 mini 播放器 (高度60px) 不会覆盖住播放列表底部
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method')
    }
  }
}

// 播放器 mixin
export const playerMixin = {
  computed: {
    // 播放模式图标切换
    iconMode() {
      return this.mode === playMode.sequence
        ? 'icon-sequence'
        : this.mode === playMode.loop
        ? 'icon-loop'
        : 'icon-random'
    },
    // 已收藏或者未收藏的样式
    favoriteIcon() {
      return this.getFavoriteIcon(this.currentSong)
    },
    ...mapGetters([
      'sequenceList',
      'currentSong',
      'playlist',
      'mode',
      'favoriteList'
    ])
  },
  methods: {
    // 改变播放模式
    changeMode() {
      const mode = (this.mode + 1) % 3

      // 设置播放模式
      this.setPlayMode(mode)
      let list = null

      // 随机播放模式需要打乱列表
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }

      // 设置当前索引
      this.resetCurrentIndex(list)

      // 设置播放列表
      this.setPlaylist(list)
    },

    // 重置当前索引，在切换各种播放模式下不改变当前歌曲
    resetCurrentIndex(list) {
      // 通过歌曲的id，在列表中找到当前的歌曲的索引
      let index = list.findIndex(item => item.id === this.currentSong.id)
      this.setCurrentIndex(index)
    },

    // 切换已收藏和没有收藏的样式
    getFavoriteIcon(song) {
      if (this.isFavorite(song)) {
        return 'icon-favorite'
      }
      return 'icon-not-favorite'
    },

    // 切换收藏
    toggleFavorite(song) {
      if (this.isFavorite(song)) {
        this.deleteFavoriteList(song)
      } else {
        this.saveFavoriteList(song)
      }
    },

    // 判断歌曲是否被收藏
    isFavorite(song) {
      const index = this.favoriteList.findIndex(item => item.id === song.id)
      return index > -1
    },
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlaylist: 'SET_PLAYLIST'
    }),
    ...mapActions(['saveFavoriteList', 'deleteFavoriteList'])
  }
}

// 搜索 mixin
export const searchMixin = {
  data() {
    return {
      query: '',
      refreshDelay: 120
    }
  },
  computed: {
    // 搜索历史
    ...mapGetters(['searchHistory'])
  },
  methods: {
    // 把搜索关键词添加到搜索栏【包括热门搜索关键词和搜索历史的关键词】
    // 调用搜索栏子组件方法
    addQuery(query) {
      this.$refs.searchBox.setQuery(query)
    },

    // 调用搜索栏子组件方法，在滚动搜索列表之前，隐藏手机端的输入键盘
    blurInput() {
      this.$refs.searchBox.blur()
    },

    // 监听子组件派发的 select 事件，把当前的搜索关键字保存到缓存中
    saveSearch() {
      this.saveSearchHistory(this.query)
    },

    // 监听 search-box 派发的事件，设置 query 为派发事件传来的新值
    onQueryChange(query) {
      this.query = query.trim() // 处理带空格的情况
    },

    ...mapActions(['saveSearchHistory', 'deleteSearchHistory'])
  }
}
