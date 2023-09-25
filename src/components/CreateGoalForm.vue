<script setup>
    import { ref, computed } from 'vue'
    import { useRoute } from 'vue-router'
    import { create_goal } from '@/helpers/api.js'

    const name = ref()
    const goal_type = ref('ABSTRACT')
    const measure_unit = ref('Characters')
    const time_unit = ref('1000')
    const speed = ref(1)
    const goal_amount = ref(1)
    const current_amount = ref(0)
    const deadline = ref()
    const description = ref()
    const route = useRoute()
    
    const should_show_executable_form = computed(() => {
        return goal_type.value == 'EXECUTABLE'
    })

    function try_create_goal(){
        const data = {
            goal_id: route.params.goal_id ? parseInt(route.params.goal_id) : null,
            name: name.value,
            goal_type: goal_type.value,
            measure_unit: measure_unit.value,
            time_unit: time_unit.value,
            speed: speed.value,
            goal_amount: goal_amount.value,
            current_amount: current_amount.value,
            description: description.value,
            deadline: deadline.value ? Date.parse(deadline.value) : null
        }
        create_goal(data)
        .then(() => emit('goal_created'))
        .catch(err => console.log('Error: ',err))
    }

    function clear_form(){
        goal_type.value = 'ABSTRACT'
        measure_unit.value = 'Characters'
        time_unit.value = '1000'
        speed.value = 1
        goal_amount.value = 1
        current_amount.value = 0
    }

    function cancel_goal_creation(){
        clear_form()
        emit('cancel_goal_creation')
    }

    const emit = defineEmits([
        'goal_created',
        'cancel_goal_creation'
    ])
</script>

<template>
    <div class="flex flex-col gap-6 p-6 box-border w-[80%] min-w-[80%] max-w-[80%] max-h-[80%] bg-menu-item absolute rounded-lg drop-shadow-lg overflow-y-auto">
        <label class="text-white text-2xl font-bold">Create goal</label>
        <div class="flex flex-row flex-wrap text-white gap-4">
            <div class="w-full min-w-full max-w-full flex flex-col gap-1">
                <label class="whitespace-nowrap text-sm">Name</label>
                <input v-model="name" class="text-sm p-2 bg-gray-200 box-border text-black rounded-lg drop-shadow-lg" type="text">
            </div>
            <div class="w-full min-w-full max-w-full flex flex-col gap-1">
                <label class="whitespace-nowrap text-sm">Goal type</label>
                <select v-model="goal_type" class="text-sm p-2 bg-gray-200 box-border text-black w-full min-w-full max-w-full rounded-lg drop-shadow-lg">
                    <option value="ABSTRACT">Abstract</option>
                    <option value="EXECUTABLE">Executable</option>
                </select>
            </div>
            <div v-if="should_show_executable_form" class="flex flex-row flex-wrap text-white gap-4">
                <div class="flex flex-row w-full min-w-full max-w-full gap-6">
                    <div class="flex flex-col gap-1 grow">
                        <label class="whitespace-nowrap text-sm">Measure unit(MU)</label>
                        <select size="5" v-model="measure_unit" class="text-sm p-2 bg-gray-200 box-border text-black w-full min-w-full max-w-full rounded-lg drop-shadow-lg">
                            <optgroup label="Textual">
                                <option class="text-xs" value="Characters">Characters</option>
                                <option class="text-xs" value="Lines">Lines</option>
                                <option class="text-xs" value="Verses">Verses</option>
                                <option class="text-xs" value="Strophes">Strophes</option>
                                <option class="text-xs" value="Paragraphs">Paragraphs</option>
                                <option class="text-xs" value="Pages">Pages</option>
                                <option class="text-xs" value="Sections">Sections</option>
                                <option class="text-xs" value="Chapters">Chapters</option>
                                <option class="text-xs" value="Tomes">Tomes</option>
                                <option class="text-xs" value="Volumes">Volumes</option>
                                <option class="text-xs" value="Books">Books</option>
                                <option class="text-xs" value="Articles">Articles</option>
                            </optgroup>
                            <optgroup label="Musical">
                                <option class="text-xs" value="Albums">Albums</option>
                                <option class="text-xs" value="Singles">Singles</option>
                                <option class="text-xs" value="Disks">Disks</option>
                                <option class="text-xs" value="Songs">Songs</option>
                            </optgroup>
                            <optgroup label="Media">
                                <option class="text-xs" value="Chapters">Chapters</option>
                                <option class="text-xs" value="Episodes">Episodes</option>
                                <option class="text-xs" value="Movies">Movies</option>
                                <option class="text-xs" value="Trilogies">Trilogies</option>
                                <option class="text-xs" value="Series">Series</option>
                                <option class="text-xs" value="Seasons">Seasons</option>
                            </optgroup>
                            <optgroup label="Weight">
                                <option class="text-xs" value="Miligrams">Miligrams</option>
                                <option class="text-xs" value="Grams">Grams</option>
                                <option class="text-xs" value="Kilos">Kilos</option>
                                <option class="text-xs" value="Tons">Tons</option>
                            </optgroup>
                            <optgroup label="Volume">
                                <option class="text-xs" value="Mililiters">Mililiters</option>
                                <option class="text-xs" value="Liters">Liters</option>
                            </optgroup>
                            <optgroup label="Distance">
                                <option class="text-xs" value="Milimeters">Milimeters</option>
                                <option class="text-xs" value="Centimeters">Centimeters</option>
                                <option class="text-xs" value="Meters">Meters</option>
                                <option class="text-xs" value="Kilometers">Kilometers</option>
                            </optgroup>
                            <optgroup label="Generic quantities">
                                <option class="text-xs" value="Units">Units</option>
                                <option class="text-xs" value="Pairs">Pairs</option>
                                <option class="text-xs" value="Tens">Tens</option>
                                <option class="text-xs" value="Dozens">Dozens</option>
                                <option class="text-xs" value="Hundreds">Hundreds</option>
                                <option class="text-xs" value="Thousands">Thousands</option>
                                <option class="text-xs" value="Millions">Millions</option>
                                <option class="text-xs" value="Billions">Billions</option>
                                <option class="text-xs" value="Trillions">Trillions</option>
                            </optgroup>
                            <optgroup label="Professional">
                                <option class="text-xs" value="Meetings">Meetings</option>
                                <option class="text-xs" value="Jobs">Jobs</option>
                                <option class="text-xs" value="Tasks">Tasks</option>
                                <option class="text-xs" value="Presentations">Presentations</option>
                                <option class="text-xs" value="Reports">Reports</option>
                                <option class="text-xs" value="Projects">Projects</option>
                                <option class="text-xs" value="Trainees">Trainees</option>
                                <option class="text-xs" value="Interns">Interns</option>
                                <option class="text-xs" value="Employees">Employees</option>
                                <option class="text-xs" value="Clients">Clients</option>
                            </optgroup>
                            <optgroup label="Education">
                                <option class="text-xs" value="Classes">Classes</option>
                                <option class="text-xs" value="Tests">Tests</option>
                                <option class="text-xs" value="Exercises">Exercises</option>
                                <option class="text-xs" value="Lists">Lists</option>
                                <option class="text-xs" value="Subjects">Subjects</option>
                                <option class="text-xs" value="Assignments">Assignments</option>
                            </optgroup>
                        </select>
                    </div>
                    <div class="flex flex-col gap-1 grow">
                        <label class="whitespace-nowrap text-sm">Time unit(TU)</label>
                        <select size="5" v-model="time_unit" class="text-sm p-2 bg-gray-200 box-border text-black w-full min-w-full max-w-full rounded-lg drop-shadow-lg">
                            <option class="text-sm" value="1000">Second</option>
                            <option class="text-sm" value="60000">Minute</option>
                            <option class="text-sm" value="3600000">Hour</option>
                            <option class="text-sm" value="86400000">Day</option>
                            <option class="text-sm" value="604800000">Week</option>
                            <option class="text-sm" value="2592000000">Month</option>
                            <option class="text-sm" value="5184000000">Bimester</option>
                            <option class="text-sm" value="7776000000">Trimester</option>
                            <option class="text-sm" value="15552000000">Semester</option>
                            <option class="text-sm" value="31104000000">Year</option>
                        </select>
                    </div>
                </div>
                <div class="flex flex-row w-full min-w-full max-w-full gap-6">
                    <div class="flex flex-col gap-1">
                        <label class="whitespace-nowrap text-sm">Speed (MU/TU)</label>
                        <input v-model="speed" class="text-sm p-2 bg-gray-200 box-border text-black w-full min-w-full max-w-full rounded-lg drop-shadow-lg" type="number">
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="whitespace-nowrap text-sm">Goal amount</label>
                        <input v-model="goal_amount" class="text-sm p-2 bg-gray-200 box-border text-black w-full min-w-full max-w-full rounded-lg drop-shadow-lg" type="number">
                    </div>
                </div>
                <div class="flex flex-col w-full min-w-full max-w-full gap-1">
                    <label class="whitespace-nowrap text-sm">Current amount</label>
                    <input v-model="current_amount" class="bg-gray-200 text-black rounded-lg px-4 py-1" type="number">
                </div>
            </div>
            <div class="flex flex-col w-full min-w-full max-w-full gap-1">
                <label class="whitespace-nowrap text-sm">Description</label>
                <textarea v-model="description" rows="5" class="bg-gray-200 text-sm p-2 bg-gray-200 text-black w-full min-w-full max-w-full rounded-lg"></textarea>
            </div>
            <div class="flex flex-col w-full min-w-full max-w-full gap-1">
                <label class="whitespace-nowrap text-sm">Deadline</label>
                <input v-model="deadline" class="bg-gray-200 text-black rounded-lg px-4 py-1 w-full min-w-full max-w-full" type="datetime-local">
            </div>
        </div>
        <div class="flex flex-row gap-4">
            <button @click="try_create_goal" class="text-white bg-pink-500 px-5 py-3 rounded-lg drop-shadow-lg">Save</button>
            <button @click="cancel_goal_creation" class="text-black bg-gray-300 px-5 py-3 rounded-lg drop-shadow-lg">Cancel</button>
        </div>
    </div>
</template>