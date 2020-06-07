<template>
  <!-- 滚动组件 -->
  <Scroll
    class="suggest"
    :data="state.result"
    :pullup="state.pullup"
    :beforeScroll="state.beforeScroll"
    ref="suggestRef"
    @beforeScroll="listScroll"
    @scrollToEnd="searchMore"
  >
    <!-- 搜索列表结果 -->
    <ul class="suggest-list">
      <li
        class="suggest-item"
        @click="selectItem(item)"
        v-for="(item, index) in state.result"
        :key="index"
      >
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <!-- 上拉刷新时加载图标，出现在最下面 -->
      <Loading v-show="state.hasMore" title="" />
    </ul>
    <!-- 无搜索结果情况-无结果组件 -->
    <div
      class="no-result-wrapper"
      v-show="!state.hasMore && !state.result.length"
    >
      <NoResult title="抱歉，暂无搜索结果" />
    </div>
  </Scroll>
</template>

<script>
import { reactive, watch, ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import Scroll from "@/components/Scroll";
import Loading from "@/components/Loading";
import NoResult from "@/components/NoResult";
import Singer from "@/utils/singer";
import { genResult, checkMore } from "@/utils/search";
import { search } from "@/request/search";
import { ERR_OK } from "@/request/config";

const TYPE_SINGER = "singer";
const PER_PAGE = 20;

export default {
  components: {
    Scroll,
    Loading,
    NoResult,
  },
  props: {
    query: {
      type: String,
      default: "",
    },
    showSinger: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { emit }) {
    const router = useRouter();
    const store = useStore();
    const setSinger = (singer) => store.commit("SET_SINGER", singer);
    const insertSong = (song) => store.dispatch("insertSong", song);

    const state = reactive({
      page: 1,
      result: [],
      pullup: true,
      hasMore: true,
      beforeScroll: true,
    });

    const suggestRef = ref(null);

    watch(
      () => props.query,
      (newVal) => {
        if (!newVal) return;
        _search();
      }
    );

    function _search() {
      state.page = 1;
      state.hasMore = true;
      suggestRef.value.scrollTo(0, 0);
      search(props.query, state.page, props.showSinger, PER_PAGE).then(
        (res) => {
          if (res.code === ERR_OK) {
            genResult(res.data, state.page).then((result) => {
              state.result = result;
              state.hasMore = checkMore(res.data);
            });
          }
        }
      );
    }

    function searchMore() {
      if (!state.hasMore) return;
      state.page++;
      search(props.query, state.page, props.showSinger, PER_PAGE).then(
        (res) => {
          if (res.code === ERR_OK) {
            genResult(res.data, state.page).then((result) => {
              state.result = state.result.concat(result);
              state.hasMore = checkMore(res.data);
            });
          }
        }
      );
    }

    function getIconCls(item) {
      return item.type === TYPE_SINGER ? "icon-mine" : "icon-music";
    }

    function getDisplayName(item) {
      return item.type === TYPE_SINGER
        ? item.singername
        : `${item.name}-${item.singer}`;
    }

    function selectItem(item) {
      if (item.type === TYPE_SINGER) {
        const singer = new Singer({
          id: item.singermid,
          name: item.singername,
        });
        router.push({
          path: `/search/${singer.id}`,
        });
        setSinger(singer);
      } else {
        insertSong(item);
      }
      emit("select");
    }

    function listScroll() {
      emit("listScroll");
    }

    function refresh() {
      suggestRef.value.refresh();
    }

    return {
      state,
      suggestRef,
      refresh,
      listScroll,
      searchMore,
      selectItem,
      getIconCls,
      getDisplayName,
    };
  },
};
</script>

<style scoped lang="scss">
@import "@/assets/styles/variable.scss";
@import "@/assets/styles/mixin.scss";

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

      [class^="icon-"] {
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
