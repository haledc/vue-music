import { playMode } from '../assets/utils/config'
import { loadSearch } from '../assets/utils/cache'

const state = {
  singer: {},
  playing: false,
  fullScreen: false,
  playlist: [],
  sequenceList: [],
  mode: playMode.sequence,
  currentIndex: -1,
  disc: {},
  topList: {},
  searchHistory: loadSearch() || [],
  playHistory: [],
  favoriteList: []
}

export default state
