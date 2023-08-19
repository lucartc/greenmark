<script setup>
  import { IonPage } from '@ionic/vue'
  import Footer from '../components/Footer.vue'
  import { ref } from 'vue'

  const self = ref()

  function lock(){
    self.value.style.overflowY = 'hidden'
  }

  function unlock(){
    self.value.style.overflowY = 'scroll'
  }

  defineExpose({
    lock,
    unlock
  })
</script>

<template>
  <ion-page>
    <div class="flex flex-col items-center bg-primary min-w-full max-w-full min-h-full">
        <div class="flex flex-col items-center min-w-full max-w-full min-h-full relative gap-5 px-6 pb-32" ref="self">
            <slot></slot>
        </div>
        <Footer></Footer>
    </div>
  </ion-page>
</template>