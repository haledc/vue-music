import { playMode } from './config'
import * as types from '../../store/mutation-types'
import { Getter, Mutation, Action } from 'vuex-class'
import { shuffle } from './util'
import { Vue, Component, Watch } from 'vue-property-decorator'

@Component
export class PlaylistMixin extends Vue {
  @Getter protected playlist: any

  protected mounted() {
    this.handlePlaylist(this.playlist)
  }

  protected activated() {
    this.handlePlaylist(this.playlist)
  }

  @Watch('playlist')
  protected onChangePlaylist(newVal: any[]) {
    this.handlePlaylist(newVal)
  }

  protected handlePlaylist(playlist?: any[]) {
    throw new Error('component must implement handlePlaylist method')
  }
}

export class PlayerMixin extends Vue {
  @Getter protected sequenceList: any
  @Getter protected currentSong: any
  @Getter protected playlist: any
  @Getter protected mode: any
  @Getter protected favoriteList: any
  @Mutation(types.SET_PLAYING_STATE) protected setPlayState: any
  @Mutation(types.SET_CURRENT_INDEX) protected setCurrentIndex: any
  @Mutation(types.SET_PLAY_MODE) protected setPlayMode: any
  @Mutation(types.SET_PLAYLIST) protected setPlaylist: any
  @Action protected saveFavoriteList: any
  @Action protected deleteFavoriteList: any

  get iconMode() {
    return this.mode === playMode.sequence
      ? 'icon-sequence'
      : this.mode === playMode.loop
      ? 'icon-loop'
      : 'icon-random'
  }

  get favoriteIcon() {
    return this.getFavoriteIcon(this.currentSong)
  }

  protected getFavoriteIcon(song: any) {
    if (this.isFavorite(song)) {
      return 'icon-favorite'
    }
    return 'icon-not-favorite'
  }

  protected isFavorite(song: any) {
    const index = this.favoriteList.findIndex(
      (item: any) => item.id === song.id
    )
    return index > -1
  }

  protected toggleFavorite(song: any) {
    this.isFavorite(song)
      ? this.deleteFavoriteList(song)
      : this.saveFavoriteList(song)
  }

  protected changeMode() {
    const mode = (this.mode + 1) % 3
    this.setPlayMode()
    let list = null
    if (mode === playMode.random) {
      list = shuffle(this.sequenceList)
    } else {
      list = this.sequenceList
    }
    this.resetCurrentIndex(list)
    this.setPlaylist()
  }

  protected resetCurrentIndex(list: any[]) {
    const index = list.findIndex(item => item.id === this.currentSong.id)
    this.setCurrentIndex(index)
  }
}

export class SearchMixin extends Vue {
  @Getter protected searchHistory: any
  @Action protected saveSearchHistory: any
  @Action protected deleteSearchHistory: any

  protected query: string = ''
  protected refreshDelay: number = 120

  protected addQuery(query: string) {
    // @ts-ignore
    this.$refs.searchBox.setQuery(query)
  }

  protected blurInput() {
    // @ts-ignore
    this.$refs.searchBox.blur()
  }

  protected saveSearch() {
    this.saveSearchHistory(this.query)
  }

  protected onQueryChange(query: string) {
    this.query = query.trim()
  }
}
