<script setup lang="ts">
import { Editor } from '@toast-ui/vue-editor'
import '@toast-ui/editor/dist/i18n/zh-cn'
import '@toast-ui/editor/dist/toastui-editor.css'

const props = defineProps({
  value: String,
  height: String,
  maxlength: Number,
})

const emit = defineEmits(['change'])

const editorRef = ref()

watch(() => props.value, () => {
  editorRef.value?.editor?.setHTML?.(props.value)
})

function onBlur() {
  const editor = editorRef.value?.editor
  const html = editor.getHTML()
  const text = editor.wwEditor.el.textContent
  emit('change', text.trim() === '' ? '' : html)
}
</script>

<template>
  <Editor
    ref="editorRef"
    initial-edit-type="wysiwyg"
    preview-style="vertical"
    :initial-value="value"
    :height="height"
    :options="{
      autofocus: false,
      hideModeSwitch: true,
      toolbarItems: [
        ['heading', 'bold', 'italic', 'strike'],
        ['hr', 'quote'],
        ['ul', 'ol'],
      ],
      language: 'zh-CN',
    }"
    @blur="onBlur"
  />
</template>
