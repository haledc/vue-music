<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input class="box" v-model="query" :placeholder="placeholder" ref="query" />
    <i @click="clear" class="icon-dismiss" v-show="query"></i>
  </div>
</template>

<script>
import { debounce } from '@/assets/helpers/util'

export default {
  props: {
    // 占位符
    placeholder: {
      type: String,
      default: '搜索歌曲、歌手'
    }
  },
  data() {
    return {
      query: ''
    }
  },
  created() {
    // query变化时，派发事件，并把新值传出
    // 需要处理派发事件的时间间隔，节省流量
    // 不用每次一变化就派发事件，导致父组件不停的搜索数据
    this.$watch(
      'query',
      debounce(newQuery => {
        this.$emit('query', newQuery)
      }, 200)
    )
  },
  methods: {
    // 清空搜索栏
    clear() {
      this.query = ''
    },

    // 设置搜索栏
    setQuery(query) {
      this.query = query
    },

    // 在滚动之前，隐藏手机端的输入键盘
    // 只有在手机端才有效
    blur() {
      this.$refs.query.blur()
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
