<template>
  <div class="song-list">
    <ul>
      <li
        class="item"
        @click="selectItem(song, index)"
        v-for="(song, index) in songs"
        :key="index"
      >
        <!-- 歌曲排行（有排行才显示） -->
        <div class="rank" v-show="rank">
          <span :class="getRankCls(index)">{{ getRankText(index) }}</span>
        </div>
        <!-- 歌曲内容 -->
        <div class="content">
          <h2 class="name">{{ song.name }}</h2>
          <p class="desc">{{ getDesc(song) }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    songs: {
      type: Array,
      default: () => []
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    function selectItem(item, index) {
      emit('select', item, index)
    }

    function getDesc(song) {
      return `${song.singer} - ${song.album}`
    }

    function getRankCls(index) {
      return index <= 2 ? `icon icon${index}` : 'text'
    }

    function getRankText(index) {
      if (index > 2) {
        return index + 1
      }
    }

    return {
      selectItem,
      getDesc,
      getRankCls,
      getRankText
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variable.scss';
@import '@/assets/styles/mixin.scss';

.song-list {
  .item {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 64px;
    font-size: $font-size-medium;

    .rank {
      flex: 0 0 25px;
      width: 25px;
      margin-right: 30px;
      text-align: center;

      .icon {
        display: inline-block;
        width: 25px;
        height: 24px;
        background-size: 25px 24px;

        &.icon0 {
          @include bg-image('first');
        }

        &.icon1 {
          @include bg-image('second');
        }

        &.icon2 {
          @include bg-image('third');
        }
      }

      .text {
        color: $color-theme;
        font-size: $font-size-large;
      }
    }

    .content {
      flex: 1;
      line-height: 20px;
      overflow: hidden;

      .name {
        @include no-wrap;
        color: $color-text;
      }

      .desc {
        @include no-wrap;
        margin-top: 4px;
        color: $color-text-d;
      }
    }
  }
}
</style>
