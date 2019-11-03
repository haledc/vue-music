<template>
  <div class="loading">
    <img src="@/assets/images/loading.gif" width="24" height="24" />
    <p class="desc">{{ title }}</p>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '正在载入...'
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variable.scss';

.loading {
  width: 100%;
  text-align: center;

  .desc {
    line-height: 20px;
    font-size: $font-size-small;
    color: $color-text-l;
  }
}
</style>
