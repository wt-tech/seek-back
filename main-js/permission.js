//class="bggray" 可以让改行单元格变灰 奇数行,偶数行

//td组件
Vue.component('std', {
	props: ['content'],
	template: `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});

$(function() {
	var app = new Vue({
		el: '#permission',
		data: {
			rawPermissionList: [],
			currentPageNo: 1,
			field: ['id', 'index', 'url', 'description'], //index指序号
			totalPage: '',
			totalCount: '',
			SUCCESS : 1,
			FAIL : 0,
			DEFAULT : -1,
			currentDescription:''
		},
		computed: {
			permissionList: function() {
				var that = this;
				return that.rawPermissionList.map(function(permission, index) {
					var status = getValue(permission,'updateFinished');
					
					return {
						index: index + 1,
						url: getValue(permission, 'url'),
						description: getValue(permission, 'description'),
						id: getValue(permission, 'id'),
						message : status===that.SUCCESS?"修改成功！":status === that.FAIL?"修改失败":""
					}
				})
			}
		},
		created: function() {
			var that = this;
			that.initRawPermissionResultList();
		},

		methods: {
			initRawPermissionResultList: function() {
				var that = this;
				simpleAxios.get('back/permissions').then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
						var resData = res.data;
						that.rawPermissionList = resData.permissions.map(function(permission){
							permission.updateFinished = that.DEFAULT;
							return permission;
						});
					} else
						backEndExceptionHanlder(res);
				}).catch(function(err) {
					unknownError(err);
				})
			},

			descriptionChange: function(index,url, description, id) {
				var that = this;
				var params = new FormData();
				if(description==that.currentDescription) return;
				if(id > 0) {
					params.append('id', id);
					params.append('description', description);
					simpleAxios.post('back/updatepermission', params).then(function(res) {
						var rawPermission = that.getRawPermissionByURL(url);
						if(res.status == STATUS_OK && res.data.status == SUCCESS) {
							rawPermission.updateFinished = that.SUCCESS;
							rawPermission.description = description;
						} else{
							permission.updateFinished = that.FAIL;						
							backEndExceptionHanlder(res);
						}
						that.rawPermissionList.splice(index-1,1,rawPermission);
					}).catch(function(err) {
						unknownError(res);
					});
				} else {
					params.append('description', description);
					params.append('url', url);
					simpleAxios.post('back/savepermission', params).then(function(res) {
						var rawPermission = that.getRawPermissionByURL(url);
						if(res.status == STATUS_OK && res.data.status == SUCCESS) {
							var id = res.data.id;
							rawPermission.id =id;
							rawPermission.description = description;
							rawPermission.updateFinished = that.SUCCESS;
						} else{
							permission.updateFinished = that.FAIL;
							backEndExceptionHanlder(res);
						}
						//console.log(rawPermission);
						that.rawPermissionList.splice(index-1,1,rawPermission);
					}).catch(function(err) {
						unknownError(res);
					});
				}
			},
			getRawPermissionByURL : function(url){
				var that = this;
				var tempPermission = null;
				that.rawPermissionList.some(function(permission){
					if(permission.url === url){
						tempPermission = permission;
						return true;
					}
					return false;
				});
				return tempPermission;
			},
			onFocus : function(url,index){
				var that = this;
				var rawPermission = that.rawPermissionList[index-1];
				that.currentDescription=rawPermission.description;
				rawPermission.updateFinished = that.DEFAULT;
				//console.log('onfocus',rawPermission,'kkk',rawPermission.updateFinished );
				that.rawPermissionList.splice(index-1,1,rawPermission);
			}
		},

	})
});