class EventEmitter {
    private subscribers: { [eventType: string]: ((data: any) => void)[] } = {};
  
    private subscribe(eventType: string, callback: (data: any) => void) {
      if (!this.subscribers[eventType]) {
        this.subscribers[eventType] = [];
      }
      this.subscribers[eventType].push(callback);
    }
  
    emit(eventType: string, data: any) {
      if (this.subscribers[eventType]) {
        this.subscribers[eventType].forEach(callback => callback(data));
      }
    }

    waitForEvent(nameYourEvent: string): Promise<any> {
        return new Promise(resolve => {
          this.subscribe(nameYourEvent, data => {
            resolve(data);
          });
        });
    }
  }

  export default EventEmitter;