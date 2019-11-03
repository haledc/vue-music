<template>
  <div class="m-header">
    <!--LOGO-->
    <div class="icon"></div>
    <!--文本-->
    <h1 class="text">{{ title }}</h1>
    <!--个人中心-->
    <router-link tag="div" class="mine" to="/user">
      <i class="icon-mine" />
    </router-link>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: 'Chicken Music'
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variable.scss';
@import '@/assets/styles/mixin.scss';

.m-header {
  position: relative;
  height: 44px;
  text-align: center;
  color: $color-theme;
  font-size: 0;

  .icon {
    display: inline-block;
    vertical-align: top;
    margin-top: 6px;
    width: 30px;
    height: 32px;
    margin-right: 9px;
    @include bg-image('logo');
    background-size: 30px 32px;
  }

  .text {
    display: inline-block;
    vertical-align: top;
    line-height: 44px;
    font-size: $font-size-large;
  }

  .mine {
    position: absolute;
    top: 0;
    right: 0;

    .icon-mine {
      display: block;
      padding: 12px;
      font-size: 20px;
      color: $color-theme;
    }
  }
}
</style>
