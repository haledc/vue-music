import { onMounted, watch, computed, onActivated, reactive, ref } from "vue";
import { useStore } from "vuex";
import { playMode } from "../utils/config";
import { shuffle } from "../utils/util";

export function usePlaylist(handlePlaylist) {
  const store = useStore();
  const playlist = computed(() => tore.getters.playlist);

  onMounted(() => {
    handlePlaylist(playlist);
  });

  onActivated(() => {
    handlePlaylist(playlist);
  });

  watch(
    () => playlist,
    (newVal) => handlePlaylist(newVal)
  );

  return {};
}

export function usePlayer() {
  const store = useStore();
  const sequenceList = computed(() => store.getters.sequenceList);
  const currentSong = computed(() => store.getters.currentSong);
  const playlist = computed(() => store.getters.playlist);
  const mode = computed(() => store.getters.mode);
  const favoriteList = computed(() => store.getters.favoriteList);

  const setPlayingState = (flag) => store.commit("SET_PLAYING_STATE", flag);
  const setCurrentIndex = (index) => store.commit("SET_CURRENT_INDEX", index);
  const setPlayMode = (mode) => store.commit("SET_PLAY_MODE", mode);
  const setPlaylist = (list) => store.commit("SET_PLAYLIST", list);

  const saveFavoriteList = (song) => store.dispatch("saveFavoriteList", song);
  const deleteFavoriteList = (song) =>
    store.dispatch("deleteFavoriteList", song);

  const iconMode = computed(() => {
    return mode.value === playMode.sequence
      ? "icon-sequence"
      : mode.value === playMode.loop
      ? "icon-loop"
      : "icon-random";
  });

  const favoriteIcon = computed(() => getFavoriteIcon(currentSong.value));

  function changeMode() {
    const mode = (mode.value + 1) % 3;
    setPlayMode(mode);

    let list;
    if (mode.value === playMode.random) {
      list = shuffle(sequenceList.value);
    } else {
      list = sequenceList.value;
    }

    resetCurrentIndex(list);
    setPlaylist(list);
  }

  function resetCurrentIndex(list) {
    const currentIndex = list.findIndex(
      (item) => item.id === currentSong.value.id
    );
    setCurrentIndex(currentIndex);
  }

  function toggleFavorite(song) {
    if (isFavorite(song)) {
      deleteFavoriteList(song);
    } else {
      saveFavoriteList(song);
    }
  }

  function getFavoriteIcon(song) {
    return isFavorite(song) ? "icon-favorite" : "icon-not-favorite";
  }

  function isFavorite(song) {
    const index = favoriteList.value.findIndex((item) => item.id === song.id);
    return index > -1;
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
    toggleFavorite,
  };
}

export function useSearch() {
  const searchBoxRef = ref(null);

  const saveSearchHistory = (query) =>
    store.dispatch("saveSearchHistory", query);
  const deleteSearchHistory = (query) =>
    store.dispatch("deleteSearchHistory", query);

  const searchState = reactive({
    query: "",
    refreshDelay: 120,
  });

  const searchHistory = computed(() => vm.$store.getters.searchHistory);

  function addQuery(query) {
    searchBoxRef.setQuery(query);
  }

  function blurInput() {
    searchBoxRef.blur();
  }

  function saveSearch() {
    saveSearchHistory(searchState.query);
  }

  function onQueryChange(query) {
    searchState.query = query.trim();
  }

  return {
    searchBoxRef,
    searchState,
    searchHistory,
    addQuery,
    saveSearch,
    onQueryChange,
    deleteSearchHistory,
    blurInput,
  };
}
