<template>
  <transition name="list-fade">
    <div class="playlist" v-show="isShowFlag" @click="hide">
      <!-- click.stop 阻止点击冒泡-->
      <div class="list-wrapper" @click.stop>
        <!--列表头部-->
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="iconMode" @click="changeMode"></i>
            <span class="text">{{ modeText }}</span>
            <span class="clear" @click="showConfirm"
              ><i class="icon-clear"></i
            ></span>
          </h1>
        </div>
        <!--歌曲列表-滚动组件-->
        <Scroll
          class="list-content"
          :data="sequenceList"
          ref="listContent"
          :refreshDelay="refreshDelay"
        >
          <!--列表过渡动画 子元素需要加 key-->
          <transition-group name="list" tag="ul" ref="list">
            <li
              :key="item.id"
              class="item"
              v-for="(item, index) in sequenceList"
              @click="selectItem(item, index)"
              ref="listItem"
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
        <!--列表操作-添加歌曲-->
        <div class="list-operate">
          <div class="add" @click="addSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到列表</span>
          </div>
        </div>
        <!--列表关闭-->
        <div class="list-close" @click="hide">
          <span>关闭</span>
        </div>
      </div>
      <!--清除确认弹窗组件-->
      <Confirm
        ref="confirm"
        text="是否清空播放列表"
        confirmBtnText="清空"
        @confirm="confirmClear"
      />
      <!--增加歌曲组件-->
      <AddSong ref="addSong" />
    </div>
  </transition>
</template>

<script>
import { mapActions } from 'vuex'

import Scroll from '@/components/Scroll'
import AddSong from '@/components/AddSong'
import Confirm from '@/components/Confirm'

import { playMode } from '@/assets/helpers/config'
import { playerMixin } from '@/assets/helpers/mixin'

export default {
  mixins: [playerMixin],
  components: {
    Scroll,
    Confirm,
    AddSong
  },
  data() {
    return {
      isShowFlag: false,
      refreshDelay: 120 // scroll 延迟刷新时间
    }
  },
  computed: {
    // 播放模式文本
    modeText() {
      return this.mode === playMode.sequence
        ? '顺序播放'
        : this.mode === playMode.random
        ? '随机播放'
        : '单曲循环'
    }
  },
  methods: {
    // 显示播放列表
    show() {
      this.isShowFlag = true
      // 需要重新刷新scroll才能滚动
      setTimeout(() => {
        this.$refs.listContent.refresh()
        this.scrollToCurrent(this.currentSong)
      }, 20)
    },

    // 隐藏播放列表
    hide() {
      this.isShowFlag = false
    },

    // 当前播放的歌曲前面显示播放图标
    getCurrentIcon(item) {
      if (this.currentSong.id === item.id) {
        return 'icon-play'
      } else {
        return ''
      }
    },

    // 选中歌曲，设置为当前索引，并且播放
    selectItem(item, index) {
      // 随机播放需要找到歌曲索引
      if (this.mode === playMode.random) {
        index = this.playlist.findIndex(song => song.id === item.id)
      }
      this.setCurrentIndex(index)
      this.setPlayingState(true)
    },

    // 滚动到当前歌曲（播放歌曲）
    scrollToCurrent(currentSong) {
      // 获得当前歌曲的索引
      const index = this.sequenceList.findIndex(
        song => currentSong.id === song.id
      )
      this.$refs.listContent.scrollToElement(
        this.$refs.list.$el.children[index],
        300
      )
    },

    // 删除歌曲
    deleteOne(item) {
      if (item.deleting) {
        return
      }
      item.deleting = true
      this.deleteSong(item)
      // 如果此时播放列表已经没有歌曲，隐藏列表
      if (!this.playlist.length) {
        this.hide()
      }
      setTimeout(() => {
        item.deleting = false
      }, 300)
    },

    // 显示清除确认窗口
    showConfirm() {
      this.$refs.confirm.show()
    },

    // 清空播放列表
    // 隐藏播放列表
    confirmClear() {
      this.deleteSongList()
      this.hide()
    },

    // 显示增加歌曲组件
    addSong() {
      this.$refs.addSong.show()
    },

    ...mapActions(['deleteSong', 'deleteSongList'])
  },
  watch: {
    // 监听当前歌曲，滚动到新歌曲位置
    currentSong(newSong, oldSong) {
      if (!this.isShowFlag || newSong.id === oldSong.id) {
        return
      }
      setTimeout(() => {
        this.scrollToCurrent(newSong)
      }, 20)
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variable.scss';
@import '@/assets/styles/mixin.scss';

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
