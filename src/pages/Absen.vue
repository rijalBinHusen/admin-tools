<script lang="ts" setup>
    import { ref, onMounted } from 'vue';
    import { type messageCrossScriptAbsen } from "../../scripts_chrome/scripts_chrome.types"

    const departements = [
        { id: 240, name: " GUDANG PRODUK STAFF" },
        { id: 392, name: " GUDANG JADI" },
        { id: 4513, name: "SUPPORT MUAT EXPORT SIR" },
        { id: 4511, name: "SUPPORT JABON SIR 1" },
        { id: 4512, name: "SUPPORT JABON SIR 2" },
        { id: 4509, name: "STAPEL SIR 1" },
        { id: 4515, name: "SUPPORT SIR 11" },
        { id: 4516, name: "SUPPORT SIR 2" },
        { id: 4514, name: "SUPPORT SIR" },
        { id: 4508, name: "SOPIR LANSIR SIR" },
        { id: 4510, name: "SUPPORT JABON SIR" },
        { id: 4527, name: "BL GJBC" },
        { id: 4528, name: "BL GJDP" },
        { id: 4529, name: "BL GJH3 GJCC" },
        { id: 4530, name: "BL GJJBN" },
        { id: 871, name: "BL GJST" }
    ]

    const departementSelected = ref<number[]>([]);
    const datePick = ref('');

    function handleSubmit() {
        // @ts-ignore
        chrome.runtime.sendMessage(<messageCrossScriptAbsen>{ action: 'stb-absen-function', data: {
            date: datePick.value,
            departements: departementSelected.value
        } });
    }

    const messageFromContentJS = ref<string[]>([]);

    onMounted(() => {
        // @ts-ignore
        chrome.runtime.onMessage.addListener((message:messageCrossScriptAbsen, sender, sendResponse) => {
            if(message.action == 'bts-absen-function') {
                messageFromContentJS.value.push(message.message + '')
            }
        });
    })
</script>

<template>
    <!-- [392, 4513, 4511, 4512, 4509, 4515, 4516, 4514, 4508, 4510] -->
    <div class="row">
        <div v-for="departemen of departements" class="col c12">
        <label>
            <input 
                type="checkbox" 
                name="option" 
                :value="departemen.id"
                v-model="departementSelected"
            > {{ departemen.name }}
        </label>
        </div>
        <div class="col c12">
            <label for="datePick">Periode </label>
            <input type="date" name="datePick" id="datePick" v-model="datePick">
        </div>
        <div>
            <input class="btn btn-b btn-sm smooth" type="submit" name="submit" id="submit" @click="handleSubmit">
        </div>
        <div class="msg">
            <div style="color: black" v-for="msg of messageFromContentJS">{{ msg }}</div>
        </div>
    </div>
</template>