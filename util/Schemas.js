const {model, Schema} = require("mongoose");

class Schemas{
    constructor(){
        this.voting = model("voting", new Schema({
            clientID: {type: String, default: ""},
            passcode: {type: String, default: ""},
            webhook: {type: String, default: ""}
        }));
    };
};
module.exports = new Schemas();