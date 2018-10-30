var https = require('https');
var fs = require('fs');
var ca2 = fs.readFileSync('hdzy_server.p12');

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