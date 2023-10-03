<template>
  <div @click="copy(clipboard.text)" class="justify-items-bottom justify-end hover:cursor-pointer">
    {{ clipboard.text }}
    <Icon name="ep:copy-document" />
  </div>
</template>

<script lang="ts" setup>

const clipboard = defineProps({
  text: { type: String, default: '' }
})

const copy = async (text: string) => {
  try {
    const inputOculto = document.createElement('input');

    inputOculto.setAttribute('value', text);

    document.body.appendChild(inputOculto);

    inputOculto.select();

    document.execCommand('copy');

    document.body.removeChild(inputOculto);

    ElMessage({
      message: `Texto copiado ${text}`,
      type: 'success',
    })
  } catch (e) {
    console.log(e)
    ElMessage({ message: 'No se pudo copiar.', type: 'error' })
  }
}
</script>