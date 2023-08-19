<script setup>
    import { ref, onMounted, computed } from 'vue'
    import { useRouter } from 'vue-router'
    import {
        start_goal,
        pause_goal,
        complete_goal,
        delete_goal,
        update_goal,
        get_goals
    } from '../helpers/api.js'

    const props = defineProps({
        description: {type: String},
        estimated_deadline: {type: Number},
        goal_amount: {type: Number},
        goal_type: {type: String},
        goal_id: {type: Number},
        current_amount: {type: Number},
        id: {type: Number},
        deadline: {type: Number},
        measure_unit: {type: String},
        name: {type: String},
        speed: {type: Number},
        status: {type: String},
        time_unit: {type: String},
        updated_at: {type: Number},
        created_at: {type: Number}
    })

    const show_options = ref(false)
    const options = ref()
    const self = ref()
    const menu = ref()
    const increment_button = ref()
    const router = useRouter()
    const subgoals = ref([])
    const confirm_complete_dialog = ref()
    const confirm_delete_dialog = ref()
    const show_confirm_complete_dialog = ref(false)
    const show_confirm_delete_dialog = ref(false)

    const get_goal_icon = computed(() => {
        switch(props.goal_type){
            case 'ABSTRACT':
                return 'abstract.svg'
            case 'EXECUTABLE':
                return 'executable.svg'
            default:
                return ''
        }
    })

    const get_status_color = computed(() => {
        switch(props.status){
            case 'PAUSED':
                return 'text-yellow-400'
            case 'IN_PROGRESS':
                return 'text-blue-200'
            case 'COMPLETE':
                return 'text-green-400'
            default:
                return 'text-white'
        }
    })

    function is_abstract(){
        return props.goal_type == 'ABSTRACT'
    }

    function is_paused(){
        return props.status == 'PAUSED'
    }

    function is_in_progress(){
        return props.status == 'IN_PROGRESS'
    }

    function is_complete(){
        return props.status == 'COMPLETE'
    }

    function can_be_edited(){
        const valid_status = ['PAUSED','IN_PROGRESS'].indexOf(props.status) >= 0
        const valid_type = ['ABSTRACT','EXECUTABLE'].indexOf(props.goal_type) >= 0
        return valid_status && valid_type
    }

    function can_be_started(){
        const valid_status = ['PAUSED'].indexOf(props.status) >= 0
        const valid_type = ['ABSTRACT','EXECUTABLE'].indexOf(props.goal_type) >= 0
        return valid_status && valid_type
    }

    function can_be_paused(){
        const valid_status = ['IN_PROGRESS'].indexOf(props.status) >= 0
        const valid_type = ['ABSTRACT','EXECUTABLE'].indexOf(props.goal_type) >= 0
        return valid_status && valid_type
    }

    function can_be_completed(){
        const valid_status = ['PAUSED','IN_PROGRESS'].indexOf(props.status) >= 0
        const valid_type = ['ABSTRACT','EXECUTABLE'].indexOf(props.goal_type) >= 0
        return valid_status && valid_type
    }

    function can_be_deleted(){
        const valid_status = ['COMPLETE','PAUSED','IN_PROGRESS'].indexOf(props.status) >= 0
        const valid_type = ['ABSTRACT','EXECUTABLE'].indexOf(props.goal_type) >= 0
        return valid_status && valid_type
    }

    function toggle_options(){
        show_options.value = !show_options.value
        if(!show_options.value) return
        self.value.style.zIndex = '1'
        setTimeout(() => { document.addEventListener('click',close_dialog_when_click_out)},50)
    }

    function close_dialog_when_click_out(e){
        if(!e.target.isEqualNode(options.value) && !options.value?.contains(e.target)){
            document.removeEventListener('click',close_dialog_when_click_out)
            self.value.style.zIndex = '0'
            show_options.value = false
        }
        
        if(!e.target.isEqualNode(menu.value)) return
        document.removeEventListener('click',close_dialog_when_click_out)
        self.value.style.zIndex = '0'
    }

    function reset_item(){
        document.removeEventListener('click',close_dialog_when_click_out)
        self.value.style.zIndex = '0'
        show_options.value = false
    }

    function edit_goal(){
        reset_item()
        emit('edit_goal',props)
    }

    function increment_goal(){
        const goal = JSON.parse(JSON.stringify(props))
        const current_amount = parseFloat(props.current_amount)
        const goal_amount = parseFloat(props.goal_amount)

        goal.current_amount = parseFloat(goal.current_amount)+1

        update_goal(goal)
        .then(() => {
            if(goal_amount - current_amount != 1) return emit('goal_incremented')
            complete_goal(goal)
            emit('goal_status_changed')
        })
    }

    function decrement_goal(){
        const goal = JSON.parse(JSON.stringify(props))
        const current_amount = parseFloat(props.current_amount)
        const goal_amount = parseFloat(props.goal_amount)
        if(!goal.current_amount) return

        goal.current_amount = parseFloat(goal.current_amount)-1
        update_goal(goal)
        .then(() => emit('goal_decremented'))
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
        const params = JSON.parse(JSON.stringify(props))

        switch(state){
            case 'START':
                promise = start_goal(params)
                break
            case 'PAUSE':
                promise = pause_goal(params)
                break
            case 'COMPLETE':
                promise = complete_goal(params)
                break
            case 'DELETE':
                promise = delete_goal(params)
                break
        }

        promise
        .then(() => emit('goal_status_changed'))
        .catch(err => console.log('Error: ',err))
    }

    function go_to_item_page(){
        if(props.goal_type != 'ABSTRACT') return
        router.push({name: 'goal', params: {goal_id: props.id}})
    }

    function close_confirm_complete_dialog(){
        show_confirm_complete_dialog.value = false
    }

    function close_confirm_delete_dialog(){
        show_confirm_delete_dialog.value = false
    }

    const emit = defineEmits([
        'goal_status_changed',
        'edit_goal',
        'goal_incremented',
        'goal_decremented'
    ])

    onMounted(() => {
        get_goals({id: props.id})
        .then(data => { subgoals.value = data; console.log(data) })
        .catch(err => console.log('Error',err))
    })
</script>

<template>
    <div ref="self" class="flex flex-row p-4 gap-4 w-full min-w-full justify-between max-w-full bg-secondary items-start rounded-lg drop-shadow-lg box-border relative">
        <div class="flex flex-col grow gap-2">
            <div class="flex flex-row gap-4 items-center">
                <img class="h-[25px] min-h-[25px] max-h-[25px] aspect-square" :src="get_goal_icon">
                <div @click="go_to_item_page" class="flex flex-col max-w-[70%] gap-4">
                    <div v-if="!is_abstract()" class="flex flex-col">
                        <label class="whitespace-nowrap text-ellipsis text-lg overflow-hidden max-w-full">{{ name }}</label>
                        <label class="overflow-hidden max-w-full max-w-full text-sm text-[#f0f0f0] overflow-hidden max-w-full">{{ ((current_amount/goal_amount)*100).toFixed(2) }}% - {{ current_amount }} {{ measure_unit }}</label>
                    </div>
                    <div v-if="is_abstract()" class="flex flex-col">
                        <label class="whitespace-nowrap text-ellipsis text-lg overflow-hidden max-w-full">{{ name }}</label>
                        <label class="whitespace-nowrap text-ellipsis text-sm text-[#f0f0f0] overflow-hidden max-w-full">{{ subgoals.length }} sub goals</label>
                    </div>
                </div>
            </div>
            <div class="flex flex-row">
                <div class="flex flex-row gap-2 items-center">
                    <img v-if="is_paused()" :src="'paused.svg'" :class="[get_status_color]">
                    <img v-if="is_in_progress()" :src="'in_progress.svg'" :class="[get_status_color]">
                    <img v-if="is_complete()" :src="'complete.svg'" :class="[get_status_color]">
                    <label :class="['text-xs','text-[#f0f0f0]']">{{ status }}</label>
                </div>
            </div>
        </div>
        <div class="flex flex-col justify-between items-end min-h-full max-h-full">
            <div class="flex flex-row justify-center">
                <img ref="menu" @click="toggle_options" class="mr-0 ml-2 h-[20px] min-h-[20px] max-h-[20px]" :src="'dots_vertical.svg'">
                <div ref="options" v-if="show_options" class="flex flex-col top-full right-0 absolute bg-primary text-white rounded-b-lg">
                    <label @click="edit_goal" v-if="can_be_edited()" class="py-2 px-3 box-border hover:backdrop-brightness-50 hover:text-white">Edit</label>
                    <label @click="try_start_goal" v-if="can_be_started()" class="py-2 px-3 box-border hover:backdrop-brightness-50 hover:text-white">Start</label>
                    <label @click="try_pause_goal" v-if="can_be_paused()" class="py-2 px-3 box-border hover:backdrop-brightness-50 hover:text-white">Pause</label>
                    <label @click="try_complete_goal" v-if="can_be_completed()" class="py-2 px-3 box-border hover:backdrop-brightness-50 hover:text-white">Complete</label>
                    <label @click="try_delete_goal" v-if="can_be_deleted()" class="py-2 px-3 box-border text-red-500 hover:text-red-700">Delete</label>
                </div>
            </div>
            <div class="flex flex-row gap-2">
                <button v-if="!is_abstract()" ref="increment_button" @click="increment_goal" class="bg-blue-500 w-[30px] min-w-[30px] max-w-[30px] h-[30px] min-h-[30px] max-h-[30px] flex flex-row justify-center items-center box-border rounded-[100%] text-2xl font-bold">+</button>
                <button v-if="!is_abstract()" ref="decrement_button" @click="decrement_goal" class="bg-blue-500 w-[30px] min-w-[30px] max-w-[30px] h-[30px] min-h-[30px] max-h-[30px] flex flex-row justify-center items-center box-border rounded-[100%] text-2xl font-bold">-</button>
            </div>
        </div>
    </div>
    <dialog v-if="show_confirm_delete_dialog" ref="confirm_delete_dialog" class="top-0 flex flex-col h-full items-center justify-center min-h-full max-h-full w-full min-w-full max-w-full bg-[#0b2428a0] z-[1]">
        <div class="flex flex-col gap-6 rounded-lg bg-secondary w-[80%] p-10 box-border items-center">
            <div class="flex flex-col gap-2 text-white w-full min-w-full max-w-full">
                <label class="text-2xl font-bold">Delete goal</label>
                <p class="leading-6">Are you sure you want to delete "{{ props.name }}"?</p>
            </div>
            <div class="w-full min-w-full max-w-full flex flex-row gap-4 text-white">
                <button class="bg-pink-500 p-3 grow rounded-lg drop-shadow-lg" @click="try_change_goal_state('DELETE')">Confirm</button>
                <button class="bg-gray-300 p-3 grow rounded-lg text-black drop-shadow-lg" @click="close_confirm_delete_dialog">Cancel</button>
            </div>
        </div>
    </dialog>
    <dialog v-if="show_confirm_complete_dialog" ref="confirm_complete_dialog" class="top-0 flex flex-col h-full items-center justify-center min-h-full max-h-full w-full min-w-full max-w-full bg-[#0b2428a0] z-[1]">
        <div class="flex flex-col gap-6 rounded-lg bg-secondary w-[80%] p-10 box-border">
            <div class="flex flex-col gap-2 text-white w-full min-w-full max-w-full">
                <label class="text-2xl font-bold">Complete goal</label>
                <p class="leading-6">Are you sure you want to complete "{{ props.name }}"?</p>
            </div>
            <div class="w-full min-w-full max-w-full flex flex-row gap-4 text-white">
                <button class="bg-pink-500 p-3 grow rounded-lg drop-shadow-lg" @click="try_change_goal_state('COMPLETE')">Confirm</button>
                <button class="bg-gray-300 p-3 grow rounded-lg text-black drop-shadow-lg" @click="close_confirm_complete_dialog">Cancel</button>
            </div>
        </div>
    </dialog>
</template>