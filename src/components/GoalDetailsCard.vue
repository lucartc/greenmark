<script setup>
    import { useRoute, useRouter } from 'vue-router'
    import { ref, onMounted } from 'vue'
    import {
        get_goals,
        pause_goal,
        start_goal,
        complete_goal,
        delete_goal,
    } from '../helpers/api.js'
    import { Toast } from '@capacitor/toast'

    const route = useRoute()
    const router = useRouter()
    const goal = ref()
    const parent_goal = ref()
    const subgoal_count = ref(null)
    const abstract_count = ref(0)
    const executable_count = ref(0)
    const paused_count = ref(0)
    const in_progress_count = ref(0)
    const complete_count = ref(0)
    const show_options = ref(false)
    const options = ref()
    const self = ref()
    const menu = ref()
    const show_confirm_complete_dialog = ref(false)
    const show_confirm_delete_dialog = ref(false)

    const emit = defineEmits([
        'create_goal',
        'edit_goal'
    ])

    function show_create_goal_dialog(){
        reset_item()
        emit('create_goal')
    }

    function go_back(){
        if(parent_goal.value){
            router.push({name: 'goal', params: {goal_id: parent_goal.value.id}})
        }else{
            router.push('/home')
        }
    }

    function toggle_options(){
        show_options.value = !show_options.value
        if(!show_options.value) return
        setTimeout(() => { document.addEventListener('click',close_dialog_when_click_out)},50)
    }

    function close_dialog_when_click_out(e){
        if(!e.target.isEqualNode(options.value) && !options.value?.contains(e.target)){
            document.removeEventListener('click',close_dialog_when_click_out)
            show_options.value = false
        }
        
        if(!e.target.isEqualNode(menu.value)) return
        document.removeEventListener('click',close_dialog_when_click_out)
    }

    function can_be_edited(){
        const valid_status = ['PAUSED','IN_PROGRESS'].indexOf(goal.value?.status) >= 0
        const valid_type = ['ABSTRACT','EXECUTABLE'].indexOf(goal.value?.goal_type) >= 0
        return valid_status && valid_type
    }

    function can_be_started(){
        const valid_status = ['PAUSED'].indexOf(goal.value?.status) >= 0
        const valid_type = ['ABSTRACT','EXECUTABLE'].indexOf(goal.value?.goal_type) >= 0
        return valid_status && valid_type
    }

    function can_be_paused(){
        const valid_status = ['IN_PROGRESS'].indexOf(goal.value?.status) >= 0
        const valid_type = ['ABSTRACT','EXECUTABLE'].indexOf(goal.value?.goal_type) >= 0
        return valid_status && valid_type
    }

    function can_be_completed(){
        const valid_status = ['PAUSED','IN_PROGRESS'].indexOf(goal.value?.status) >= 0
        const valid_type = ['ABSTRACT','EXECUTABLE'].indexOf(goal.value?.goal_type) >= 0
        return valid_status && valid_type
    }

    function can_be_deleted(){
        const valid_status = ['COMPLETE','PAUSED','IN_PROGRESS'].indexOf(goal.value?.status) >= 0
        const valid_type = ['ABSTRACT','EXECUTABLE'].indexOf(goal.value?.goal_type) >= 0
        return valid_status && valid_type
    }

    function reset_item(){
        document.removeEventListener('click',close_dialog_when_click_out)
        show_options.value = false
    }

    function edit_goal(){
        reset_item()
        emit('edit_goal',goal.value)
    }

    function try_start_goal(){
        try_change_goal_state('START')
    }

    function try_pause_goal(){
        try_change_goal_state('PAUSE')
    }

    function try_complete_goal(){
        reset_item()
        show_confirm_complete_dialog.value = true
    }

    function try_delete_goal(){
        reset_item()
        show_confirm_delete_dialog.value = true
    }

    function try_change_goal_state(state){
        reset_item()

        let promise = null
        const params = JSON.parse(JSON.stringify(goal.value))

        switch(state){
            case 'START':
                promise = start_goal(params)
                break
            case 'PAUSE':
                promise = pause_goal(params)
                break
            case 'COMPLETE':
                promise = complete_goal(params)
                .then(() => update())
                .then(() => show_confirm_complete_dialog.value = false)
                .then(() => Toast.show({text: 'Goal has been completed!'}))
                break
            case 'DELETE':
                promise = delete_goal(params)
                .then(() => router.push('/home'))
                .then(() => Toast.show({text: 'Goal has been deleted!'}))
                break
        }

        promise
        .then(() => emit('goal_status_changed'))
        .catch(err => console.log('Error: ',err))
    }

    function close_confirm_complete_dialog(){
        show_confirm_complete_dialog.value = false
    }

    function close_confirm_delete_dialog(){
        show_confirm_delete_dialog.value = false
    }

    onMounted(() => {
        update()
    })

    function update(){
        const params = {
            id: route.params.goal_id
        }

        get_goals()
        .then(data => {
            goal.value = data.filter(item => item.id == params.id).pop()
            parent_goal.value = data.filter(item => item.id == goal.value.goal_id).pop()
            subgoal_count.value = data.filter(item => item.goal_id == params.id).length
            subgoal_count.value = subgoal_count.value
            if(subgoal_count.value != null){
                abstract_count.value = data.filter(item => (item.goal_type == 'ABSTRACT' && item.goal_id == params.id)).length
                executable_count.value = data.filter(item => (item.goal_type == 'EXECUTABLE' && item.goal_id == params.id)).length
                paused_count.value = data.filter(item => (item.status == 'PAUSED' && item.goal_id == params.id)).length
                in_progress_count.value = data.filter(item => (item.status == 'IN_PROGRESS' && item.goal_id == params.id)).length
                complete_count.value = data.filter(item => item.status == 'COMPLETE' && item.goal_id == params.id).length
            }
        })
        .catch(err => console.log('Error',err))
    }

    defineExpose({
        update
    })
</script>

<template>
    <div ref="self" class="flex flex-col w-full min-w-full max-w-full bg-secondary rounded-b-lg p-8 py-6 box-border gap-2 text-white z-[1]">
        <div class="flex flex-col gap-4">
            <div class="flex flex-row w-full min-w-full max-w-full justify-between relative">
                <label @click="go_back" class="text-lg">{{ parent_goal ? '< '+parent_goal.name : '< Back' }}</label>
                <img ref="menu" @click="toggle_options" :src="'dots_vertical.svg'">
                <div ref="options" v-if="show_options" class="bg-primary text-white flex flex-col top-full right-0 absolute rounded-b-lg z-[1]">
                    <label @click="edit_goal" v-if="can_be_edited()" class="py-2 px-3 box-border hover:backdrop-brightness-50 hover:text-white">Edit</label>
                    <label @click="try_start_goal" v-if="can_be_started()" class="py-2 px-3 box-border hover:backdrop-brightness-50 hover:text-white">Start</label>
                    <label @click="try_pause_goal" v-if="can_be_paused()" class="py-2 px-3 box-border hover:backdrop-brightness-50 hover:text-white">Pause</label>
                    <label @click="try_delete_goal" v-if="can_be_deleted()" class="py-2 px-3 box-border text-red-500 hover:text-red-700">Delete</label>
                </div>
            </div>
            <div class="flex flex-col gap-1">
                <label class="text-lg font-bold">{{ goal?.name}}</label>
                <label class="text-white">{{ subgoal_count }} goals registered</label>
            </div>
        </div>
        <p class="line-clamp-3">
            {{ goal?.description }}
        </p>
        <div class="flex flex-row gap-2">
            <button @click="try_complete_goal" v-if="can_be_completed()" class="mt-auto w-full bg-pink-500 rounded-lg flex flex-row justify-center items-center px-4 py-2 drop-shadow-lg">Complete goal</button>
            <button @click="show_create_goal_dialog" v-if="can_be_edited()" class="mt-auto w-full bg-pink-500 rounded-lg flex flex-row justify-center items-center px-4 py-2 drop-shadow-lg">New +</button>
        </div>
        <div class="flex flex-row gap-[15px] flex-wrap mt-4">
            <div class="flex flex-row gap-1 items-center">
                <label class="text-sm">{{ abstract_count.toString().padStart(2,'0') }}</label>
                <img class="h-[14px] aspect-square" :src="'abstract.svg'">
            </div>
            <div class="flex flex-row gap-1 items-center">
                <label class="text-sm">{{ executable_count.toString().padStart(2,'0') }}</label>
                <img class="h-[14px] aspect-square" :src="'executable.svg'">
            </div>
            <div class="flex flex-row gap-1 items-center">
                <label class="text-sm">{{ paused_count.toString().padStart(2,'0') }}</label>
                <img class="h-[14px] aspect-square" :src="'paused.svg'">
            </div>
            <div class="flex flex-row gap-1 items-center">
                <label class="text-sm">{{ in_progress_count.toString().padStart(2,'0') }}</label>
                <img class="h-[14px] aspect-square" :src="'in_progress.svg'">
            </div>
            <div class="flex flex-row gap-1 items-center">
                <label class="text-sm">{{ complete_count.toString().padStart(2,'0') }}</label>
                <img class="h-[14px] aspect-square" :src="'complete.svg'">
            </div>
        </div>
        <dialog v-if="show_confirm_complete_dialog" ref="confirm_complete_dialog" class="top-0 flex flex-col h-full items-center justify-center min-h-full max-h-full w-full min-w-full max-w-full bg-[#0b2428a0]">
            <div class="flex flex-col gap-6 rounded-lg bg-secondary w-[80%] p-10 box-border">
                <div class="flex flex-col gap-2 text-white w-full min-w-full max-w-full">
                    <label class="text-2xl font-bold">Complete goal</label>
                    <p class="leading-6">Are you sure you want to complete "{{ goal?.name }}"?</p>
                </div>
                <div class="w-full min-w-full max-w-full flex flex-row gap-4 text-white">
                    <button class="bg-pink-500 p-3 grow rounded-lg drop-shadow-lg" @click="try_change_goal_state('COMPLETE')">Confirm</button>
                    <button class="bg-gray-300 p-3 grow rounded-lg text-black drop-shadow-lg" @click="close_confirm_complete_dialog">Cancel</button>
                </div>
            </div>
        </dialog>
        <dialog v-if="show_confirm_delete_dialog" ref="confirm_delete_dialog" class="top-0 flex flex-col h-full items-center justify-center min-h-full max-h-full w-full min-w-full max-w-full bg-[#0b2428a0]">
            <div class="flex flex-col gap-6 rounded-lg bg-secondary w-[80%] p-10 box-border items-center">
                <div class="flex flex-col gap-2 text-white w-full min-w-full max-w-full">
                    <label class="text-2xl font-bold">Delete goal</label>
                    <p class="leading-6">Are you sure you want to delete "{{ goal?.name }}"?</p>
                </div>
                <div class="w-full min-w-full max-w-full flex flex-row gap-4 text-white">
                    <button class="bg-pink-500 p-3 grow rounded-lg drop-shadow-lg" @click="try_change_goal_state('DELETE')">Confirm</button>
                    <button class="bg-gray-300 p-3 grow rounded-lg text-black drop-shadow-lg" @click="close_confirm_delete_dialog">Cancel</button>
                </div>
            </div>
        </dialog>
    </div>
</template>