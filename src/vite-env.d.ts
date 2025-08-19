/// <reference types="vite/client" />
type sidepanelCommunication = 
                                |"bts-get-spreadsheet-data"
                                |"stb-get-spreadsheet-data"
                                |"bts-run-hello-world"
                                |"stb-run-hello-world"

interface messageCrossScript {
    action: sidepanelCommunication,
    data: string
}