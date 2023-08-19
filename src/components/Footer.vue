<script setup>
    import { useRouter } from 'vue-router'

    const router = useRouter()

    function go_to_home(){
        router.push('/home')
    }

    function go_to_settings(){
        router.push('/settings')
    }
</script>

<template>
    <div class="flex row justify-center gap-8 w-full min-w-full max-w-full bg-secondary absolute bottom-0 py-6 box-border z-[1]">
        <img @click="go_to_home" class="hover:brightness-75 h-[25px] min-h-[25px] max-h-[25px] aspect-square" :src="'home.svg'">
        <img @click="go_to_settings" class="hover:brightness-75 h-[25px] min-h-[25px] max-h-[25px] aspect-square" :src="'dots_horizontal.svg'">
    </div>
</template>