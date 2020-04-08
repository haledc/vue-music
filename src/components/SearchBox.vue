<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input
      class="box"
      v-model="query"
      :placeholder="placeholder"
      ref="inputRef"
    />
    <i @click="clear" class="icon-dismiss" v-show="query"></i>
  </div>
</template>

<script>
import { ref, watch } from '@vue/composition-api'
import { debounce } from '@/utils/util'

export default {
  props: {
    placeholder: {
      type: String,
      default: '搜索歌曲、歌手'
    }
  },
  setup(props, { emit, refs }) {
    const query = ref('')

    watch(
      () => query.value,
      newVal => {
        debounce(emit('query', newVal), 200)
      }
    )

    function clear() {
      query.value = ''
    }

    function setQuery(val) {
      query.value = val
    }

    function blur() {
      refs.inputRef.blur()
    }

    return {
      query,
      clear,
      setQuery,
      blur
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variable.scss';

.search-box {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  padding: 0 6px;
  height: 40px;
  background: $color-highlight-background;
  border-radius: 6px;

  .icon-search {
    font-size: 24px;
    color: $color-background;
  }

  .box {
    flex: 1;
    margin: 0 5px;
    line-height: 18px;
    background: $color-highlight-background;
    color: $color-text;
    font-size: $font-size-medium;
    outline: 0;

    &::placeholder {
      color: $color-text-d;
    }
  }

  .icon-dismiss {
    font-size: 16px;
    color: $color-background;
  }
}
</style>
