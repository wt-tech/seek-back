
//class="bggray" 可以让改行单元格变灰 奇数行,偶数行

//td组件
Vue.component('std',{
	props : ['content'],
	template : `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});


$(function(){
	var app = new Vue({
		el:'#permission',
		data:{
			rawPermissionList : [],
			currentPageNo : 1,
			field : ['id','index','url','description'],//index指序号
			totalPage: '',
			totalCount:'',
		},
		computed : {
			permissionList : function(){
				var that = this;
				return that.rawPermissionList.map(function(permission,index){
					return{
						index : index +1,
						url: getValue(permission,'url'),
						description :'<input id="Text1" type="text" v-model="description" value='+'getValue(permission,'description')'+"/>',
						id : getValue(permission,'id')
					}
				})
			}
		},
		created : function(){
			var that = this;
			that.initRawPermissionResultList();
		},
		
		methods : {
			initRawPermissionResultList : function(){
				var that = this;
				simpleAxios.get('back/permissions').then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						var resData = res.data;
						that.rawPermissionList = resData.permissions;
					}else 
						backEndExceptionHanlder(res);
				}).catch(function(err){
					unknownError(err);
				})
			},
		},
	
	})
});
