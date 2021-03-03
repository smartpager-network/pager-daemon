class Message {
    constructor() {
        this.ID // get from MessageManager.New
        this.Type // "simple" or "duplex"
        this.RoutingMask // device=birdy&lora=devID:fPort&pocsag=133701B&dapnet=testID
        this.Content // Blabla
        this.Headers
    }

}

module.exports = Message