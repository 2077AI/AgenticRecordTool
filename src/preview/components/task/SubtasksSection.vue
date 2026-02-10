<template>
  <div v-if="subtasks.length > 0" class="w-subtasks-container">
    <NCollapse :expanded-names="subtasksExpanded" @update:expanded-names="$emit('update:subtasks-expanded', $event)">
      <NCollapseItem
        v-for="(subtask, subtaskIndex) in subtasks"
        :key="subtask.id"
        :name="subtask.id"
        :id="`subtask-${subtask.id}`"
        class="w-subtask-collapse"
      >
        <template #header>
          <div class="w-subtask-header">
            <NCheckbox
              :checked="subtask.checked"
              @update:checked="(checked) => $emit('update-subtask-checked', subtask.id, checked)"
              @click.stop
            />
            <span>Subtask-{{ subtask.order !== undefined ? subtask.order : subtaskIndex + 1 }}</span>
          </div>
        </template>
        <div class="w-subtask-content">
          <InstructionResults
            instruction-label="Sub - Instruction"
            :instruction="subtask.instruction"
            :results="subtask.results"
            @update:instruction="$emit('update-subtask-instruction', subtask.id, $event)"
            @update:results="$emit('update-subtask-results', subtask.id, $event)"
          />
          <div class="w-subtask-actions">
            <div class="w-subtask-actions-title">Sub - Actions</div>
            <ActionItem
              v-for="(action, actionIndex) in subtask.actions"
              :key="action.id || actionIndex"
              :action="action"
              :index="actionIndex"
              :checked="false"
              :disabled="true"
              :is-sub-action="true"
              @open-tab="$emit('open-tab', $event)"
              @check="$emit('check', $event)"
              @remove="$emit('remove-subtask-action', subtask.id, actionIndex)"
            />
          </div>
        </div>
      </NCollapseItem>
    </NCollapse>
  </div>
</template>

<script lang="ts" setup>
import { NCollapse, NCollapseItem, NCheckbox } from 'naive-ui';
import InstructionResults from './InstructionResults.vue';
import ActionItem from './ActionItem.vue';
import type { Subtask } from '../../types';

defineProps<{
  subtasks: Subtask[];
  subtasksExpanded: string[];
}>();

defineEmits<{
  'update:subtasks-expanded': [value: string[]];
  'update-subtask-checked': [subtaskId: string, checked: boolean];
  'update-subtask-instruction': [subtaskId: string, instruction: string];
  'update-subtask-results': [subtaskId: string, results: Array<{ value: string }>];
  'open-tab': [url: string];
  'check': [time: number];
  'remove-subtask-action': [subtaskId: string, actionIndex: number];
}>();
</script>

<style lang="less" scoped>
.w-subtasks-container {
  margin-bottom: 12px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.10);
  background: #FFF;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  :deep(.n-collapse) {
    border: none;
    background: transparent;
    width: 100%;
  }
}

.w-subtask-collapse {
  margin-bottom: 12px;
  :deep(.n-collapse-item) {
    border: 1px solid rgba(0, 0, 0, 0.10);
    background: white;
    border-radius: 12px;
  }
  
  :deep(.n-collapse-item__header) {
    background: transparent;
  }
  
  :deep(.n-collapse-item__content-wrapper) {
    .n-collapse-item__content-inner {
      padding-top: 12px;
    }
  }
  
  .w-subtask-header {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    
    > span {
      color: #000;
      font-family: "PingFang SC";
      font-size: 20px;
      font-style: normal;
      font-weight: 500;
      line-height: 24px;
      letter-spacing: 0.2px;
    }
  }
  
  .w-subtask-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    .w-subtask-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      
      .w-subtask-actions-title {
        font-size: 16px;
        font-weight: 500;
        color: #1f2937;
        margin-bottom: 4px;
      }
    }
  }
}
</style>

