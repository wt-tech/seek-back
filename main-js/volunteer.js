
//class="bggray" 可以让改行单元格变灰 奇数行,偶数行

//td组件
Vue.component('vtd',{
	props : ['info'],
	template : `<td align="center" valign="middle" class="borderright borderbottom">{{info}}</td>`
});


$(function(){
	var app = new Vue({
		el : '#volunteer',
		data : {
			rawVolunteerList : []
		},
		computed : {
			
		},
		
		created : function(){
			var that = this;
			that.initRawVolunteerList();
		},
		
		methods : {
			initRawVolunteerList : function(){
				var that = this;
				simpleAxios.get('banner/listbanner').then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						that.rawVolunteerList = res.data.banners;
					}else
						backEndExceptionHanlder(res);
				}).catch(function(res){
					unknownError(res);
				})
			}
		}
	});
});