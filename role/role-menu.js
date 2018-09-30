
document.onselectstart = function(){
	return false;
};
$(function(){
	
	var roleManagement = new Vue({
		el : '#role',
		data : {
			roleId : null,
			rawAllMenus : [],
			allMenus : [],
			rawRoleMenus : [],
			roleMenus : [],
			
			tobeAddedId : [],
			tobeRemovedId : [],
			
			lastClick : {}
		},
		
		created : function(){
			this.initRoleId();
			this.initRawAllMenus();
			this.initRawRoleMenus();
			this.initOtherData();
		},
		methods : {
			initOtherData : function(){
				this.tobeAddedId = new Set([]);
				this.tobeRemovedId = new Set([]);
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
			initlastClick : function(){
				this.lastClick = {
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
			shiftClick : function(menuId,index){
				this.selectOneRow({id:menuId});//先选中当前行
				if(this.lastClick.isShfitClick){//上次点击是shift click
					this.selectManyRows(menuId,index);//选中上次点击行和本次点击行之间的所有行
				}
				this.setlastClickShfitClick(menuId,index);
			},
			
			
			commonClick : function(menuId,index){
				this.toggleOneRow({id:menuId});//选中当前行
				this.setlastClickCommenClick(menuId,index);
			},
			
			setlastClickShfitClick : function(menuId,index){
				this.lastClick = {
					isShfitClick : true,
					menuId : menuId,
					index : index
				};
			},
			
			setlastClickCommenClick : function(menuId,index){
				this.lastClick = {
					isShfitClick : false,
					menuId : menuId,
					index : index
				};
			},
			toggleBgGray : function(menu){
				var that  = this;
				that.allMenus.some(function(item,index){
					if(item.id === menu.id){
						item.bgGray = !item.bgGray;
						that.allMenus.splice(index,1,item);
						return true;
					}
				});
			},
			addBgGray : function(menu){
				var that  = this;
				that.allMenus.some(function(item,index){
					if(item.id === menu.id){
						item.bgGray = true;
						that.allMenus.splice(index,1,item);
						return true;
					}
				});
			},
			selectOneRow : function(menu){
				this.addBgGray(menu);
				this.tobeAddedId.add(menu.id);
			},
			toggleOneRow : function(menu){

				var that  = this;
				var bgGray = false;
				that.allMenus.some(function(item,index){
					if(item.id === menu.id){
						bgGray = item.bgGray;
						return true;
					}
				});
				
				if(bgGray)//toggle前是true
					this.tobeAddedId.delete(menu.id);
				else//toggle前是false
					this.tobeAddedId.add(menu.id);

				this.toggleBgGray(menu);
			},
			
			/**
			 * 选择多行,emmmm....
			 */
			selectManyRows : function(menuId,index){
				var that = this;
				if(that.lastClick.isShfitClick){
					var lastClickIndex = that.lastClick.index
					var beginIndex = index <= lastClickIndex? index : lastClickIndex;
					var endIndex = lastClickIndex + index - beginIndex;
					for(;beginIndex <= endIndex;beginIndex++){
						that.selectOneRow(that.allMenus[beginIndex]);
					}
				}
			}	
		}
	});
})