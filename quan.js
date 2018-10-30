//互动作业 破解

/*
 破解:
    抓包观察
    查看app代码 加固脱壳
 加密方式如下:
      核心内容返回desc加密	
*/

const co = require('co');
const crypto = require('crypto');
const request =  require('request');
const rp =  require('request-promise');
const fs = require('fs');


function decryption(data, key='IcYX83NIf5461vaP') {
    var iv = '';
    var clearEncoding = 'utf8';
    var cipherEncoding = 'hex';
    var cipherChunks = [];
    var decipher = crypto.createDecipheriv('aes-128-ecb', key, iv);
    decipher.setAutoPadding(true);

    cipherChunks.push(decipher.update(data, cipherEncoding, clearEncoding));
    cipherChunks.push(decipher.final(clearEncoding));

    return cipherChunks.join('');
}


var auth = 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJhdXRob3JpdGllcyI6IlJPTEVfQURNSU4sQVVUSF9XUklURSIsInN1YiI6Ijg2NDM5NDAxMDE3NDg3MCIsImV4cCI6MTU0MjA3NTg1Nn0.jWkXlbaVQQ551r50cEwsVCGtK2wKdkAnoHELCQ4Xnx4pfAOwPFrP4sfmWhWuWOCtddOCUi4ZNvdyySJkf97pgQ';
var types = ['free', 'fashi', 'zhanshi', 'cike', 'tanke', 'fuzhu'];

var options = {
    uri: '',
    method: 'GET',
    json: true,
    headers: {
    	'Authorization': auth
    }
}

function queryKing(type){
	options.method = "GET";
	options.uri = 'http://47.93.14.82:8080/config/queryKingHeroByStyle?heroStyle=' + type;
	return rp(options);
}

function queryLine(heroCode){
	options.uri = 'http://47.93.14.82:8080/config/queryLineSvip';
	options.form = {
		heroCode: heroCode,
		bindImei: '864394010174870'
	};
	options.method = "POST";
	return rp(options);
}

function getDatas(){
	co(function*(){
		for(let i =0; i < types.length; i++){
			let data = yield queryKing(types[i]);
			let code = data.code;
			let content = data.content;
			fs.writeFileSync(`data/${types[i]}.json`,JSON.stringify(content));
			if(code == 200){
				for(let j=0; j<content.length; j++){
					 let heroAvatar = content[j]['heroAvatar'];
					 let filename = "avatars/"+ heroAvatar.substring(heroAvatar.lastIndexOf("/") + 1, heroAvatar.lastIndexOf(".")) + ".jpg";
					 request(content[j]['heroAvatar']).pipe(fs.createWriteStream(filename));
					 data = yield queryLine(content[j]['heroCode']);
					 fs.writeFileSync(`data/${types[i]}_line_${j}.json`,decryption(data["content"]));
				}
			}
		}
	})
}
getDatas();

