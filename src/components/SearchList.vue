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
    searches: {
      type: Array,
      default: () => []
    }
  },
  setup(props, { emit }) {
    function selectItem(item) {
      emit('select', item)
    }

    function deleteOne(item) {
      emit('delete', item)
    }

    return {
      selectItem,
      deleteOne
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
