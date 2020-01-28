require('dotenv').config();
class Config{
    constructor(){
        this.baseURL = "https://dbl-webhook-voting.glitch.me";
        this.encryption = process.env.Encryption;
    }
};
module.exports = new Config();