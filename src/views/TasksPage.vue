<script setup>
  import PageTemplate from '../components/PageTemplate.vue'
  import MenuCard from '../components/MenuCard.vue'
  import { onIonViewDidEnter } from '@ionic/vue'
  import { ref } from 'vue'
  import {
    set_filter,
    set_order,
    get_default_filter,
    get_default_order
  } from '../helpers/api.js'

  const page = ref()
  const order = ref()
  const filter = ref()

  function change_default_order(){
    set_order(order.value)
  }
  function change_default_filter(){
    set_filter(filter.value)
  }

  onIonViewDidEnter(() => {
    get_default_filter()
    .then(data => { filter.value = data; console.log('filter: ',data)})

    get_default_order()
    .then(data => { order.value = data; console.log('order: ',data)})

    page.value.unlock()
  })
</script>

<template>
    <PageTemplate ref="page">
        <MenuCard menu="tasks"></MenuCard>
        <div class="flex flex-col w-full min-w-full max-w-full gap-2 text-white">
          <div class="p-4 bg-secondary rounded-lg drop-shadow-lg flex flex-col w-full min-w-full max-w-full">
            <label class="text-lg">Default task order</label>
            <select @change="change_default_order" v-model="order" class="bg-transparent w-fit text-gray-300">
              <option value="Name" class="text-black text-sm">Name</option>
              <option value="Latest" class="text-black text-sm">Latest</option>
              <option value="Oldest" class="text-black text-sm">Oldest</option>
              <option value="Updated" class="text-black text-sm">Updated</option>
              <option value="Incomplete" class="text-black text-sm">Incomplete</option>
              <option value="Complete" class="text-black text-sm">Complete</option>
            </select>
          </div>
          <div class="p-4 bg-secondary rounded-lg drop-shadow-lg flex flex-col w-full min-w-full max-w-full">
            <label class="text-lg">Default task filter</label>
            <select @change="change_default_filter" v-model="filter" class="bg-transparent w-fit text-gray-300">
              <option value="" class="text-black text-sm">All</option>
              <option value="IN_PROGRESS" class="text-black text-sm">In progress</option>
              <option value="PAUSED" class="text-black text-sm">Paused</option>
              <option value="ABSTRACT" class="text-black text-sm">Abstract</option>
              <option value="EXECUTABLE" class="text-black text-sm">Executable</option>
              <option value="Incomplete" class="text-black text-sm">Incomplete</option>
              <option value="Complete" class="text-black text-sm">Complete</option>
            </select>
          </div>
        </div>
    </PageTemplate>
</template>
