<template>
  <div>
    <div class="w-instruction">
      <div class="w-instruction-label">{{ instructionLabel }}</div>
      <NInput 
        v-model:value="instructionValue"
        placeholder="Please Input" 
        class="w-instruction-input"
        @update:value="handleInstructionUpdate"
      />
    </div>
    <div class="w-result-group">
      <div class="w-result-label">Result</div>
      <div 
        v-for="(result, index) in results" 
        :key="index"
        class="w-result-group-item"
      >
        <div class="w-result-index">{{ index + 1 }}</div>
        <NInput 
          v-model:value="result.value"
          placeholder="Input" 
          class="w-result-input"
          @update:value="handleResultUpdate"
        />
        <NButton 
          :class="['w-result-add-btn', { 'w-result-remove-btn': index !== results.length - 1 }]"
          @click="index === results.length - 1 ? handleAddResult() : handleRemoveResult(index)"
        >
          <template #icon>
            <svg v-if="index === results.length - 1" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M0.75 9.75H17.25C17.6642 9.75 18 9.41421 18 9C18 8.58579 17.6642 8.25 17.25 8.25H0.75C0.335786 8.25 0 8.58579 0 9C0 9.41421 0.335786 9.75 0.75 9.75Z" fill="#5E5CE5"/>
              <path d="M8.25 0.75V17.25C8.25 17.6642 8.58579 18 9 18C9.41421 18 9.75 17.6642 9.75 17.25V0.75C9.75 0.335786 9.41421 0 9 0C8.58579 0 8.25 0.335786 8.25 0.75Z" fill="#5E5CE5"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M0.75 9.75H17.25C17.6642 9.75 18 9.41421 18 9C18 8.58579 17.6642 8.25 17.25 8.25H0.75C0.335786 8.25 0 8.58579 0 9C0 9.41421 0.335786 9.75 0.75 9.75Z" fill="#FA6464"/>
            </svg>
          </template>
        </NButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { NInput, NButton } from 'naive-ui';

interface Props {
  instructionLabel?: string;
  instruction?: string;
  results: Array<{ value: string }>;
}

interface Emits {
  (e: 'update:instruction', value: string): void;
  (e: 'update:results', value: Array<{ value: string }>): void;
}

const props = withDefaults(defineProps<Props>(), {
  instructionLabel: 'Instruction',
  instruction: ''
});

const emit = defineEmits<Emits>();

const instructionValue = ref(props.instruction);
const results = ref<Array<{ value: string }>>([...props.results]);

watch(() => props.instruction, (newVal) => {
  instructionValue.value = newVal;
});

watch(() => props.results, (newVal) => {
  results.value = [...newVal];
}, { deep: true });

const handleInstructionUpdate = (value: string) => {
  instructionValue.value = value;
  emit('update:instruction', value);
};

const handleResultUpdate = () => {
  emit('update:results', results.value);
};

const handleAddResult = () => {
  results.value.push({ value: '' });
  emit('update:results', results.value);
};

const handleRemoveResult = (index: number) => {
  if (results.value.length > 1) {
    results.value.splice(index, 1);
    emit('update:results', results.value);
  }
};
</script>

<style lang="less" scoped>
.w-instruction {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  
  .w-instruction-label {
    font-size: 14px;
    font-weight: 500;
    color: #1f2937;
  }
  
  .w-instruction-input {
    width: 100%;
    height: 40px;
    background: #F9F9F9;
  }
}

.w-result-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .w-result-label {
    font-size: 14px;
    font-weight: 500;
    color: #1f2937;
  }
  
  .w-result-group-item {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .w-result-index {
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      border: 1px solid #E6E6E6;
      background: #F9F9F9;
      font-size: 12px;
      font-weight: 500;
      color: #1f2937;
      flex-shrink: 0;
    }
    
    .w-result-input {
      flex: 1;
      height: 40px;
      background: #F9F9F9;
    }
    
    :deep(.w-result-add-btn),
    :deep(.w-result-remove-btn) {
      background: #F9F9F9;
      
      &:hover {
        background: #F0F0F0;
      }
    }
  }
}
</style>

