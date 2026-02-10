<template>
    <div  class="loading-overlay" >
      <div class="loading-content">
        <div class="loading-spinner">
          <div v-for="i in 12" :key="i" class="spinner-blade"></div>
        </div>
        <div class="loading-text">{{ t('loading_data') }}</div>
      </div>
    </div>
</template>
<script setup lang="ts">
import { t } from '../utils/i18n'
</script>
<style scoped>
.loading-overlay {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.3s;
  position: fixed;
  z-index: 1000;
  background-color: #000;
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  position: relative;
  width: 60px;
  height: 60px;
  margin: 0 auto;
}

.spinner-blade {
  position: absolute;
  left: 44.5%;
  top: 37%;
  width: 10%;
  height: 25%;
  border-radius: 50%/20%;
  background-color: #fff;
  animation: spinner-fade 1s linear infinite;
  animation-delay: calc(var(--n) * 0.08333s);
}

.spinner-blade:nth-child(1) { --n: 1; transform: rotate(30deg) translate(0, -150%); }
.spinner-blade:nth-child(2) { --n: 2; transform: rotate(60deg) translate(0, -150%); }
.spinner-blade:nth-child(3) { --n: 3; transform: rotate(90deg) translate(0, -150%); }
.spinner-blade:nth-child(4) { --n: 4; transform: rotate(120deg) translate(0, -150%); }
.spinner-blade:nth-child(5) { --n: 5; transform: rotate(150deg) translate(0, -150%); }
.spinner-blade:nth-child(6) { --n: 6; transform: rotate(180deg) translate(0, -150%); }
.spinner-blade:nth-child(7) { --n: 7; transform: rotate(210deg) translate(0, -150%); }
.spinner-blade:nth-child(8) { --n: 8; transform: rotate(240deg) translate(0, -150%); }
.spinner-blade:nth-child(9) { --n: 9; transform: rotate(270deg) translate(0, -150%); }
.spinner-blade:nth-child(10) { --n: 10; transform: rotate(300deg) translate(0, -150%); }
.spinner-blade:nth-child(11) { --n: 11; transform: rotate(330deg) translate(0, -150%); }
.spinner-blade:nth-child(12) { --n: 12; transform: rotate(360deg) translate(0, -150%); }

@keyframes spinner-fade {
  0% { opacity: 0.85; }
  50% { opacity: 0.25; }
  100% { opacity: 0.25; }
}

.loading-text {
  margin-top: 16px;
  color: #fff;
  font-size: 14px;
}
</style>