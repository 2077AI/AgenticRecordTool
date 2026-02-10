<template>
  <div class="l-item">
      <div class="i-inneractions" @mousedown="handleContainerMouseDown">
      <div class="i-innerItem">
        <div class="i-top">
          <div class="h-left">
            <NCheckbox
              v-if="!disabled && !isSubAction && !isRecycleBin"
              :checked="checked"
              @update:checked="handleToggle"
              @click.stop="handleCheckboxClick"
            />
            <NCheckbox
              v-else-if="!isSubAction && !isRecycleBin"
              :checked="false"
              disabled
            />
            <div class="h-index" :class="{ 'h-index-sub': isSubAction }">{{ action.order !== undefined ? action.order : index + 1 }}</div>
            <div>
              <span class="event-label">{{ i18nTexts.eventType }}: </span>{{ action.type }}, <span class="event-label">{{ i18nTexts.timeLabel }}: </span>{{ action.time }}ms
            </div>
          </div>
          <div class="button-wrap">
            <NButton
              class="action-button action-button-normal"
              @click="handleOpenTab"
            >
              {{ i18nTexts.openLink }}
            </NButton>

            <NButton
              class="action-button action-button-normal"
              @click="handleCheck"
            >{{ i18nTexts.viewButton }}
            </NButton>

            <NButton
              v-if="!isRecycleBin"
              class="action-button action-button-error"
              @click="handleRemove"
            >{{ i18nTexts.removeButton }}
            </NButton>

            <NButton
              v-if="isRecycleBin"
              class="action-button action-button-error"
              @click="handleRestore"
            >{{ i18nTexts.restore }}
            </NButton>
          </div>
        </div>
        <div v-if="action.info" class="i-info">
          <div class="i-info-item">
            <div>{{ i18nTexts.contentLabel }}: </div>
            <div>{{ action.info.data }}</div>
          </div>
          <div class="i-info-item">
            <div>{{ i18nTexts.xpathLabel }}: </div>
            <div style="width: 100%; word-break: break-word">
              {{ action.info.target?.xPath }}
            </div>
          </div>
          <div v-if="action.type === EventTypes.KEY_DOWN" class="i-info-item">
            <div>{{ i18nTexts.altKeyLabel }}: </div>
            <div>{{ action.info.altKey }}</div>
          </div>
          <div v-if="action.type === EventTypes.KEY_DOWN" class="i-info-item">
            <div>{{ i18nTexts.ctrlKeyLabel }}: </div>
            <div>{{ action.info.ctrlKey }}</div>
          </div>
          <div v-if="action.type === EventTypes.KEY_DOWN" class="i-info-item">
            <div>{{ i18nTexts.metaKeyLabel }}: </div>
            <div>{{ action.info.metaKey }}</div>
          </div>
          <div v-if="action.type === EventTypes.KEY_DOWN" class="i-info-item">
            <div>{{ i18nTexts.keyLabel }}: </div>
            <div>{{ action.info.key }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { NButton, NCheckbox } from 'naive-ui';
import { EventTypes } from '../../../types';
import { t } from '../../../utils/i18n';

interface Props {
  action: any;
  index: number;
  checked?: boolean;
  disabled?: boolean;
  isSubAction?: boolean;
  isRecycleBin?: boolean;
}

interface Emits {
  (e: 'toggle', checked: boolean, event?: MouseEvent): void;
  (e: 'openTab', url: string): void;
  (e: 'check', time: number): void;
  (e: 'remove'): void;
  (e: 'restore'): void;
}

const props = withDefaults(defineProps<Props>(), {
  checked: false,
  disabled: false,
  isSubAction: false,
  isRecycleBin: false
});

const emit = defineEmits<Emits>();

const i18nTexts = computed(() => ({
  eventType: t('event_type'),
  timeLabel: t('time_label'),
  openLink: t('open_link'),
  viewButton: t('view_button'),
  removeButton: t('remove_button'),
  contentLabel: t('content_label'),
  xpathLabel: t('xpath_label'),
  altKeyLabel: t('alt_key_label'),
  ctrlKeyLabel: t('ctrl_key_label'),
  metaKeyLabel: t('meta_key_label'),
  keyLabel: t('key_label'),
  restore: t('restore')
}));

let clickEvent: MouseEvent | undefined;
let containerMouseDownEvent: MouseEvent | undefined;

const handleContainerMouseDown = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.closest('.n-checkbox') || target.closest('.h-left')) {
    containerMouseDownEvent = event;
  }
};

const handleCheckboxClick = (event: MouseEvent) => {
  clickEvent = event;
};

const handleToggle = (checked: boolean) => {
  const eventToUse = (clickEvent && clickEvent.shiftKey !== undefined) 
    ? clickEvent 
    : (containerMouseDownEvent || clickEvent);
  
  emit('toggle', checked, eventToUse);
  clickEvent = undefined;
  containerMouseDownEvent = undefined;
};

const handleOpenTab = () => {
  if (props.action.url) {
    emit('openTab', props.action.url);
  }
};

const handleCheck = () => {
  emit('check', props.action.time);
};

const handleRemove = () => {
  emit('remove');
};

const handleRestore = () => {
  emit('restore');
};
</script>

<style lang="less" scoped>
.l-item {
  position: relative;
  width: 100%;
  margin-bottom: 10px;
  border-radius: 12px;
  border: 1px solid #E6E6E6;
  background: #F9F9F9;
  box-sizing: border-box;
}

.i-inneractions {
  .i-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 10px;
    border-bottom: 1px solid #e5e7eb;
    background: #F9F9F9;
    border-radius: 12px 12px 0 0;
    
    .h-left {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .h-index {
        background: #5e5ce5;
        width: 22px;
        height: 22px;
        min-width: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        color: #fff;
        font-size: 14px;
        line-height: 18px;
        font-weight: 400;
        
        &.h-index-sub {
          width: 20px;
          height: 20px;
          min-width: 20px;
          border: 1px solid rgba(94, 92, 229, 0.40);
          background: rgba(94, 92, 229, 0.10);
          color: #5e5ce5;
        }
      }
      
      .event-label {
        color: #0E0E0E99;
      }
    }
    
    .button-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .action-button {
        padding: 0 12px;
        border-radius: 6px;
        backdrop-filter: blur(8px);
        white-space: nowrap;
      }
      
      :deep(.action-button-normal),
      :deep(.action-button-error) {
        border-radius: 6px;
        backdrop-filter: blur(8px);
      }
      
      :deep(.action-button-normal) {
        --n-border-radius: 6px !important;
        --n-border: 1px solid rgba(118, 116, 233, 0.40) !important;
        --n-border-hover: 1px solid rgba(158, 157, 239, 0.40) !important;
        --n-border-pressed: 1px solid rgba(118, 116, 233, 0.40) !important;
        --n-border-focus: 1px solid rgba(118, 116, 233, 0.40) !important;
        --n-color: rgba(118, 116, 233, 0.10) !important;
        --n-color-hover: rgba(158, 157, 239, 0.10) !important;
        --n-color-pressed: rgba(118, 116, 233, 0.10) !important;
        --n-color-focus: rgba(118, 116, 233, 0.10) !important;
        --n-text-color: #7674E9 !important;
        --n-text-color-hover: #7674E9 !important;
        --n-text-color-pressed: #7674E9 !important;
        --n-text-color-focus: #7674E9 !important;
        backdrop-filter: blur(8px);
      }
      
      :deep(.action-button-error) {
        --n-border-radius: 6px !important;
        --n-border: 1px solid rgba(227, 77, 89, 0.40) !important;
        --n-border-hover: 1px solid rgba(227, 77, 89, 0.40) !important;
        --n-border-pressed: 1px solid rgba(227, 77, 89, 0.40) !important;
        --n-border-focus: 1px solid rgba(227, 77, 89, 0.40) !important;
        --n-color: rgba(227, 77, 89, 0.10) !important;
        --n-color-hover: rgba(227, 77, 89, 0.10) !important;
        --n-color-pressed: rgba(227, 77, 89, 0.10) !important;
        --n-color-focus: rgba(227, 77, 89, 0.10) !important;
        --n-text-color: #E34D59 !important;
        --n-text-color-hover: #E34D59 !important;
        --n-text-color-pressed: #E34D59 !important;
        --n-text-color-focus: #E34D59 !important;
        backdrop-filter: blur(8px);
      }
    }
  }
  
  .i-info {
    display: flex;
    flex-direction: column;
    padding: 8px 10px;
    background: #F9F9F9;
    border-radius: 0 0 12px 12px;
    font-size: 14px;
    line-height: 1.5;
    color: #374151;
    gap: 8px;
    
    .i-info-item {
      display: flex;
      align-items: flex-start;
      gap: 4px;
      
      > :first-child {
        color: #0E0E0E99;
      }
    }
  }
}
</style>

