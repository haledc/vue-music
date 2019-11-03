<template>
  <div class="search-list" v-show="searches.length">
    <transition-group name="list" tag="ul">
      <li
        :key="item"
        class="search-item"
        v-for="item in searches"
        @click="selectItem(item)"
      >
        <span class="text">{{ item }}</span>
        <span class="icon" @click.stop="deleteOne(item)">
          <i class="icon-delete"></i>
        </span>
      </li>
    </transition-group>
  </div>
</template>

<script>
export default {
  props: {
    // 搜索历史列表
    searches: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    /**
     * 选中搜索历史列表的搜索关键词
     * 基础组件不作业务逻辑，只派发事件和传值
     * @param item
     */
    selectItem(item) {
      this.$emit('select', item)
    },
    /**
     * 删除搜索历史列表的搜索关键词
     * 基础组件不作业务逻辑，只派发事件和传值
     * @param item
     */
    deleteOne(item) {
      this.$emit('delete', item)
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variable.scss';
@import '@/assets/styles/mixin.scss';

.search-list {
  .search-item {
    display: flex;
    align-items: center;
    height: 40px;
    overflow: hidden;

    &.list-enter-active,
    &.list-leave-active {
      transition: all 0.1s;
    }

    &.list-enter,
    &.list-leave-to {
      height: 0;
    }

    .text {
      flex: 1;
      color: $color-text-l;
    }

    .icon {
      @include extend-click;

      .icon-delete {
        font-size: $font-size-small;
        color: $color-text-d;
      }
    }
  }
}
</style>
