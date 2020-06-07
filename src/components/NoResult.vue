<template>
  <div class="no-result">
    <div class="no-result-icon"></div>
    <p class="no-result-text">{{ title }}</p>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: "",
    },
  },
};
</script>

<style scoped lang="scss">
@import "@/assets/styles/variable.scss";
@import "@/assets/styles/mixin.scss";

.no-result {
  text-align: center;

  &-icon {
    width: 86px;
    height: 90px;
    margin: 0 auto;
    @include bg-image("no-result");
    background-size: 86px 90px;
  }

  &-text {
    margin-top: 30px;
    font-size: $font-size-medium;
    color: $color-text-d;
  }
}
</style>
