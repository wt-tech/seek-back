
//class="bggray" 可以让改行单元格变灰 奇数行,偶数行

//td组件
Vue.component('vtd',{
	props : ['content'],
	template : `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});


$(function(){
	var app = new Vue({
		el : '#banner',
		data : {
			rawBannerList : [],
			fields : ['id','index','imgName','onUse','uploadTime','url'],//index指序号
		},
		computed : {
			bannerList : function(){
				var that = this;
				return that.rawBannerList.map(function(banner,index){
					return {
						index : index +1,
						imgName : getValue(banner,'imgName'),
						onUse : getValue(banner,'onUse')===true?'是':'否',
						uploadTime : getDateOfDateTime(getValue(banner,'uploadTime')),
						url : "<img src='"+ getValue(banner,'url')+"'></img>",
						id : getValue(banner,'id')
					};
				});
			}
		},
		
		created : function(){
			var that = this;
			that.initRawBannerList();
		},
		
		methods : {
			initRawBannerList : function(){
				var that = this;
				simpleAxios.get('banner/listbanner').then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						that.rawBannerList = res.data.banners;
					}else
						backEndExceptionHanlder(res);
				}).catch(function(res){
					unknownError(res);
				})
			},
			deleteBannerRequest : function(banner){
				if(!window.confirm("确定要删除该轮播图及对应的详情页面吗?")) return;
				var that = this;
				var params = new FormData();
				var bannerId = banner.id;
				params.append('id',bannerId);
				simpleAxios.post('banner/removebanner',params).then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						alert('删除成功!');
						that.deleteBannerFrontEnd(bannerId);
					}else
						backEndExceptionHanlder(res);
				}).catch(function(err){
					unknownError(res);
				});
			},
			deleteBannerFrontEnd : function(bannerId){
				var that = this;
				that.rawBannerList.remove(bannerId);
			},
			turnToEditPage : function(banner){
				var id = banner.id;
				var url = "update.html?id="+id;
				window.open(url);
			}
		}
	});
});