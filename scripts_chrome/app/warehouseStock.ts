// import { FetchRequest } from "../../utils/third_party/fetch_request"
// import config from "../../../config-src.json"
// import { getWeekNumber } from "../../utils/script"
// import { Spreadsheet } from "../../utils/spreadsheet";
// import { EventEmitter } from "stream";

// interface StockResponse {
//     ItemID: string
//     ItemName: string
//     Inventory_Unit: string
//     SaldoAwal: string
//     LPB: string
//     AG: string
//     BOM: string
//     MasukLainLain: string
//     RETUR: string
//     PMK: string
//     KeluarLT: string
//     KeluarLainLain: string
//     BOMOUT: string
//     KeluarTR: string
//     MasukTR: string
//     SaldoAkhir: string
//     Old_ID: string
//     Description: string
//     Cust_ItemID: null,
//     Cust_Desc: string
//     Supp_ItemID: string
//     Supp_Desc: string
//     UnitSetID: string
//     Unit2: string
//     Storage_Unit: string
//     Purchase_Unit: string
//     Purchase_Price: string
//     Purchase_Ccy: string
//     Sales_Unit: string
//     Sales_Price: string
//     Sales_Ccy: string
//     ItemType: string
//     Lot_: string
//     ItemGroupID: string
//     ItemCategoryID: string
//     ItemBrandID: string
//     ItemModelID: string
//     ClassID: string
//     GL_GroupID: string
//     Tax_GroupID: string
//     Size_: string
//     Color: string
//     Material: string
//     Motif: null,
//     Weight: string
//     Weight_Unit: null,
//     Length_: string
//     Width_: string
//     Height: string
//     Dim_Unit: null,
//     Vol_: string
//     Volume: string
//     Volume_Unit: string
//     ValueMtd: string
//     Remarks: string
//     LastTransDate: string
//     LastTransCode: string
//     Std_cost: string
//     Inspect_: string
//     WeightingFactor: string
//     ReOrderPoint: string
//     MinStockQty: string
//     MinOrderQty: string
//     DateExpired: null,
//     Barcode: null,
//     PrioritySuppID: null,
//     LeadTimeDays: string
//     Supply_: string
//     Master_: string
//     Fence: string
//     OrderHorz: string
//     PlanHorz: string
//     PlanMethod: string
//     MaxQty: string
//     SafetyQty: string
//     FixedOrderQty: string
//     Production_unit: string
//     Blocked: string
//     Obsolete: string
//     SQTtolerance: string
//     PQTTolerance: string
//     ProtectStdCost_: string
//     SMinQtTol: string
//     PMinQtTol: string
//     UpdateLastPurchasePrice_: string
//     UseQty2Calc_: string
//     InternalProcess: string
//     BackFlush: string
//     QtyOrderMultiply: string
//     MaxOrderQty: string
//     DefLocID: null,
//     BaseComp1: string
//     BaseComp2: string
//     BaseComp3: string
//     BaseComp4: string
//     RegisterDate: null,
//     Added_by: null,
//     Changed_by: string
//     Last_Modified: string
// }

// interface Dates {
//     lastDate: Date
//     lastDateString: string
//     firstDate6day: Date
//     firstDate6dayString: string
//     weekNumber: number
// }

// export class Stock_Etally_model {

//     request;
//     urlLogin = "auth/login";
//     warehouses;
//     spreadsheetOperation;
//     dates: Dates;

//     spreadsheetIdReportStock = "1sRjCuc4gDRs3i8hfnfAKkxCFV9hnAXRVKnTL9Wje-L4"
//     folderIdReportStock = "1rt_JTnIg_Gy4tFoM95noiwzKd5FA7dB0";

//     newSpreadsheetIdStock = "";

//     constructor() {
//         this.request = new FetchRequest();
//         this.warehouses = [
//             "GJJBN", "GJBC", "GJDP", "GJST", "GJCC", "GJH3", "GJKOPI"
//         ]
//         this.spreadsheetOperation = new Spreadsheet();
//         this.dates = {
//             lastDate: new Date(),
//             firstDate6day: new Date(),
//             firstDate6dayString: "",
//             weekNumber: 0,
//             lastDateString: ""
//         };
//         this.setDate();
//     }

//     // async loginToETally(): Promise<string|false> {
//     //     // GET default cookie
//     //     const endPoint = config.ETallyURL + this.urlLogin;
//     //     return this.request.loginAdmin(config.ETallyUser, endPoint);
//     // }

//     async getStock(dateStart: string, dateEnd: string, warehouse: string): Promise<StockResponse[]|string> {
//         const currentDate = new Date();
//         const dateToSend = currentDate.toLocaleDateString("JP")
//         const urlToGetStock = `${config.ETallyURL}report/get_list_stock?tgl1=${dateStart}&tgl2=${dateEnd}&tgl3=${dateToSend}&tgl4=${dateToSend}&get_gd=%25${warehouse}%25&src=1`;

//         const getData = await this.request.doFetch(urlToGetStock, "", "GET", true);

//         if (getData.status === 200) { 

//             const result = getData.data as StockResponse[];
//             return result;
//         }

//         return "Failed to get data from ETally";
//     }

//     // setDate() {

//     //     const lastDate = new Date();
//     //     lastDate.setDate(lastDate.getDate() - lastDate.getDay());
//     //     const lastDateString = lastDate.toLocaleDateString("ID-id").replace(/-/g, "-")

//     //     const firstDate6day = new Date(lastDate);
//     //     firstDate6day.setDate(lastDate.getDate() - 6);
//     //     const weekNumber = getWeekNumber(firstDate6day);
//     //     const firstDate6dayString = firstDate6day.toLocaleDateString("ID-id").replace(/-/g, "-")

//     //     this.dates = {
//     //         lastDate,
//     //         lastDateString,
//     //         firstDate6day,
//     //         firstDate6dayString,
//     //         weekNumber
//     //     }
//     // }

//     async getStockAndEntryToSpreadsheet(subscriberEmit: EventEmitter) {

//         subscriberEmit.emit("message", "Mulai membuat report stock!");
//         const login = await this.loginToETally();
//         if (login === false) {
//             subscriberEmit.emit("message", `Gagal melakukan login ke sistem E-Tally`)
//             return;
//         }
//         subscriberEmit.emit("message", login)

//         const weekNumber = this.dates.weekNumber
//         const firstDate6dayString = this.dates.firstDate6dayString
//         const lastDateString = this.dates.lastDateString
//         const firstDate6day = this.dates.firstDate6day
//         const lastDate = this.dates.lastDate

//         subscriberEmit.emit("message", "Copying spreadsheet template and move to folder")
//         const newFilename = `Report stock all gudang W${weekNumber} ${firstDate6dayString} sampai dengan ${lastDateString}`
//         const copiedSpreadsheet = await this.spreadsheetOperation.copySpreadsheetToFolder(this.spreadsheetIdReportStock, this.folderIdReportStock, newFilename)
        
//         subscriberEmit.emit("message", copiedSpreadsheet.message)
//         if(!copiedSpreadsheet.isSuccess) {
//             return;
//         }

//         subscriberEmit.emit("message", "Mendapatkan data dari sistem")
//         const stockToInsert = [];
//         for(let d = firstDate6day; d <= lastDate; d.setDate(d.getDate() + 1)) {
//             const date = d.toISOString().slice(0, 10);
//             for (let wh of this.warehouses) {
                
//                 const stocks = await this.getStock(date, date, wh);
//                 if(typeof stocks === 'string') return stocks;
    
//                 for(let stock of stocks) {

//                     stockToInsert.push([
//                         weekNumber,
//                         date,
//                         wh,
//                         stock.ItemID, 
//                         stock.ItemName, 
//                         stock.Inventory_Unit, 
//                         Number(stock.SaldoAwal),
//                         Number(stock.LPB),
//                         Number(stock.AG),
//                         Number(stock.BOM),
//                         Number(stock.MasukLainLain),
//                         Number(stock.MasukTR),
//                         Number(stock.RETUR),
//                         Number(stock.PMK),
//                         Number(stock.KeluarLT),
//                         Number(stock.KeluarLainLain),
//                         Number(stock.KeluarTR), 
//                         Number(stock.SaldoAkhir)
//                     ])
//                 }
//                 subscriberEmit.emit("message", `Berhasil mendapatkan laporan stock gudang ${wh} periode ${date}`)
//             }
//         }
//         const response = await this.spreadsheetOperation.insertDataToSheet(copiedSpreadsheet.id, "Sheet1!A3:R", stockToInsert);
        
//         subscriberEmit.emit("message", response.message);
//         subscriberEmit.emit("message", "Berhasil membuat report stock: https://docs.google.com/spreadsheets/d/" + copiedSpreadsheet.id);
//         this.newSpreadsheetIdStock = copiedSpreadsheet.id;
//         // subscriberEmit.emit("message", "close");
//     }
// }