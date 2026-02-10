<template>
  <div class="w-list-container">
    <NCollapse :expanded-names="actionsCollapseExpanded" @update:expanded-names="$emit('update:actions-collapse-expanded', $event)">
      <NCollapseItem name="actions" class="w-actions-collapse">
        <template #header>
          <div class="w-list-title-container">
            <span>Actions</span>
            <div class="w-list-title-container-right">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M10 1.875C10 1.875 11.6526 1.875 13.1628 2.51376C13.1628 2.51376 14.621 3.13053 15.7452 4.25476C15.7452 4.25476 16.8695 5.37899 17.4862 6.83719C17.4862 6.83719 18.125 8.34739 18.125 10C18.125 10 18.125 11.6526 17.4862 13.1628C17.4862 13.1628 16.8695 14.621 15.7452 15.7452C15.7452 15.7452 14.621 16.8695 13.1628 17.4862C13.1628 17.4862 11.6526 18.125 10 18.125C10 18.125 8.34739 18.125 6.83719 17.4862C6.83719 17.4862 5.37899 16.8695 4.25476 15.7452C4.25476 15.7452 3.13053 14.621 2.51376 13.1628C2.51376 13.1628 1.875 11.6526 1.875 10C1.875 10 1.875 8.34739 2.51376 6.83719C2.51376 6.83719 3.13053 5.37899 4.25476 4.25476C4.25476 4.25476 5.37899 3.13053 6.83719 2.51376C6.83719 2.51376 8.34739 1.875 10 1.875ZM10 3.125C10 3.125 8.60087 3.125 7.32413 3.66501C7.32413 3.66501 6.09047 4.18681 5.13864 5.13864C5.13864 5.13864 4.18681 6.09047 3.66502 7.32413C3.66502 7.32413 3.125 8.60087 3.125 10C3.125 10 3.125 11.3991 3.66502 12.6759C3.66502 12.6759 4.18681 13.9095 5.13864 14.8614C5.13864 14.8614 6.09047 15.8132 7.32413 16.335C7.32413 16.335 8.60087 16.875 10 16.875C10 16.875 11.3991 16.875 12.6759 16.335C12.6759 16.335 13.9095 15.8132 14.8614 14.8614C14.8614 14.8614 15.8132 13.9095 16.335 12.6759C16.335 12.6759 16.875 11.3991 16.875 10C16.875 10 16.875 8.60087 16.335 7.32413C16.335 7.32413 15.8132 6.09047 14.8614 5.13864C14.8614 5.13864 13.9095 4.18681 12.6759 3.66501C12.6759 3.66501 11.3991 3.125 10 3.125Z" fill="#6B7280"/>
                <path d="M9.375 6.25V10.625C9.375 10.9702 9.65482 11.25 10 11.25C10.3452 11.25 10.625 10.9702 10.625 10.625V6.25C10.625 5.90482 10.3452 5.625 10 5.625C9.65482 5.625 9.375 5.90482 9.375 6.25Z" fill="#6B7280"/>
                <path d="M10.9375 13.4375C10.9375 13.9553 10.5177 14.375 10 14.375C9.48227 14.375 9.0625 13.9553 9.0625 13.4375C9.0625 12.9197 9.48227 12.5 10 12.5C10.5177 12.5 10.9375 12.9197 10.9375 13.4375Z" fill="#6B7280"/>
              </svg>
              <span>{{ instructionDescription }}</span>
            </div>
          </div>
        </template>
        <div v-if="visibleActions.length === 0" class="w-empty">
          <span>{{ emptyActions }}</span>
        </div>
        <ActionItem
          v-for="(item, blockindex) in visibleActions"
          :key="item.id || blockindex"
          :action="item"
          :index="blockindex"
          :checked="isActionSelected(blockindex, item)"
          @toggle="(checked, event) => $emit('toggle-action', blockindex, checked, event)"
          @open-tab="$emit('open-tab', $event)"
          @check="$emit('check', $event)"
          @remove="$emit('remove-action', blockindex)"
        />
      </NCollapseItem>
    </NCollapse>
  </div>
</template>

<script lang="ts" setup>
import { NCollapse, NCollapseItem } from 'naive-ui';
import ActionItem from './ActionItem.vue';
import type { Action } from '../../types';

defineProps<{
  visibleActions: Action[];
  actionsCollapseExpanded: string[];
  instructionDescription: string;
  emptyActions: string;
  isActionSelected: (index: number, item: Action) => boolean;
}>();

defineEmits<{
  'update:actions-collapse-expanded': [value: string[]];
  'toggle-action': [index: number, checked: boolean, event?: MouseEvent];
  'open-tab': [url: string];
  'check': [time: number];
  'remove-action': [index: number];
}>();
</script>

<style lang="less" scoped>
.w-list-container {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.10);
  background: #FFF;
  padding: 14px;
  
  :deep(.n-collapse) {
    border: none;
    background: transparent;
    width: 100%;
  }

  .w-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60px;
    color: #9ca3af;
    font-style: italic;
    font-size: 14px;
    border-radius: 12px;
    border: 1px solid #E6E6E6;
    background: #F9F9F9;
    margin-top: 10px;
  }
}

.w-actions-collapse {
  :deep(.n-collapse-item) {
    border: none;
    background: transparent;
  }
  
  :deep(.n-collapse-item__header) {
    padding: 0;
    background: transparent;
  }
  
  :deep(.n-collapse-item__content-wrapper) {
    .n-collapse-item__content-inner {
      padding: 0;
      padding-top: 12px;
    }
  }
}

.w-list-title-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  
  > span {
    color: #000;
    font-size: 20px;
    font-weight: 500;
    line-height: 24px;
    letter-spacing: 0.2px;
  }
  
  .w-list-title-container-right {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #6b7280;
    margin-left: auto;
    
    svg {
      flex-shrink: 0;
    }
  }
}
</style>

