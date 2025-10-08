

class UpahBoronganApprove {
  
  private async loginToApp(name: string, password: string): Promise<boolean> {
    try {
      const url = '/warehouse/auth/login';
      const body = `username=${name}&password=${password}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
        referrer: "/warehouse/",
        mode: 'cors',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Login failed with status: ${response.status}`);
      }

      const cookies = response.headers.get('Set-Cookie');
      if (!cookies) {
        throw new Error('No Set-Cookie header found in the response.');
      }

      return true;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  private logOut() {
    return fetch("/warehouse/auth/logout", {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9",
        "upgrade-insecure-requests": "1"
      },
      "referrer": "/warehouse/relation/user_gudang",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "include"
    });
  }

  private async checkUsername(username: string): Promise<boolean> {
    try {
        const url = '/warehouse/user/profile';
        const response = await fetch(url, { referrer: "/warehouse/" });
        if (!response.ok) {
            throw new Error(`Failed to fetch user data: ${response.status}`);
        }
        const html = await response.text();
      
        const responseAsHTMLElemen = new DOMParser().parseFromString(html, "text/html");
        const userElement = responseAsHTMLElemen.querySelector('#nama');
        if (!userElement) throw new Error("Tidak boleh mendapatkan element nama user");
        
        const usernameMatched = userElement.textContent == username;
        return usernameMatched
    } catch (error) {
        console.error('Error checking username:', error);
        throw error;
    }
  }

  private async getListToApprove(date1: string, date2: string, approvePeople:1|2): Promise<number[]> {
    try {
        const response = await fetch(`/warehouse/generate/get_list_approve?tgl1=${date1}&tgl2=${date2}&get_gd%5B%5D=5&get_gd%5B%5D=4&get_gd%5B%5D=2&get_gd%5B%5D=3&get_gd%5B%5D=7&get_gd%5B%5D=1&get_gd%5B%5D=6`, {
            "headers": {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "en-US,en;q=0.9,id-ID;q=0.8,id;q=0.7",
                "x-requested-with": "XMLHttpRequest"
            },
            "referrer": "/warehouse/generate/approve",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });
      if (!response.ok) {
        throw new Error(`Failed to fetch list: ${response.status}`);
      }
      const data = await response.json() as GetListToApproveResponse;

      if (!data.list || !Array.isArray(data.list)) {
        throw new Error('Invalid response format: "list" array is missing or not an array.');
      }

      const listToApprove: number[] = [];
      for (const item of data.list) {
        let isNeedToPush = false;
        if(approvePeople == 1) {
          isNeedToPush = item.generated !== '' && item.approved === '0' && item.approved2 === '0'
        }

        else if(approvePeople == 2) {
          isNeedToPush = item.generated !== '' && item.approved === '1' && item.approved2 === '0'
        }

        if (isNeedToPush) listToApprove.push(Number(item.id_paid));
      }
      return listToApprove;
    } catch (error) {
      console.error('Error getting list to approve:', error);
      throw error;
    }
  }

  private async approveRecord(flagColumn: 1|2, idPaid:number) {
    try {
      const doApprove = await fetch("/warehouse/generate/edit_approve", {
      "headers": {
          "accept": "application/json, text/javascript, */*; q=0.01",
          "accept-language": "en-US,en;q=0.9,id-ID;q=0.8,id;q=0.7",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "x-requested-with": "XMLHttpRequest"
      },
          "referrer": "/warehouse/generate/approve",
          "body": `flag_column=${flagColumn}&flag_apv=1&id_paid=${idPaid}&link=approve`,
          "method": "POST",
          "mode": "cors",
          "credentials": "include"
      });

      if (!doApprove.ok) {
        throw new Error(`Login failed with status: ${doApprove.status}`);
      }
      
    } catch (error) {
      console.error('Error during approve data:', error);
      throw error;
    }
  }

  async startApproveUpah(param: parameterToApproveUpah) {
    
    try {
        let peopleApprove = <2|1> 1;
        for(let user of param.users) {
          if(peopleApprove > 2) return;
          // logout
          await this.logOut();
          // login
          const login = await this.loginToApp(user.username, user.password)
          if(!login) throw new Error("Gagal login ke user: " + user.username)
          // check username
          const isUsernameMatched = await this.checkUsername(user.username);
          if(!isUsernameMatched) return;
          // get list to approve
          const listToApprove = await this.getListToApprove(param.dateStart, param.dateEnd, peopleApprove);
          // approve
          for(let approveId of listToApprove) {
            await this.approveRecord(peopleApprove, approveId)
          }
          // add counter
          peopleApprove += 1
        }
    } catch (error) {
        
    }
  }
}

interface parameterToApproveUpah {
    users: { username: string, password: string, displayName: string}[]
    dateStart: string,
    dateEnd: string
}

interface GetListToApproveResponse {
    "tgl1": string
    "tgl2": string
    "tgl_c": string
    "gudang": {
        "id": string
        "gudang": string
        "kode": string
        "locid": string
        "id_area": string
        "virtual": string
        "virtual_t": string
        "virtual_d": string
        "area": string
    },
    "list": 
        {
            "id_paid": string
            "active": string
            "trno": string
            "generated": string
            "approved": string
            "approved_on": string
            "approved_by": string
            "approved2": string
            "approved2_on": string
            "approved2_by": string
            "id_gd": string
            "gudang": string
            "upah": string
            "tgl_koreksi": null,
            "tgl_bayar": null,
            "id_gudang": null,
            "gudang2": null,
            "k_upah": null
        }[]
    "unset": string
}


// generate this type code for me

// class called upahBoronganApprove, and inside the class, create below functions with try catch method inside:

// 1. private function as loginToApp,  accept name:string and password:string as parameter which do steps below:
//     a. do fetch post to specific url with body as  `username=username&password=password`, mode=cors, crendentials=include
//     b.make sure the login process return Set-cookie headers
// 2. private function as checkUsername, accept username:string as paramater which d steps below:
//     a. do fetch to specific url
//     b. check on the response where element #nama" should be matched with parameter
// 3. private function as listToApprove, accpet date1:string and date2:string as parameter
//     a. do fetch to specific url
//     b. check the response json should be like below
//         {
//             "tgl1": "2025-09-15",
//             "tgl2": "2025-09-21",
//             "tgl_c": "1",
//             "gudang": {
//                 "id": "2",
//                 "gudang": "",
//                 "kode": "B",
//                 "locid": "GJST",
//                 "id_area": "2",
//                 "virtual": "GJST - V",
//                 "virtual_t": "GJST -VT",
//                 "virtual_d": "GJST -VD",
//                 "area": "STT PUSAT"
//             },
//             "list": {
//                     "id_paid": "3548",
//                     "active": "1",
//                     "trno": null,
//                     "generated": "2025-09-21",
//                     "approved": "0",
//                     "approved_on": null,
//                     "approved_by": null,
//                     "approved2": "0",
//                     "approved2_on": null,
//                     "approved2_by": null,
//                     "id_gd": "5",
//                     "gudang": "",
//                     "upah": "53300",
//                     "tgl_koreksi": null,
//                     "tgl_bayar": null,
//                     "id_gudang": null,
//                     "gudang2": null,
//                     "k_upah": null
//                 }[],
//             "unset": ""
//         }
//     c. create variable as listToApprove []
//     d. loop the response.list
//     e. if list.generated != "", && approved == 1 && approved2 == 0 push to listToApproved
//     f. return listToApprove
//     // check again after approve data
//     // when managaer, if list.generated != "", && approved == 0 push to listToApproved
