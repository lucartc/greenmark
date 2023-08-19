<script setup>
  import { onIonViewDidEnter } from '@ionic/vue'
  import GoalDetailsCard from '../components/GoalDetailsCard.vue'
  import GoalList from '../components/GoalList.vue'
  import Footer from '../components/Footer.vue'
  import PageTemplate from '../components/PageTemplate.vue'
  import CreateGoalForm from '../components/CreateGoalForm.vue'
  import EditGoalForm from '../components/EditGoalForm.vue'
  import { ref } from 'vue'

  const page = ref()
  const goal_list = ref()
  const create_goal_dialog = ref(false)
  const edit_goal_dialog = ref(false)
  const goal_being_edited = ref()
  const goal_card = ref()
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

  function hide_edit_goal_dialog(goal){
    goal_being_edited.value = null
    edit_goal_dialog.value = false
    page.value.unlock()
  }

  function update_goal(){
    hide_create_goal_dialog()
    hide_edit_goal_dialog()
    goal_list.value.update()
    goal_card.value.update()
  }

  function update_card(){
    goal_card.value.update()
  }

  onIonViewDidEnter(() => {
    page.value.unlock()
    goal_list.value.update()
    goal_card.value.update()
  })
</script>

<template>
  <PageTemplate ref="page">
      <GoalDetailsCard ref="goal_card" @goal_status_changed="update_goal" @edit_goal="show_edit_goal_dialog" @create_goal="show_create_goal_dialog"></GoalDetailsCard>
      <GoalList ref="goal_list" @goal_changed="update_card" @edit_goal="show_edit_goal_dialog"></GoalList>
      <dialog v-if="create_goal_dialog" class="flex flex-col justify-center items-center bg-[#0b2428a0] absolute w-full min-w-full max-w-full h-full min-h-full overflow-y-auto z-[1]">
        <CreateGoalForm @goal_created="update_goal" @cancel_goal_creation="hide_create_goal_dialog"></CreateGoalForm>
      </dialog>
      <dialog v-if="edit_goal_dialog" class="flex flex-col justify-center items-center bg-[#0b2428a0] absolute w-full min-w-full max-w-full h-full min-h-full overflow-y-auto z-[1]">
        <EditGoalForm ref="edit_goal_form" @goal_edited="update_goal" @cancel_goal_edition="hide_edit_goal_dialog" v-bind="goal_being_edited"></EditGoalForm>
      </dialog>
  </PageTemplate>
</template>