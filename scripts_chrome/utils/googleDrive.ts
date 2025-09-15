import { GoogleApiResult } from "../scripts_chrome.types";

export class Gdrive {

    private token = "";

    constructor(token: string) {
      this.token = token;
    }

    /**
     * Move a Google Drive file into a target folder.
     *
     * @param fileId   string - The ID of the file you want to move
     * @param folderId string - The ID of the destination folder
     * @returns        Promise<any> - The updated file resource with new parents
     */
    async moveFileToFolder(fileId: string, folderId: string): Promise<GoogleApiResult> {
        
      try {
      
          if(this.token == "") throw new Error("Token unsetted");
            // 1. Fetch current parents of the file
            const metaRes = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?fields=parents`,
            {
                method: "GET",
                headers: {
                Authorization: `Bearer ${this.token}`, // Use OAuth token
                },
            }
            );

            // Parse metadata response
            const fileMetadata = await metaRes.json();

            // If there is an error in the response, throw it
            if (!metaRes.ok) {
                throw new Error(`Failed to fetch file metadata: ${fileMetadata.error?.message}`);
            }

            // Extract current parents (comma separated string)
            const previousParents = fileMetadata.parents ? fileMetadata.parents.join(",") : "";

            // 2. Send PATCH request to update parents (move file)
            const moveRes = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${folderId}&removeParents=${previousParents}&fields=id,parents`,
                {
                    method: "PATCH",
                    headers: {
                    Authorization: `Bearer ${this.token}`, // Use OAuth token
                    "Content-Type": "application/json",
                    },
                }
            );

            // Parse move response
            const moveData = await moveRes.json();

            // If error, throw
            if (!moveRes.ok) {
                throw new Error(`Failed to move file: ${moveData.error?.message}`);
            }

            // ✅ Return new file data (contains file id and new parents array)
            return {
                id: "",
                isSuccess: true,
                message: "File moved"
            };
        } catch (err: any) {
            // Catch any network or API errors
            return {
                id: "",
                isSuccess: false,
                message: err.message
            }
            // throw err; // Rethrow so caller can handle it too
        }
    }

    /**
    * Make a copy of a Google Drive file
    * 
    * @param {string} fileId - The ID of the source file you want to copy
    * @param {string} newFileName - The name for the copied file
    * @returns {Promise<object>} - The created file resource (contains id, name, etc.)
    */
    async makeAcopyOfAFile(fileId: string, newFileName: string): Promise<{ id: string, name: string}> {
     try {
       const url = `https://www.googleapis.com/drive/v3/files/${fileId}/copy`;
   
       const res = await fetch(url, {
         method: "POST",
         headers: {
           "Authorization": `Bearer ${this.token}`, // 🔑 OAuth2 token
           "Content-Type": "application/json"
         },
         body: JSON.stringify({
           name: newFileName // New file name
         })
       });
   
       const data = await res.json();
   
       if (!res.ok) {
         throw new Error(`Drive API error: ${data.error?.message}`);
       }
   
       return data;
     } catch (err) {
       console.error("❌ Failed to copy file:", err);
       throw err;
     }
   }
   

}

export type GdriveType = InstanceType<typeof Gdrive>;