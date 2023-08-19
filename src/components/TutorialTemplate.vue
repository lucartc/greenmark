<script setup>
  import { IonPage } from '@ionic/vue'
</script>

<template>
  <ion-page>
    <div class="flex flex-col items-center bg-primary min-w-full max-w-full min-h-full overflow-y-scroll">
        <slot></slot>
    </div>
  </ion-page>
</template>