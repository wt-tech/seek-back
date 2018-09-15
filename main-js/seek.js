
//class="bggray" 可以让改行单元格变灰 奇数行,偶数行

//td组件
Vue.component('vtd',{
	props : ['content'],
	template : `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});


$(function(){
	var app = new Vue({
		el : '#seek',
		data : {
			rawSeekList : [],
			fields : ['id','index','sequence','seekType','missName','gender','birthdate','missDate','address'
	                 ,'missDetailPlace','feature','plot','seekimgs','seekSubtype','contactName',
	                 ,'contactTel','title' ,'pubdate'],//index指序号
		},
		computed : {
			seekList : function(){
				var that = this;
				return that.rawSeekList.map(function(seek,index){
					return {
						index : index +1,
						sequence : getValue(seek,'sequence'),
						seekType : getValue(seek,'seekType'),
						missName : getValue(seek,'missName'),
						gender : getValue(seek,'gender'),
						birthdate : getDateOfDateTime(getValue(seek,'birthdate')),
						missDate : getDateOfDateTime(getValue(seek,'missDate')),
						address : getValue(seek,'address'),
						missDetailPlace : getValue(seek,'missDetailPlace'),
						feature : getValue(seek,'feature'),
						plot : getValue(seek,'plot'),
						seekimgs : "<img src='"+ getValue(seek,'seekimgs')+"'></img>",
						seekSubtype : getValue(seek,'seekSubtype'),
						contactName : getValue(seek,'contactName'),
						contactTel : getValue(seek,'contactTel'),
						title : getValue(seek,'title'),
						pubdate : getDateOfDateTime(getValue(seek,'pubdate')),
						id : getValue(seek,'id')
					};
				});
			}
		},
		
		created : function(){
			var that = this;
			that.initRawSeekList();
			that.initTotalSeekCount();
		},
		
		methods : {
			initRawSeekList : function(){
				var that = this;
				var vueInstance = this;
				simpleAxios.get('seek/back/listseek'+vueInstance.pageIndex+'/'+_pageSize).then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						that.rawSeekList = res.data.seeks;
					}else
						backEndExceptionHanlder(res);
				}).catch(function(res){
					unknownError(res);
				})
			},
			
			//初始化总条目个数
            initTotalSeekCount:function(){
                var vueInstance = this;
                axos.get('/seek/back/countseek').then(function(res) {
                     //获取数据成功
                    if(res.status==200 && res.data.status == 'success'){
                        vueInstance.totalCount = res.data.totalCount;
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
            },
            
			deleteSeekRequest : function(banner){
				if(!window.confirm("确定要删除该寻亲记录吗?")) return;
				var that = this;
				var params = new FormData();
				var seekId = seek.id;
				params.append('id',seekId);
				simpleAxios.post('seek/back/removeseek',params).then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						alert('删除成功!');
						that.deleteSeekFrontEnd(seekId);
					}else
						backEndExceptionHanlder(res);
				}).catch(function(err){
					unknownError(res);
				});
			},
			deleteSeekFrontEnd : function(seekId){
				var that = this;
				that.rawSeekList.remove(seekId);
			},
			turnToEditPage : function(seek){
				var id = seek.id;
				var url = "update.html?id="+id;
				window.open(url);
			}
		}
	});
});