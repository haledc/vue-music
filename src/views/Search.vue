<template>
  <div class="search">
    <div class="search-hox-wrapper">
      <SearchBox ref="searchBox" @query="onQueryChange"/>
    </div>
    <div class="shortcut-wrapper" v-show="!query" ref="shortcutWrapper">
      <Scroll class="shortcut" :data="shortcut" ref="shortcut" :refreshDelay="refreshDelay">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li
                class="item"
                v-for="(item, index) in hotKey"
                :key="index"
                @click="addQuery(item.k)"
              >
                <span>{{ item.k }}</span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="showConfirm">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <SearchList @select="addQuery" @delete="deleteSearchHistory" :searches="searchHistory"/>
          </div>
        </div>
      </Scroll>
    </div>
    <div class="search-result" v-show="query" ref="searchResult">
      <Suggest :query="query" @listScroll="blurInput" @select="saveSearch" ref="suggest"/>
    </div>
    <Confirm ref="confirm" text="是否清空所有搜索历史" confirmBtnText="清空" @confirm="clearSearchHistory"/>
    <router-view/>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Mixins, Watch } from 'vue-property-decorator'
import SearchBox from '@/components/SearchBox.vue'
import Suggest from '@/components/Suggest.vue'
import SearchList from '@/components/SearchList.vue'
import Confirm from '@/components/Confirm.vue'
import Scroll from '@/components/Scroll.vue'
import { getHotKey } from '@/assets/api/search'
import { ERR_OK } from '@/assets/api/config'
import { Action } from 'vuex-class'
import { PlaylistMixin, SearchMixin } from '@/assets/utils/mixin'
import Song from '@/assets/utils/song'
import { HotKeyInterface } from '@/assets/api/apiInterface'

@Component({
  components: {
    SearchBox,
    Suggest,
    SearchList,
    Confirm,
    Scroll
  }
})
export default class Search extends Mixins(PlaylistMixin, SearchMixin) {
  @Action public clearSearchHistory!: () => void

  public $refs!: {
    shortcutWrapper: HTMLElement
    shortcut: Scroll
    searchResult: HTMLElement
    confirm: Confirm
    suggest: Suggest
  }

  public hotKey = [] as Array<HotKeyInterface | string>

  get shortcut() {
    return this.hotKey.concat(this.searchHistory)
  }

  public created() {
    this.getHotKey()
  }

  public handlePlaylist(playlist: Song[]) {
    const bottom = playlist.length > 0 ? '60px' : '0'
    this.$refs.shortcutWrapper.style.bottom = bottom
    this.$refs.shortcut.refresh()
    this.$refs.searchResult.style.bottom = bottom
    this.$refs.suggest.refresh()
  }

  public showConfirm() {
    this.$refs.confirm.show()
  }

  @Watch('query')
  public watchQueryChange(newQuery: string) {
    if (!newQuery) {
      setTimeout(() => {
        this.$refs.shortcut.refresh()
      }, 20)
    }
  }

  private getHotKey() {
    getHotKey().then(res => {
      if (res.code === ERR_OK) {
        this.hotKey = res.data.hotkey.slice(0, 10)
      }
    })
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/styles/variable.styl'
@import '~@/assets/styles/mixin.styl'

.search
  .search-box-wrapper
    margin: 20px

  .shortcut-wrapper
    position: fixed
    top: 178px
    bottom: 0
    width: 100%

    .shortcut
      height: 100%
      overflow: hidden

      .hot-key
        margin: 0 20px 20px 20px

        .title
          margin-bottom: 20px
          font-size: $font-size-medium
          color: $color-text-l

        .item
          display: inline-block
          padding: 5px 10px
          margin: 0 20px 10px 0
          border-radius: 6px
          background: $color-highlight-background
          font-size: $font-size-medium
          color: $color-text-d

      .search-history
        position: relative
        margin: 0 20px

        .title
          display: flex
          align-items: center
          height: 40px
          font-size: $font-size-medium
          color: $color-text-l

          .text
            flex: 1

          .clear
            extend-click()

            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d

  .search-result
    position: fixed
    width: 100%
    top: 178px
    bottom: 0
</style>