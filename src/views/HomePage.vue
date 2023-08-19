<script setup>
  import { ref } from 'vue'
  import HomeCard from '../components/HomeCard.vue'
  import GoalList from '../components/GoalList.vue'
  import PageTemplate from '../components/PageTemplate.vue'
  import EditGoalForm from '../components/EditGoalForm.vue'
  import CreateGoalForm from '../components/CreateGoalForm.vue'
  import { onIonViewDidEnter } from '@ionic/vue'
  import { LocalNotifications } from '@capacitor/local-notifications'

  const page = ref()
  const goal_list = ref()
  const create_goal_dialog = ref(false)
  const edit_goal_dialog = ref(false)
  const goal_being_edited = ref()
  const home_card = ref()
  const edit_goal_form = ref()

  function show_create_goal_dialog(){
    create_goal_dialog.value = true
    page.value.lock()
  }

  function hide_create_goal_dialog(){
    create_goal_dialog.value = false
    page.value.unlock()
  }

  function show_edit_goal_dialog(goal){
    goal_being_edited.value = goal
    edit_goal_dialog.value = true
    edit_goal_form.value?.update()
    page.value.lock()
  }

  function hide_edit_goal_dialog(){
    goal_being_edited.value = null
    edit_goal_dialog.value = false
    page.value.unlock()
  }

  function update_goal_list(){
    hide_create_goal_dialog()
    hide_edit_goal_dialog()
    goal_list.value.update()
    home_card.value.update()
  }

  function update_card(){
    home_card.value.update()
  }

  onIonViewDidEnter(async function(){
    page.value.unlock()
    goal_list.value.update()
    home_card.value.update()
    LocalNotifications.requestPermissions()
  })
</script>

<template>
  <PageTemplate ref="page">
      <HomeCard ref="home_card" @create_goal="show_create_goal_dialog"></HomeCard>
      <GoalList ref="goal_list" @goal_changed="update_card" @edit_goal="show_edit_goal_dialog"></GoalList>
      <dialog v-if="create_goal_dialog" class="flex flex-col justify-center items-center bg-[#0b2428a0] absolute w-full min-w-full max-w-full h-full min-h-full p-0 overflow-y-scroll">
        <CreateGoalForm @goal_created="update_goal_list" @cancel_goal_creation="hide_create_goal_dialog"></CreateGoalForm>
      </dialog>
      <dialog v-if="edit_goal_dialog" class="flex flex-col justify-center items-center bg-[#0b2428a0] absolute w-full min-w-full max-w-full h-full min-h-full p-0 overflow-y-scroll">
        <EditGoalForm ref="edit_goal_form" @goal_edited="update_goal_list" @cancel_goal_edition="hide_edit_goal_dialog" v-bind="goal_being_edited"></EditGoalForm>
      </dialog>
  </PageTemplate>
</template>
