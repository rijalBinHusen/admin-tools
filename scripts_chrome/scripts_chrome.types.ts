export interface spreadsheetResponse {
    isSuccess: boolean,
    data: any
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
                                |"ctb-absen-function"
                                |'btc-absen-function'
                                |"ctb-upah-bl"
                                |'btc-upah-bl'
                                |"ctb-antrian2-function"
                                |"btc-antrian2-function"

export interface messageCrossScriptGeneral {
    action: sidepanelCommunication,
    data: any
    message?: string
}

export interface GoogleApiResult {
    isSuccess: boolean
    message: string
    id: string
}

export type messageCrossScript = messageCrossScriptGeneral|messageCrossScriptAbsen|messageCrossScriptUpah

export type SendActionToBackground = (func: messageCrossScript) => void;

export interface absenParameterFunction {
    date: string
    departements: number[]
}

export interface parameterPeriodStartEnd {
    dateStart: string
    dateEnd: string
    mode?: modeUpah
}

export interface messageCrossScriptAbsen {
    action: 'stb-absen-function' | 'btc-absen-function' | 'bts-absen-function',
    data: absenParameterFunction
    message?: string
}

export type modeUpah = 'check'|'generate';

export interface messageCrossScriptUpah {
    action: 'stb-upah-bl' | 'btc-upah-bl' | 'bts-upah-bl'
            | 'stb-antrian2-function' | 'btc-antrian2-function' | 'bts-antrian2-function',
    data: parameterPeriodStartEnd
    message?: string
}