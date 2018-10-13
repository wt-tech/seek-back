/* 不允许选择文本 */
document.onselectstart = function() {
	return false;
}

// new Vue('v-option',{
Vue.component('v-option', {
	props: ['item'],
	template: `<option value='item.id'>{{item.name}}</option>`
});

$(function() {

	var vue = new Vue({

		el: '#areaAllocate',
		data: {

			volunteerId: null,

			provinceList: [],
			cityList: [],
			countyList: [],
			
			spceialList : [1,2,3,4,33,34],//特殊省份(实际上是城市)的id 这些城市分别是['北京', '天津', '上海', '重庆', '香港', '澳门']

			toBeAllocatedAreaList: [], //左侧等待被分配列表
			allocatedAreaList: [], //右侧已经分配列表
			toBeRemovedAreaList: [], //右侧选中等待被删除列表

			currentProvince: null,
			currentCity: null,
			currentCountys: [], //只有这货是数组

			//左侧上次点击信息
			leftLastClickInfo: {
				index: -1
			},
			rightLastClickInfo : {
				index: -1
			}

		},
		
		computed : {
			currentProvinceIsSpecialProvince : function(){
				var that = this;
				return that.spceialList.some(function(value){
					return value == that.currentProvince.id;//起始状态 currentProvince是null,所以会报错.不过并不影响
				});
			}
		},

		created: function() {
			this.initVolunteerId();

			if (!this.volunteerId)
				return;
			this.initDefaultCityCountyList();
			this.initProvinceListAndVolunteerAreas();

		},

		methods: {

			initVolunteerId: function() {
				var that = this;
				try {
					var queryString = window.location.search; //形如 : ?name=daryl&pasword=123 的字符串
					queryString = queryString.substr(1); //去掉 ? 
					var params = queryString.split('&');
					for (var param of params) {
						if (param.indexOf('id') != -1) {
							that.volunteerId = param.split('=')[1].trim();
						}
					}
				} catch (e) {
					//TODO handle the exception
					that.volunteerId = null;
				}
				if (isNaN(that.volunteerId) || !that.volunteerId) //若不是一个数字或者是空串
					that.volunteerId = null;
			},

			initDefaultCityCountyList: function() {
				this.cityList = addPleaseChooseOption([]);
				this.countyList = addPleaseChooseOption([]);
			},


			initProvinceListAndVolunteerAreas: function() {
				var that = this;
				//TODO replace url here 
				simpleAxios.get('/volunteer/back/listvolunteerarea?volunteerId=' + that.volunteerId).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) { //获取数据成功
						if (that.provinceList.length === 0) //如果省份已经有值,不需要重复赋值(该函数会被调用多次)
							that.provinceList = addPleaseChooseOption(res.data.listprovince);
						that.allocatedAreaList = res.data.volunteerareas.map(function(item,index){
							return {
								provinceName : getValue(item,'provinceName'),
								cityName : getValue(item,'cityName'),
								countyName : getValue(item,'countyName'),
								id : getValue(item,'id'),
								selected : false,
								valueOf : function() {
									return showAreaInfo2(this);
								},
							};
						});
					} else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				})
			},

			setCityList: function(provinceId) {
				var that = this;
				simpleAxios.get('/seek/back/city?id=' + provinceId).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) { //获取数据成功
						that.cityList = addPleaseChooseOption(res.data.citylist);
					} else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				})
			},

			setCountyList: function(cityId) {
				var that = this;
				simpleAxios.get('/seek/back/county?id=' + cityId).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) { //获取数据成功
						that.countyList = addPleaseChooseOption(res.data.countylist);
					} else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				})
			},

			provinceChange: function(index) {
				var selectedProvince = this.provinceList[index];
				this.setCityList(selectedProvince.id);
				this.currentProvince = selectedProvince;
			},
			
			cityChange: function(index) {
				var selectedCity = this.cityList[index];
				this.currentCity = selectedCity;
				if(!this.currentProvinceIsSpecialProvince){//说明选中的 省份 是普通省份		
					this.setCountyList(selectedCity.id);
				}else{//说明选中的 省份 是'特殊省份(城市)'
					var selectedOptions = forgeAnOption();//伪造一个index=0的option,手动触发countyChange事件
					this.countyChange(selectedOptions,true);
				}
			},
			countyChange: function(selectedOptions,ifZeroIndexShouldAdd) {
				this.setCurrentCountys(selectedOptions,ifZeroIndexShouldAdd);
				this.add2ToBeAllocatedAreaList();
			},
			/**
			 * 将一次countyChange事件所选择的所有county放入currentCountys中
			 * ifZeroIndexShouldAdd该值为true,selectedOptions中index为0的option也会添加进countyList
			 * 该值为false,selectedOptions中index为0的option不会添加进countyList
			 */
			setCurrentCountys: function(selectedOptions,ifZeroIndexShouldAdd) {
				var optionsList = selectedOptions;
				var countyList = [];
				var option = null;
				for (var temp of selectedOptions) {
					option = this.countyList[temp.index];
					if (ifZeroIndexShouldAdd) //0应该添加     
						countyList.push(option);
					else//0不应该添加
						!!temp.index && countyList.push(option);
				}
				this.currentCountys = Array.from(countyList);
			},

			/**
			 * 一次countyChange事件出发后,将所选中的省市县添加至左侧div中
			 */
			add2ToBeAllocatedAreaList: function() {
				var that = this;
				var tempList = that.toBeAllocatedAreaList;
				that.currentCountys.forEach(function(county, index) {
					//判断tempList之前是否已经包括该区域
					if (tempList.some(function(item) {
							return item.county.id === county.id 
								&& item.city.id === that.currentCity.id 
								&& item.province.id ===that.currentProvince.id;
						}))
						return;//存在直接返回
					let temp = {
						province: that.currentProvince,
						city: that.currentCity,
						county: county,
						select: false, //该属性为false指,左边的框中没选中.为true指选中.在toggleOneRow和selectManyRows中用到
						valueOf: function() {
							return showAreaInfo(this);
						},
					};
					tempList.push(temp);
				});
				that.toBeAllocatedAreaList = tempList;
			},


			leftCommonClick: function(index) {
				this.setLeftLastClickInfo(index);
				this.leftToggleOneRow(index);
			},

			rightCommonClick : function(index){
				this.setRightLastClickInfo(index);
				this.rightToggleOneRow(index);
			},

			/**
			 * shiftClick只有选中没有取消
			 */
			leftShiftClick: function(index) {
				if (this.leftLastClickInfo.index == -1) //如果一开始就shift+单击
					this.setLeftLastClickInfo(index);
				this.leftSelectManyRows(index);
				this.setLeftLastClickInfo(index);
			},
			
			/**
			* shiftClick只有选中没有取消
			*/
			rightShiftClick: function(index) {
				if (this.rightLastClickInfo.index == -1) //如果一开始就shift+单击
					this.setRightLastClickInfo(index);
				this.rightSelectManyRows(index);
				this.setRightLastClickInfo(index);
			},

			leftToggleOneRow: function(index) {
				var temp = this.toBeAllocatedAreaList[index];
				temp.selected = !temp.selected;
				this.toBeAllocatedAreaList.splice(index, 1, temp);
			},
			
			rightToggleOneRow: function(index) {
				var temp = this.allocatedAreaList[index];
				temp.selected = !temp.selected;
				this.allocatedAreaList.splice(index, 1, temp);
			},
			
			

			leftSelectManyRows: function(index) {
				var lastClickIndex = this.leftLastClickInfo.index;
				var fromIndex = Math.min(index, lastClickIndex);
				var endIndex = Math.max(index, lastClickIndex);
				var tempList = [];
				var temp = null;
				for (var i = fromIndex; i <= endIndex; i++) {
					temp = this.toBeAllocatedAreaList[i];
					temp.selected = true;
					tempList.push(temp);
				}
				this.toBeAllocatedAreaList.splice(fromIndex, endIndex - fromIndex + 1, ...tempList);
			},
			
			
			rightSelectManyRows: function(index) {
				var lastClickIndex = this.rightLastClickInfo.index;
				var fromIndex = Math.min(index, lastClickIndex);
				var endIndex = Math.max(index, lastClickIndex);
				var tempList = [];
				var temp = null;
				for (var i = fromIndex; i <= endIndex; i++) {
					temp = this.allocatedAreaList[i];
					temp.selected = true;
					tempList.push(temp);
				}
				this.allocatedAreaList.splice(fromIndex, endIndex - fromIndex + 1, ...tempList);
			},
			

			setLeftLastClickInfo: function(index) {
				this.leftLastClickInfo = {
					index: index
				};
			},
			
			setRightLastClickInfo: function(index) {
				this.rightLastClickInfo = {
					index: index
				};
			},


			removeFromToBeAllocatedArea: function() {
				var that = this;
				that.toBeAllocatedAreaList =
					that.toBeAllocatedAreaList.filter(function(item) {
						return !item.selected;
					});
			},

			removeFromAllocatedArea: function() {
				var that = this;
				that.allocatedAreaList =
					that.allocatedAreaList.filter(function(item) {
						return !item.selected;
					});
			},


			addToAllocatedArea: function() {
				var formdata = this.preapreInsertParams();
				this.insertRequest(formdata);
			},
			
			removeSelectedAllocatArea : function(){
				if(window.confirm("确实要删除选中项吗?")){
					var formdata = this.prepareRemoveParams();
					this.removeRequest(formdata);
				}
			},

			preapreInsertParams: function() {
				var formdata = new FormData();
				formdata.append("volunteerId", this.volunteerId);
				var arrays = [
					[],
					[],
					[]
				];
				for (var temp of this.toBeAllocatedAreaList) {
					arrays[0].push(temp.province.id);
					arrays[1].push(temp.city.id);
					arrays[2].push(temp.county.id);
				}
				// arrays[0].push({a:1,b:2});
				formdata.append("provinceId", arrays[0]);
				formdata.append("cityId", arrays[1]);
				formdata.append("countyId", arrays[2]);
				return formdata;
			},
			
			prepareRemoveParams : function(){
				var formdata = new FormData();
				var array = [];
				for (var temp of this.allocatedAreaList) {
					if(temp.selected)
						array.push(temp.id);
				}
				formdata.append("id", array);
				return formdata;
			},
		
			insertRequest: function(formdata) {
				var that = this;
				simpleAxios.post('volunteer/back/savevolunteerarea', formdata).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) { //获取数据成功
						that.initProvinceListAndVolunteerAreas();
					} else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				})
			},
			
			removeRequest : function(formdata){
				var that = this;
				simpleAxios.post('volunteer/back/deletevolunteerarea', formdata).then(function(res) {
					if (res.status == STATUS_OK && res.data.status == SUCCESS) { //获取数据成功
						that.removeFromAllocatedArea();
						alert('删除成功');
					} else
						backEndExceptionHanlder(res);
				}).catch(function(res) {
					unknownError(res);
				})
			}
		}
	});
});

function addPleaseChooseOption(arr, object = null) {
	if (arr instanceof Array) {
		arr.unshift(object === null ? {
			id: 0,
			name: '请选择'
		} : object);
	}
	return arr;
}

/**
 * 伪造一个option
 */
function forgeAnOption(){
	return [{
		index : 0
	}];
}

function showAreaInfo(area) {
	var countyName = "";
	if (area.county && area.county.id)
		countyName = '-' + area.county.name;
	return area.province.name + '-' + area.city.name + countyName;
}

function showAreaInfo2(area) {
	var countyName = "";
	if (area.countyName)
		countyName = '-' + area.countyName;
	return area.provinceName + '-' + area.cityName + countyName;
}
