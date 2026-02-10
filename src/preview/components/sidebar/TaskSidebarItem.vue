<template>
  <div class="w-task-sidebar-item">
    <!-- subtask icon -->
    <svg 
      v-if="!isAssociating" 
      xmlns="http://www.w3.org/2000/svg" 
      width="6" 
      height="6" 
      viewBox="0 0 6 6" 
      fill="none" 
      class="w-subtask-icon"
    >
      <circle cx="3" cy="3" r="3" fill="#4D4D4D"/>
    </svg>

    <!-- subtask icon - associating mode -->
    <svg 
      v-else 
      xmlns="http://www.w3.org/2000/svg" 
      width="12" 
      height="12" 
      viewBox="0 0 12 12" 
      fill="none" 
      class="w-association-icon"
      :class="{ 'w-association-icon-selected': isSelected }"
      @click.stop="handleAssociationClick"
    >
      <circle cx="6" cy="6" r="5.5" stroke="#4D4D4D"/>
      <path d="M3 6H9" stroke="#4D4D4D" stroke-linecap="round"/>
      <path d="M6 3V9" stroke="#4D4D4D" stroke-linecap="round"/>
    </svg>
    <span 
      class="w-subtask-link"
      @click.stop="handleClick"
    >
      Subtask-{{ subtask.order !== undefined ? subtask.order : index + 1 }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import { type Subtask } from "../../types";

const props = defineProps<{
  subtask: Subtask;
  index: number;
  isAssociating: boolean;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  'click': [subtaskId: string];
  'association-click': [subtaskId: string];
}>();

const handleAssociationClick = () => {
  emit('association-click', props.subtask.id);
};

const handleClick = () => {
  emit('click', props.subtask.id);
};
</script>

<style lang="less" scoped>
.w-task-sidebar-item {
  word-break: break-word;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 2;
  padding-right: 12px;
  
  .w-subtask-icon {
    display: inline-block;
    margin-right: 4px;
    vertical-align: middle;
  }

  .w-association-icon {
    display: inline-block;
    margin-right: 4px;
    vertical-align: middle;
    cursor: pointer;
    
    &.w-association-icon-selected {
      circle {
        fill: #5E5CE5;
        fill-opacity: 0.2;
      }
      path {
        stroke: #5E5CE5;
      }
    }
  }

  .w-subtask-link {
    cursor: pointer;
    transition: color 0.2s ease;
    
    &:hover {
      color: #5E5CE5;
    }
  }
}
</style>

