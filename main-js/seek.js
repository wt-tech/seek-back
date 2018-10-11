//class="bggray" 可以让改行单元格变灰 奇数行,偶数行

//td组件
Vue.component('vtd', {
	props: ['content'],
	template: `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});

$(function() {
	var app = new Vue({
		el: '#seek',
		data: {
			inputs: null,
			seektype: '',
			seekSort: {
				missDate: null,
				birthDate: null,
				pubDate: null
			},
			rawSeekList: [],
			fields: ['id', 'index', 'sequence', 'seekType', 'missName', 'gender', 'birthdate', 'missDate', 'address', 'missDetailPlace', 'feature', 'plot', 'seekimgs', 'seekSubtype', 'contactName', , 'contactTel', 'title', 'pubdate'], //index指序号
			totalCount: '',
			totalPage: '',
			currentPageNo: 1
		},
		computed: {
			seekList: function() {
				var that = this;
				return that.rawSeekList.map(function(seek, index) {
					return {
						index: index + 1,
						sequence: getValue(seek, 'sequence'),
						seekType: getValue(seek, 'seekType'),
						missName: getValue(seek, 'missName'),
						gender: getValue(seek, 'gender'),
						birthdate: getDateOfDateTime(getValue(seek, 'birthdate')),
						missDate: getDateOfDateTime(getValue(seek, 'missDate')),
						birthaddress: getValue(seek.address, 'birthProvinceName') + getValue(seek.address, 'birthCityName') + getValue(seek.address, 'birthCountyName'),
						missaddress: getValue(seek.address, 'missProvinceName') + getValue(seek.address, 'missCityName') + getValue(seek.address, 'missCountyName'),
						missDetailPlace: getValue(seek, 'missDetailPlace'),
						seekSubtype: getValue(seek, 'seekSubtype'),
						title: getValue(seek, 'title'),
						pubdate: getDateOfDateTime(getValue(seek, 'pubdate')),
						id: getValue(seek, 'id')
					};
				});
			}
		},

		created: function() {
			var that = this;
			that.initseeky();
			that.initRawSeekList();
		},

		methods: {
			initseeky: function() {
				try {
					var search = window.location.search;
					search = search.substr(1, search.length - 1);
					var id = search.split('=')[1];
				} catch(e) {
					id = -1;
					alert('未检测到id,请重试');
				}
				this.seektype = id;
				console.log(this.seektype)
			},
			initRawSeekList: function(pages,missName) {
				var that = this;
				var vueInstance = this;
				if(that.seektype == 'y') {
					if(missName){
						var params = {
							currentPageNo: pages || 1,
							id: 1,
							seekType: '寻亲',
							missName : missName
						};
					}else{
						var params = {
							currentPageNo: pages || 1,
							id: 1,
							seekType: '寻亲'
						};
					}
					
					jsonAxios.post('seek/back/listseek', params).then(function(res) {
						if(res.status == STATUS_OK && res.data.status == SUCCESS) {
							that.rawSeekList = res.data.seeks;
							that.totalPage = Math.ceil(res.data.totalCount/res.data.pageSize);
							that.totalCount = res.data.totalCount;
						} else
							backEndExceptionHanlder(res);
					}).catch(function(res) {
						unknownError(res);
					})
				} else {
					if(missName){
						var params = {
							currentPageNo: pages || 1,
							id: 1,
							seekType: '寻人',
							missName:missName,
						};
					}else{
						var params = {
							currentPageNo: pages || 1,
							id: 1,
							seekType: '寻人'
						};
					}
					jsonAxios.post('seek/back/listseek', params).then(function(res) {
						//console.log('寻人',res.data)
						if(res.status == STATUS_OK && res.data.status == SUCCESS) {
							that.rawSeekList = res.data.seeks;
							that.totalPage = Math.ceil(res.data.totalCount / res.data.pageSize);
							that.totalCount = res.data.totalCount;
						} else
							backEndExceptionHanlder(res);
					}).catch(function(res) {
						unknownError(res);
					})
				}

			},

			/*//初始化总条目个数
            initTotalSeekCount:function(){
                var vueInstance = this;
                simpleAxios.get('/seek/back/countseek').then(function(res) {
                     //获取数据成功
                    if(res.status==200 && res.data.status == 'success'){
                        vueInstance.totalCount = res.data.totalCount;
                      //console.log(vueInstance.totalCount);
                        vueInstance.totalPage = Math.ceil(vueInstance.totalCount/_pageSize);
                    }else{
                        console.log('err');
                        //错误处理
                    }
                }).catch(function(err){
                    console.log(err);
                });
            },
            
            turnToFirstPage:function(){
                var vueInstance = this;
                if(vueInstance.pageIndex != 1){
                    vueInstance.pageIndex = 1;
                    vueInstance.initRawSeekList();
                }
            },

            turnToNextPage:function(){
                var vueInstance = this;
                if(vueInstance.pageIndex  < vueInstance.totalPage){
                    vueInstance.pageIndex++;
                    vueInstance.initRawSeekList();
                }
            },

            turnToPrePage : function(){
                var vueInstance = this;
                if(vueInstance.pageIndex > 1){
                    vueInstance.pageIndex--;
                    vueInstance.initRawSeekList();
                }
            },

            turnToLastPage : function(){
                var vueInstance = this;
                if(vueInstance.pageIndex  < vueInstance.totalPage){
                    vueInstance.pageIndex = vueInstance.totalPage,
                    vueInstance.initRawSeekList();
                }
            },*/

			deleteSeekRequest: function(seek) {
				if(!window.confirm("确定要删除该寻亲记录吗?")) return;
				var that = this;
				var params = new FormData();
				var seekId = seek.id;
				params.append('id', seekId);
				simpleAxios.post('seek/back/removeseek', params).then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
						alert('删除成功!');
						that.deleteSeekFrontEnd(seekId);
					} else
						backEndExceptionHanlder(res);
				}).catch(function(err) {
					unknownError(res);
				});
			},
			deleteSeekFrontEnd: function(seekId) {
				var that = this;
				that.rawSeekList.remove(seekId);
			},
			turnToEditPage: function(seek) {
				var id = seek.id;
				var url = "seek-update.html?id=" + id;
				window.open(url);
			},
			turnToUpdatePage: function(seek) {
				var id = seek.id;
				var url = "seek-update.html?id=" + id;
				window.open(url);
			},
			submit: function() {
				var that = this;
				var page = that.currentPageNo;
				var missName = that.inputs;
//				var params = that.prepareUpdateParams();
				that.initRawSeekList(page,missName);
//				jsonAxios.post('seek/back/listseek', params).then(function(res) {
//					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
//						console.log(res.data);
//					} else
//						backEndExceptionHanlder(res);
//				}).catch(function(err) {
//					unknownError(res);
//				});
			},
			toComment: function(seek) {
				var id = seek.id
				console.log(id)
				var url = "comment.html?id=" + id;
				window.open(url);
			},
			prepareUpdateParams: function() {
				var that = this;
				var params = new FormData();
				params.append('missName', that.inputs)
				return params;
			},

			//排序
			sortPubDate: function(e) {

				var sortVal = e.target.value
				var seekList = this.seekList
				if(sortVal == 'true') {
					seekList.sort(function(a, b) {
						return Number(a.pubdate.replace(/-/g, '')) - Number(b.pubdate.replace(/-/g, ''))
					})
				} else {
					seekList.sort(function(a, b) {
						return Number(b.pubdate.replace(/-/g, '')) - Number(a.pubdate.replace(/-/g, ''))
					})
				}

			},
			sortMissDate: function(e) {
				var sortVal = e.target.value
				var seekList = this.seekList
				if(sortVal == 'true') {
					seekList.sort(function(a, b) {
						return Number(a.missDate.replace(/-/g, '')) - Number(b.missDate.replace(/-/g, ''))
					})
				} else {
					seekList.sort(function(a, b) {
						return Number(b.missDate.replace(/-/g, '')) - Number(a.missDate.replace(/-/g, ''))
					})
				}
			},
			sortBirthDate: function(e) {
				var sortVal = e.target.value
				var seekList = this.seekList
				if(sortVal == 'true') {
					seekList.sort(function(a, b) {
						return Number(a.birthdate.replace(/-/g, '')) - Number(b.birthdate.replace(/-/g, ''))
					})
				} else {
					seekList.sort(function(a, b) {
						return Number(b.birthdate.replace(/-/g, '')) - Number(a.birthdate.replace(/-/g, ''))
					})
				}
			},

			firstPage: function() {
				var that = this;
				that.currentPageNo = 1;
				that.initRawSeekList(that.currentPageNo);
			},

			prevPage: function() {
				var that = this;
				if(that.currentPageNo > 1) {
					var currentPageNo = that.currentPageNo;
					currentPageNo--;
					that.currentPageNo = currentPageNo;
					that.initRawSeekList(currentPageNo);
				} else {
					alert('已经是第一页');
				}
			},

			nextPage: function() {
				var that = this;
				var currentPageNo = that.currentPageNo;
				console.log(that.totalPage);
				if(that.totalPage == currentPageNo) {
					alert('已经是最后一页');
				} else {
					currentPageNo++;
					that.currentPageNo = currentPageNo;
					that.initRawSeekList(currentPageNo);
				}
			},

			lastPage: function() {
				var that = this;
				that.currentPageNo = that.totalPage;
				that.initRawSeekList(that.totalPage);
			},

		}
	});
});