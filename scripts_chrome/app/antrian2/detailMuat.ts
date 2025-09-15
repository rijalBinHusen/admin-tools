export class Antrian2DetailMuat {

    request;
    currentWeekNumber = 0;
    urlDownloadLaporanDetailMuatGudang = "report/xls_report_gudang"
    templateSpreadsheetIdLaporanDetailMuat = "1c-ffd6um6pNKxPVKhbpq9djBvAQBxi70N-_DVH21ryI";
    folderIdLaporanDetailMuat = "1gstNp74BrpKwxCbu8VQKlhPKNbRH7wbi";
    
    // folderIdMonitoringKendaraan = "1KBYwGvnd0G8JkL9z1Z6XE7wAiKS4P0Zi";
    // folderIdLaporanDetailMuat = "1KBYwGvnd0G8JkL9z1Z6XE7wAiKS4P0Zi";
    // folderIdRataRataLamaMuat = "1KBYwGvnd0G8JkL9z1Z6XE7wAiKS4P0Zi";
    // folderIdLaporanMuatByQuantity = "1KBYwGvnd0G8JkL9z1Z6XE7wAiKS4P0Zi";
    
    spreadsheetIdLaporanDetailMuat = "";
    
    constructor() {
        this.request = new FetchRequest();
        this.spreadsheetOperation = new Spreadsheet();
    }

    async loginToAntrian2(): Promise<string|false>  {
        // GET default cookie
        const endPoint = config.antrianURL + this.urlLogin;
        return this.request.loginAdmin(config.antrianUser, endPoint)
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
}