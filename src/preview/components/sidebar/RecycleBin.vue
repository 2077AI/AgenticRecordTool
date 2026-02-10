<template>
  <div class="w-list">
    <div class="w-list-container">
      <div v-if="deletedActions.length === 0" class="w-empty">
        <span>{{ i18nTexts.emptyRecycleBin }}</span>
      </div>
      <template v-else>
        <div class="w-list-title-container">
          <span>Deleted Actions</span>
        </div>
        <ActionItem
          v-for="(item, blockindex) in deletedActions"
          :key="item.id || blockindex"
          :action="item"
          :index="blockindex"
          :checked="false"
          :disabled="true"
          :is-recycle-bin="true"
          @open-tab="handleOpenTab"
          @check="handleCheck"
          @restore="handleRestore(blockindex)"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ActionItem from "../task/ActionItem.vue";
import { t } from '../../../utils/i18n';

const i18nTexts = {
  emptyRecycleBin: t('empty_recycle_bin'),
};

interface Props {
  deletedActions: any[];
}

interface Emits {
  (e: 'openTab', url: string): void;
  (e: 'check', time: number): void;
  (e: 'restore', action: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleOpenTab = (url: string) => {
  emit('openTab', url);
};

const handleCheck = (time: number) => {
  emit('check', time);
};

const handleRestore = (index: number) => {
  const action = props.deletedActions[index];
  if (action) {
    emit('restore', action);
  }
};
</script>

<style lang="less" scoped>
.w-list {
  flex: 6;
  min-width: 400px;
  overflow-y: auto;
  height: 100%;
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  .w-list-container {
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.10);
    background: #FFF;
    padding: 14px;
    
    .w-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: #9ca3af;
      font-style: italic;
      font-size: 16px;
    }
  }
  
  .w-list-title-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    width: 100%;
    margin-bottom: 12px;
    
    > span {
      color: #000;
      font-size: 20px;
      font-weight: 500;
      line-height: 24px;
      letter-spacing: 0.2px;
    }
  }
}
</style>

