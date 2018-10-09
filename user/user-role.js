
document.onselectstart = function(){
	return false;
};
$(function(){
	
	var userRoleManagement = new Vue({
		el : '#role',
		data : {
			userId : null,
			rawAllRoles : [],
			allRoles : [],
			rawUserRoles : [],
			userRoles : [],
			
			leftSelectedIds : [],//左侧选中的菜单项
			rightSelectedIds : [],//右侧选中的菜单项
			
			leftLastClick : {},
			rightLastClick : {}
		},
		
		computed : {
			//最终提交时,发送给服务器端的所有的roleId
			rightfinalIds : function(){
				return this.userRoles.map(function(role){
					return role.id;
				});
			}
		},
		
		created : function(){
			this.initUserId();
			this.initRawAllRoles();
			this.initRawUserRoles();
			this.initOtherData();
			this.initLeftLastClick();
			this.initRightLastClick();
		},
		methods : {
			initOtherData : function(){
				this.leftSelectedIds = new Set([]);
				this.rightSelectedIds = new Set([]);
			},
			initUserId : function(){
				try{
					var search = window.location.search;
					search = search.substr(1,search.length-1);
					var id = search.split('=')[1];
				}catch(e){
					id = -1;
					alert('未检测到id,请重试');
				}
				this.userId = id;
			},
			//获取信息
			initRawAllRoles : function(){
				this.getAllRole();
			},
			initRawUserRoles : function(){
				this.getRoleByUser();
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
			getAllRole : function(){
				var that = this;
				simpleAxios.get('back/roles').then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						that.rawAllRoles = res.data.roles;
						that.allRoles = res.data.roles.map(function(role){
							var computeRole = {};
							$.extend(computeRole,role);
							computeRole.bgGray = false;
							return computeRole;
						});
					}else
						backEndExceptionHanlder(res);
				}).catch(function(res){
					unknownError(res);
				});
			},
			getRoleByUser : function(){
				var that = this;
				simpleAxios.get('back/user/'+that.userId+'/roles').then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						that.rawUserRoles = res.data.roles;
						that.userRoles = res.data.roles.map(function(role){
							var computeRole = {};
							$.extend(computeRole,role);
							computeRole.bgGray = false;
							return computeRole;
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
			shiftClick : function(roleId,index,isLeft){
				if(isLeft){
					this.selectOneRow({id:roleId},isLeft);//先选中当前行
					if(this.leftLastClick.isShfitClick){//上次点击是shift click
						this.selectManyRows(roleId,index,isLeft);//选中上次点击行和本次点击行之间的所有行
					}
					this.setLeftLastClickShfitClick(roleId,index,true);
				}else{
					this.selectOneRow({id:roleId},isLeft);//先选中当前行
					if(this.rightLastClick.isShfitClick){//上次点击是shift click
						this.selectManyRows(roleId,index,isLeft);//选中上次点击行和本次点击行之间的所有行
					}
					this.setRightLastClickShfitClick(roleId,index,true);
				}
			},
			
			
			commonClick : function(roleId,index,isLeft){
				if(isLeft){
					this.toggleOneRow({id:roleId},isLeft);//选中当前行
					this.setLeftLastClickShfitClick(roleId,index,false);
				}else{
					this.toggleOneRow({id:roleId},isLeft);//选中当前行
					this.setRightLastClickShfitClick(roleId,index,false);
				}
			},
			
			setLeftLastClickShfitClick : function(roleId,index,isShfit){
				this.leftLastClick = {
					isShfitClick : isShfit,
					roleId : roleId,
					index : index
				};
			},
			
			setRightLastClickShfitClick : function(roleId,index,isShfit){
				this.rightLastClick = {
					isShfitClick : isShfit,
					roleId : roleId,
					index : index
				};
			},
			
			toggleBgGray : function(role,isLeft){
				var that  = this;
				if(isLeft){
					that.allRoles.some(function(item,index){
						if(item.id === role.id){
							item.bgGray = !item.bgGray;
							that.allRoles.splice(index,1,item);
							return true;
						}
					});
				}else{
					that.userRoles.some(function(item,index){
						if(item.id === role.id){
							item.bgGray = !item.bgGray;
							that.userRoles.splice(index,1,item);
							return true;
						}
					});
				}
				
			},
			addBgGray : function(role,isLeft){
				var that  = this;
				if(isLeft){
					that.allRoles.some(function(item,index){
						if(item.id === role.id){
							item.bgGray = true;
							that.allRoles.splice(index,1,item);
							return true;
						}
					});
				}else{
					that.userRoles.some(function(item,index){
						if(item.id === role.id){
							item.bgGray = true;
							that.userRoles.splice(index,1,item);
							return true;
						}
					});
				}
				
			},
			selectOneRow : function(role,isLeft){
				this.addBgGray(role,isLeft);
				if(isLeft)
					this.leftSelectedIds.add(role.id);
				else
					this.rightSelectedIds.add(role.id);
			},
			toggleOneRow : function(role,isLeft){

				var that  = this;
				var bgGray = false;
				var roles = isLeft? that.allRoles : that.userRoles;
				roles.some(function(item,index){
					if(item.id === role.id){
						bgGray = item.bgGray;
						return true;
					}
				});
				
				if(isLeft){
					if(bgGray)//toggle前是true
						this.leftSelectedIds.delete(role.id);
					else//toggle前是false
						this.leftSelectedIds.add(role.id);
				}else{
					if(bgGray)//toggle前是true
						this.rightSelectedIds.delete(role.id);
					else//toggle前是false
						this.rightSelectedIds.add(role.id);
				}
				

				this.toggleBgGray(role,isLeft);
			},

			selectManyRows : function(roleId,index,isLeft){
				var that = this;
				if(isLeft){
					if(that.leftLastClick.isShfitClick){
						var lastClick = that.leftLastClick.index
						var beginIndex = index <= lastClick? index : lastClick;
						var endIndex = lastClick + index - beginIndex;
						for(;beginIndex <= endIndex;beginIndex++){
							that.selectOneRow(that.allRoles[beginIndex],isLeft);
						}
					}
				}else{
					if(that.rightLastClick.isShfitClick){
						var lastClick = that.rightLastClick.index
						var beginIndex = index <= lastClick? index : lastClick;
						var endIndex = lastClick + index - beginIndex;
						for(;beginIndex <= endIndex;beginIndex++){
							that.selectOneRow(that.userRoles[beginIndex],isLeft);
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
				var allIds = that.rawAllRoles.map(function(role){
					return role.id;
				});
				that.insertIntoRight(allIds);
			},
			
			insertIntoRight : function(ids){
				var newRoles = this.userRoles.slice(0);
				var temp = {};
				for(var id of ids){
					temp = {};
					if(!this.userRoles.some(function(role){return role.id === id;}))//之前不存在,添加
					{
						this.allRoles.some(function(role){
							if(role.id === id){
								$.extend(temp,role);
								return true;
							}
						});
						newRoles.push(temp);
					}
				}
				this.userRoles = newRoles;
				console.log(this.userRoles);
			},
			
			removeFromRight : function(){
				var newRoles = this.userRoles.slice(0);
				var ids = this.rightSelectedIds;
				for(var id of ids){
					newRoles.remove(id);
				}
				this.userRoles = newRoles;
				this.rightSelectedIds = new Set([]);
			},
			
			
			userRolesNotChanged : function(){
				var that = this;
				if(that.rightfinalIds.length === that.rawUserRoles.length){
					return that.rawUserRoles.every(function(role){
						return that.rightfinalIds.some(function(id){
							return id == role.id;
						})
					});
				}
				return false;
			},
			
			/**
			 * 提交数据
			 */
			submitNewRoles : function(){
				//检测角色是否有变化,若无变化,不发送请求
				if(this.userRolesNotChanged()){
					alert('用户角色并未修改,请修改后再点击提交');
					return;
				}
				
				var params = {
					userCode : this.userId,
					roleIds : this.rightfinalIds.slice(0)
				}
				
				jsonAxios.put('back/user/roles',params).then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						alert("用户角色修改成功");
					}
				}).catch(function(err){
					unknownError(err);
				});
			}
		
		}
	});
})