import { messageCrossScript, type SendActionToBackground } from "../../scripts_chrome.types";
import { Gdrive, GdriveType } from "../../utils/googleDrive";
import { GoogleSpreadsheet, GSheetType } from "../../utils/googleSpreadsheet";
import { getAuthToken } from "../../utils/googleGetToken";

let lamaMuatByQtySpreadsheetId = "";
let monitoringKendaraanSpreadsheetId = "";
let dataForMonitoringKendaraan:string[][] = [];
let dataForReportLamaMuatByQtyFromRata2LamaMuat: string[][] = [];

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

        this.sendResponseToSidePanel("detail muat data: " + data.length + "row");
        
        try {
            const copySpreadsheet = await this.GdriveOperation.makeAcopyOfAFile(this.templateSpreadsheetIdLaporanDetailMuat, fileName);
            if(!copySpreadsheet.id ) throw new Error("Gagal make a copy of template");
            this.sendResponseToSidePanel("Berhasil make a copy template detail muat");

            const mappedData = data.map(row => {
                // Create a copy of the row to avoid modifying the original array
                const newRow = [...row];
                
                // Convert dates at indices 4, 5, 6, and 7
                newRow[4] = this.convertDateFormat(newRow[4]);
                newRow[5] = this.convertDateFormat(newRow[5]);
                newRow[6] = this.convertDateFormat(newRow[6]);
                newRow[7] = this.convertDateFormat(newRow[7]);
                
                return newRow;
            });
            
            dataForMonitoringKendaraan = mappedData.map((value) => [value[0], value[8], value[18]])
            // movve file
            await this.GdriveOperation.moveFileToFolder(copySpreadsheet.id, this.folderIdLaporanDetailMuat)
            
            const insertData2 = await this.GsheetOperation.setRangeValues(copySpreadsheet.id, "Worksheet!A2:X", mappedData);
            if(insertData2.isSuccess === false) throw new Error("Gagal copy data ke report detail muat");
            this.sendResponseToSidePanel("Berhasil copy data ke spreadsheet");
    
            this.sendResponseToSidePanel(`Detail muat kendaraan: https://docs.google.com/spreadsheets/d/${copySpreadsheet.id}\n\n`)
        } catch (error) {
            this.sendResponseToSidePanel("Gagal generate report detail muat: " + error.message)
        }        
    }

    private async createReportMonitoringKendaraan(data: string[][], fileName: string): Promise<void> {

        this.sendResponseToSidePanel("Monitoring kendaraan data: " + data.length + " row");

        try {
            
            const spreadsheetId = await this.GdriveOperation.makeAcopyOfAFile(this.templateSpreadsheetIdMonitoringKendaraan, fileName);
            if(spreadsheetId && !spreadsheetId?.id) throw new Error("Tidak dapat make a copy of a file")
            // move file
            await this.GdriveOperation.moveFileToFolder(spreadsheetId.id, this.folderIdMonitoringKendaraan)
            const filterData = data.filter((val) => val[0] != 'GPACK');
            
            const mappedData = filterData.map(row => {
                // Create a copy of the row to avoid modifying the original array
                const newRow = [...row];
                
                // Convert dates at indices 4, 5, 6, and 7
                newRow[4] = this.convertDateFormat(newRow[4]);
                newRow[5] = this.convertDateFormat(newRow[5]);
                newRow[6] = this.convertDateFormat(newRow[6]);
                newRow[7] = this.convertDateFormat(newRow[7]);
                
                return newRow;
            });
            // insertdata
            const insertData = await this.GsheetOperation.setRangeValues(spreadsheetId.id, "Worksheet!A2:R", mappedData)
            if(insertData.isSuccess === false) throw new Error("Tidak dapat memasukkan data #1");

            const insertData2 = await this.GsheetOperation.setRangeValues(spreadsheetId.id, "Sheet4!A5:C", dataForMonitoringKendaraan)
            if(insertData2.isSuccess === false) throw new Error("Tidak dapat memasukkan data #2");
    
            this.sendResponseToSidePanel(`Monitoring kendaraan: https://docs.google.com/spreadsheets/d/${spreadsheetId.id}\n\n`)

            // empty the data
            dataForMonitoringKendaraan = [];
        } catch (error) {
            this.sendResponseToSidePanel("Gagal generate report monitoring kendaraan" + JSON.stringify(error))
        }

    }

    private async createReportRata2LamaMuat(data: string[][], fileName: string): Promise<void> {

        this.sendResponseToSidePanel("rata2 lama muat data: " + data.length + " row");
        
        try {
            
            const spreadsheetId = await this.GdriveOperation.makeAcopyOfAFile(this.templateSpreadsheetIdRataRataLamaMuat, fileName);
            if(spreadsheetId && !spreadsheetId?.id) throw new Error("Tidak dapat make a copy of file")
                // move file
            await this.GdriveOperation.moveFileToFolder(spreadsheetId.id, this.folderIdRataRataLamaMuat)
            
            const mappedData = data.map(row => {
                // Create a copy of the row to avoid modifying the original array
                const newRow = [...row];
                
                // Convert dates at indices 4, 5, 6, and 7
                newRow[4] = this.convertDateFormat(newRow[7]);
                newRow[5] = this.convertDateFormat(newRow[8]);
                newRow[6] = this.convertDateFormat(newRow[9]);
                
                return newRow;
            });

            // insertdata
            const insertData = await this.GsheetOperation.setRangeValues(spreadsheetId.id, "Worksheet!A2:M", mappedData)
            if(insertData.isSuccess === false) throw new Error("Tidak dapat memasukkan data");
    
            dataForReportLamaMuatByQtyFromRata2LamaMuat = mappedData;
            this.sendResponseToSidePanel(`Rata rata lama muat: https://docs.google.com/spreadsheets/d/${spreadsheetId.id}\n\n`)
        } catch (error) {
            this.sendResponseToSidePanel("Gagal generate report rata2 lama muat" + JSON.stringify(error))
        }
    }

    private async createReportLamaMuatByQty(newFilename: string) {
        const isSpreadsheetCreated = lamaMuatByQtySpreadsheetId != "";

        try {
            
            if(!isSpreadsheetCreated) {
                const spreadsheetId = await this.GdriveOperation.makeAcopyOfAFile(this.templateSpreadsheetIdLaporanMuatByQuantity, newFilename);
                if(spreadsheetId && !spreadsheetId?.id) throw new Error("Tidak dapat make a copy of file")
                lamaMuatByQtySpreadsheetId = spreadsheetId.id
                // move file
                await this.GdriveOperation.moveFileToFolder(spreadsheetId.id, this.folderIdLaporanMuatByQuantity)    
            }
                
            // get values from monitoring kendaraan
            const getDataFromMonitoringKendaraan = await this.GsheetOperation.getValuesOnSpreadsheet(monitoringKendaraanSpreadsheetId, "Worksheet!A:AM")
            // filter data
            const filterData = getDataFromMonitoringKendaraan.data.map((value) => [value[0], value[1], Number(value[2]), value[3], value[19], value[20], value[21], value[22], Number(value[11]), Number(value[15])])
            const filterData2 = getDataFromMonitoringKendaraan.data.map((value) => [value[28], value[29], value[30], value[31]])
            
            // insert data
            const insertData1 = await this.GsheetOperation.setRangeValues(lamaMuatByQtySpreadsheetId, "database!B4:K", filterData);
            if(insertData1.isSuccess === false) throw new Error("Gagal memasukkan data ke report lama muat by qty #1");
            
            const insertData2 = await this.GsheetOperation.setRangeValues(lamaMuatByQtySpreadsheetId, "database!L4:O", filterData2);
            if(insertData2.isSuccess === false) throw new Error("Gagal memasukkan data ke report lama muat by qty #2");

            const insertData3 = await this.GsheetOperation.setRangeValues(lamaMuatByQtySpreadsheetId, "Worksheet!B4:N", dataForReportLamaMuatByQtyFromRata2LamaMuat);
            if(insertData3.isSuccess === false) throw new Error("Gagal memasukkan data ke report lama muat by qty #3");

            // empty record
            dataForReportLamaMuatByQtyFromRata2LamaMuat = [];

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
            await this.createReportLamaMuatByQty(newFilename)
        }
        
        if(params.whatDomain === 'rata2-lama-muat') {
            let fileNameToSet = `Laporan muat dengan total QTY ${params.spreadsheetFileName} rata rata lama muat`;
            await this.createReportRata2LamaMuat(params.data, fileNameToSet)

            // for lama muat by qty
            let newFilename = `Lama antri dan lama muat by quantity ${params.spreadsheetFileName}`;
            await this.createReportLamaMuatByQty(newFilename)
        }

        // notify that process is Finished
        this.writeResponse({ action: 'end-response', isSuccess: true })

    }

    private convertDateFormat(dateString: string) {
        // Split the date and time parts
        const [datePart, timePart] = dateString.split(' ');
        // Split the date part into year, month, and day
        const [year, month, day] = datePart.split('-');
        // Reassemble in the new format
        return `${day}-${month}-${year} ${timePart}`;
    }
}