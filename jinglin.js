//互动作业 破解

/*
 破解:
    抓包观察
    查看app代码 加固脱壳
 加密方式如下:
      返回desc加密	
*/

var fs      = require('fs');
var request = require("request");
var co      = require('co');

function get(url, name){
	let promise = new Promise((r, j)=>{
		request(url).on('end', function(e){
			if(e){
			   j();
			}else{
			   r();
			}	
		}).on('error', function(e){
			j(e);
		}).pipe(fs.createWriteStream(name));
	});
	promise.catch(new Function);
	return promise;
}

let argv = process.argv;

co(function*(){
	//http://handler.1010pic.com/api/book_diandu/get_chapter?&id=529
	//http://handler.1010pic.com/api/book_diandu/get_detail?&id=529
	// for(let i = 9; i <= 9; i++ ){
	// 	let json = fs.readFileSync(`jinglin/decode_grade_id=${i}`);
	// 	data = JSON.parse(json.toString());
	// 	result = data['result'];
	// 	for(let j = 0; j < result.length; j++){
	// 		let id = result[j]["id"];
	// 		if(!fs.existsSync(`jinglin/chapter_id=${id}`)){
	// 			yield get(`http://handler.1010pic.com/api/book_diandu/get_chapter?&id=${id}`, `jinglin/chapter_id=${id}`);
	// 			console.log(`jinglin/chapter_id=${id}`);
	// 		}
	// 		if(!fs.existsSync(`jinglin/detail_id=${id}`)){
	// 			yield get(`http://handler.1010pic.com/api/book_diandu/get_detail?&id=${id}`, `jinglin/detail_id=${id}`);
	// 			console.log(`jinglin/detail_id=${id}`);
	// 		}

	// 	}
	// }
	for(let i = parseInt(argv[2]); i <= parseInt(argv[3]); i++ ){
		if(fs.existsSync(`jinglin/decode_detail_id=${i}`)){
			console.log(`jinglin/decode_detail_id=${i}`)
			let json = fs.readFileSync(`jinglin/decode_detail_id=${i}`);
			json = json.toString()
    		json = json.substring(0, json.lastIndexOf('}')+1);
			data = JSON.parse(json);
			result = data['result'];

			let id = i;
			let dir = `jinglin/${id}`;
				 
			if(!fs.existsSync(dir)){
				fs.mkdirSync(dir);
			}

			if(!fs.existsSync(`${dir}/cover.jpg`)){
				yield get(`http://thumb.1010pic.com/dmt/diandu/${id}/cover.jpg`, `${dir}/cover.jpg`);
			}
			var tmp_name = ""
			for(let j = 0; j < result.length; j++){

				 let page_url = result[j]["page_url"];
				 let page_url_name = page_url.substring(page_url.lastIndexOf("/") + 1, page_url.lastIndexOf("."));
			
				 if(!fs.existsSync(`${dir}/${page_url_name}.jpg`)){
					 yield get(page_url, `${dir}/${page_url_name}.jpg`);
				 } 

                 let track_info = result[j]["track_info"];
                 for(let k = 0 ; k < track_info.length; k++){

                 	let mp3_file = track_info[k]["mp3_file"];
                 	if(mp3_file){
						let mp3_file_name = (mp3_file.substring(mp3_file.lastIndexOf("/") + 1, mp3_file.lastIndexOf(".")));
	                 	var url  = mp3_file.substring(0, mp3_file.lastIndexOf("/")) +"/"+ encodeURIComponent(mp3_file_name)+".mp3";
	                 	var size = 0;
	                 	if(fs.existsSync(`${dir}/${mp3_file_name}.mp3`)){
	                 		const stats = fs.statSync(`${dir}/${mp3_file_name}.mp3`);
							size = stats.size;
						}
	                 	if(size <= 2024){
	                 		console.log(url);
	                 		console.log(mp3_file);
	                 		if(tmp_name == mp3_file) continue;
	                 		tmp_name = mp3_file
 							yield get(url, `${dir}/${mp3_file_name}.mp3`).catch((e)=>{
 								if(fs.existsSync(`wl/${mp3_file_name}.mp3`)){
									console.log("复制"+mp3_file);
									fs.createReadStream(`wl/${mp3_file_name}.mp3`).pipe(fs.createWriteStream( `${dir}/${mp3_file_name}.mp3`));
								} else {
									fs.appendFileSync('files.txt', mp3_file+"\n");
								}
							});
					 	}
				 	}
                 }
			}
		}
	}
});

