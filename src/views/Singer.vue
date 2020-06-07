<template>
  <div class="singer" ref="singerRef">
    <ListView @select="selectSinger" :data="singers" ref="listRef" />
    <router-view />
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import ListView from "@/components/ListView";
import Singer from "@/utils/singer";
import { getSingerList } from "@/request/singer";
import { ERR_OK } from "@/request/config";
import { usePlaylist, useMutations } from "@/hooks";

const HOT_NAME = "热门";
const HOT_SINGER_LEN = 10;

export default {
  components: {
    ListView,
  },
  setup(props) {
    const router = useRouter();
    const store = useStore();
    const setSinger = (singer) => store.commit("SET_SINGER", singer);

    const singers = ref([]);
    const singerRef = ref(null);
    const listRef = ref(null);

    function handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? "60px" : "";
      singerRef.value.style.bottom = bottom;
      listRef.value.refresh();
    }

    usePlaylist(handlePlaylist);

    function _getSingerList() {
      getSingerList().then((res) => {
        if (res.code === ERR_OK) {
          singers.value = _normalizeSinger(res.data.list);
        }
      });
    }

    _getSingerList();

    function _normalizeSinger(list) {
      let map = {
        hot: {
          title: HOT_NAME,
          items: [],
        },
      };

      list.forEach((item, index) => {
        if (index < HOT_SINGER_LEN) {
          // 热门
          map.hot.items.push(
            new Singer({
              id: item.Fsinger_mid,
              name: item.Fsinger_name,
            })
          );
        }

        // key 为 [A-Z]
        const key = item.Findex;

        if (!map[key]) {
          map[key] = {
            title: key,
            items: [],
          };
        }

        map[key].items.push(
          new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name,
          })
        );
      });

      // 排序
      let hot = [];
      let ret = [];
      for (let key in map) {
        let val = map[key];
        if (val.title.match(/[a-zA-Z]/)) {
          ret.push(val);
        } else if (val.title === HOT_NAME) {
          hot.push(val);
        }
      }
      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0);
      });
      return hot.concat(ret);
    }

    function selectSinger(singer) {
      router.push({
        path: `/singer/${singer.id}`,
      });
      setSinger(singer);
    }

    return {
      singerRef,
      listRef,
      singers,
      selectSinger,
    };
  },
};
</script>

<style scoped lang="scss">
.singer {
  position: fixed;
  top: 88px;
  bottom: 0;
  width: 100%;
}
</style>
