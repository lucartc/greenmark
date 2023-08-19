<script setup>
  import { onIonViewDidEnter } from '@ionic/vue'
  import PageTemplate from '../components/PageTemplate.vue'
  import MenuCard from '../components/MenuCard.vue'
  import { show_tutorial } from '../helpers/api.js'
  import { useRouter } from 'vue-router'
  import { ref } from 'vue'
  import { LocalNotifications } from '@capacitor/local-notifications'
  import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'

  const router = useRouter()
  const page = ref()

  function go_to_tasks(){
    router.push('/tasks')
  }

  async function export_data(){
    get_records()
    .then(data => {
        return Filesystem.writeFile({
          path: 'greemark_records.json',
          data: data,
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        })
    })
    .then(() => {
      LocalNotifications.schedule({notifications: [
        {
            id: 1,
            title: 'Export finished',
            body: 'Saved in "greenmark_records.json"'
        }
      ]})
    })
    .catch(err => console.log('Error',err))
  }

  function go_to_tutorial(){
    show_tutorial()
    .then(() => router.push('/tutorial'))
    .catch(err => console.log('Error',err))
  }

  onIonViewDidEnter(() => {
    Filesystem.checkPermissions()
    .then(data => console.log('permissions: ',JSON.stringify(data)))
    .catch(err => console.log('Error',err))
    Filesystem.requestPermissions()
    .then(data => console.log('permissions: ',JSON.stringify(data)))
    .catch(err => console.log('Error',err))
    page.value.unlock()
  })
</script>

<template>
  <PageTemplate ref="page">
    <MenuCard menu="settings"></MenuCard>
    <div class="w-full min-w-full max-w-full flex flex-col gap-2">
      <div @click="go_to_tasks" class="flex flex-row gap-6 w-full min-w-full max-w-full bg-secondary items-center rounded-lg drop-shadow-lg px-6 py-4 box-border text-white">
        <img class="h-[20px] min-h-[20px] max-h-[20px] aspect-square" :src="'tasks.svg'">
        <div class="flex flex-col">
            <label class="text-md">Tasks</label>
        </div>
      </div>
      <div @click="go_to_tutorial" class="flex flex-row gap-6 w-full min-w-full max-w-full bg-secondary items-center rounded-lg drop-shadow-lg px-6 py-4 box-border text-white">
        <img class="h-[20px] min-h-[20px] max-h-[20px] aspect-square" :src="'tutorial.svg'">
        <div class="flex flex-col">
            <label class="text-md">See tutorial</label>
        </div>
      </div>
      <div @click="export_data" class="flex flex-row gap-6 w-full min-w-full max-w-full bg-secondary items-center rounded-lg drop-shadow-lg px-6 py-4 box-border text-white">
        <img class="h-[20px] min-h-[20px] max-h-[20px] aspect-square" :src="'data.svg'">
        <div class="flex flex-col">
            <label class="text-md">Export data</label>
        </div>
      </div>
    </div>
  </PageTemplate>
</template>