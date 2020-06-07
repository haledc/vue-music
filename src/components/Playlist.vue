<template>
  <transition name="list-fade">
    <div class="playlist" v-show="state.isShowFlag" @click="hide">
      <!-- click.stop 阻止点击冒泡-->
      <div class="list-wrapper" @click.stop>
        <!-- 列表头部 -->
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="iconMode" @click="changeMode"></i>
            <span class="text">{{ modeText }}</span>
            <span class="clear" @click="showConfirm"
              ><i class="icon-clear"></i
            ></span>
          </h1>
        </div>
        <!-- 歌曲列表-滚动组件 -->
        <Scroll
          class="list-content"
          :data="sequenceList"
          ref="listContentRef"
          :refreshDelay="state.refreshDelay"
        >
          <!-- 列表过渡动画 子元素需要加 key -->
          <transition-group name="list" tag="ul" ref="listRefRef">
            <li
              :key="item.id"
              class="item"
              v-for="(item, index) in sequenceList"
              @click="selectItem(item, index)"
              ref="listItemRef"
            >
              <i class="current" :class="getCurrentIcon(item)"></i>
              <span class="text">{{ item.name }}</span>
              <span class="like" @click.stop="toggleFavorite(item)">
                <i :class="getFavoriteIcon(item)"></i>
              </span>
              <span class="delete" @click.stop="deleteOne(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </Scroll>
        <!-- 列表操作-添加歌曲 -->
        <div class="list-operate">
          <div class="add" @click="addSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到列表</span>
          </div>
        </div>
        <!-- 列表关闭 -->
        <div class="list-close" @click="hide">
          <span>关闭</span>
        </div>
      </div>
      <!-- 清除确认弹窗组件 -->
      <Confirm
        ref="confirmRef"
        text="是否清空播放列表"
        confirmBtnText="清空"
        @confirm="confirmClear"
      />
      <!-- 增加歌曲组件 -->
      <AddSong ref="addSongRef" />
    </div>
  </transition>
</template>

<script>
import { reactive, computed, watch, ref } from "vue";
import { useStore } from "vuex";
import Scroll from "@/components/Scroll";
import AddSong from "@/components/AddSong";
import Confirm from "@/components/Confirm";
import { playMode } from "@/utils/config";
import { usePlayer } from "@/hooks";

export default {
  components: {
    Scroll,
    Confirm,
    AddSong,
  },
  setup(props) {
    const store = useStore();
    const deleteSong = (song) => store.dispatch("deleteSong", song);
    const deleteSongList = () => store.dispatch("deleteSongList");

    const state = reactive({
      isShowFlag: false,
      refreshDelay: 120,
    });

    const listContentRef = ref(null);
    const listRefRef = ref(null);
    const listItemRef = ref(null);
    const confirmRef = ref(null);
    const addSongRef = ref(null);

    const {
      sequenceList,
      currentSong,
      playlist,
      mode,
      iconMode,
      getFavoriteIcon,
      changeMode,
      setPlayingState,
      setCurrentIndex,
      toggleFavorite,
    } = usePlayer();

    const modeText = computed(() => {
      return mode.value === playMode.sequence
        ? "顺序播放"
        : mode.value === playMode.random
        ? "随机播放"
        : "单曲循环";
    });

    watch(
      () => currentSong,
      (newSong, oldSong) => {
        if (!state.isShowFlag || newSong.id === oldSong.id) return;
        setTimeout(() => {
          scrollToCurrent(newSong);
        }, 20);
      }
    );

    function show() {
      state.isShowFlag = true;
      setTimeout(() => {
        listContentRef.value.refresh();
        scrollToCurrent(currentSong);
      }, 20);
    }

    function hide() {
      state.isShowFlag = false;
    }

    function getCurrentIcon(item) {
      if (currentSong.id === item.id) {
        return "icon-play";
      } else {
        return "";
      }
    }

    function selectItem(item, index) {
      if (mode === playMode.random) {
        index = playlist.findIndex((song) => song.id === item.id);
      }
      setCurrentIndex(index);
      setPlayingState(true);
    }

    function scrollToCurrent(currentSong) {
      const index = sequenceList.findIndex(
        (song) => currentSong.id === song.id
      );
      listContentRef.value.scrollToElement(
        listRef.value.$el.children[index],
        300
      );
    }

    function deleteOne(item) {
      if (item.deleting) return;
      item.deleting = true;
      deleteSong(item);
      if (!playlist.length) {
        hide();
      }
      setTimeout(() => {
        item.deleting = false;
      }, 300);
    }

    function showConfirm() {
      confirmRef.value.show();
    }

    function confirmClear() {
      deleteSongList();
      hide();
    }

    function addSong() {
      addSongRef.value.show();
    }

    return {
      state,
      listContentRef,
      listRefRef,
      listItemRef,
      confirmRef,
      addSongRef,
      sequenceList,
      modeText,
      iconMode,
      hide,
      changeMode,
      showConfirm,
      selectItem,
      getCurrentIcon,
      toggleFavorite,
      getFavoriteIcon,
      deleteOne,
      addSong,
      confirmClear,
    };
  },
};
</script>

<style scoped lang="scss">
@import "@/assets/styles/variable.scss";
@import "@/assets/styles/mixin.scss";

.playlist {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 200;
  background-color: $color-background-d;

  &.list-fade-enter-active,
  &.list-fade-leave-active {
    transition: opacity 0.3s;

    .list-wrapper {
      transition: all 0.3s;
    }
  }

  &.list-fade-enter,
  &.list-fade-leave-to {
    opacity: 0;

    .list-wrapper {
      transform: translate3d(0, 100%, 0);
    }
  }

  &.list-fade-enter,
  .list-wrapper {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: $color-highlight-background;

    .list-header {
      position: relative;
      padding: 20px 30px 10px 20px;

      .title {
        display: flex;
        align-items: center;

        .icon {
          margin-right: 10px;
          font-size: 30px;
          color: $color-theme-d;
        }

        .text {
          flex: 1;
          font-size: $font-size-medium;
          color: $color-text-l;
        }

        .clear {
          @include extend-click;

          .icon-clear {
            font-size: $font-size-medium;
            color: $color-text-d;
          }
        }
      }
    }

    .list-content {
      max-height: 240px;
      overflow: hidden;

      .item {
        display: flex;
        align-items: center;
        height: 40px;
        padding: 0 30px 0 20px;
        overflow: hidden;

        &.list-enter-active,
        &.list-leave-active {
          transition: all 0.1s;
        }

        &.list-enter,
        &.list-leave-to {
          height: 0;
        }

        .current {
          flex: 0 0 20px;
          width: 20px;
          font-size: $font-size-small;
          color: $color-theme-d;
        }

        .text {
          flex: 1;
          @include no-wrap;
          font-size: $font-size-medium;
          color: $color-text-d;
        }

        .like {
          @include extend-click();
          margin-right: 15px;
          font-size: $font-size-small;
          color: $color-theme;

          .icon-favorite {
            color: $color-sub-theme;
          }
        }

        .delete {
          @include extend-click();
          font-size: $font-size-small;
          color: $color-theme;
        }
      }
    }

    .list-operate {
      width: 140px;
      margin: 20px auto 30px auto;

      .add {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        border: 1px solid $color-text-l;
        border-radius: 100px;
        color: $color-text-l;

        .icon-add {
          margin-right: 5px;
          font-size: $font-size-small-s;
        }

        .text {
          font-size: $font-size-small;
        }
      }
    }

    .list-close {
      text-align: center;
      line-height: 50px;
      background: $color-background;
      font-size: $font-size-medium-x;
      color: $color-text-l;
    }
  }
}
</style>
