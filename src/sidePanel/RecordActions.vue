<template>
  <div class="wrap">
    <div class="w-content">
      <div class="c-center">
        <div class="button-container">
          <NButton 
            v-if="!isRecording"
            type="primary" 
            size="large"
            @click="handleStartCapture"
            class="capture-button"
          >
            {{ t('start_capture') }}
          </NButton>
          <NButton 
            v-else
            type="error" 
            size="large"
            @click="handleStopCapture"
            class="capture-button"
          >
            {{ t('complete_capture') }}
          </NButton>
        </div>
        <div v-if="isRecording" class="recording-status">
          <div class="recording-indicator"></div>
          <span>{{ t('recording') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import { NButton, useMessage } from "naive-ui";
import { t } from "../utils/i18n";

const message = useMessage();
const isRecording = ref(false);

const handleStartCapture = () => {
  if (isRecording.value) return;
  
  chrome.runtime.sendMessage({
    action: "triggerStartRecord",
    data: {
      labelId: "",
      taskName: "",
      itemId: "",
      index: 0,
      instruct: "",
    },
    isRawHtml: true,
  });
};

const handleStopCapture = () => {
  if (!isRecording.value) return;
  
  isRecording.value = false;
  const recordStatusJSON = localStorage.getItem("RECORD_STATUS");
  if (recordStatusJSON) {
    try {
      const recordStatus = JSON.parse(recordStatusJSON);
      recordStatus.recording = false;
      localStorage.setItem("RECORD_STATUS", JSON.stringify(recordStatus));
    } catch (e) {
      console.error("Failed to update recording status:", e);
    }
  }
  
  chrome.runtime.sendMessage({ action: "triggerFinishRecord" });
  
  message.info(t('complete_capture'));
};

const checkRecordingStatus = () => {
  const recordStatusJSON = localStorage.getItem("RECORD_STATUS");
  if (recordStatusJSON) {
    try {
      const recordStatus = JSON.parse(recordStatusJSON);
      isRecording.value = recordStatus.recording || false;
    } catch (e) {
      isRecording.value = false;
    }
  } else {
    isRecording.value = false;
  }
};

chrome.runtime.onMessage.addListener((msg: any, _sender, _sendResponse) => {
  if (msg.action === "startRecord") {
    isRecording.value = true;
  } else if (msg.action === "finishRecord") {
    isRecording.value = false;
  }
  return false;
});

let interval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  checkRecordingStatus();
  interval = setInterval(checkRecordingStatus, 1000);
});

onUnmounted(() => {
  if (interval) {
    clearInterval(interval);
  }
});
</script>
<style lang="less" scoped>
.wrap {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f7f8fa;
  
  .language-switcher {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 100;
    
    .lang-btn {
      color: #666;
      font-size: 12px;
      padding: 4px 8px;
      
      &:hover {
        color: #1890ff;
        background-color: #f0f8ff;
      }
    }
  }
  
  .w-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .c-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      
      .button-container {
        width: 150px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .capture-button {
          width: 100%;
          height: 100%;
          font-size: 14px;
        }
      }
      
      .recording-status {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 12px;
        color: #ff4d4f;
        font-size: 14px;
        
        .recording-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #ff4d4f;
          animation: pulse 1.5s ease-in-out infinite;
        }
      }
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
