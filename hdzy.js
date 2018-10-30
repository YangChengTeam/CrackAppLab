//互动作业 破解

/*
 破解:
    抓包观察
    查看app代码 加固脱壳
 加密方式如下:
      双向验证 

 漏洞: 
     暂未破解
 
 说明:
    脱壳查看代码，证书格式的兼容性不太了解，过段时候再来弄一下
*/

var https = require('https');
var fs = require('fs');
var ca2 = fs.readFileSync('hdzy_server.pem');

var options = { 
  hostname: 'hds.hdzuoye.com',
  path: '/hd-server/commonUser/updateTag.do',
  form: {
  	data: '{"userId":-1,"base":["appType_1","appVersion_33105","channelType_yingyongbao","cityCode_","countyCode_","provinceCode_","sex_2"],"pushSdk":"jpush","regId":"13065ffa4e2be8d0899"}'
  }
};

var req = https.get(options, function(res){ 
  res.pipe(process.stdout); 
});

req.on('error', function(err){
  console.error(err.code);
});