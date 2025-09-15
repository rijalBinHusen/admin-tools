import { FetchRequest } from "../utils/third_party/fetch_request";
import config from "../../config-src.json";
import { getWeekNumber, toSpreadsheetDate } from "../utils/script.js";
import { EventEmitter } from "stream";
import { Spreadsheet } from "../utils/spreadsheet";

export class Antrian2 {

    request;
    currentWeekNumber = 0;
    urlLogin = "login/login_process";
    urlLaporanMuat = "report/report_selesai";
    urlDownloadLaporanMuat = "report/xls_report_selesai"
    urlDownloadLaporanDetailMuatGudang = "report/xls_report_gudang"
    urlDownloadRataRataLamaMuat = "report/xls_report_muat_qty"

    templateSpreadsheetIdMonitoringKendaraan = "1A-77iD6HQM5tPQc_Pb2p526bvMtdkgLk-oL4Xsh1Pmc";
    templateSpreadsheetIdLaporanDetailMuat = "1c-ffd6um6pNKxPVKhbpq9djBvAQBxi70N-_DVH21ryI";
    templateSpreadsheetIdRataRataLamaMuat = "16muHvCrVVYVLJX7RvsXC4g9EIOWs2p7KRJ9dCALMzhg";
    templateSpreadsheetIdLaporanMuatByQuantity = "1l_bLL_PjvoEAxIqQueG4RwOZufbHSTMQfiL-IXx-_DI";

    // folderIdMonitoringKendaraan = "1KBYwGvnd0G8JkL9z1Z6XE7wAiKS4P0Zi";
    // folderIdLaporanDetailMuat = "1KBYwGvnd0G8JkL9z1Z6XE7wAiKS4P0Zi";
    // folderIdRataRataLamaMuat = "1KBYwGvnd0G8JkL9z1Z6XE7wAiKS4P0Zi";
    // folderIdLaporanMuatByQuantity = "1KBYwGvnd0G8JkL9z1Z6XE7wAiKS4P0Zi";
    folderIdMonitoringKendaraan = "1DHhQxXnQj0Nc1EAJPAPDZdLhBxJ7zN1b";
    folderIdLaporanDetailMuat = "1gstNp74BrpKwxCbu8VQKlhPKNbRH7wbi";
    folderIdRataRataLamaMuat = "1dQ0sr1mXS4htt-qGIv-4lD7-r6MoE5yh";
    folderIdLaporanMuatByQuantity = "1M1NoKPWzCAu4z8P44zpzCIpDYRCm454c";

    spreadsheetIdMonitoringKendaraan = "";
    spreadsheetIdLaporanDetailMuat = "";
    spreadsheetIdRataRataLamaMuat = "";

    spreadsheetOperation;

    constructor() {
        this.request = new FetchRequest();
        this.spreadsheetOperation = new Spreadsheet();
    }

    async loginToAntrian2(): Promise<string|false>  {
        // GET default cookie
        const endPoint = config.antrianURL + this.urlLogin;
        return this.request.loginAdmin(config.antrianUser, endPoint)
    }

    async createReportMonitoringKendaraan(tanggal_mulai: string, tanggal_akhir: string, emitEvent: EventEmitter) {
        emitEvent.emit('message', `Mendapatkan data laporan muat ${tanggal_mulai} - ${tanggal_akhir}`);
        const body = `tgl_awal=${tanggal_mulai}&tgl_akhir=${tanggal_akhir}`;
        const endPoint = config.antrianURL + this.urlDownloadLaporanMuat;

        const dataArray = await this.request.downloadXlsFile(endPoint, body)
        
        if(typeof dataArray === 'string' || !dataArray.length) {
            emitEvent.emit("message", dataArray);
            emitEvent.emit("message", "Gagal mendapatkan data laporan muat");
            emitEvent.emit("message", "close");
            return; 
        }

        emitEvent.emit("message", "Berhasil mendapatkan data laporan muat");
        // remove the first array
        dataArray.shift();

        const filterData = dataArray.filter((val) => val[0] != 'GPACK');
        const newFilename = `Laporan muat W${this.currentWeekNumber} ${tanggal_mulai} sampai dengan ${tanggal_akhir}`;

        emitEvent.emit("message", "Make a copy of template monitoring kendaraan");
        // const spreadsheetId = await copySpreadsheetToFolder(this.templateSpreadsheetIdMonitoringKendaraan, this.folderIdMonitoringKendaraan, newFilename);
        const spreadsheetId = await this.spreadsheetOperation.copySpreadsheetToFolder(this.templateSpreadsheetIdMonitoringKendaraan, this.folderIdMonitoringKendaraan, newFilename);
        emitEvent.emit("message", spreadsheetId.message)
        if(spreadsheetId.isSuccess === false) return;

        emitEvent.emit("Memasukkan data monitoring kendaraan");

        const insertData = await this.spreadsheetOperation.insertDataToSheet(spreadsheetId.id, "Worksheet!A2:P", filterData)
        emitEvent.emit("message", insertData.message)
        if(insertData.isSuccess === false) return;

        this.spreadsheetIdMonitoringKendaraan = spreadsheetId.id;
        emitEvent.emit("message", `Berhasil membuat report monitoring kendaraan: https://docs.google.com/spreadsheets/d/${spreadsheetId.id}\n\n`)
    }

    async createReportDetailMuat(tanggal_mulai: string, tanggal_akhir: string, emitEvent: EventEmitter) {
        emitEvent.emit('message', `Mendapatkan data detail muat gudang ${tanggal_mulai} - ${tanggal_akhir}`);
        const body = `tgl_awal=${tanggal_mulai}&tgl_akhir=${tanggal_akhir}`;
        const endPoint = config.antrianURL + this.urlDownloadLaporanDetailMuatGudang;

        const dataArray = await this.request.downloadXlsFile(endPoint, body)
        if(typeof dataArray === 'string') {
            emitEvent.emit("message", dataArray);
            return; 
        }
        emitEvent.emit("Berhasil mendapatkan data laporan detail muat");
        // remove the first array
        dataArray.shift();

        // only get some column to insert to monitoring kendaraan;
        const dataToInsertToMonitoringKendaraang = dataArray.map((value) => [value[0], value[8], value[18]])
        emitEvent.emit("message", "Memasukkan data SO, ekspedisi ke monitoring kendaraan");
        
        const insertData = await this.spreadsheetOperation.insertDataToSheet(this.spreadsheetIdMonitoringKendaraan, "Sheet4!A5:C", dataToInsertToMonitoringKendaraang);
        emitEvent.emit("message", insertData.message);
        if(insertData.isSuccess === false) return;

        emitEvent.emit("message", "Make a copy of template report detail muat");
        const newFilename = `Laporan detail muat gudang W${this.currentWeekNumber} ${tanggal_mulai} sampai dengan ${tanggal_akhir}`;
        const copySpreadsheet = await this.spreadsheetOperation.copySpreadsheetToFolder(this.templateSpreadsheetIdLaporanDetailMuat, this.folderIdLaporanDetailMuat, newFilename);
        emitEvent.emit("message", copySpreadsheet.message);
        if(copySpreadsheet.isSuccess === false) return;
        
        emitEvent.emit("message", "Memasukkan data");
        const insertData2 = await this.spreadsheetOperation.insertDataToSheet(copySpreadsheet.id, "Worksheet!A2:O", dataArray);
        emitEvent.emit("message", insertData2.message);
        if(insertData2.isSuccess === false) return;

        this.spreadsheetIdLaporanDetailMuat = copySpreadsheet.id;
        emitEvent.emit("message", `Berhasil membuat report detail muat kendaraan: https://docs.google.com/spreadsheets/d/${copySpreadsheet.id}\n\n`)

    }

    async createReportRataRataLamaMuat(tanggal_mulai: string, tanggal_akhir: string, emitEvent: EventEmitter) {
        emitEvent.emit("message",`Mendapatkan data rata rata lama muat gudang tanggal ${tanggal_mulai} - ${tanggal_akhir}`);
        const body = `tgl_awal=${tanggal_mulai}&tgl_akhir=${tanggal_akhir}`;
        const endPoint = config.antrianURL + this.urlDownloadRataRataLamaMuat;

        const dataArray = await this.request.downloadXlsFile(endPoint, body);
        if(typeof dataArray === 'string') {
            emitEvent.emit("message", dataArray);
            return;
        }
        dataArray.shift();
        emitEvent.emit("message ","Berhasil mendapatkan data rata rata lama muat gudang");
        // remove the first array

        emitEvent.emit("message ", "Make a copy of template rata rata lama muat");
        const newFilename = `Laporan muat dengan total QTY W${this.currentWeekNumber} ${tanggal_mulai} sampai dengan ${tanggal_akhir} rata rata lama muat`;
        const copySpreadsheet = await this.spreadsheetOperation.copySpreadsheetToFolder(this.templateSpreadsheetIdRataRataLamaMuat, this.folderIdRataRataLamaMuat, newFilename);
        emitEvent.emit("message ", copySpreadsheet.message);
        if(copySpreadsheet.isSuccess === false) return;

        emitEvent.emit("message","Memasukkan data");
        const insertData = await this.spreadsheetOperation.insertDataToSheet(copySpreadsheet.id, "Worksheet!A2:L", dataArray);
        emitEvent.emit("message", insertData.message);
        if(insertData.isSuccess === false) return;

        // globalVariable.RataRataLamaMuatSpreadsheetId = copySpreadsheet.id;
        emitEvent.emit("message", `Berhasil membuat report rata rata lama muat kendaraan: https://docs.google.com/spreadsheets/d/${copySpreadsheet.id}\n\n`)
    }

    async createReportLamaMuatByQuantity(tanggal_mulai: string, tanggal_akhir: string, emitEvent: EventEmitter) {
        emitEvent.emit("message", "\n\nMendapatkan data monitoring kendaraan dari google spreadsheet");
        const getDataFromMonitoringKendaraan = await this.spreadsheetOperation.getColumnsValue(this.spreadsheetIdMonitoringKendaraan, "Worksheet!A:AM");
        if(typeof getDataFromMonitoringKendaraan == 'string') {
            emitEvent.emit("message", "Gagal mendapatkan data dari monitoring kendaraan");
            return;
        }
        emitEvent.emit("message", "Filtering data monitoring kendaraan");
        const filterData = getDataFromMonitoringKendaraan.map((value) => [value[0], value[1], Number(value[2]), value[3], value[19], value[20], value[21], value[22], Number(value[11]), Number(value[15])])
        const filterData2 = getDataFromMonitoringKendaraan.map((value) => [value[28], value[29], value[30], value[31]])

        // remove the first element array
        filterData.shift();
        filterData2.shift();

        // ==================================================================================================================================================================

        emitEvent.emit("message", "Make a copy of template lama muat by quantity");
        const newFilename = `Lama antri dan lama muat by quantity W${this.currentWeekNumber} tanggal ${tanggal_mulai} sampai dengan ${tanggal_akhir}`;
        const copySpreadsheet = await this.spreadsheetOperation.copySpreadsheetToFolder(this.templateSpreadsheetIdLaporanMuatByQuantity, this.folderIdLaporanMuatByQuantity, newFilename);
        emitEvent.emit("message", copySpreadsheet.message);
        if(copySpreadsheet.isSuccess === false) return;

        // ==================================================================================================================================================================

        emitEvent.emit("message", "Memasukkan data bagian 1");
        const insertData1 = await this.spreadsheetOperation.insertDataToSheet(copySpreadsheet.id, "database!B4:K", filterData);
        emitEvent.emit("message", insertData1.message);
        if(insertData1.isSuccess === false) return;

        // ==================================================================================================================================================================
        
        emitEvent.emit("message", "Memasukkan data bagian 2");
        const insertData2 = await this.spreadsheetOperation.insertDataToSheet(copySpreadsheet.id, "database!L4:O", filterData2);
        emitEvent.emit("message", insertData2.message);
        if(insertData2.isSuccess === false) return;

        // ==================================================================================================================================================================

        emitEvent.emit("message", `Mendapatkan data muat + quantity tanggal ${tanggal_mulai} - ${tanggal_akhir}`);
        
        const body = `tgl_awal=${tanggal_mulai}&tgl_akhir=${tanggal_akhir}`;
        const endPoint = config.antrianURL + this.urlDownloadRataRataLamaMuat;
        const dataArray = await this.request.downloadXlsFile(endPoint, body)
        if(typeof dataArray === 'string') {
            emitEvent.emit("message", "Gagal mendapatkan data muat + quantity");
            return;
        }
        emitEvent.emit("message", "Berhasil mendapatkan data muat + quantity");
        // remove the first array
        dataArray.shift();

        emitEvent.emit("message", "Memasukkan data ke report muat + quantity");
        const insertData3 = await this.spreadsheetOperation.insertDataToSheet(copySpreadsheet.id, "Worksheet!B4:N", dataArray);
        emitEvent.emit("message", insertData3.message);
        if(insertData3.isSuccess === false) return;
        
        emitEvent.emit("message", `Berhasil membuat report lama muat by quantity: https://docs.google.com/spreadsheets/d/${copySpreadsheet.id}\n\n`);
    }

    async createReportBasedOnAntrian2(emitEvent: EventEmitter) {

        const login = await this.loginToAntrian2();
        if(login === false) {
            emitEvent.emit("message", "Gagal login ke antrian 2");
            return;
        }
        
        emitEvent.emit("message", login);

        const lastDate = new Date();
        lastDate.setDate(lastDate.getDate() - lastDate.getDay());

        const firstDate = new Date(lastDate);
        firstDate.setDate(lastDate.getDate() - 6);

        const firstDateString = firstDate.toLocaleDateString("ID-id").split("/").join("-")
        const lastDateString = lastDate.toLocaleDateString("ID-id").split("/").join("-")

        const firstDate6day = new Date(lastDate);
        firstDate6day.setDate(lastDate.getDate() - 6);
        const firstDate6dayString = firstDate6day.toLocaleDateString("ID-id").split("/").join("-")

        this.currentWeekNumber = getWeekNumber(firstDate6day)

        await this.createReportMonitoringKendaraan(firstDateString, lastDateString, emitEvent);
        await this.createReportDetailMuat(firstDateString, lastDateString, emitEvent);
        await this.createReportRataRataLamaMuat(firstDate6dayString, lastDateString, emitEvent);

        await new Promise((resolve) => {
            emitEvent.emit("message", "Tunggu 30 detik lagi untuk sort data");
            setTimeout(() => { resolve("") }, 10000);
        })
        // sort all report
        emitEvent.emit("message", "Sorting monitoring kendaraan data");
        const sortMonitoringKendaraan = await this.spreadsheetOperation.sortDataSpreadsheet(this.spreadsheetIdMonitoringKendaraan, [2, 4, 5], 1, 0, 18);
        emitEvent.emit("message", sortMonitoringKendaraan.message);
        if(sortMonitoringKendaraan.isSuccess === false) return;

        // =======================================================================

        emitEvent.emit("message", "\n\nSorting data laporan detail muat");
        const sortReportDetailMuat = await this.spreadsheetOperation.sortDataSpreadsheet(this.spreadsheetIdLaporanDetailMuat, [0, 4, 5], 1, 0, 24);
        emitEvent.emit("message", sortReportDetailMuat.message);
        if(sortReportDetailMuat.isSuccess === false) return;

        // ===============================================================================

        emitEvent.emit("message", "\n\nMerubah tanggal monitoring kendaraang");
        const insertData = await this.spreadsheetOperation.insertDataToSheet(this.spreadsheetIdMonitoringKendaraan, "Result1!A7", [[toSpreadsheetDate(firstDate)]]);
        emitEvent.emit("message", insertData.message);
        if(insertData.isSuccess === false) return;

        // ===============================================================================

        await this.createReportLamaMuatByQuantity(firstDateString, lastDateString, emitEvent);
        // await this.setSpreadsheetLinkToEKPI(emitEvent);
        emitEvent.emit("message", "close");
    }

    async setSpreadsheetLinkToEKPI(emitEvent: EventEmitter) {
        const sheetName = "OTIF";
        const weeklyReportSpreadsheetId = config.ekpi_spreadsheets.weekly_report_spreadsheet_id;
        const weeklyReportOTIFLastRow = await this.spreadsheetOperation.getLastRow(weeklyReportSpreadsheetId, sheetName, "A");

        const weeklyStartRowSource = (weeklyReportOTIFLastRow - 80) + 78; // adjustment by result

        const weeklyStartRowDestination = weeklyReportOTIFLastRow + 2;
        const weeklyEndRowDestination = (weeklyStartRowDestination + 80) + 79; // adjustment by result

        // copy range to range
        const weeklySourceRange = `${sheetName}!A${weeklyStartRowSource}:Z${weeklyReportOTIFLastRow}`;
        const weeklyDestinationRange = `${sheetName}!A${weeklyStartRowDestination}:Z${weeklyEndRowDestination}`;
        const copyRangeToRange = await this.spreadsheetOperation.copyRangeToRange(
                                        weeklyReportSpreadsheetId,
                                        weeklySourceRange,
                                        weeklyDestinationRange
                                    );
        emitEvent.emit("message", copyRangeToRange.message);
        if(copyRangeToRange.isSuccess === false) return;

        // set link 
        const linkRangeValue = `https://docs.google.com/spreadsheets/d/${this.spreadsheetIdLaporanDetailMuat}`;
        const setLink = await this.spreadsheetOperation.setValueToRange(weeklyReportSpreadsheetId, sheetName, `A${weeklyEndRowDestination + 2}`, linkRangeValue);
        emitEvent.emit("message", setLink.message);
        if(setLink.isSuccess === false) return;

        // ===================================================================================
        
        const sheetNameEkpi = "OTIFv2";
        const eKPISpreadsheetId = config.ekpi_spreadsheets.ekpi_fgwh_spreadsheet_id;
        const eKPILastRow = await this.spreadsheetOperation.getLastRow(eKPISpreadsheetId, sheetNameEkpi, "A");

        const eKPIStartRowSource = eKPILastRow - 112;

        const eKPIStartRowDestination = eKPILastRow + 2;
        const eKPIEndRowDestination = eKPIStartRowDestination + 112;

        // copy range to range
        const eKPISourceRange = `${sheetNameEkpi}!A${eKPIStartRowSource}:Z${eKPILastRow}`;
        const eKPIDestinationRange = `${sheetNameEkpi}!A${eKPIStartRowDestination}:Z${eKPIEndRowDestination}`;
        const copyRangeToRangeEKPI = await this.spreadsheetOperation.copyRangeToRange(
                                        eKPISpreadsheetId,
                                        eKPISourceRange,
                                        eKPIDestinationRange
                                    );
        emitEvent.emit("message", copyRangeToRangeEKPI.message);
        if(copyRangeToRangeEKPI.isSuccess === false) return;

        // set link 
        const linkRangeValueEkpi = `https://docs.google.com/spreadsheets/d/${this.spreadsheetIdLaporanDetailMuat}`;
        const setLinkEKPI = await this.spreadsheetOperation.setValueToRange(weeklyReportSpreadsheetId, sheetNameEkpi, `A${eKPIStartRowDestination + 2}`, linkRangeValueEkpi);
        emitEvent.emit("message", setLinkEKPI.message);
        if(setLinkEKPI.isSuccess === false) return;
    }

}