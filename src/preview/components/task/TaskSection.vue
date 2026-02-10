<template>
  <div class="w-top" id="task-section">
    <div class="w-title">
      Task
    </div>
    <InstructionResults
      instruction-label="Instruction"
      :instruction="taskInstruction"
      :results="results"
      @update:instruction="$emit('update:instruction', $event)"
      @update:results="$emit('update:results', $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import InstructionResults from './InstructionResults.vue';

defineProps<{
  taskInstruction: string;
  results: Array<{ value: string }>;
}>();

defineEmits<{
  'update:instruction': [value: string];
  'update:results': [value: Array<{ value: string }>];
}>();
</script>

<style lang="less" scoped>
.w-top {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 12px;
  padding: 20px 14px;
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.10);
  
  .w-title {
    font-size: 20px;
    line-height: 24px;
    font-weight: 600;
    color: #1f2937;
  }
}
</style>

