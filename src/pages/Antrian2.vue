<script lang="ts" setup>
    import { onMounted, ref } from 'vue';
    import { type messageCrossScript } from "../../scripts_chrome/scripts_chrome.types"
    import EventEmitter from "../utils/EventEmitter";

    const dateStart = ref('');
    const dateEnd = ref('');

    const eventEmitSubscribe = new EventEmitter();
    const domains = ['detail-muat','monitoring-kendaraan', 'rata2-lama-muat']

    async function handleSubmit() {
        for (let domain of domains) {
            
            // @ts-ignore
            chrome.runtime.sendMessage(<messageCrossScript>{ action: 'stb-antrian2-function', data: {
                dateEnd: dateEnd.value,
                dateStart: dateStart.value,
                },
                whatDomain: domain
            });

            const isSuccess = await eventEmitSubscribe.waitForEvent('next-step');
            if(!isSuccess) return;
        }
    }

    onMounted(() => {
        // @ts-ignore
        chrome.runtime.onMessage.addListener((message: messageCrossScript, sender, sendResponse) => {
        //   listen to end of response
            if(message.action == 'end-response') {
                eventEmitSubscribe.emit("next-step", message.isSuccess)
            }
        });
    })
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