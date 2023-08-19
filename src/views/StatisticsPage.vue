<script setup>
  import PageTemplate from '../components/PageTemplate.vue'
  import MenuCard from '../components/MenuCard.vue'
  import { onIonViewDidEnter } from '@ionic/vue'
  import { ref } from 'vue'

  const page = ref()

  onIonViewDidEnter(() => {
    page.value.unlock()
  })
</script>

<template>
    <PageTemplate ref="page">
        <MenuCard menu="statistics"></MenuCard>
        Statistics Page
    </PageTemplate>
</template>