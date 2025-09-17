export interface spreadsheetResponse {
    isSuccess: boolean,
    data: any
}

export interface GoogleApiResult {
    isSuccess: boolean
    message: string
    id: string
}

export type SendActionToBackground = (func: messageCrossScript) => void;

// StB =  sidepanel to background.js
// BtC = background.js to contetnt.js
// CtB = Content.js to background.js
// BtS = background to Sidepanel.js

export type messageCrossScript = BTSAction
                                    |STBActionAbsen
                                    |STBActionParameterPeriodStartEnd
                                    |BTCActionParameterPeriodStartEnd
                                    |CTBAction
                                    |CTBActionAntrian2
                                    |BTCAntrian2

export interface absenParameterFunction {
    date: string
    departements: number[]
}

interface parameterPeriodStartEnd {
    dateStart: string
    dateEnd: string
    mode?: modeUpah
}

interface STBActionAbsen {
    action: 'stb-absen-function' | 'btc-absen-function',
    data: absenParameterFunction
}

export type modeUpah = 'check'|'generate';

interface STBActionParameterPeriodStartEnd {
    action: 'stb-upah-bl' | 'stb-antrian2-function',
    data: parameterPeriodStartEnd
}

interface BTSAction {
    action: 'bts-upah-bl' | 'bts-antrian2-function'| 'bts-absen-function',
    message: string
}

interface CTBAction {
    action: 'ctb-upah-bl' | 'ctb-absen-function' | 'send-message',
    message: string
}

type DomainAntrian2 = 'detail-muat'|'monitoring-kendaraan'|'rata2-lama-muat';

interface CTBActionAntrian2 {
    action: 'ctb-antrian2-function',
    data: string[][],
    whatDomain: DomainAntrian2
    spreadsheetFileName: string
}

interface BTCActionParameterPeriodStartEnd {
    action: 'btc-upah-bl'
    data: parameterPeriodStartEnd
}

interface BTCAntrian2 {
    action: 'btc-antrian2-function'
    data: parameterPeriodStartEnd
    whatDomain: DomainAntrian2
}