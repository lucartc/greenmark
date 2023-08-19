<script setup>
  import TutorialTemplate from '../components/TutorialTemplate.vue'
  import { ref, computed } from 'vue'
  import { Toast } from '@capacitor/toast'
  import {
    get_tutorial_pages,
    mark_tutorial_as_done,
    should_show_tutorial,
    reset_show_tutorial
  } from '../helpers/api.js'
  import { onIonViewDidEnter } from '@ionic/vue'
  import { useRouter } from 'vue-router'

  const current_page = ref(0)
  const pages = ref([])
  const router = useRouter()

  const has_next_page = computed(() => {
    return pages.value && pages.value[current_page.value+1]
  })

  const has_previous_page = computed(() => {
    return current_page.value > 0
  })

  const get_current_page = computed(() => {
    return pages.value.length ? pages.value[current_page.value] : null
  })

  function skip_tutorial(){
    reset_show_tutorial()
    .then(() => mark_tutorial_as_done())
    .then(() => router.push('/home'))
    .then(() => Toast.show({text: 'Skipping tutorial...'}))
    .catch(err => console.log('Error',err))
  }

  function show_next_page(){
    current_page.value += 1
  }

  function show_previous_page(){
    if(current_page.value > 0) current_page.value -= 1
  }


  onIonViewDidEnter(() => {
    current_page.value = 0
    should_show_tutorial()
    .then(data => {
      if(data){
        pages.value = get_tutorial_pages()
      }else{
        router.push('/home')
      }
    })
  })
</script>

<template>
    <TutorialTemplate>
        <div class="flex flex-col gap-4 justify-center items-center bg-primary w-full min-w-full max-w-full h-full min-h-full max-h-full p-10">
            <div class="flex flex-col w-full min-h-[600px] max-h-[700px] gap-6 text-white">
              <button @click="skip_tutorial" class="flex flex-row justify-center items-center px-4 h-[40px] min-h-[40px] max-h-[40px] ml-auto rounded-lg drop-shadow-lg text-white">Skip tutorial ></button>
              <div class="flex flex-col w-full gap-6 items-center overflow-y-auto">
                <label class="text-xl font-bold self-start">{{ get_current_page?.title }}</label>
                <img v-if="get_current_page?.type == 'image'" :src="get_current_page?.media" class="bg-pink-700 w-[100%] border-none rounded-lg drop-shadow-lg">
                <video v-if="get_current_page?.type == 'video'" :src="get_current_page?.media" class="bg-pink-700 w-[100%] border-none rounded-lg drop-shadow-lg" autoplay muted loop></video>
                <div v-html="get_current_page?.text" class="leading-6"></div>
              </div>
            </div>
            <div class="flex flex-row justify-center w-full min-w-full max-w-full gap-4">
              <button v-if="has_previous_page" @click="show_previous_page" class="self-center bg-pink-500 text-xl font-bold text-white grow p-3 rounded-lg drop-shadow-lg">Previous</button>
              <button v-if="has_next_page" @click="show_next_page" class="self-center text-xl font-bold text-white bg-pink-500 grow p-3 rounded-lg drop-shadow-lg">Next</button>
              <button v-if="!has_next_page" @click="skip_tutorial" class="self-center bg-pink-500 text-xl font-bold text-white grow p-3 rounded-lg drop-shadow-lg">Finish</button>
            </div>
        </div>
    </TutorialTemplate>
</template>
