import Song from '../utils/song'
import { playMode } from '../utils/config'
import { loadSearch } from '../utils/cache'

export interface State {
  singer: object
  playing: boolean
  fullScreen: boolean
  playlist: Song[]
  sequenceList: Song[]
  mode: number
  currentIndex: number
  disc: object
  topList: Song[]
  searchHistory: string[]
  playHistory: Song[]
  favoriteList: Song[]
}

const state: State = {
  singer: {},
  playing: false,
  fullScreen: false,
  playlist: [],
  sequenceList: [],
  mode: playMode.sequence,
  currentIndex: -1,
  disc: {},
  topList: [],
  searchHistory: loadSearch(),
  playHistory: [],
  favoriteList: []
}

export default state
