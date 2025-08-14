export interface spreadsheetResponse {
    isSuccess: boolean,
    data: string
}

// StB =  sidepanel to background.js
// BtC = background.js to contetnt.js
// CtB = Content.js to background.js
// BtS = background to Sidepanel.js

export type sidepanelCommunication = "stb-run-hello-world"
                                |"ctb-run-hello-world"
                                |"btc-run-hello-world"
                                |"bts-run-hello-world"
                                |"stb-get-spreadsheet-data"
                                |"btc-get-spreadsheet-data"
                                |"ctb-get-spreadsheet-data"
                                |"bts-get-spreadsheet-data"

export interface messageCrossScript {
    action: sidepanelCommunication,
    data: string
}