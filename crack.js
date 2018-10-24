const rp = require('request-promise');
const pako = require('pako');
const Base64 = require('js-base64').Base64;
const TextDecoder = require('util').TextDecoder
const JSEncrypt = require('node-jsencrypt')
/* EncryptUtils by zhangkai */
var EncryptUtils = {
    k: ['0', '1', '2', '3', '4', '5', '6', '7', '8',
                       '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
                       'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y',
                       'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
                       'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y',
                       'Z', '*', '!'],
    encode: function(str){
        var b64Str = Base64.encode(str);
        var len = b64Str.length;
        var result = "";
        for(var i = 0; i < len; i ++){
             result += b64Str.charAt(i).charCodeAt(0) + this.k[(i % this.k.length)].charCodeAt(0);
             if(i != len - 1){
                result += "_";
             }
        }
        result = "x" + result + "y";
        return result;
    },
    decode: function(str){
        var result = "";
        if(str.charAt(0) == 'x' && str.charAt(str.length - 1) == 'y'){
             var str = str.substr(1, str.length - 2);
             var strs = str.split('_');
             var len = strs.length;
             for(var i = 0; i < len ; i++){
                  result += String.fromCharCode(parseInt(strs[i]) - this.k[(i % this.k.length)].charCodeAt(0));
             }
        }
        return Base64.decode(result);
    },
    rsa: function(str, publickey){
        var strs = this.sectionStr(str);
        var crypt = new JSEncrypt();
        crypt.setPublicKey(publickey);
        var result = "";
        if(strs.length == 0){
             result = crypt.encrypt(str);
        }else{
           for(var i = 0; i < strs.length ; i++){
             result += crypt.encrypt(strs[i]);
             console.log(crypt.encrypt(strs[i]).length);
           }
        }
        console.log(result);
        return result;
    },
    sectionStr: function(str){

        var strs = [];
        var length = str.length;
        var size = 256;
        if (length > size) {
             var len = parseInt(length / size) + (length % size > 0 ? 1 : 0);
             for (var i = 0, j = 0; i < length; i += 1) {
                   var start = i * size;

                   if (size + start >= length) {
                      size = length - start;
                   }
                   if (j >= len) {
                       break;
                   }
                   j++;
                   strs.push(str.substr(start, size));
              }
       }
       return strs;
    },
    decodeResponse: function(arrayBuffer){
           var byteArray = new Uint8Array(arrayBuffer);
           var inflate = new pako.Inflate({ level: -1});

           inflate.push(byteArray, true);
           if (inflate.err) {
               throw new Error(inflate.err);
           }

           var string = new TextDecoder("utf-8").decode(inflate.result);
           var result = this.decode(string);

           if(Object.prototype.toString.call( result ) === '[object Array]'){
                  var i, str = '';
                  for (i = 0; i < result.length; i++) {
                        str += '%' + ('0' + result[i].toString(16)).slice(-2);
                  }
                  result = decodeURIComponent(str);
           }
           return result;
    },
    compress: function(msg, pubkey){
        return pako.gzip(this.rsa(msg, pubkey));
    }
};

var default_params = {
	agent_id: 1,
	ts: new Date().getTime(),
	device_type: 2,
	um_channel: "online",
	userid: 57138787,
	source: 57138787,
	file_id: 20
}
var options = {
    uri: 'https://a.197754.com/api/upload_file/browse_file',
    method: 'POST',
    encoding: null,
    headers: {
		cltokenexp: "1695887716",
		cltoken: "k6yfmtqyoqdocsqwjh9fk63i7ahev42j"
	},
    body: EncryptUtils.compress(JSON.stringify(default_params), "MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA5KaI8l7xplShIEB0PwgmMRX/3uGG9BDLPN6wbMmkkO7H1mIOXWB/Jdcl4/IMEuUDvUQyv3P+erJwZ1rvNstohXdhp2G7IqOzH6d3bj3Z6vBvsXP1ee1SgqUNrjX2dn02hMJ2Swt4ry3n3wEWusaWmev4CSteSKGHhBn5j2Z5B+CBOqPzKPp2Hh23jnIH8LSbXmW0q85a851BPwmgGEan5HBPq04QUjo6SQsW/7dLaaAXfUTYETe0HnpLaimcHl741ftGyrQvpkmqF93WiZZXwlcDHSprf8yW0L0KA5jIwq7qBeu/H/H5vm6yVD5zvUIsD7htX0tIcXeMVAmMXFLX35duvYDpTYgO+DsMgk2Q666j6OcEDVWNBDqGHc+uPvYzVF6wb3w3qbsqTnD0qb/pWxpEdgK2BMVz+IPwdP6hDsDRc67LVftYqHJLKAfQt5T6uRImDizGzhhfIfJwGQxI7TeJq0xWIwB+KDUbFPfTcq0RkaJ2C5cKIx08c7lYhrsPXbW+J/W4M5ZErbwcdj12hrfV8TPx/RgpJcq82otrNthI3f4QdG4POUhdgSx4TvoGMTk6CnrJwALqkGl8OTfPKojOucENSxcA4ERtBw4It8/X39Mk0aqa8/YBDSDDjb+gCu/Em4yYvrattNebBC1zulK9uJIXxVPi5tNd7KlwLRMCAwEAAQ==")
};

rp(options)
    .then(function ($) {
    	console.log(EncryptUtils.decodeResponse($))
    })
    .catch(function (err) {	
    });