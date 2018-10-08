
document.onselectstart = function(){
	return false;
};
$(function(){
	
	var roleMenuManagement = new Vue({
		el : '#role',
		data : {
			roleId : null,
			rawAllMenus : [],
			allMenus : [],
			rawRoleMenus : [],
			roleMenus : [],
			
			leftSelectedIds : [],//左侧选中的菜单项
			rightSelectedIds : [],//右侧选中的菜单项
			
			leftLastClick : {},
			rightLastClick : {}
		},
		
		computed : {
			//最终提交时,发送给服务器端的所有的menuId
			rightfinalIds : function(){
				return this.roleMenus.map(function(menu){
					return menu.id;
				});
			}
		},
		
		created : function(){
			this.initRoleId();
			this.initRawAllMenus();
			this.initRawRoleMenus();
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
			initRawAllMenus : function(){
				this.getAllMenu();
			},
			initRawRoleMenus : function(){
				this.getMenuByRole();
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
			getAllMenu : function(){
				var that = this;
				simpleAxios.get('back/menus').then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						that.rawAllMenus = res.data.menus;
						that.allMenus = res.data.menus.map(function(menu){
							var computeMenu = {};
							$.extend(computeMenu,menu);
							computeMenu.bgGray = false;
							return computeMenu;
						});
					}else
						backEndExceptionHanlder(res);
				}).catch(function(res){
					unknownError(res);
				});
			},
			getMenuByRole : function(){
				var that = this;
				simpleAxios.get('back/role/'+that.roleId+'/menus').then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						that.rawRoleMenus = res.data.menus;
						that.roleMenus = res.data.menus.map(function(menu){
							var computeMenu = {};
							$.extend(computeMenu,menu);
							computeMenu.bgGray = false;
							return computeMenu;
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
			shiftClick : function(menuId,index,isLeft){
				if(isLeft){
					this.selectOneRow({id:menuId},isLeft);//先选中当前行
					if(this.leftLastClick.isShfitClick){//上次点击是shift click
						this.selectManyRows(menuId,index,isLeft);//选中上次点击行和本次点击行之间的所有行
					}
					this.setLeftLastClickShfitClick(menuId,index,true);
				}else{
					this.selectOneRow({id:menuId},isLeft);//先选中当前行
					if(this.rightLastClick.isShfitClick){//上次点击是shift click
						this.selectManyRows(menuId,index,isLeft);//选中上次点击行和本次点击行之间的所有行
					}
					this.setRightLastClickShfitClick(menuId,index,true);
				}
			},
			
			
			commonClick : function(menuId,index,isLeft){
				if(isLeft){
					this.toggleOneRow({id:menuId},isLeft);//选中当前行
					this.setLeftLastClickShfitClick(menuId,index,false);
				}else{
					this.toggleOneRow({id:menuId},isLeft);//选中当前行
					this.setRightLastClickShfitClick(menuId,index,false);
				}
			},
			
			setLeftLastClickShfitClick : function(menuId,index,isShfit){
				this.leftLastClick = {
					isShfitClick : isShfit,
					menuId : menuId,
					index : index
				};
			},
			
			setRightLastClickShfitClick : function(menuId,index,isShfit){
				this.rightLastClick = {
					isShfitClick : isShfit,
					menuId : menuId,
					index : index
				};
			},
			
			toggleBgGray : function(menu,isLeft){
				var that  = this;
				if(isLeft){
					that.allMenus.some(function(item,index){
						if(item.id === menu.id){
							item.bgGray = !item.bgGray;
							that.allMenus.splice(index,1,item);
							return true;
						}
					});
				}else{
					that.roleMenus.some(function(item,index){
						if(item.id === menu.id){
							item.bgGray = !item.bgGray;
							that.roleMenus.splice(index,1,item);
							return true;
						}
					});
				}
				
			},
			addBgGray : function(menu,isLeft){
				var that  = this;
				if(isLeft){
					that.allMenus.some(function(item,index){
						if(item.id === menu.id){
							item.bgGray = true;
							that.allMenus.splice(index,1,item);
							return true;
						}
					});
				}else{
					that.roleMenus.some(function(item,index){
						if(item.id === menu.id){
							item.bgGray = true;
							that.roleMenus.splice(index,1,item);
							return true;
						}
					});
				}
				
			},
			selectOneRow : function(menu,isLeft){
				this.addBgGray(menu,isLeft);
				if(isLeft)
					this.leftSelectedIds.add(menu.id);
				else
					this.rightSelectedIds.add(menu.id);
			},
			toggleOneRow : function(menu,isLeft){

				var that  = this;
				var bgGray = false;
				var menus = isLeft? that.allMenus : that.roleMenus;
				menus.some(function(item,index){
					if(item.id === menu.id){
						bgGray = item.bgGray;
						return true;
					}
				});
				
				if(isLeft){
					if(bgGray)//toggle前是true
						this.leftSelectedIds.delete(menu.id);
					else//toggle前是false
						this.leftSelectedIds.add(menu.id);
				}else{
					if(bgGray)//toggle前是true
						this.rightSelectedIds.delete(menu.id);
					else//toggle前是false
						this.rightSelectedIds.add(menu.id);
				}
				

				this.toggleBgGray(menu,isLeft);
			},

			selectManyRows : function(menuId,index,isLeft){
				var that = this;
				if(isLeft){
					if(that.leftLastClick.isShfitClick){
						var lastClick = that.leftLastClick.index
						var beginIndex = index <= lastClick? index : lastClick;
						var endIndex = lastClick + index - beginIndex;
						for(;beginIndex <= endIndex;beginIndex++){
							that.selectOneRow(that.allMenus[beginIndex],isLeft);
						}
					}
				}else{
					if(that.rightLastClick.isShfitClick){
						var lastClick = that.rightLastClick.index
						var beginIndex = index <= lastClick? index : lastClick;
						var endIndex = lastClick + index - beginIndex;
						for(;beginIndex <= endIndex;beginIndex++){
							that.selectOneRow(that.roleMenus[beginIndex],isLeft);
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
				var allIds = that.rawAllMenus.map(function(menu){
					return menu.id;
				});
				that.insertIntoRight(allIds);
			},
			
			insertIntoRight : function(ids){
				var newMenus = this.roleMenus.slice(0);
				var temp = {};
				for(var id of ids){
					temp = {};
					if(!this.roleMenus.some(function(menu){return menu.id === id;}))//之前不存在,添加
					{
						this.allMenus.some(function(menu){
							if(menu.id === id){
								$.extend(temp,menu);
								return true;
							}
						});
						newMenus.push(temp);
					}
				}
				this.roleMenus = newMenus;
				console.log(this.roleMenus);
			},
			
			removeFromRight : function(){
				var newMenus = this.roleMenus.slice(0);
				var ids = this.rightSelectedIds;
				for(var id of ids){
					newMenus.remove(id);
				}
				this.roleMenus = newMenus;
				this.rightSelectedIds = new Set([]);
			},
			
			
			roleMenusNotChanged : function(){
				var that = this;
				if(that.rightfinalIds.length === that.rawRoleMenus.length){
					return that.rawRoleMenus.every(function(menu){
						return that.rightfinalIds.some(function(id){
							return id == menu.id;
						})
					});
				}
				return false;
			},
			
			/**
			 * 提交数据
			 */
			submitNewMenus : function(){
				//检测权限是否有变化,若无变化,不发送请求
				if(this.roleMenusNotChanged()){
					alert('权限并未修改,请修改后再点击提交');
					return;
				}
				
				var params = {
					roleId : this.roleId,
					menuIds : this.rightfinalIds.slice(0)
				}
				
				jsonAxios.put('back/role/menus',params).then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						alert("角色权限修改成功");
					}
				}).catch(function(err){
					unknownError(err);
				});
			}
		
		}
	});
})