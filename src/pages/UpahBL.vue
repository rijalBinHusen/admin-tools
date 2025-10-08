<script lang="ts" setup>
    import { ref } from 'vue';
    import { type messageCrossScript, type modeUpah } from "../../scripts_chrome/scripts_chrome.types"

    const dateStart = ref('');
    const dateEnd = ref('');
    const mode = ref<modeUpah>('check')

    function sendMessageToChrome (param: messageCrossScript) {
        // @ts-ignore
        chrome.runtime.sendMessage(param);
    }

    function handleSubmit() {
        
        if(mode.value == 'approve') {
            sendMessageToChrome({ action: 'stb-approve-upah-bl', data: {
                dateEnd: dateEnd.value,
                dateStart: dateStart.value,
                users: [
                    { displayName: "Lesmana Permadi", password: "123", username: "permadi" },
                    { displayName: "Rori Maulidi", password: "123", username: "rori" },
                  ]
                },
            })
        } else {
            sendMessageToChrome({ action: 'stb-upah-bl', data: {
                dateEnd: dateEnd.value,
                dateStart: dateStart.value,
                mode: mode.value
                },
            })
        }
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
        <div class="col c12">
            <!-- generate input radio 2 choices -->

            <input v-model="mode" type="radio" name="mode" id="check" value="check"></input>
            <label for="check">Periksa</label>
            
            <input v-model="mode" type="radio" name="mode" id="generate" value="generate"></input>
            <label for="generate">Generate</label>

            <input v-model="mode" type="radio" name="mode" id="approve" value="approve"></input>
            <label for="generate">Approve</label>
        </div>
        <div>
            <input class="btn btn-b btn-sm smooth" type="submit" name="submit" id="submit" @click="handleSubmit">
        </div>
    </div>
</template>