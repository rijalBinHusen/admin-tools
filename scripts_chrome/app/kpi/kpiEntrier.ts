import { type SendActionToBackground, messageCrossScript} from "../../scripts_chrome.types";
import { ThirdParty } from "../../utils/thirdParty"
import config from "../../../config.json"
export class EKPI {

    private thirdParty;
    private automationSpreadsheetId: string;
    private ekpiSpreadsheetIdRangeSetting: string;
    private ekpiRangeKuantiSetting: string;
    private ekpiRangeKualiSetting: string;
    private ekpiUsersRangeSetting: string;
    private timeWaiting = 1000 * 2;
    private localStorageName: string;
    private localStorageData: localStorageData = {
        spreadsheetId: "",
        endDate: "",
        startDate: "",
        userIdEntried: []
    };
    private ekpiStartDateRange: string;
    private ekpiEndDateRange: string;

    // ========================================== new code ========
    private writeResponse: SendActionToBackground;

    // ========================================== new code ========
    constructor (
        automationSpreadsheetId: string,
        ekpiSpreadsheetIdRangeSetting: string,
        ekpiRangeKuantiSetting: string,
        ekpiRangeKualiSetting: string,
        ekpiUsersRangeSetting: string,
        ekpiStartDateRange: string,
        ekpiEndDateRange: string,
        funcToSendActionToBackground: SendActionToBackground
    ) {
        this.thirdParty = new ThirdParty();
        this.automationSpreadsheetId = automationSpreadsheetId;
        this.ekpiSpreadsheetIdRangeSetting = ekpiSpreadsheetIdRangeSetting;
        this.ekpiRangeKuantiSetting = ekpiRangeKuantiSetting;
        this.ekpiRangeKualiSetting = ekpiRangeKualiSetting;
        this.ekpiUsersRangeSetting = ekpiUsersRangeSetting;
        this.ekpiStartDateRange = ekpiStartDateRange;
        this.ekpiEndDateRange = ekpiEndDateRange;
        this.localStorageName = "ekpiEntried";
        this.writeResponse = funcToSendActionToBackground;
    }

    private sendResponse(message: string, data?: string) {
        const currentTime = new Date();
        const messageToSend = `${currentTime.toLocaleTimeString()} | ${message}`
        this.writeResponse({ action: "ctb-kpi", message: messageToSend });
        // console.log(message, data)
    }

    async login(username: string, password: string): Promise<boolean> {

        const login = await fetch(location.origin + "/KPI/auth/login", {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "max-age=0",
                "content-type": "application/x-www-form-urlencoded",
                "upgrade-insecure-requests": "1"
            },
                "referrer": location.origin + "/KPI/",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": `username=${username}&password=${password}`,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            });

            return login.url === location.origin + "/KPI/raport"
    }

    async logout() {
        return fetch(location.origin + "/KPI/auth/logout")
    }

    isKPIEntried() {
        
    }

    async insert_kpi(user_id: string, periode1: string, periode2: string, kuantitatifPoint: pointKPI[], kualitatifPoint: pointKPI[]) {

        const response_report = await fetch(location.origin + `/KPI/raport/detail_raport?id=${user_id}&dept=7&raport=&tgl1=${periode1}&tgl2=${periode2}`, {
            "headers": {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "en-US,en;q=0.9",
                "x-requested-with": "XMLHttpRequest"
            },
            "referrer": location.origin + "/KPI/raport",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });

        if(response_report.status !== 200) return false;

        const report = await response_report.json() as Report_response;

        const isNotOkeToInsert = !report.nama || report.status.approved == "0";

        if(isNotOkeToInsert) {
            console.log("data sudah di input")
            return false;
        }
        
        const formData = new FormData();

        // add kuantitatif
        for(let i = 0; i < report.kuanti.length; i++) {
            let kuan = report.kuanti[i]
            formData.append(`real1[${i}]`, kuantitatifPoint[i].points + '');
            formData.append(`target1[${i}]`, '100');
            formData.append(`id1[${i}]`, '');
            formData.append(`desk1[${i}]`, kuan.desk);
            formData.append(`indikator1[${i}]`, kuan.indikator);
            formData.append(`params1[${i}]`, kuan.params);
            formData.append(`bobot1[${i}]`, kuan.bobot);
            formData.append(`ach1[${i}]`, kuantitatifPoint[i].points + '');
            if(kuantitatifPoint[i].remarks) {

                formData.append(`id_ansum1[${i}][]`, '');
                formData.append(`id_tr_ansum1[${i}][]`, '');
                formData.append(`dept_ansum1[${i}][]`, 7 + ''); // departemen yang menyebabkan tidak tercapai
                formData.append(`ket_ansum1[${i}][]`, kuantitatifPoint[i].remarks); // Keterangan TO tidak tercapai
            }
        }

        let index = 0;
        // add kualitatif
        for(let kual of report.kuali) {
            formData.append(`target2[]`, '100');
            formData.append(`real2[]`, kualitatifPoint[index].points + '');
            formData.append(`id2[]`, '');
            formData.append(`desk2[]`, kual.desk);
            formData.append(`params2[]`, kual.params);
            formData.append(`bobot2[]`, kual.bobot);
            formData.append(`ach2[]`, kualitatifPoint[index].points + '');
            if(kualitatifPoint[index].remarks) {

                formData.append(`id_ansum2[${index}][]`, '');
                formData.append(`id_tr_ansum2[${index}][]`, '');
                formData.append(`dept_ansum2[${index}][]`, 9 + ''); // departemen yang menyebabkan tidak tercapai
                formData.append(`ket_ansum2[${index}][]`, kualitatifPoint[index].remarks); // Keterangan TO tidak tercapai
            }
            index++;
        }

        formData.append("document[]", "(binary)");
        formData.append("id_user", user_id);
        formData.append("id_dept", "7");
        formData.append("id_raport", "");
        formData.append("tgl_awal", periode1);
        formData.append("tgl_akhir", periode2);
        formData.append("nama", report.nama);
        
        await fetch(location.origin + "/KPI/raport/edit_raport", {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "max-age=0",
                "upgrade-insecure-requests": "1"
            },
            "referrer": location.origin + "/KPI/raport",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": formData,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });

        return true
    }

    async getUsersEKPI(): Promise<Users_and_details[]|false> {

        const userRange = await this.thirdParty.getSpreadsheetValue(
            this.automationSpreadsheetId,
            this.ekpiUsersRangeSetting
        )
        
        const listUser = await this.thirdParty.getSpreadsheetValue(
            this.automationSpreadsheetId,
            userRange.values[0][0],
        );
        
        if(listUser?.values && listUser.values.length) {
            const userList:Users_and_details[] = listUser.values.map((rec) => ({
                name: rec[0],
                username: rec[1],
                password: rec[2],
                id_user: rec[3]
            }));
            return userList
        }

        return false
    }

    async getPointEKPI(): Promise<pointsEKPI|false> {
        const pointAlphabet = {
            B: 100,
            C: 80,
            K: 60
        }

        // spreadsheet id range
        const ekpiSpreadsheetIdRange = await this.thirdParty.getSpreadsheetValue(
            this.automationSpreadsheetId,
            this.ekpiSpreadsheetIdRangeSetting
        );
        // check is ekpiSpreadsheetIdRange is not empty
        const isNotNullEkpiSpreadsheetIdRange = ekpiSpreadsheetIdRange.values && ekpiSpreadsheetIdRange.values.length && ekpiSpreadsheetIdRange.values[0][0]
        if (!isNotNullEkpiSpreadsheetIdRange) {
            console.log("Ekpi spreadsheet id range is not found")
            return false;
        }
        
        // spreadsheet id
        const ekpiSpreadsheetId = await this.thirdParty.getSpreadsheetValue(
            this.automationSpreadsheetId,
            ekpiSpreadsheetIdRange.values[0][0]
        );
        // check is ekpiSpreadsheetId is not empty
        const isNotNullekpiSpreadsheetId = ekpiSpreadsheetId.values && ekpiSpreadsheetId.values.length && ekpiSpreadsheetId.values[0][0]
        if (!isNotNullekpiSpreadsheetId) {
            console.log("Ekpi spreadsheet id is not found")
            return false;
        }

        // kuantitaif range
        const kuantitatifRange = await this.thirdParty.getSpreadsheetValue(
            this.automationSpreadsheetId,
            this.ekpiRangeKuantiSetting
        )
        // check is kuantitatifRange is not empty
        const isNotNullkuantitatifRange = kuantitatifRange.values && kuantitatifRange.values.length && kuantitatifRange.values[0][0]
        if (!isNotNullkuantitatifRange) {
            console.log("Kuantitatif range is not found")
            return false;
        }
        
        // kuantitatif data
        const kuantitatifPoint = await this.thirdParty.getSpreadsheetValue(
            ekpiSpreadsheetId.values[0][0], 
            kuantitatifRange.values[0][0]
        );
        // check is kuantitatifPoint is not empty
        const isNotNullkuantitatifPoint = kuantitatifPoint.values && kuantitatifPoint.values.length && kuantitatifPoint.values[0][0]
        if (!isNotNullkuantitatifPoint) {
            console.log("Kuantitatif point not found")
            return false;
        }

        const pointsEKPI:pointsEKPI = {};
        
        if(kuantitatifPoint?.values && kuantitatifPoint.values.length) {
            for(let i = 0; i < kuantitatifPoint.values.length; i++) {
                const kuan = kuantitatifPoint.values[i];
                const kuantiUsername = kuan[0];
                const kuantiParam = kuan[8];
                const KRA =  kuan[2];
                const remarks = kuan[11]

                // if point is exists
                if(kuantiParam && Object.keys(pointAlphabet).includes(kuantiParam)) {
                    const isUsernameInitialized = pointsEKPI && pointsEKPI[kuantiUsername];
                    
                    if(isUsernameInitialized) {
                        pointsEKPI[kuantiUsername]['kuanti'].push({
                            // @ts-ignore
                            points: pointAlphabet[kuantiParam],
                            KRA,
                            remarks
                        })
                    }
                    else {
                        pointsEKPI[kuantiUsername] = {
                                kuanti: [{
                                    // @ts-ignore
                                    points: pointAlphabet[kuantiParam],
                                    KRA,
                                    remarks
                                }],
                                kuali: []
                        }
                    }
                }
            }
        }

        // kuantitatif range
        const kualitatifRange = await this.thirdParty.getSpreadsheetValue(
            this.automationSpreadsheetId,
            this.ekpiRangeKualiSetting
        )
        // check is kualitatifRange is not empty
        const isNotNullkualitatifRange = kualitatifRange.values && kualitatifRange.values.length && kualitatifRange.values[0][0]
        if (!isNotNullkualitatifRange) {
            console.log("Kualitatif range not found")
            return false;
        }

        // kuantitatif data
        const kualitatifPoint = await this.thirdParty.getSpreadsheetValue(
            ekpiSpreadsheetId.values[0][0],
            kualitatifRange.values[0][0]
        );
        // check is kualitatifPoint is not empty
        const isNotNullkualitatifPoint = kualitatifPoint.values && kualitatifPoint.values.length && kualitatifPoint.values[0][0]
        if (!isNotNullkualitatifPoint) {
            console.log("Kualitatif point not found")
            return false;
        }

        if(kualitatifPoint?.values && kualitatifPoint.values.length) {
            for(let i = 0; i < kualitatifPoint.values.length; i++) {
                const kual = kualitatifPoint.values[i];
                const kualiUsername = kual[0];
                const kualiKRA = kual[2];
                const kualiPoint = Number(kual[6]) < 60 ? 0 : Number(kual[6]);
                const remarks = kual[8]
                // if point is exists
                if(kualiKRA) {
                    const isUsernameInitialized = pointsEKPI && pointsEKPI[kualiUsername];

                    if(isUsernameInitialized) {
                        pointsEKPI[kualiUsername]['kuali'].push({
                            points: kualiPoint,
                            KRA: kualiKRA,
                            remarks
                        })
                    }
                }
            }
        }

        return pointsEKPI
    }

    async checkIsRaportEntriedOrNot(tgl1: string, tgl2: string): Promise<boolean> {

        const getRaport = await fetch(`/KPI/raport/show_raport?tgl1=${tgl1}&tgl2=${tgl2}`, {
            "headers": {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "en-US,en;q=0.9,id-ID;q=0.8,id;q=0.7",
                "x-requested-with": "XMLHttpRequest"
            },
            "referrer": "/KPI/raport",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
            });
        
        if(getRaport.status !== 200) return true;
        const report = await getRaport.json() as getRaportResponse;
        const isReportExists = report && report.raport && report.raport.length > 0 && report.raport[0].id_raport != null;
        return isReportExists;
    }
    
    async startEntry(periode1: string, periode2: string): Promise<string|true> {
        const users = await this.getUsersEKPI();
        if(!users) return "Gagal mendapatkan users";

        if(periode1 == "" || periode2 == "") return "Periode report tidak boleh kosong";

        const pointsKPI = await this.getPointEKPI();
        if(!pointsKPI) return `Gagal melakukan input E-KPI karena semua point E-KPI tidak ditemukan`;
        // else {
        //     this.sendResponse("Berhasil mendapatkan point ekpi: ",pointsKPI)
        // }
        
        let counter = 0;
        for(let user of users) {
            if(!user.id_user || !user.name || !user.password || !user.username) continue;
            
            this.sendResponse(`Melakukan input raport ${user.name}, data ke ${counter++} dari ${users.length}`);
            
            this.timeWaiting += 1000;
            await new Promise(resolve => setTimeout(resolve, this.timeWaiting));
            if (this.timeWaiting >= 7000) this.timeWaiting = 1000;

            // login
            const isLoginSuccess = await this.login(user.username, user.password);
            if(!isLoginSuccess) {
                this.sendResponse(`Gagal login ${user.name}`);
                continue;
            }
            
            const generatedPoint = this.generateAllPointas100(user.name);
            let pointKuanti = generatedPoint[user.name].kuanti;
            let pointKuali = generatedPoint[user.name].kuali;
            
            const isEKPIPointExists = pointsKPI[user.name];
            if(isEKPIPointExists) {
                
                pointKuanti = pointsKPI[user.name].kuanti;
                pointKuali = pointsKPI[user.name].kuali;
                this.sendResponse(`Input E-KPI ${user.name} Sesuai dengan point yang ada`);
            }
            
            else {
                
                this.sendResponse(`Input E-KPI ${user.name} all point as 100`);
            }

            const isReportEntried = await this.checkIsRaportEntriedOrNot(periode1, periode2);

            if(isReportEntried) {

                this.sendResponse(`Report sudah di entry. Gagal melakukan input E-KPI ${user.name}`);
            }
            else {
                await this.insert_kpi(user.id_user, periode1, periode2, pointKuanti, pointKuali);
            }
            // logout
            await this.logout();
        }
        return true
    }

    async runEKPIEntrier() {
        
        
        // check is current tab === /finger/index.php/login // http://182.16.186.138:8080/
        const isURLValid = window.location.host == '192.168.8.7:8080' || window.location.host == '182.16.186.138:8080'
        if (!isURLValid) {
            this.sendResponse("Anda tidak berada diaplikasi STT");
            return;
        }
        this.sendResponse("Anda berada diaplikasi STT")
        
        const startDateData = await this.thirdParty.getSpreadsheetValue(
            this.automationSpreadsheetId,
            this.ekpiStartDateRange,
        );
        
        const endDateData = await this.thirdParty.getSpreadsheetValue(
            this.automationSpreadsheetId,
            this.ekpiEndDateRange,
        );

        const periodeDateStart = startDateData.values[0][0];
        const periodeDateEnd = endDateData.values[0][0];

        const message = `Melakukan input ${periodeDateStart} - ${periodeDateEnd}`
        this.sendResponse(message)
        
        const isSuccess = await this.startEntry(periodeDateStart, periodeDateEnd);
        if(isSuccess === true) {
            this.sendResponse("Selesai input eKPI")
        } else {
            this.sendResponse(isSuccess)
        }
    }

    async waitAndReRun() {
        const current = new Date();
        const currentDate = current.getDate();

        const nextDate = currentDate + 1;
        const nextTimeRun = new Date(current); // Create a copy of the date to avoid modifying the original
        nextTimeRun.setDate(nextDate); // Set to the next hour, 0 minutes, 0 seconds, 0 milliseconds
        nextTimeRun.setHours(12, 3, 0, 0); // Set to the next hour, 0 minutes, 0 seconds, 0 milliseconds

        const timeWaiting = nextTimeRun.getTime() - current.getTime();
        await new Promise((resolve) => {
            setTimeout(() => resolve(""), timeWaiting)
        })
        this.runEKPIEntrier();
    }

    setDataToLocalStorage() {
        window.localStorage.setItem(
            this.localStorageName,
            JSON.stringify(this.localStorageData)
        )
    }

    getDataFromLocalStorage() {
        const getData = window.localStorage.getItem(this.localStorageName);
        if(getData) this.localStorageData = JSON.parse(getData);
    }

    generateAllPointas100(username: string): pointsEKPI {
        return {
            [username]: {
                kuali: [
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                ],
                kuanti: [
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                    { KRA: "", points: 100, remarks: ""},
                ],
            }
        }
    }
}

interface Kuantitatif {
    "id_kuanti": string,
    "id_user": string,
    "desk": string,
    "indikator": string,
    "params": string,
    "bobot": string,
    "draft": string,
    "active": string,
    "edited_by": string,
    "edited_on": string
}

interface Kualitatif {
    "id_kuali": string,
    "id_user": string,
    "desk": string,
    "params": string,
    "bobot": string,
    "draft": string,
    "active": string,
    "edited_by": string,
    "edited_on": string
}

interface Report_response {
    "nama": string,
    "status": {
        "approved": null,
        "number": null,
        "draft": null
    },
    "doc": [],
    "s_apv": {
        "number": null,
        "number2": null
    },
    "kuanti": Kuantitatif[],
    "kuali": Kualitatif[],
    "ansum1": "",
    "ansum2": ""
}

interface Users_and_details {
    name: string,
    username: string,
    password: string,
    id_user: string
}

interface pointKPI {
    points: number,
    KRA:  string
    remarks: string
}

interface pointsEKPI {
    [username: string]: {
        kuali: pointKPI[],
        kuanti: pointKPI[]
    }

}


interface getRaportResponse {
    "raport": [
        {
            "id_user": string
            "id_dept": string
            "nama": string
            "dept": string
            "area": string
            "id_hierarki": string
            "child": string
            "parent": string
            "direct": string
            "id_raport": null,
            "tgl_awal": null,
            "tgl_akhir": null
        }
    ],
    "periode": {
        "id_periode": string
        "nama": string
        "tgl_awal": string
        "tgl_akhir": string
        "edited_by": string
        "edited_on": string
    }
}

interface localStorageData {
    startDate: string
    endDate: string
    spreadsheetId: string
    userIdEntried: number[]
}