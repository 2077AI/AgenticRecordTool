<template>
  <n-modal
    v-model:show="showModal"
    transform-origin="center"
    style="width: 800px;"
    class="custom-card"
    preset="card"
    :title="i18nTexts.insertBehavior"
    size="huge"
    :bordered="false"
  >
  <NSelect style="width: 300px;" v-model:value="currentCompontName" :options="actionOptions" ></NSelect>
  <component :is="currentCompoent" ref="childRef" />
  <template  #footer> 
    <NButton style="margin-right: 10px;" type="info" @click="handleConfirm">{{ i18nTexts.confirmButton }}</NButton>
    <NButton type="error" @click="showModal = false">{{ i18nTexts.cancelButton }}</NButton>
  </template>
  </n-modal>
</template>
<script setup lang="ts">
import { ref, watch, shallowRef, computed } from "vue";
import { NModal, NButton, NSelect } from "naive-ui";
import SearchText from "./Actions/SearchText.vue"
import { t } from '../utils/i18n'

const emit = defineEmits(["confirm"]);
const showModal = ref(false);
const childRef = ref()

// Internationalization texts
const i18nTexts = computed(() => ({
  insertBehavior: t('insert_behavior'),
  confirmButton: t('confirm_button'),
  cancelButton: t('cancel_button'),
  textSearch: t('text_search')
}));

const currentCompontName = ref(i18nTexts.value.textSearch)
const currentCompoent = shallowRef(SearchText)
watch(currentCompontName, (name) => {
  if(name === i18nTexts.value.textSearch){
    currentCompoent.value = SearchText
  }
})
const actionOptions = computed(() => [
  {
    label: i18nTexts.value.textSearch,
    value: i18nTexts.value.textSearch
  }
]);
const handleConfirm = () => {
  if (childRef) {
    const result = childRef.value.getResult()
    emit("confirm", result)
    showModal.value = false;
    
  }
};
const triggerShowModal = () => {
  showModal.value = true;
};
defineExpose({
  triggerShowModal,
});
</script>
<style lang="less" scoped></style>
