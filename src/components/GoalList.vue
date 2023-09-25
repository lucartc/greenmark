<script setup>
    import { ref, computed } from 'vue'
    import { useRoute } from 'vue-router'
    import {
        get_goals,
        get_default_filter,
        get_default_order
    } from '@/helpers/api.js'
    import GoalListItem from './GoalListItem.vue'

    const goals = ref([])
    const goal_search = ref()
    const goal_order = ref('Name')
    const goal_filter = ref('')
    const complete_goals = ref()
    const route = useRoute()

    const filtered_goals = computed(() => {
        const results = goals.value
        .filter(goal => {
            if(goal_search.value){
                return goal.name.toUpperCase()
                       .match(goal_search.value?.toUpperCase())
            }
            return goal
        })
        .filter(goal => {
            switch(goal_filter.value){
                case "":
                    return true
                case "IN_PROGRESS":
                    return goal.status == "IN_PROGRESS"
                case "PAUSED":
                    return goal.status == "PAUSED"
                case "ABSTRACT":
                    return goal.goal_type == "ABSTRACT"
                case "EXECUTABLE":
                    return goal.goal_type == "EXECUTABLE"
                case "Incomplete":
                    return goal.status != "COMPLETE"
                case "Complete":
                    return goal.status == "COMPLETE"
            }
            return goal_filter.value ?
                   (
                    goal.goal_type == goal_filter.value ||
                    goal.status == goal_filter.value
                    ) :
                   true
        })
        console.log('results: ',results)
        switch(goal_order.value){
            case 'Name':
                return results.sort()
            case 'Latest':
                return results.sort((a,b) => b.created_at - a.created_at)
            case 'Oldest':
                return results.sort((a,b) => a.created_at - b.created_at)
            case 'Updated':
                return results.sort((a,b) => b.updated_at - a.updated_at)
            case 'Incomplete':
                return results.filter(res => res.status != 'COMPLETE')
                       .concat(results.filter(res => res.status == 'COMPLETE'))
            case 'Complete':
                return results.filter(res => res.status == 'COMPLETE')
                       .concat(results.filter(res => res.status != 'COMPLETE'))
            case 'Nearest deadline':
                return results.sort((a,b) => (b.deadline ? b.deadline : -Infinity) - (a.deadline ? a.deadline : -Infinity))
            case 'Farthest deadline':
                return results.sort((a,b) => (a.deadline ? a.deadline : Infinity) - (b.deadline ? b.deadline : Infinity))
            default:
                return results
        }
    })

    const emit = defineEmits([
        'show_edit_goal_dialog',
        'edit_goal',
        'goal_changed'
    ])

    defineExpose({
        update
    })

    function update(){
        goal_search.value = null
        
         const params = {
            id: route.params?.goal_id
         }

         get_goals(params)
         .then(data => {
            if(params.id){
                goals.value = data
                complete_goals.value = data.filter(item => item.status == 'COMPLETE')
            }else{
                goals.value = data.filter(item => !item.goal_id)
                complete_goals.value = data.filter(item => !item.goal_id && item.status == 'COMPLETE')
            }
        })

        get_default_filter()
        .then(data => goal_filter.value = data)

        get_default_order()
        .then(data => goal_order.value = data)
    }

    function edit_goal(goal){
        emit('edit_goal',goal)
    }

    function show_edit_goal_dialog(){
        emit('show_edit_goal_dialog')
    }

    function emit_status_changed(){
        update()
        emit('goal_changed')
    }
</script>

<template>
    <div class="flex flex-col w-full min-w-full max-w-full py-2 box-border gap-4 text-white">
        <div class="flex flex-row w-full min-w-full max-w-full gap-3">
            <div class="flex flex-col gap-1">
                <label class="text-xs">Sort by</label>
                <select v-model="goal_order" class="text-[0.7rem] bg-transparent caret-pink-500">
                    <option class="text-black text-[0.6rem]" value="Name">Name</option>
                    <option class="text-black text-[0.6rem]" value="Latest">Latest</option>
                    <option class="text-black text-[0.6rem]" value="Oldest">Oldest</option>
                    <option class="text-black text-[0.6rem]" value="Updated">Updated</option>
                    <option class="text-black text-[0.6rem]" value="Incomplete">Incomplete</option>
                    <option class="text-black text-[0.6rem]" value="Complete">Complete</option>
                    <option class="text-black text-[0.6rem]" value="Nearest deadline">Nearest deadlines</option>
                    <option class="text-black text-[0.6rem]" value="Farthest deadline">Farthest deadline</option>
                </select>
            </div>
            <div class="flex flex-col gap-1">
                <label class="text-xs">Show only</label>
                <select v-model="goal_filter" class="text-[0.7rem] bg-transparent">
                    <option class="text-black text-[0.6rem]" value="">All</option>
                    <option class="text-black text-[0.6rem]" value="IN_PROGRESS">In progress</option>
                    <option class="text-black text-[0.6rem]" value="PAUSED">Paused</option>
                    <option class="text-black text-[0.6rem]" value="ABSTRACT">Abstract</option>
                    <option class="text-black text-[0.6rem]" value="EXECUTABLE">Executable</option>
                    <option class="text-black text-[0.6rem]" value="Incomplete">Incomplete</option>
                    <option class="text-black text-[0.6rem]" value="Complete">Complete</option>
                </select>
            </div>
            <div class="flex flex-row gap-2 ml-auto items-center">
                <input v-model="goal_search" class="text-black w-[60px] min-w-[60px] max-w-[60px] bg-gray-200 rounded-lg py-1 p-2 text-sm drop-shadow-lg" type="text">
                <img class="ml-2 h-[20px] h-[20px] h-[20px] aspect-square" :src="'search.svg'">
            </div>
        </div>
        <div class="flex flex-col gap-4">
            <GoalListItem :key="Date.now()" @goal_incremented="update" @goal_decremented="update" @edit_goal="edit_goal" @goal_status_changed="emit_status_changed" v-for="goal in filtered_goals" v-bind="goal" @show_edit_goal_dialog="show_edit_goal_dialog"></GoalListItem>
            <div class="flex flex-row items-center bg-secondary py-4 px-4 box-border rounded-lg gap-3" v-if="!goals.length">
                <img :src="'info.svg'">
                <label class="text-white">There are no goals registered</label>
            </div>
        </div>
    </div>
</template>