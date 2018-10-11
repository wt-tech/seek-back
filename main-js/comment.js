
//class="bggray" 可以让改行单元格变灰 奇数行,偶数行

//td组件
Vue.component('vtd',{
	props : ['content'],
	template : `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});


$(function(){
	var app = new Vue({
		el : '#seeks',
		data : {
			currentPageNo:1,
			commentList:[],
			mybox:[],
			isCheckedAll:false,
			ismybox:[],
			mybox2:[],
			totalCount:'',
			totalPage:'',
		},
		computed : {
			sortcommentList:function(){
				var that = this;
				return that.commentList.map(function(comment,index){
					return {
						index : index +1,
						nickname : getValue(comment,'customer.nickname') || getValue(comment,'comentCustomerName'),
						comentTime : getValue(comment,'customer.comentTime') || getValue(comment,'replyTime'),
						content : getValue(comment,'content') || getValue(comment,'replyContent'),
						id : getValue(comment,'id') ,
						replyId :  getValue(comment,'replyId')
//						topid : getValue(comment,'topComentId') || getValue(comment,'replyId')
					};
				});
			}
		},
		
		created : function(){
			var that = this;
			that.initseeky();
			that.initComment()
		},
		
		methods : {
			initseeky : function(){
				try{
					var search = window.location.search;
					search = search.substr(1,search.length-1);
					var id = search.split('=')[1];
				}catch(e){
					id = -1;
					alert('未检测到id,请重试');
				}
				this.seekId = id;
				console.log(this.seekId)
			},
			initComment:function(currentPageNo){
				var that = this
				var params = new FormData();
				var id = that.seekId;
				var currentPageNo = currentPageNo || 1
				params.append('id',id);
				params.append('currentPageNo',currentPageNo)
//				var param = {
//					id:that.seekId,
//					currentPageNo:1
//				};
//				console.log(params)
				simpleAxios.post("seek/getseek",params).then(function(res){
					if(res.status == STATUS_OK && res.data.status==SUCCESS){
						var commentLists = [];
						for (var tmp of res.data.topComents){
							commentLists.push(tmp)
							if(tmp.talks){
								for (var tmp2 of tmp.talks){
									commentLists.push(tmp2)
								}
							}
							
						}
						that.commentList = commentLists;
						that.totalPage = Math.ceil(res.data.totalCount / res.data.pageSize);
						that.totalCount = res.data.totalCount;
					}else
						backEndExceptionHanlder(res);
				}).catch(function(err){
					console.log(err)
					unknownError(err);
				})
			},
			
			submit:function(){
				
			},
		
		    deleteSome () {
		    	var that = this
		      console.log('外层：',that.mybox,'内层：',that.mybox2)
//		      var topcomentId = {}
//		      var comentId = {}
		      var params = new FormData()
		      params.append('topcomentId',that.mybox);
		      params.append('comentId',that.mybox2)
		      simpleAxios.post("topcoment/back/deletecoment",params).then(function(res){
		      		console.log(res)
					if(res.status == STATUS_OK && res.data.status==SUCCESS){
						
						//TODO 
						alert('删除成功');
						that.delet()
					}else
						backEndExceptionHanlder(res);
				}).catch(function(err){
					unknownError(err);
				})
				
		       
		    },
		    delet:function(){
		    	var that = this
		    	that.commentList = that.commentList.filter(item => that.mybox.indexOf(item.id) === -1);
		        that.commentList = that.commentList.filter(item => that.mybox2.indexOf(item.replyId) === -1);
		        that.mybox = [];
		        that.mybox2 = [];
		    },
			checkedOne:function(comment){
				console.log(comment)
				let idIndex = this.ismybox.indexOf(comment.index)
			      if (idIndex >= 0) {//如果已经包含就去除
			        this.mybox.splice(idIndex, 1)
			        this.mybox2.splice(idIndex, 1)
			        this.ismybox.splice(idIndex, 1)
			      } else {//如果没有包含就添加
			      	if(comment.id !==''){			   //有id是外层评论，replyId是内层评论,mybox存储外层评论的id，mybox2存储内层评论的replyId
			        	this.mybox.push(comment.id)
			      	}else{
			      		this.mybox2.push(comment.replyId)
			      	}
			        this.ismybox.push(comment.index)
			      }
				console.log(this.mybox,this.mybox2)
			},
			checkedAll (e) {
			  this.isCheckedAll = e.target.checked;
			  console.log(e.target.checked)
			  if (this.isCheckedAll) {//全选时
			    this.mybox = []
			    this.mybox2 = []
			    this.sortcommentList.forEach(item => {
			    	if(item.id !==''){
			    		this.mybox.push(item.id)
			    	}else{
			    		this.mybox2.push(item.replyId)
			    	}
			    	this.ismybox.push(item.index)
			        console.log('内层评论的id:'+this.mybox,'外层评论的id：'+this.mybox2)
			    })
			  } else {
			    this.mybox = [];
			    this.ismybox = [];
			    this.mybox2 = []
			  }
			},
			
			//分页
			turnToFirstPage:function(){
				var that = this;
				that.initComment(1);
				that.emptylength();

			},
			turnToPrePage:function(){
				var that = this;
				if(that.currentPageNo > 1) {
					var currentPageNo = that.currentPageNo;
					currentPageNo--;
					that.currentPageNo = currentPageNo;
					that.initComment(currentPageNo);
					that.emptylength();
				} else {
					alert('已经是第一页');
				}
			},
			turnToNextPage:function(){
				var that = this;
				var currentPageNo = that.currentPageNo;
				if(that.totalPage == currentPageNo) {
					alert('已经是最后一页');
				} else {
					currentPageNo++;
					that.currentPageNo = currentPageNo;
					that.initComment(currentPageNo);
					that.emptylength();
				}
			},
			
			turnToLastPage:function(){
				var that = this;
				var pages = that.totalPage;
				that.initComment(pages);
				that.emptylength();
			},
			//点击分页时清空数据
			emptylength:function(){
				var that = this
				that.ismybox = [];
				that.mybox = [];
				that.mybox2 = []
			}

			
		}
	});
});