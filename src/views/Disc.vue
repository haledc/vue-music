<template>
  <transition appear name="slide">
    <MusicList :title="title" :bg-image="bgImage" :songs="songs" />
  </transition>
</template>

<script>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import MusicList from "@/components/MusicList";
import { getSongList } from "@/request/recommend";
import { ERR_OK } from "@/request/config";
import { processSongsUrl, normalizeSongs } from "@/utils/song";

export default {
  components: {
    MusicList,
  },
  setup(props) {
    const router = useRouter();
    const store = useStore();
    const songs = ref([]);

    const disc = computed(() => store.getters.disc);
    const title = computed(() => disc.value.dissname);
    const bgImage = computed(() => disc.value.imgurl);

    function _getSongList() {
      if (!disc.value.dissid) {
        router.push("/recommend");
        return;
      }
      getSongList(disc.value.dissid).then((res) => {
        if (res.code === ERR_OK) {
          processSongsUrl(normalizeSongs(res.cdlist[0].songlist)).then(
            (val) => (songs.value = val)
          );
        }
      });
    }
    _getSongList();

    return {
      songs,
      title,
      bgImage,
    };
  },
};
</script>

<style scoped lang="scss">
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter,
.slide-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>
