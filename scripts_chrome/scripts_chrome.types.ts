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
                                |"bts-get-spreadsheet-data"
                                |"stb-absen-function"
                                |"btc-absen-function"
                                |"bts-absen-function"
                                |"ctb-absen-function"

export interface messageCrossScript {
    action: sidepanelCommunication,
    data: any
    message?: string
}

export interface GoogleApiResult {
    isSuccess: boolean
    message: string
    id: string
}

export type SendActionToBackground = (func: messageCrossScript) => void;

export interface absenParameterFunction {
    date: string
    departements: number[]
}

export interface messageCrossScriptAbsen {
    action: 'stb-absen-function' | 'btc-absen-function' | 'bts-absen-function',
    data: absenParameterFunction
    message?: string
}