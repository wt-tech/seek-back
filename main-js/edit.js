var bannerId = -1;
//初始化bannerId
(function() {
	try {
		var search = window.location.search;
		search = search.substr(1, search.length - 1);
		var id = search.split('=')[1];
	} catch (e) {
		id = -1;
		alert('未检测到id,该页面将自动被关闭');
		window.close();
	}
	console.log(id);
	if(id<=0){
		alert('检测到id不合法,该页面将自动被关闭');
		window.close();
	}
	bannerId = id;
})();




function showContent() {
	$('.edit').hide();
	$('.content').show();
}

function showEdit() {
	$('.content').hide();
	$('.edit').show();
}

function initRichText(editor,content){
	editor.txt.html(content);
}

function initBannerDetail(){
	return {
		bannerId : bannerId,
		content : null
	}
}


function prepareImgParams(files){
	
	var params = new FormData();
	for(var file of files){
		params.append("detailImgs",file);
	}
	return params;
}

$(function () {
	showEdit();
	
	var E = window.wangEditor;
	var editor = new E('#editor');
	
	//配置编辑器相关信息
	(function(){
		editor.customConfig.customUploadImg = function (files, insert) {
			console.log(files);
			var params = prepareImgParams(files);
			fileAxios.post('detail/back/imgs',params).then(function(res){
				if(res.status == STATUS_OK && res.data.status == SUCCESS){
					var urls = res.data.urls;
					for(var url of urls)
						insert(url);
					alert('图片插入成功');
				}
				else
					backEndExceptionHanlder(res);
			}).catch(function(err){
				unknownError(err);
			});
		}
		editor.create();
	})();

	
	//发送请求,查询该banner是否有详情页,并初始化富文本编辑器面板
	var bannerDetail = null;
	simpleAxios.get('detail/back/banner/detail/'+bannerId).then(function(res){
		if(res.status == STATUS_OK && res.data.status == SUCCESS){
			bannerDetail = res.data.detail;
			if(bannerDetail == null)//该轮播图无详情页
				bannerDetail = initBannerDetail();
			else//轮播图有详情页
				initRichText(editor,bannerDetail.content);
		}else
			backEndExceptionHanlder(res);		
	}).catch(function(err){
		unknownError(err);
	});

	//给预览添加事件
	$('#preview').click(function () {
		showContent();
		$('#content').html(editor.txt.html());
	});

	//给返回修改添加事件
	$('#modify').click(function () {
		showEdit();
	});

	//给提交添加事件
	$('#submit').click(function () {
		var content = editor.txt.html();
		if(bannerDetail.id)
			updateDetailRequest(bannerDetail,content);
		else
			newDetailRequest(bannerDetail,content);
	});

});

function prepareParams(bannerDetail,content) {

	var params = new FormData();
	params.append('bannerId', bannerDetail.bannerId);
	params.append('content', content);

	return params;
};

function newDetailRequest(bannerDetail,content){
	
	var params = prepareParams(bannerDetail,content);
	// params.append('_method','POST');
	simpleAxios.post('detail/back/detail', params).then(function (res) {
		if(res.status == STATUS_OK && res.data.status == SUCCESS){
			alert("添加成功");
		}else
			backEndExceptionHanlder(res);
	}).catch(function (err) {
		unknownError(err);
	});
}

function updateDetailRequest(bannerDetail,content){
	
	var params = {
		id : bannerDetail.id,
		bannerId:bannerDetail.bannerId,
		content : content
	};
	// params.append('_method','PUT');
	jsonAxios.put('detail/back/detail', params).then(function (res) {
		if(res.status == STATUS_OK && res.data.status == SUCCESS){
			alert("修改成功");
		}else
			backEndExceptionHanlder(res);
	}).catch(function (err) {
		unknownError(err);
	});
}
