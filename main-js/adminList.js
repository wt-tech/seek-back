Vue.component('vtd',{
	props : ['content'],
	template : `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});


$(function(){
	var app = new Vue({
		el:'#admin',
		data:{
			totalCount:'',
			currentPageNo : 1,
			adminList:[]
		},
		computed:{
			comadmList : function(){
				var that = this;
				return that.adminList.map(function(admin,index){
					return{
						index : index +1,
						userName : getValue(admin,'userName'),
						userCode : getValue(admin,'userCode'),
						userPassword : getValue(admin,'userPassword'),
						id : getValue(admin,'id')
						
						
						
						
						
					}
				})
			}
		},
		created:function(){
			var that = this
			that.getAdminList()
		},
		methods : {
			getAdminList:function(pages){
				var that = this
				var currentPageNo = pages || 1
				simpleAxios.get('back/logins?currentPageNo='+currentPageNo).then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						var resData = res.data
						that.adminList = resData.users
						console.log(res)
					}else 
						backEndExceptionHanlder(res);
				}).catch(function(err){
					console.log(err)
				})
			},
			turnToUpdatePage:function(e){
				console.log(e)
				var id = e.id
				var userName = e.userName
				var userCode = e.userCode
				var url = './user-role.html?id='+userCode;
				window.location.href = url;
			}
		},
		
		
	})
})
