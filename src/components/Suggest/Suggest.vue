<template>
  <Scroll
    class="suggest"
    :data="result"
    :pullup="pullup"
    :before-scroll="beforeScroll"
    ref="suggest"
    @beforeScroll="listScroll"
    @scrollToEnd="searchMore"
  >
    <ul class="suggest-list">
      <li
        v-for="(item, index) in result"
        :key="index"
        class="suggest-item"
        @click="selectItem(item)"
      >
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <Loading v-show="hasMore" />
    </ul>
    <div class="no-result-wrapper" v-show="!hasMore && !result.length">
      <NoResult title="抱歉，暂无搜索结果" />>
    </div>
  </Scroll>
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit, Watch } from 'vue-property-decorator'
import { Mutation, Action } from 'vuex-class'
import Scroll from '@/components/Scroll'
import Loading from '@/components/Loading'
import NoResult from '@/components/NoResult'
import * as types from '@/store/mutation-types'
import { search } from '@/request/search'
import { ERR_OK } from '@/request/config'
import Singer from '@/utils/singer'
import { processSongUrl, normalizeSongs } from '@/utils/song'
import { genResult, hasMore } from '@/utils/search'
import Song from '@/utils/song'
import { SingerZhida } from '@/types'

const TYPE_SINGER = 'singer'
const PER_PAGE = 20

@Component({
  components: {
    Scroll,
    Loading,
    NoResult
  }
})
export default class Suggest extends Vue {
  @Prop({ default: '' }) public query!: string
  @Prop({ default: true }) public showSinger!: boolean

  @Mutation(types.SET_SINGER) public setSinger!: (singer: Singer) => void
  @Action public insertSong!: (song: Song) => void

  public page: number = 1
  public result = [] as Array<Song | SingerZhida>
  public pullup: boolean = true
  public hasMore: boolean = true
  public beforeScroll: boolean = true
  public $refs!: {
    suggest: Scroll
  }

  public search() {
    this.page = 1
    this.hasMore = true
    this.$refs.suggest.scrollTo(0, 0)
    search(this.query, this.page, this.showSinger, PER_PAGE).then(res => {
      if (res.code === ERR_OK) {
        genResult(res, this.page).then(result => (this.result = result))
        this.hasMore = hasMore(res)
      }
    })
  }

  public searchMore() {
    if (!this.hasMore) {
      return
    }
    this.page++
    search(this.query, this.page, this.showSinger, PER_PAGE).then(res => {
      if (res.code === ERR_OK) {
        genResult(res, this.page).then(result => this.result.concat(result))
        this.hasMore = hasMore(res)
      }
    })
  }

  public getIconCls(item: SingerZhida) {
    return item.type === TYPE_SINGER ? 'icon-mine' : 'icon-music'
  }

  public getDisplayName(item: SingerZhida) {
    return item.type === TYPE_SINGER
      ? item.singername
      : `${item.name}-${item.singer}`
  }

  @Emit('select')
  public selectItem(item: SingerZhida) {
    if (item.type === TYPE_SINGER) {
      const singer = new Singer({
        id: item.singermid,
        name: item.singername
      })
      this.$router.push(`/search/${singer.id}`)
      this.setSinger(singer)
    } else if (item instanceof Song) {
      this.insertSong(item)
    }
  }

  @Emit()
  public listScroll() {
    //
  }

  public refresh() {
    this.$refs.suggest.refresh()
  }

  @Watch('query')
  public onQueryChangeInSuggest(newQuery: string) {
    if (!newQuery) {
      return
    }
    this.search()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';
@import '@/assets/styles/mixins.scss';

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
