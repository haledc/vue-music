<template>
  <div id="app" @touchmove.prevent>
    <!--头部-->
    <m-header/>
    <!--导航栏-->
    <tab/>
    <!--路由-->
    <keep-alive>
      <router-view/>
    </keep-alive>
    <!--播放器-->
    <player/>
  </div>
</template>

<script type="text/ecmascript-6">
  import MHeader from 'components/m-header/m-header'
  import Tab from 'components/tab/tab'
  import Player from 'components/player/player'

  export default {
    components: {
      MHeader,
      Tab,
      Player
    }
  }
</script>

<style scoped lang="stylus" type="text/stylus" rel="stylesheet/stylus">

</style>
