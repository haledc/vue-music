import {
  onMounted,
  watch,
  computed,
  onActivated,
  reactive
} from '@vue/composition-api'
import { playMode } from '../utils/config'
import { shuffle } from '../utils/util'

export function usePlaylist(vm, handlePlaylist) {
  const playlist = computed(() => vm.$store.getters.playlist)

  onMounted(() => {
    handlePlaylist(playlist)
  })

  onActivated(() => {
    handlePlaylist(playlist)
  })

  watch(() => playlist, newVal => handlePlaylist(newVal), { lazy: true })

  return {}
}

export function usePlayer(vm) {
  const sequenceList = computed(() => vm.$store.getters.sequenceList)
  const currentSong = computed(() => vm.$store.getters.currentSong)
  const playlist = computed(() => vm.$store.getters.playlist)
  const mode = computed(() => vm.$store.getters.mode)
  const favoriteList = computed(() => vm.$store.getters.favoriteList)

  const setPlayingState = useMutations(vm, 'SET_PLAYING_STATE')
  const setCurrentIndex = useMutations(vm, 'SET_CURRENT_INDEX')
  const setPlayMode = useMutations(vm, 'SET_PLAY_MODE')
  const setPlaylist = useMutations(vm, 'SET_PLAYLIST')

  const saveFavoriteList = useActions(vm, 'saveFavoriteList')
  const deleteFavoriteList = useActions(vm, 'deleteFavoriteList')

  const iconMode = computed(() => {
    return mode.value === playMode.sequence
      ? 'icon-sequence'
      : mode.value === playMode.loop
      ? 'icon-loop'
      : 'icon-random'
  })

  const favoriteIcon = computed(() => getFavoriteIcon(currentSong.value))

  function changeMode() {
    const mode = (mode.value + 1) % 3
    setPlayMode(mode)

    let list
    if (mode.value === playMode.random) {
      list = shuffle(sequenceList.value)
    } else {
      list = sequenceList.value
    }

    resetCurrentIndex(list)
    setPlaylist(list)
  }

  function resetCurrentIndex(list) {
    const currentIndex = list.findIndex(
      item => item.id === currentSong.value.id
    )
    setCurrentIndex(currentIndex)
  }

  function toggleFavorite(song) {
    if (isFavorite(song)) {
      deleteFavoriteList(song)
    } else {
      saveFavoriteList(song)
    }
  }

  function getFavoriteIcon(song) {
    return isFavorite(song) ? 'icon-favorite' : 'icon-not-favorite'
  }

  function isFavorite(song) {
    const index = favoriteList.value.findIndex(item => item.id === song.id)
    return index > -1
  }

  return {
    sequenceList,
    currentSong,
    playlist,
    mode,
    favoriteList,
    setPlayingState,
    setCurrentIndex,
    setPlayMode,
    setPlaylist,
    saveFavoriteList,
    deleteFavoriteList,
    iconMode,
    favoriteIcon,
    changeMode,
    getFavoriteIcon,
    toggleFavorite
  }
}

export function useSearch(vm, refs) {
  const saveSearchHistory = useActions(vm, 'saveSearchHistory')
  const deleteSearchHistory = useActions(vm, 'deleteSearchHistory')

  const _state = reactive({
    query: '',
    refreshDelay: 120
  })

  const searchHistory = computed(() => vm.$store.getters.searchHistory)

  function addQuery(query) {
    refs.searchBox.setQuery(query)
  }

  function blurInput() {
    refs.searchBox.blur()
  }

  function saveSearch() {
    saveSearchHistory(_state.query)
  }

  function onQueryChange(query) {
    console.log(query.value)
    _state.query = query.value.trim()
  }

  return {
    _state,
    searchHistory,
    addQuery,
    saveSearch,
    onQueryChange,
    deleteSearchHistory,
    blurInput
  }
}

export function useMutations(vm, type) {
  return payload => {
    vm.$store.commit(type, payload)
  }
}

export function useActions(vm, type) {
  return payload => {
    vm.$store.dispatch(type, payload)
  }
}
