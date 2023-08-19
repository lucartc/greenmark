<script setup>
    import { ref, onMounted } from 'vue'
    import { get_goals } from '../helpers/api.js'

    const goal_count = ref(null)
    const abstract_count = ref(0)
    const executable_count = ref(0)
    const paused_count = ref(0)
    const in_progress_count = ref(0)
    const complete_count = ref(0)

    const emit = defineEmits([
        'create_goal'
    ])

    function show_create_goal_dialog(){
        emit('create_goal')
    }

    onMounted(() => {
        update()
    })

    function update(){
        get_goals()
        .then(data => {
            goal_count.value = data.filter(item => !item.goal_id).length
            goal_count.value = goal_count.value > 99 ? '+99' : goal_count.value
            if(goal_count.value != null){
                abstract_count.value = data.filter(item => (item.goal_type == 'ABSTRACT' && !item.goal_id)).length
                executable_count.value = data.filter(item => (item.goal_type == 'EXECUTABLE' && !item.goal_id)).length
                paused_count.value = data.filter(item => (item.status == 'PAUSED' && !item.goal_id)).length
                in_progress_count.value = data.filter(item => (item.status == 'IN_PROGRESS' && !item.goal_id)).length
                complete_count.value = data.filter(item => (item.status == 'COMPLETE' && !item.goal_id)).length
            }
        })
        .catch(err => console.log('Error',err))
    }

    defineExpose({
        update
    })
</script>

<template>
        <div class="flex flex-col w-full min-w-full max-w-full bg-secondary rounded-b-lg p-8 py-8 box-border gap-4 text-white drop-shadow-lg">
            <div class="flex flex-col gap-6">
                <div class="flex flex-row gap-3 items-center">
                    <img class="h-[20px] min-h-[20px] max-h-[20px]" :src="'home.svg'">
                    <label class="text-lg h-fit">Welcome home!</label>
                    <div class="ml-auto flex flex-row">
                        <button @click="show_create_goal_dialog" class="mt-auto font-bold w-full bg-pink-500 rounded-lg flex flex-row justify-center items-center px-4 py-2 drop-shadow-lg">New +</button>
                    </div>
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-lg font-bold">{{  (new Date()).toLocaleDateString('en-US',{dateStyle: 'full'}) }}</label>
                    <label class="text-white">{{ goal_count }} goals registered</label>
                </div>
            </div>
            <div class="flex flex-row gap-[15px] flex-wrap">
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
        </div>
</template>