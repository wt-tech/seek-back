
//class="bggray" 可以让改行单元格变灰 奇数行,偶数行

//td组件
Vue.component('vtd',{
	props : ['content'],
	template : `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});


$(function(){
	var app = new Vue({
		el : '#role',
		data : {
			rawRoleList : [],
		},
		computed : {
			roleList : function(){
				var that = this;
				return that.rawRoleList.map(function(role,index){
					return {
						index : index +1,
						roleName : getValue(role,'roleName'),
						description : getValue(role,'description');
						id : getValue(role,'id')						
					};
				});
			}
		},
		
		created : function(){
			var that = this;
			that.initRawRoleList();
		},
		
		methods : {
			initRawRoleList : function(){
				var that = this;
				simpleAxios.get('back/roles').then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						that.rawRoleList = res.data.roles;
						console.log(res.data.roles)
					}else
						backEndExceptionHanlder(res);
				}).catch(function(res){
					unknownError(res);
				})
			},
			deleteRoleRequest : function(role){
				/* if(!window.confirm("确定要删除该轮播图及对应的详情页面吗?")) return;
				var that = this;
				var params = new FormData();
				var roleId = role.id;
				params.append('id',roleId);
				simpleAxios.post('role/back/removerole',params).then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						alert('删除成功!');
						that.deleteRoleFrontEnd(roleId);
					}else
						backEndExceptionHanlder(res);
				}).catch(function(err){
					unknownError(res);
				}); */
			},
			deleteRoleFrontEnd : function(roleId){
				var that = this;
				that.rawRoleList.remove(roleId);
			},
			turnToUpdatePage : function(role){
				var id = role.id;
				var url = "update.html?id="+id;
				window.open(url);
			}
		}
	});
});