import { playMode } from './config'
import * as types from '../../store/mutation-types'
import { Getter, Mutation, Action } from 'vuex-class'
import { shuffle } from './util'
import { Vue, Component, Watch } from 'vue-property-decorator'
import Song from '@/assets/utils/song'

@Component
export class PlaylistMixin extends Vue {
  @Getter public playlist!: Song[]

  public mounted() {
    this.handlePlaylist(this.playlist)
  }

  public activated() {
    this.handlePlaylist(this.playlist)
  }

  @Watch('playlist')
  public onChangePlaylist(newVal: any[]) {
    this.handlePlaylist(newVal)
  }

  public handlePlaylist(playlist?: any[]) {
    throw new Error('component must implement handlePlaylist method')
  }
}

@Component
export class PlayerMixin extends Vue {
  @Getter public sequenceList!: Song[]
  @Getter public currentSong!: Song
  @Getter public playlist!: Song[]
  @Getter public mode!: number
  @Getter public favoriteList!: Song[]
  @Mutation(types.SET_PLAYING_STATE) public setPlayingState!: (
    flag: boolean
  ) => void
  @Mutation(types.SET_CURRENT_INDEX) public setCurrentIndex!: (
    index: number
  ) => void
  @Mutation(types.SET_PLAY_MODE) public setPlayMode!: (mode: number) => void
  @Mutation(types.SET_PLAYLIST) public setPlaylist!: (list: Song[]) => void
  @Action public saveFavoriteList!: (song: Song) => void
  @Action public deleteFavoriteList!: (song: Song) => void

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

  public getFavoriteIcon(song: Song) {
    if (this.isFavorite(song)) {
      return 'icon-favorite'
    }
    return 'icon-not-favorite'
  }

  public isFavorite(song: Song) {
    const index = this.favoriteList.findIndex(
      (item: any) => item.id === song.id
    )
    return index > -1
  }

  public toggleFavorite(song: Song) {
    this.isFavorite(song)
      ? this.deleteFavoriteList(song)
      : this.saveFavoriteList(song)
  }

  public changeMode() {
    const mode = (this.mode + 1) % 3
    this.setPlayMode(mode)
    let list: Song[]
    if (mode === playMode.random) {
      list = shuffle(this.sequenceList)
    } else {
      list = this.sequenceList
    }
    this.resetCurrentIndex(list)
    this.setPlaylist(list)
  }

  public resetCurrentIndex(list: Song[]) {
    const index = list.findIndex(item => item.id === this.currentSong.id)
    this.setCurrentIndex(index)
  }
}

@Component
export class SearchMixin extends Vue {
  @Getter public searchHistory!: string[]
  @Action public saveSearchHistory!: (query: string) => void
  @Action public deleteSearchHistory!: () => void

  public query: string = ''
  public refreshDelay: number = 120
  public $refs: any

  public addQuery(query: string) {
    this.$refs.searchBox.setQuery(query)
  }

  public blurInput() {
    this.$refs.searchBox.blur()
  }

  public saveSearch() {
    this.saveSearchHistory(this.query)
  }

  public onQueryChange(query: string) {
    this.query = query.trim()
  }
}
