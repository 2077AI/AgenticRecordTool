<template>
  <div class="w-video">
    <div class="w-video-title">
      <span>{{ recordingScreen }}</span>
    </div>
    <div class="w-video-container">
      <div id="video-container"></div>
    </div>
    <div class="w-video-time">
      {{ (currentTime * 1000).toFixed(0) + "ms" }}
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  currentTime: number;
  recordingScreen: string;
}>();
</script>

<style lang="less" scoped>
.w-video {
  flex: 5;
  min-width: 300px;
  width: 100%;
  height: 100%;
  align-self: stretch;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  font-size: 14px;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  .w-video-title {
    font-size: 20px;
    line-height: 24px;
    font-weight: 600;
    color: #1f2937;
    line-height: 24px; 
    margin-bottom: 16px;
    text-align: left;
  }
  .w-video-container {
    flex: 1;
    border: 1px solid #E6E6E6;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .w-video-time {
    text-align: left;
    width: fit-content;
    color: #000;
    font-family: "PingFang SC";
    font-size: 16px;
    font-weight: 400;
    padding: 2px 16px;
    line-height: 20px;
    letter-spacing: 1px;
    margin-top: 12px;
    border-radius: 6px;
    border: 1px solid #E6E6E6;
    background: #F4F4F4;
  }
}
</style>

