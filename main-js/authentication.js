
//class="bggray" 可以让改行单元格变灰 奇数行,偶数行

//td组件
Vue.component('std',{
	props : ['content'],
	template : `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});


$(function(){
	var app = new Vue({
		el:'#authentication',
		data:{
			rawAuthenticationList : [],
			currentPageNo : 1,
			field : ['id','index','customerName','identityNO','address','tel','authResult'],//index指序号
			totalPage: '',
			totalCount:'',
		},
		computed : {
			authenticationList : function(){
				var that = this;
				return that.rawAuthenticationList.map(function(authentication,index){
					return{
						index : index +1,
						customerName : '<a href="./get-authentication.html?id='+getValue(authentication,'id')+'" target="mainFrame">'+getValue(authentication,'customerName')+'</a>',
						identityNO: getValue(authentication,'identityNO'),
						address : getValue(authentication,'address'),
						tel : getValue(authentication,'tel'),
						authResult : getValue(authentication,'authResult'),
						id : getValue(authentication,'id')
					}
				})
			}
		},
		created : function(){
			var that = this;
			that .initRawAuthResultList()
		},
		
		methods : {
			initRawAuthResultList : function(PageNo){
				var that = this
//				var params = new FormData();
				var currentPageNo = PageNo || that.currentPageNo
//				params.append('currentPageNo',currentPageNo)
				simpleAxios.get('authentication/back/listauthentication?currentPageNo='+currentPageNo).then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						var resData = res.data;
						that.rawAuthenticationList = resData.authentications;
						that.totalPage = Math.ceil(resData.totalCount/resData.pageSize);
						that.totalCount = resData.totalCount;
						//console.log(res)
						//console.log(that.rawAuthenticationList)
					}else 
						backEndExceptionHanlder(res);
				}).catch(function(err){
					unknownError(err);
				})
			},
			passauthentication : function(authentication){
				console.log(authentication.id,authentication)
				var that = this
				var params = new FormData()
				var id = authentication.id				
				params.append('authResult','认证通过')
				params.append('id',id)
				if (authentication.authResult == '认证通过'){
					alert('审核已完成，请勿重复审核')
				}else{
					simpleAxios.post('authentication/back/updateAuthentication',params).then(function(res){
						console.log(res)
						that.initRawAuthResultList()
					}).catch(function(err){
						console.log(err)
					})
				}
				
			},
			
			notpassauthentication : function(authentication){
				console.log(authentication.id,authentication)
				var that = this
				var params = new FormData()
				var id = authentication.id				
				params.append('authResult','认证不通过')
				params.append('id',id)
				if (authentication.authResult == '认证不通过'){
					alert('审核已完成，请勿重复审核')
				}else{
					simpleAxios.post('authentication/back/updateAuthentication',params).then(function(res){
						console.log(res)
						that.initRawAuthResultList()
					}).catch(function(err){
						console.log(err)
					})
				}
				
			},
			
			firstPage: function() {
				var that = this;
				that.currentPageNo = 1;
				that.initRawAuthResultList(that.currentPageNo)
			},
			prevPage : function(){
				var that = this
				if (that.currentPageNo > 1 ){					
					var currentPageNo  = that. currentPageNo
					currentPageNo -- 
					that.currentPageNo = currentPageNo
					that.initRawAuthResultList(currentPageNo)
				}else{
					alert('已经是第一页')
				}
			},
			nextPage :function(){
				var that = this
				var currentPageNo  = that.currentPageNo
				console.log(that.totalPage)
				if (that.totalPage == currentPageNo){
					alert('已经是最后一页')
				}else{					
					currentPageNo ++
					that.currentPageNo = currentPageNo
					that.initRawAuthResultList(currentPageNo)
				}
			},
			lastPage :function(){
				var that = this
				that.currentPageNo = that.totalPage
				that.initRawAuthResultList(that.totalPage)
			}
			
		},
	
	})
});
