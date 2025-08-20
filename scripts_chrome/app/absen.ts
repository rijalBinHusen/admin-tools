import { downloadAsFile, toSpreadsheetDate } from "../utils/tools";
import { type SendActionToBackground, absenParameterFunction } from "../scripts_chrome.types";

export class Absen {

    private messageToConfirm = <string[]>[];
    private writeResponse: SendActionToBackground;

    constructor(funcToSendActionToBackground: SendActionToBackground) {
        this.writeResponse = funcToSendActionToBackground;
    }

    private sendResponse(message: string, data?: string) {
        this.writeResponse({ action: "ctb-absen-function", message, data })
    }

    private async downloadAbsen(date: Date, departemenId: number): Promise<string|undefined> {
        // tanggal = MM/DD/YYYY
        // const body = `tgl=${tanggal_mulai}&tgl2=${tanggal_akhir}&xls=1`;
        const dateParameter = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`

        const body = `tgl=${dateParameter}&dept=${departemenId}&dibuat=&mengetahui=`;
        const fetchAbsen = await fetch("http://192.168.8.7:8080/finger/index.php/test11", {
            "headers": {
              "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
              "accept-language": "en-US,en;q=0.9",
              "cache-control": "no-cache",
              "content-type": "application/x-www-form-urlencoded",
              "pragma": "no-cache",
              "upgrade-insecure-requests": "1"
            },
            "referrer": "http://192.168.8.7:8080/finger/index.php/test11",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": body,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
          });
        
        if(fetchAbsen.redirected) {
            this.sendResponse("Anda belum login ke aplikasi absen")
            return;
        }

        const responseString = await fetchAbsen.text();
        const responseAsHTMLElemen = new DOMParser().parseFromString(responseString, "text/html");
        const table = responseAsHTMLElemen.querySelector("table");
        if(table == null ) {
            this.sendResponse(`Gagal mendapatkan data absen ${departemenId} tanggal ${dateParameter}`)
            return;
        }
        this.sendResponse(`Berhasil mendapatkan data absen ${departemenId} tanggal ${dateParameter}`)
        const dataArray = this.getTableDataAsArray(table);
        if(dataArray == null) return;
        // remove the first array
        // dataArray.shift();
        // [No, userid,	name,	deptname,	ma,	ssn,	in,	out,	Jam Kerja,	in,	out,	pkln,	pkll, ]
        // data to return [tanggal, userid, in, out, istirahat=1, pkln, Jam kerja]
        const isSunday = date.getDay() == 0;

        const result = <string[]>[];

        for (let i = 0; i < dataArray.length; i++) {
            const row = dataArray[i];
            if(i == 0) {
                result.push("Tanggal,id_finder,nama,departemen,masuk,keluar,istirahat,lembur,jk")
                continue;
            }
            let restHour = 1;

            const isFriday = date.getDay() == 5;
            // if friday and its outsourcing
            if(isFriday && departemenId != 392) restHour = 1.5;
            // if not friday and outsourcing 0.5 hours rest
            // if(!isFriday && departemenId == 4509) restHour = 0.5;
            // if working in 5 hours, there is no rest
            if(Number(row[8]) <= 6) restHour = 0;
            
            // std hour another than 392 departemen id
            let setStdHour = Number(row[8]) > 0 ? Number(row[8]) - restHour : 0;
            // if departemen id 392 && saturday and > 6 and morning worker
            const isSaturdayAndMorningWorkerOverTimeAndDeptId392 = departemenId == 392 && date.getDay() == 6 && Number(row[8]) > 6 && Number(row[6].substring(0, 2)) < 12;
            if(isSaturdayAndMorningWorkerOverTimeAndDeptId392) setStdHour += 0.5;

            // eventEmit.emit("message", `\n${new Date(tanggal)} - ${Number(row[1])}, ${row[6]}, ${row[7]}, ${restHour}, ${Number(row[11])}, ${setStdHour}\n`)
            let isNeedToPush = false;
            if(isSunday) {
                if(Number(row[8]) > 0) isNeedToPush = true;
            } 
            else isNeedToPush = true;

            if(isNeedToPush) {
                const isFingerInEmpty = row[6] == "" ? " In" : "";
                const isFingerOutEmpty = row[7] == "" ? " Out" : "";
                if(isFingerInEmpty || isFingerOutEmpty) {
                    this.messageToConfirm.push(`${row[2]} tidak ada Finger${isFingerInEmpty + isFingerOutEmpty }`);
                }

                const peopleName = row[2].replace(",", ". ");
                result.push([toSpreadsheetDate(new Date(dateParameter)), Number(row[1]), peopleName, row[3], row[6], row[7], restHour, Number(row[11]), setStdHour].join(","))
            }
        }
        return result.join("\n");
    }
    /**
     * Selects an HTML table element and converts its data into a 2D array of strings.
     * Each inner array represents a row, and contains the text content of its cells.
     *
     * @returns {string[][] | null} A 2D array of strings representing the table data,
     * or null if the table element is not found.
     */
    private getTableDataAsArray(table: HTMLTableElement): string[][]|null {

        if (!table) {
            console.warn(`Table not found.`);
            return null;
        }

        const tableData = <string[][]>[];

        // Select all rows within the table, including header rows (if any) and body rows
        // Using 'tr' selector covers both thead/tbody/tfoot rows.
        const rows = table.querySelectorAll('tr');

        rows.forEach(row => {
            const rowData = <string[]>[];
            // Select all cell elements within the current row (td for data cells, th for header cells)
            const cells = row.querySelectorAll('th, td');

            cells.forEach(cell => {
                // Get the text content of the cell and trim whitespace
                // @ts-ignore
                rowData.push(cell?.textContent.trim());
            });

            // Only add non-empty rows to the tableData array
            // This helps to skip rows that might just contain a single empty cell or no cells
            if (rowData.length > 0) {
                tableData.push(rowData);
            }
        });

        return tableData;
    }

    async startGetAbsen(parameter: absenParameterFunction) {
        
        // check is current tab === http://192.168.8.7:8080/finger/index.php/login
        if (window.location.host != '192.168.8.7:8080') {
            this.sendResponse("Anda tidak berada diaplikasi finger");
            return;
        }
        this.sendResponse("Anda berada diaplikasi finger")
        // if date is not set
        if (!parameter.date) {
            this.sendResponse("Tanggal belum ditentukan!")
            return;
        }
        
        const dateTimeInput = new Date(parameter.date);

        // check is user already logged in (or simply fetch absen, if it return us to login page, then it's not logged in yet)
        // fetch absen
        let result = <string[]>[];
        let index = 1;
        
        for(let dep of parameter.departements) {
            this.sendResponse(`Mendapatkan data ${index} dari ${parameter.departements.length}`)
            const getAbsen = await this.downloadAbsen(dateTimeInput, dep);
            if(getAbsen == null) continue;
            result.push(getAbsen);
            index++;
        }

        if(!result.length) return;
        
        if(this.messageToConfirm.length) {
            const message = this.messageToConfirm.join("\n");
            let confirm = window.confirm(message + "\n\nApakah Anda yakin ingin melanjutkan?");
            if(!confirm) {
                this.sendResponse("Proses download dibatalkan")
                return;
            };
        }

        const fileName = `${dateTimeInput.toLocaleDateString()} Absensi gudang jadi ${new Date().toLocaleTimeString("ID-id", { hour12: false })}.csv`;
        downloadAsFile(result.join("\n"), fileName);
        this.sendResponse("Berhasil mengunduh data " + fileName);
    }
}