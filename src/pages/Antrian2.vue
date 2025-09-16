<script lang="ts" setup>
    import { ref } from 'vue';
    import { type parameterPeriodStartEnd } from "../../scripts_chrome/scripts_chrome.types"

    const dateStart = ref('');
    const dateEnd = ref('');

    function handleSubmit() {
        // @ts-ignore
        chrome.runtime.sendMessage(<parameterPeriodStartEnd>{ action: 'stb-antrian2-function', data: {
            dateEnd: dateEnd.value,
            dateStart: dateStart.value
            },
        });
    }
</script>

<template>
    <div class="row">
        <div class="col c12">
            <label for="dateStart">Start periode </label>
            <input type="date" name="dateStart" id="dateStart" v-model="dateStart">
        </div>
        <div class="col c12">
            <label for="dateEnd">End periode</label>
            <input type="date" name="dateEnd" id="dateEnd" v-model="dateEnd">
        </div>
        <div>
            <input class="btn btn-b btn-sm smooth" type="submit" name="submit" id="submit" @click="handleSubmit">
        </div>
    </div>
</template>