document.onselectstart = function(){
	return false;
}

$(function(){
	
	var rolePermissionManagement = new Vue({
		el : '#role',
		data : {
			roleId : null,
			rawAllPermissions : [],
			allPermissions : [],
			rawRolePermissions : [],
			rolePermissions : [],
			
			leftSelectedIds : [],//左侧选中的权限
			rightSelectedIds : [],//右侧选中的权限
			
			leftLastClick : {},
			rightLastClick : {}
		},
		computed : {
			//最终提交时,发送给服务器端的所有的permissionId
			rightfinalIds : function(){
				return this.rolePermissions.map(function(permission){
					return permission.id;
				});
			}
		},
		
		created : function(){
			this.initRoleId();
			this.initRawAllPermissions();
			this.initRawRolePermissions();
			this.initOtherData();
			this.initLeftLastClick();
			this.initRightLastClick();
		},
		
		methods : {
			
			initOtherData : function(){
				this.leftSelectedIds = new Set([]);
				this.rightSelectedIds = new Set([]);
			},
			initRoleId : function(){
				try{
					var search = window.location.search;
					search = search.substr(1,search.length-1);
					var id = search.split('=')[1];
				}catch(e){
					id = -1;
					alert('未检测到id,请重试');
				}
				this.roleId = id;
			},
			
			//获取信息
			initRawAllPermissions : function(){
				this.getAllPermission();
			},
			initRawRolePermissions : function(){
				this.getPermissionByRole();
			},
			initLeftLastClick : function(){
				this.leftLastClick = {
					isShfitClick : false
				}
			},
			initRightLastClick : function(){
				this.rightLastClick = {
					isShfitClick : false
				}
			},
			
			getAllPermission : function(){
				var that = this;
				simpleAxios.get('back/permissions').then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						that.rawAllPermissions = res.data.permissions;
						that.allPermissions = res.data.permissions.map(function(permission){
							var computePermission = {};
							$.extend(computePermission,permission);
							computePermission.bgGray = false;
							return computePermission;
						});
					}else
						backEndExceptionHanlder(res);
				}).catch(function(res){
					unknownError(res);
				});
			},
			
			getPermissionByRole : function(){
				var that = this;
				simpleAxios.get('back/role/'+that.roleId+'/permissions').then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						that.rawRolePermissions = res.data.permissions;
						that.rolePermissions = res.data.permissions.map(function(permission){
							var computePermission = {};
							$.extend(computePermission,permission);
							computePermission.bgGray = false;
							return computePermission;
						});
					}else
						backEndExceptionHanlder(res);
				}).catch(function(res){
					unknownError(res);
				});
			},
			
			/**
			* shift就一定是选中,不要考虑取消选择
			*/
			shiftClick : function(permissionId,index,isLeft){
				if(isLeft){
					this.selectOneRow({id:permissionId},isLeft);//先选中当前行
					if(this.leftLastClick.isShfitClick){//上次点击是shift click
						this.selectManyRows(permissionId,index,isLeft);//选中上次点击行和本次点击行之间的所有行
					}
					this.setLeftLastClickShfitClick(permissionId,index,true);
				}else{
					this.selectOneRow({id:permissionId},isLeft);//先选中当前行
					if(this.rightLastClick.isShfitClick){//上次点击是shift click
						this.selectManyRows(permissionId,index,isLeft);//选中上次点击行和本次点击行之间的所有行
					}
					this.setRightLastClickShfitClick(permissionId,index,true);
				}
			},
			
			commonClick : function(permissionId,index,isLeft){
				if(isLeft){
					this.toggleOneRow({id:permissionId},isLeft);//选中当前行
					this.setLeftLastClickShfitClick(permissionId,index,false);
				}else{
					this.toggleOneRow({id:permissionId},isLeft);//选中当前行
					this.setRightLastClickShfitClick(permissionId,index,false);
				}
			},
			
			setLeftLastClickShfitClick : function(permissionId,index,isShfit){
				this.leftLastClick = {
					isShfitClick : isShfit,
					permissionId : permissionId,
					index : index
				};
			},
			
			setRightLastClickShfitClick : function(permissionId,index,isShfit){
				this.rightLastClick = {
					isShfitClick : isShfit,
					permissionId : permissionId,
					index : index
				};
			},
			
			toggleBgGray : function(permission,isLeft){
				var that  = this;
				if(isLeft){
					that.allPermissions.some(function(item,index){
						if(item.id === permission.id){
							item.bgGray = !item.bgGray;
							that.allPermissions.splice(index,1,item);
							return true;
						}
					});
				}else{
					that.rolePermissions.some(function(item,index){
						if(item.id === permission.id){
							item.bgGray = !item.bgGray;
							that.rolePermissions.splice(index,1,item);
							return true;
						}
					});
				}
				
			},
			addBgGray : function(permission,isLeft){
				var that  = this;
				if(isLeft){
					that.allPermissions.some(function(item,index){
						if(item.id === permission.id){
							item.bgGray = true;
							that.allPermissions.splice(index,1,item);
							return true;
						}
					});
				}else{
					that.rolePermissions.some(function(item,index){
						if(item.id === permission.id){
							item.bgGray = true;
							that.rolePermissions.splice(index,1,item);
							return true;
						}
					});
				}
				
			},
			selectOneRow : function(permission,isLeft){
				this.addBgGray(permission,isLeft);
				if(isLeft)
					this.leftSelectedIds.add(permission.id);
				else
					this.rightSelectedIds.add(permission.id);
			},
			
			toggleOneRow : function(permission,isLeft){
				var that  = this;
				var bgGray = false;
				var permissions = isLeft? that.allPermissions : that.rolePermissions;
				permissions.some(function(item,index){
					if(item.id === permission.id){
						bgGray = item.bgGray;
						return true;
					}
				});
				
				if(isLeft){
					if(bgGray)//toggle前是true
						this.leftSelectedIds.delete(permission.id);
					else//toggle前是false
						this.leftSelectedIds.add(permission.id);
				}else{
					if(bgGray)//toggle前是true
						this.rightSelectedIds.delete(permission.id);
					else//toggle前是false
						this.rightSelectedIds.add(permission.id);
				}
				

				this.toggleBgGray(permission,isLeft);
			},
			
			selectManyRows : function(permissionId,index,isLeft){
				var that = this;
				if(isLeft){
					if(that.leftLastClick.isShfitClick){
						var lastClick = that.leftLastClick.index
						var beginIndex = index <= lastClick? index : lastClick;
						var endIndex = lastClick + index - beginIndex;
						for(;beginIndex <= endIndex;beginIndex++){
							that.selectOneRow(that.allPermissions[beginIndex],isLeft);
						}
					}
				}else{
					if(that.rightLastClick.isShfitClick){
						var lastClick = that.rightLastClick.index
						var beginIndex = index <= lastClick? index : lastClick;
						var endIndex = lastClick + index - beginIndex;
						for(;beginIndex <= endIndex;beginIndex++){
							that.selectOneRow(that.rolePermissions[beginIndex],isLeft);
						}
					}
				}
			},	
			addToRight : function(){
				var that = this;
				var leftSelectedIds = that.leftSelectedIds;
				that.insertIntoRight(leftSelectedIds);				
			},
			addAllToRight : function(){
				var that = this;
				var allIds = that.rawAllPermissions.map(function(permission){
					return permission.id;
				});
				that.insertIntoRight(allIds);
			},
			
			insertIntoRight : function(ids){
				var newPermissions = this.rolePermissions.slice(0);
				var temp = {};
				for(var id of ids){
					temp = {};
					if(!this.rolePermissions.some(function(permission){return permission.id === id;}))//之前不存在,添加
					{
						this.allPermissions.some(function(permission){
							if(permission.id === id){
								$.extend(temp,permission);
								return true;
							}
						});
						newPermissions.push(temp);
					}
				}
				this.rolePermissions = newPermissions;
				console.log(this.rolePermissions);
			},
			
			removeFromRight : function(){
				var newPermissions = this.rolePermissions.slice(0);
				var ids = this.rightSelectedIds;
				for(var id of ids){
					newPermissions.remove(id);
				}
				this.rolePermissions = newPermissions;
				this.rightSelectedIds = new Set([]);
			},
			
			rolePermissionsNotChanged : function(){
				var that = this;
				if(that.rightfinalIds.length === that.rawRolePermissions.length){
					return that.rawRolePermissions.every(function(permission){
						return that.rightfinalIds.some(function(id){
							return id == permission.id;
						})
					});
				}
				return false;
			},
			
			/**
			* 提交数据
			*/
			submitNewPermissions : function(){
				//检测权限是否有变化,若无变化,不发送请求
				if(this.rolePermissionsNotChanged()){
					alert('权限并未修改,请修改后再点击提交');
					return;
				}
				
				var params = {
					roleId : this.roleId,
					permissionIds : this.rightfinalIds.slice(0)
				}
				
				jsonAxios.put('back/role/permissions',params).then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						alert("角色权限修改成功");
					}
				}).catch(function(err){
					unknownError(err);
				});
			}
			
			
		}
		
		
		
	});
	
	
	
	
});