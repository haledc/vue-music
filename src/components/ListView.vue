<template>
  <Scroll
    class="listview"
    :data="data"
    ref="listviewRef"
    :listenScroll="listenScroll"
    :probeType="probeType"
    @scroll="scroll"
  >
    <ul>
      <!-- 歌手列表组 -->
      <li
        v-for="group in data"
        class="list-group"
        ref="listGroupRef"
        :key="group.title"
      >
        <h2 class="list-group-title">{{ group.title }}</h2>
        <ul>
          <!-- 歌手列表组里的歌手 -->
          <li
            @click="selectItem(item)"
            v-for="item in group.items"
            class="list-group-item"
            :key="item.name"
          >
            <img v-lazy="item.avatar" class="avatar" />
            <span class="name">{{ item.name }}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!-- 锚点 -->
    <div
      class="list-shortcut"
      @touchstart="onShortcutTouchStart"
      @touchmove.stop.prevent="onShortcutTouchMove"
    >
      <ul>
        <li
          v-for="(item, index) in shortcutList"
          class="item"
          :class="{ current: state.currentIndex === index }"
          :data-index="index"
          :key="index"
        >
          {{ item }}
        </li>
      </ul>
    </div>
    <!-- 歌手组固定标题栏 -->
    <div class="list-fixed" v-show="fixedTitle" ref="fixedRef">
      <h1 class="fixed-title">{{ fixedTitle }}</h1>
    </div>
    <div class="loading-container" v-show="!data.length">
      <Loading />
    </div>
  </Scroll>
</template>

<script>
import { reactive, computed, watch } from "vue";
import Scroll from "@/components/Scroll";
import Loading from "@/components/Loading";
import { getData } from "@/utils/dom";

const ANCHOR_HEIGHT = 18;
const TITLE_HEIGHT = 30;

export default {
  components: {
    Scroll,
    Loading,
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
  setup(props, { emit }) {
    const touch = {};
    const listenScroll = true;
    let listHeight = [];
    const probeType = 3;
    let fixedTop = 0;

    const state = reactive({
      scrollY: -1,
      currentIndex: 0,
      diff: -1,
    });

    const fixedRef = ref(null);
    const listviewRef = ref(null);
    const listGroupRef = ref(null);

    const shortcutList = computed(() =>
      props.data.map((group) => group.title.substr(0, 1))
    );

    const fixedTitle = computed(() => {
      if (state.scrollY > 0) {
        return;
      }
      return props.data[state.currentIndex]
        ? props.data[state.currentIndex].title
        : "";
    });

    watch(
      () => props.data,
      () => {
        setTimeout(() => {
          _calculateHeight();
        }, 20);
      }
    );

    watch(
      () => state.scrollY,
      (newY) => {
        if (newY > 0) {
          state.currentIndex = 0;
          return;
        }

        for (let i = 0; i < listHeight.length - 1; i++) {
          let height1 = listHeight[i];
          let height2 = listHeight[i + 1];
          if (-newY >= height1 && -newY < height2) {
            state.currentIndex = i;
            state.diff = height2 + newY;
            return;
          }
        }

        state.currentIndex = listHeight.length - 2;
      }
    );

    watch(
      () => state.diff,
      (newVal) => {
        let fixedTopVal =
          newVal > 0 && newVal < TITLE_HEIGHT ? newVal - TITLE_HEIGHT : 0;
        if (fixedTop === fixedTopVal) return;
        fixedTop = fixedTopVal;
        fixedRef.value.style.transform = `translate3d(0, ${fixedTopVal}px, 0)`;
      }
    );

    function onShortcutTouchStart(event) {
      const anchorIndex = getData(event.target, "index");
      const firstTouch = event.touches[0];
      touch.y1 = firstTouch.pageY;
      touch.anchorIndex = anchorIndex;
      _scrollTo(anchorIndex);
    }

    function onShortcutTouchMove(event) {
      const firstTouch = event.touches[0];
      touch.y2 = firstTouch.pageY;
      const delta = ((touch.y2 - touch.y1) / ANCHOR_HEIGHT) | 0;
      const anchorIndex = parseInt(touch.anchorIndex) + delta;
      _scrollTo(anchorIndex);
    }

    function refresh() {
      listviewRef.value.refresh();
    }

    function scroll(pos) {
      state.scrollY = pos.y;
    }

    function selectItem(item) {
      emit("select", item);
    }

    function _scrollTo(index) {
      if (!index && index !== 0) return;
      if (index < 0) {
        index = 0;
      } else if (index > listHeight.length - 2) {
        index = listHeight.length - 2;
      }
      state.scrollY = -listHeight[index];
      listviewRef.value.scrollToElement(listGroupRef[index], 0);
    }

    function _calculateHeight() {
      listHeight = [];
      const list = listGroupRef;
      let height = 0;
      listHeight.push(height);
      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        height += item.clientHeight;
        listHeight.push(height);
      }
    }

    return {
      listviewRef,
      listGroupRef,
      fixedRef,
      state,
      listenScroll,
      probeType,
      shortcutList,
      fixedTitle,
      scroll,
      refresh,
      selectItem,
      onShortcutTouchStart,
      onShortcutTouchMove,
    };
  },
};
</script>

<style scoped lang="scss">
@import "@/assets/styles/variable.scss";

.listview {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $color-background;

  .list-group {
    padding-bottom: 30px;

    .list-group-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }

    .list-group-item {
      display: flex;
      align-items: center;
      padding: 20px 0 0 30px;

      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }

      .name {
        margin-left: 20px;
        color: $color-text-l;
        font-size: $font-size-medium;
      }
    }
  }

  .list-shortcut {
    position: absolute;
    z-index: 30;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    padding: 20px 0;
    border-radius: 10px;
    text-align: center;
    background: $color-background-d;
    font-family: Helvetica;

    .item {
      padding: 3px;
      line-height: 1;
      color: $color-text-l;
      font-size: $font-size-small;

      &.current {
        color: $color-theme;
      }
    }
  }

  .list-fixed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;

    .fixed-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
  }

  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
