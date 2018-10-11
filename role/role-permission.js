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
			rolePermissions : [],//存放该角色'暂时拥有'(即在右边框框中)的所有权限
			rightCurrentPagePermissions : [],//右侧当前页展示的permissions,为什么左侧没有对应的?因为左侧的是只读的.右侧是可写的.
			
			leftSelectedIds : [],//左侧选中的权限
			rightSelectedIds : [],//右侧选中的权限
			
			leftLastClick : {},
			rightLastClick : {},
			
			leftPageInfo : {
				currentPage : 1,
				totalPages : 1,
				totalCounts : 1,
				pageSize : 10
			},
			
			rightPageInfo : {
				currentPage : 1,
				totalPages : 1,
				totalCounts : 1,
				pageSize : 10
			},
			
		},
		computed : {
			//最终提交时,发送给服务器端的所有的permissionId
			rightfinalIds : function(){
				return this.rolePermissions.map(function(permission){
					return permission.id;
				});
			},
			
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
			
			/**
			 * 初始化,点击首页,下一页,上一页,尾页均需要调用次函数
			 */
			getAllPermissionsByPageInfo : function(){
				var that = this;
				var pageInfo = that.leftPageInfo;
				return that.rawAllPermissions.filter(function(permission,index){
					return index >= (pageInfo.currentPage-1) * pageInfo.pageSize && index < (pageInfo.currentPage) * pageInfo.pageSize
				}).map(function(permission,index){
					var computePermission = {};
					$.extend(computePermission,permission);
					computePermission.bgGray = false;
					return computePermission;
				});
			},
			
			/**
			* 初始化,点击首页,下一页,上一页,尾页,添加至右边,从右边移除均需要调用次函数
			* reCalculateRightPageInfo之后,有可能会调用该函数
			*/
			getRightCurrentPagePermissions : function(){
				var that = this;
				var pageInfo = this.rightPageInfo;
				that.rightCurrentPagePermissions = that.rolePermissions.filter(function(permission,index){
					return index >= (pageInfo.currentPage-1) * pageInfo.pageSize && index < (pageInfo.currentPage) * pageInfo.pageSize
				}).map(function(permission,index){
					var computePermission = {};
					$.extend(computePermission,permission);
					computePermission.bgGray = false;
					return computePermission;
				});
				// return that.rightCurrentPagePermissions;
			},
			
			/**
			 * 当rolePermissions变化时触发,但又不能声明为计算属性,因为currentPage无法由计算得出
			 * 重新计算 rightPageInfo 因为右边的框框是变化的,这里主要是重新计算
			 * totalpages以及currentPage.
			 * rolePermissions保存了右边框框所有的权限,因此根据此数组来计算
			 */
			reCalculateRightPageInfo : function(){//TODO 应该在初始化,添加,移除中调用
				var that = this;
				var currentPage = that.rightPageInfo.currentPage;
				var oldTotalPages = that.rightPageInfo.totalPages;
				var newTotalPages = Math.ceil(that.rolePermissions.length/that.rightPageInfo.pageSize);
				// if(newTotalPages == oldTotalPages) return;//总页数没改变,直接返回.
				if(newTotalPages != oldTotalPages && currentPage == oldTotalPages){//当前页是未新增之前最后一页,现在总页数改变
					//让当前页,处于最后一页
					that.rightPageInfo.totalPages = newTotalPages;
					that.rightPageInfo.currentPage = newTotalPages;
				}
				that.getRightCurrentPagePermissions();
			},
			
			getAllPermission : function(){
				var that = this;
				simpleAxios.get('back/permissions').then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						that.rawAllPermissions = res.data.permissions;
						that.leftPageInfo.totalPages = Math.ceil(res.data.permissions.length/that.leftPageInfo.pageSize);
						that.setLeftPermissionsLastClickAndSelectedIds();
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
						that.reCalculateRightPageInfo();//初始化rightPageInfo
						// that.getRightCurrentPagePermissions();
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
					that.rightCurrentPagePermissions.some(function(item,index){//TODO
						if(item.id === permission.id){
							item.bgGray = !item.bgGray;
							that.rightCurrentPagePermissions.splice(index,1,item);
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
					that.rightCurrentPagePermissions.some(function(item,index){//TODO
						if(item.id === permission.id){
							item.bgGray = true;
							that.rightCurrentPagePermissions.splice(index,1,item);//TODO
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
				var permissions = isLeft? that.allPermissions : that.rightCurrentPagePermissions;//TODO
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
							that.selectOneRow(that.rightCurrentPagePermissions[beginIndex],isLeft);//TODO
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
				var allIds = that.allPermissions.map(function(permission){
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
				this.reCalculateRightPageInfo();//需要重新计算
			},
			
			removeFromRight : function(){
				var newPermissions = this.rolePermissions.slice(0);
				var ids = this.rightSelectedIds;
				for(var id of ids){
					newPermissions.remove(id);
				}
				this.rolePermissions = newPermissions;
				this.rightSelectedIds = new Set([]);
				this.reCalculateRightPageInfo();//需要重新计算
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
			},
			
			
			leftFirstPage : function(){
				if(this.leftPageInfo.currentPage == 1){
					alert('已经是第一页了');
					return;
				}
				this.leftPageInfo.currentPage = 1;
				this.setLeftPermissionsLastClickAndSelectedIds();
			},
			leftNextPage : function(){
				if(this.leftPageInfo.currentPage == this.leftPageInfo.totalPages){
					alert('已经是最后一页了');
					return;
				}
				this.leftPageInfo.currentPage =this.leftPageInfo.currentPage + 1;
				this.setLeftPermissionsLastClickAndSelectedIds();
			},
			leftPrePage : function(){
				if(this.leftPageInfo.currentPage == 1){
					alert('已经是第一页了');
					return;
				}
				this.leftPageInfo.currentPage =this.leftPageInfo.currentPage - 1;
				this.setLeftPermissionsLastClickAndSelectedIds();
			},
			leftLastPage : function(){
				if(this.leftPageInfo.currentPage == this.leftPageInfo.totalPages){
					alert('已经是最后一页了');
					return;
				}
				this.leftPageInfo.currentPage =this.leftPageInfo.totalPages;
				this.setLeftPermissionsLastClickAndSelectedIds();
			},
			
			setLeftPermissionsLastClickAndSelectedIds : function(){
				this.allPermissions = this.getAllPermissionsByPageInfo();
				this.initLeftLastClick();
				this.leftSelectedIds = new Set([]);
			},
			
			
			
			
			rightFirstPage : function(){
				if(this.rightPageInfo.currentPage == 1){
					alert('已经是第一页了');
					return;
				}
				this.rightPageInfo.currentPage = 1;
				this.setRightPermissionsLastClickAndSelectedIds();
			},
			rightNextPage : function(){
				if(this.rightPageInfo.currentPage == this.rightPageInfo.totalPages){
					alert('已经是最后一页了');
					return;
				}
				this.rightPageInfo.currentPage =this.rightPageInfo.currentPage + 1;
				this.setRightPermissionsLastClickAndSelectedIds();
			},
			rightPrePage : function(){
				if(this.rightPageInfo.currentPage == 1){
					alert('已经是第一页了');
					return;
				}
				this.rightPageInfo.currentPage =this.rightPageInfo.currentPage - 1;
				this.setRightPermissionsLastClickAndSelectedIds();
			},
			rightLastPage : function(){
				if(this.rightPageInfo.currentPage == this.rightPageInfo.totalPages){
					alert('已经是最后一页了');
					return;
				}
				this.rightPageInfo.currentPage =this.rightPageInfo.totalPages;
				this.setRightPermissionsLastClickAndSelectedIds();
			},
			
			setRightPermissionsLastClickAndSelectedIds : function(){
				// this.allPermissions = this.getAllPermissionsByPageInfo();
				this.getRightCurrentPagePermissions();
				this.initRightLastClick();
				this.rightSelectedIds = new Set([]);
			}
			
			
			
		}
		
		
		
	});
	
	
	
	
});