import { messageCrossScript, type SendActionToBackground } from "../../scripts_chrome.types";
import { Gdrive, GdriveType } from "../../utils/googleDrive";
import { GoogleSpreadsheet, GSheetType } from "../../utils/googleSpreadsheet";
import { getAuthToken } from "../../utils/googleGetToken";

let lamaMuatByQtySpreadsheetId = "";

export class Antrian2BackgroundJS {
    
    private templateSpreadsheetIdLaporanDetailMuat = "1c-ffd6um6pNKxPVKhbpq9djBvAQBxi70N-_DVH21ryI";
    private templateSpreadsheetIdMonitoringKendaraan = "1A-77iD6HQM5tPQc_Pb2p526bvMtdkgLk-oL4Xsh1Pmc";
    private templateSpreadsheetIdRataRataLamaMuat = "16muHvCrVVYVLJX7RvsXC4g9EIOWs2p7KRJ9dCALMzhg";
    private templateSpreadsheetIdLaporanMuatByQuantity = "1l_bLL_PjvoEAxIqQueG4RwOZufbHSTMQfiL-IXx-_DI";
    
    
    // private folderIdLaporanMuatByQuantity = "1M1NoKPWzCAu4z8P44zpzCIpDYRCm454c";
    // private folderIdLaporanDetailMuat = "1gstNp74BrpKwxCbu8VQKlhPKNbRH7wbi";
    // private folderIdMonitoringKendaraan = "1DHhQxXnQj0Nc1EAJPAPDZdLhBxJ7zN1b";
    // private folderIdRataRataLamaMuat = "1dQ0sr1mXS4htt-qGIv-4lD7-r6MoE5yh";
    
    // =========================== test =================================== //
    private folderIdLaporanMuatByQuantity = "1KBYwGvnd0G8JkL9z1Z6XE7wAiKS4P0Zi";
    private folderIdLaporanDetailMuat = "1KBYwGvnd0G8JkL9z1Z6XE7wAiKS4P0Zi";
    private folderIdMonitoringKendaraan = "1KBYwGvnd0G8JkL9z1Z6XE7wAiKS4P0Zi";
    private folderIdRataRataLamaMuat = "1KBYwGvnd0G8JkL9z1Z6XE7wAiKS4P0Zi";
    
    private GdriveOperation: GdriveType;
    private GsheetOperation: GSheetType;
    private isGoogleAPIReady: boolean = false;
    private writeResponse: SendActionToBackground;

    constructor(funcToSendAction: SendActionToBackground) {
        this.setUpGoogleAPI();
        this.writeResponse = funcToSendAction;
    }

    private async setUpGoogleAPI () {
        if(this.isGoogleAPIReady) return;
        const token = await getAuthToken(true);
        this.GdriveOperation = new Gdrive(token)
        this.GsheetOperation = new GoogleSpreadsheet(token)
        this.isGoogleAPIReady = true;
    }

    private async sendResponseToSidePanel(message: string) {
        this.writeResponse({ action: 'bts-antrian2-function', message })
    }

    private async createReportDetailMuat(data: string[][], fileName: string) {

        this.sendResponseToSidePanel("data detail muat received total length: " + data.length);
        
        try {
            
            const copySpreadsheet = await this.GdriveOperation.makeAcopyOfAFile(this.templateSpreadsheetIdLaporanDetailMuat, fileName);
            if(!copySpreadsheet.id ) throw new Error("Gagal make a copy of template");
            this.sendResponseToSidePanel("Berhasil make a copy template detail muat");
            
            // movve file
            await this.GdriveOperation.moveFileToFolder(copySpreadsheet.id, this.folderIdLaporanDetailMuat)
            
            const insertData2 = await this.GsheetOperation.setRangeValues(copySpreadsheet.id, "Worksheet!A2:X", data);
            if(insertData2.isSuccess === false) throw new Error("Gagal copy data ke report detail muat");
            this.sendResponseToSidePanel("Berhasil copy data ke spreadsheet");
    
            this.sendResponseToSidePanel(`Berhasil membuat report detail muat kendaraan: https://docs.google.com/spreadsheets/d/${copySpreadsheet.id}\n\n`)
        } catch (error) {
            this.sendResponseToSidePanel("Gagal generate report detail muat: " + error.message)
        }        
    }

    private async createReportMonitoringKendaraan(data: string[][], fileName: string): Promise<void> {

        this.sendResponseToSidePanel("data monitoring kendaraan received total length: " + data.length);

        try {
            
            const spreadsheetId = await this.GdriveOperation.makeAcopyOfAFile(this.templateSpreadsheetIdMonitoringKendaraan, fileName);
            if(spreadsheetId && !spreadsheetId?.id) throw new Error("Tidak dapat make a copy of a file")
            // move file
            await this.GdriveOperation.moveFileToFolder(spreadsheetId.id, this.folderIdMonitoringKendaraan)
            
            // insertdata
            const filterData = data.filter((val) => val[0] != 'GPACK');
            const insertData = await this.GsheetOperation.setRangeValues(spreadsheetId.id, "Worksheet!A2:R", filterData)
            if(insertData.isSuccess === false) throw new Error("Tidak dapat memasukkan data");
    
            this.sendResponseToSidePanel(`Berhasil membuat report monitoring kendaraan: https://docs.google.com/spreadsheets/d/${spreadsheetId.id}\n\n`)
        } catch (error) {
            this.sendResponseToSidePanel("Gagal generate report monitoring kendaraan" + JSON.stringify(error))
        }

    }

    private async createReportRata2LamaMuat(data: string[][], fileName: string): Promise<void> {

        this.sendResponseToSidePanel("data rata2 lama muat received total length: " + data.length);
        
        try {
            
            const spreadsheetId = await this.GdriveOperation.makeAcopyOfAFile(this.templateSpreadsheetIdRataRataLamaMuat, fileName);
            if(spreadsheetId && !spreadsheetId?.id) throw new Error("Tidak dapat make a copy of file")
                // move file
            await this.GdriveOperation.moveFileToFolder(spreadsheetId.id, this.folderIdRataRataLamaMuat)
            
            // insertdata
            const insertData = await this.GsheetOperation.setRangeValues(spreadsheetId.id, "Worksheet!A2:M", data)
            if(insertData.isSuccess === false) throw new Error("Tidak dapat memasukkan data");
    
            this.sendResponseToSidePanel(`Berhasil membuat report rata rata lama muat kendaraan: https://docs.google.com/spreadsheets/d/${spreadsheetId.id}\n\n`)
        } catch (error) {
            this.sendResponseToSidePanel("Gagal generate report rata2 lama muat" + JSON.stringify(error))
        }
    }

    private async createReportLamaMuatByQty(domain: string, data: string[][], newFilename: string) {
        const isSpreadsheetCreated = lamaMuatByQtySpreadsheetId != "";

        try {
            
            if(!isSpreadsheetCreated) {
                const spreadsheetId = await this.GdriveOperation.makeAcopyOfAFile(this.templateSpreadsheetIdLaporanMuatByQuantity, newFilename);
                if(spreadsheetId && !spreadsheetId?.id) throw new Error("Tidak dapat make a copy of file")
                lamaMuatByQtySpreadsheetId = spreadsheetId.id
                // move file
                await this.GdriveOperation.moveFileToFolder(spreadsheetId.id, this.folderIdLaporanMuatByQuantity)    
            }
            
            if(domain == 'monitoring-kendaraan') {
                
                // filter data
                const filterData = data.map((value) => [value[0], value[1], Number(value[2]), value[3], value[19], value[20], value[21], value[22], Number(value[11]), Number(value[15])])
                const filterData2 = data.map((value) => [value[28], value[29], value[30], value[31]])
                
                const insertData1 = await this.GsheetOperation.setRangeValues(lamaMuatByQtySpreadsheetId, "database!B4:K", filterData);
                if(insertData1.isSuccess === false) throw new Error("Tidak dapat memasukkan data bagian 1");
                
                const insertData2 = await this.GsheetOperation.setRangeValues(lamaMuatByQtySpreadsheetId, "database!L4:O", filterData2);
                if(insertData2.isSuccess === false) throw new Error("Tidak dapat memasukkan data bagian 2");
            }

            if(domain == 'rata2-lama-muat') {
                const insertData3 = await this.GsheetOperation.setRangeValues(lamaMuatByQtySpreadsheetId, "Worksheet!B4:N", data);
                if(insertData3.isSuccess === false) throw new Error("Gagal memasukkan data ke report lama muat by qty #3");
            
            }

            this.sendResponseToSidePanel(`Berhasil membuat report lama muat by quantity: https://docs.google.com/spreadsheets/d/${lamaMuatByQtySpreadsheetId}`);
        } catch (error) {

            this.sendResponseToSidePanel("Gagal generate report lama muat by Qty" + JSON.stringify(error.message))
        }
    }

    async generateReport(params: messageCrossScript) {
        // cancel it
        if(params.action != 'ctb-antrian2-function') return;

        await this.setUpGoogleAPI();
        if(params.whatDomain === 'detail-muat') {
            let fileNameToSet = `Laporan detail muat gudang ${params.spreadsheetFileName}`
            await this.createReportDetailMuat(params.data, fileNameToSet)
        }
        
        if(params.whatDomain === 'monitoring-kendaraan') {
            let fileNameToSet = `Laporan muat ${params.spreadsheetFileName}`;
            await this.createReportMonitoringKendaraan(params.data, fileNameToSet)

            // for lama muat by qty
            let newFilename = `Lama antri dan lama muat by quantity ${params.spreadsheetFileName}`;
            await this.createReportLamaMuatByQty(params.whatDomain, params.data, newFilename)
        }
        
        if(params.whatDomain === 'rata2-lama-muat') {
            let fileNameToSet = `Laporan muat dengan total QTY ${params.spreadsheetFileName} rata rata lama muat`;
            await this.createReportRata2LamaMuat(params.data, fileNameToSet)

            // for lama muat by qty
            let newFilename = `Lama antri dan lama muat by quantity ${params.spreadsheetFileName}`;
            await this.createReportLamaMuatByQty(params.whatDomain, params.data, newFilename)
        }

        // notify that process is Finished
        this.writeResponse({ action: 'end-response', isSuccess: true })

    }
}