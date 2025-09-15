import { getWeekNumber } from "../../utils/tools";
import { Antrian2DetailMuat } from "./detailMuat";
import { Antrian2LamaMuatByQty } from "./lamaMuatByQty";
import { Antrian2MonitoringKendaraan } from "./monitoringKendaraan";
import { Antrian2Rata2LamaMuat } from "./rata2LamaMuat";
import { GoogleSpreadsheet } from "../../utils/googleSpreadsheet";
import { Gdrive } from "../../utils/googleDrive";
import { getAuthToken } from "../../utils/googleGetToken";
import { type SendActionToBackground } from "../../scripts_chrome.types";


class Antrian2 {
    private writeResponse: SendActionToBackground;

    constructor(funcToSendActionToBackground: SendActionToBackground) {
        this.writeResponse = funcToSendActionToBackground;
    }
    
    private sendResponse(message: string, data?: string) {
        const currentTime = new Date();
        const messageToSend = `${currentTime.toLocaleTimeString()} | ${message}`
        this.writeResponse({ action: "ctb-antrian2-function", message: messageToSend, data });
    }

    /**
     * Get data from sistem.
     *
     * @param dateStart string - The first period you want to get in MM-DD-YYYY
     * @param dateEnd string - The first period you want to get in MM-DD-YYYY
     */
    async generateReport(startDate: string, endDate: string) {

        
        try {
            // ========================= SETTING UP =============================//
            const token =  await getAuthToken(true);
            const GDriveOperation = new Gdrive(token);
            const GSheetOperation = new GoogleSpreadsheet(token);
            
            const monitorinKendaraanOps = new Antrian2MonitoringKendaraan(this.writeResponse, GDriveOperation, GSheetOperation)
            const detailMuatOps = new Antrian2DetailMuat(this.writeResponse, GDriveOperation, GSheetOperation)
            const rata2LamaMuatOps = new Antrian2Rata2LamaMuat(this.writeResponse, GDriveOperation, GSheetOperation)
            const lamaMuatByQtyOps = new Antrian2LamaMuatByQty(this.writeResponse, GDriveOperation, GSheetOperation)

            const startDateAsDate = new Date(startDate)
            const endDateAsDate = new Date(endDate) 
            
            const firstDateString = startDateAsDate.toLocaleDateString("ID-id").split("/").join("-")
            const lastDateString = endDateAsDate.toLocaleDateString("ID-id").split("/").join("-")
            const currentWeekNumber = getWeekNumber(startDateAsDate);
            // ========================= END OF SETTING UP =============================//

            // =========================== START PROCESS ================================== //
            const monitoringKendaraanSheetId = await monitorinKendaraanOps.createReportMonitoringKendaraan(firstDateString, lastDateString, currentWeekNumber);
            if(monitoringKendaraanSheetId === false) throw new Error("Gagal generate report monitoring kendaraan");
            
            const detailMuatSheetId = await detailMuatOps.createReportDetailMuat(firstDateString, lastDateString, monitoringKendaraanSheetId, currentWeekNumber);
            if(detailMuatSheetId === false) throw new Error("Gagal generate report detail muat");
            
            const rata2LamaMuatSheetId = await rata2LamaMuatOps.(firstDateString, lastDateString, monitoringKendaraanSheetId, currentWeekNumber);
            if(rata2LamaMuatSheetId === false) throw new Error("Gagal generate report rata2 lama muat");
        
        } catch (error) {
            
        }
    }
}