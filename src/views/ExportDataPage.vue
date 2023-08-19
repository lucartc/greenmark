<script setup>
import { onIonViewDidEnter } from '@ionic/vue'
  import PageTemplate from '../components/PageTemplate.vue'
  import MenuCard from '../components/MenuCard.vue'
  import { get_records } from '../helpers/api.js'
  import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { Toast } from '@capacitor/toast'
  import { LocalNotifications } from '@capacitor/local-notifications'

  const page = ref()
  const router = useRouter()

  async function export_file(){
    get_records()
    .then(data => {
        return Filesystem.writeFile({
          path: 'greemark_records.json',
          data: data,
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        })
    })
    .then(data => router.push('/home'))
    .then(data => {
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
        <MenuCard menu="export_data"></MenuCard>
        <div class="flex flex-col w-full">
          <button @click="export_file" class="flex flex-row text-xl text-white font-bold w-full min-w-full max-w-full bg-secondary justify-center items-center rounded-lg drop-shadow-lg px-6 py-4 box-border">
            Export data
          </button>
        </div>
    </PageTemplate>
</template>