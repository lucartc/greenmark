<script setup>
    const props = defineProps({
        menu: {type: String}
    })
</script>

<template>
        <div class="flex flex-col w-full min-w-full max-w-full bg-menu-item rounded-b-lg p-10 py-8 box-border gap-8 text-white mb-5">
            <div class="flex flex-row gap-4">
                <div v-if="menu == 'settings'" class="flex flex-row gap-4">
                    <img class="w-[30px] min-w-[30px] max-w-[30px] aspect-square" :src="'settings.svg'" alt="">
                    <label class="text-xl font-bold">Settings</label>
                </div>
                <div v-if="menu == 'statistics'" class="flex flex-row gap-4">
                    <img class="w-[30px] min-w-[30px] max-w-[30px] aspect-square" :src="'statistics.svg'" alt="">
                    <label class="text-xl font-bold">Statistics</label>
                </div>
                <div v-if="menu == 'export_data'" class="flex flex-row gap-4">
                    <img class="w-[30px] min-w-[30px] max-w-[30px] aspect-square" :src="'data.svg'" alt="">
                    <label class="text-xl font-bold">Export data</label>
                </div>
                <div v-if="menu == 'tasks'" class="flex flex-row gap-4">
                    <img class="w-[30px] min-w-[30px] max-w-[30px] aspect-square" :src="'tasks.svg'" alt="">
                    <label class="text-xl font-bold">Tasks</label>
                </div>
            </div>
        </div>
</template>