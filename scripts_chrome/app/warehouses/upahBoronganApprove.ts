

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
        credentials: 'omit',
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

  private async checkUsername(username: string): Promise<string> {
    try {
        const url = '/warehouse/user/profile';
        const response = await fetch(url, { referrer: "/warehouse/" });
        if (!response.ok) {
            throw new Error(`Failed to fetch user data: ${response.status}`);
        }
        const html = await response.text();
      
        const responseAsHTMLElemen = new DOMParser().parseFromString(html, "text/html");
        const userElement = responseAsHTMLElemen.querySelector('#nama');
        if (userElement) {
            return userElement.textContent;
        }
        return "";
    } catch (error) {
        console.error('Error checking username:', error);
        throw error;
    }
  }

  private async getListToApprove(date1: string, date2: string): Promise<any[]> {
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
      const data = await response.json();

      if (!data.list || !Array.isArray(data.list)) {
        throw new Error('Invalid response format: "list" array is missing or not an array.');
      }

      const listToApprove: any[] = [];
      for (const item of data.list) {
        if (item.generated !== '' && item.approved === '1' && item.approved2 === '0') {
          listToApprove.push(item);
        }
      }
      return listToApprove;
    } catch (error) {
      console.error('Error getting list to approve:', error);
      throw error;
    }
  }

  private async approveRecord() {
    const doApprove = await fetch("/warehouse/generate/edit_approve", {
    "headers": {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-US,en;q=0.9,id-ID;q=0.8,id;q=0.7",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "x-requested-with": "XMLHttpRequest"
    },
        "referrer": "/warehouse/generate/approve",
        "body": "flag_column=2&flag_apv=1&id_paid=3543&link=approve",
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });
  }

  async startApproveUpah(param: parameterToApproveUpah) {
    
    try {
        
        for(let user of param.users) {
            // login
            const login = await this.loginToApp(user.username, user.password)
            // check username
            if(!login) throw new Error("Gagal login ke user: " + user.username)
            // get list to approve
            const listToApprove = await this.getListToApprove(param.dateStart, param.dateEnd);
            // approve

            // check is there any record to approve again
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
