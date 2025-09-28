export async function getAuthToken(interactive = true): Promise<string> {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive }, (token) => {
        if(!navigator.onLine) return reject("Tidak ditemukan akses internet")
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);``
        }
        resolve(JSON.stringify(token));
      });
    });
  }