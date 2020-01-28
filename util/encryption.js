const aes = require('aes256');
module.exports = class Encrypt{
    constructor(key){
        if(!key) throw new Error(`You didn't provide a key!`);
        this.cipher = aes.createCipher(key);
    };
    encrypt(message){
        return this.cipher.encrypt(message);
    };
    decrypt(message){
      try{
        return this.cipher.decrypt(message);
      }catch(err){
        return message;
      }
    };
    equals(msg, message){
        if(msg === message) return true
        else return false;
    };
}