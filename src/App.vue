<template>
  <div id="app" @touchmove.prevent>
    <Header />
    <Tab />
    <KeepAlive>
      <RouterView />
    </KeepAlive>
    <Player />
  </div>
</template>

<script>
import Header from "@/components/Header";
import Tab from "@/components/Tab";
import Player from "@/views/Player";

export default {
  components: {
    Header,
    Tab,
    Player,
  },
};
</script>
