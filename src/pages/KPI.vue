<script lang="ts" setup>
    import { type messageCrossScript } from "../../scripts_chrome/scripts_chrome.types"

    async function handleSubmit() {
            // @ts-ignore
            chrome.runtime.sendMessage(<messageCrossScript>{ action: 'stb-kpi' })
    }
</script>

<template>
    <div class="row">
        <div class="col c12">
            <h2>Entry kpi</h2>
            <input class="btn btn-b btn-sm smooth" value="Input KPI" type="submit" name="submit" id="submit" @click="handleSubmit">
        </div>
    </div>
</template>