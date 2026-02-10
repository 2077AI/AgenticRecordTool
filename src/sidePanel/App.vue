<template>
  <div class="wrap">
    <n-message-provider>
      <RecordActions />
    </n-message-provider>
  </div>
</template>
<script setup lang="ts">
import { NMessageProvider } from "naive-ui";
import RecordActions from "./RecordActions.vue";

</script>
<style lang="less" scoped>
.wrap {
  width: 280px;
  height: 230px;
}
</style>
