
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

function initBannerDetail(){
	return {
		content : "该轮播图暂无详情页<a target='_blank' href='edit.html?bannerId="+bannerId+"'>点击编辑</a>"
	}
}

$(function(){
	//发送请求,查询该banner是否有详情页,并初始化富文本编辑器面板
	var bannerDetail = null;
	simpleAxios.get('detail/back/banner/detail/'+bannerId).then(function(res){
		if(res.status == STATUS_OK && res.data.status == SUCCESS){
			bannerDetail = res.data.detail;
			if(bannerDetail == null)//该轮播图无详情页
				bannerDetail = initBannerDetail();
			$('#content').html(bannerDetail.content);
		}else
			backEndExceptionHanlder(res);		
	}).catch(function(err){
		alert(err);
		unknownError(err);
	});
})


$(function(){
	$('#backToIndex').click(function(){
		console.log('abc');
		wx.miniProgram.switchTab({
			url : '/tabs/index/index'
		});
	});
})