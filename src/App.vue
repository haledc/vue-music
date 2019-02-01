<template>
  <div id="app">
    <Header />
    <Tab />
    <keep-alive>
      <router-view />
    </keep-alive>
    <Player />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Header from '@/components/Header.vue'
import Tab from '@/components/Tab.vue'
import Player from '@/views/Player.vue'

@Component({
  components: {
    Header,
    Tab,
    Player
  }
})
export default class App extends Vue {}
</script>
