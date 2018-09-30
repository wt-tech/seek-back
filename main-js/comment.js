
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
						//TODO 
						
						console.log(res)
						var commentLists = []
						for (var tmp of res.data.topComents){
							commentLists.push(tmp)
							if(tmp.talks){
								for (var tmp2 of tmp.talks){
									commentLists.push(tmp2)
								}
							}
							
						}
						console.log(commentLists)
						that.commentList = commentLists;
						that.totalCount = res.data.totalCount
						that.totalPage = Math.ceil(res.data.totalCount/5)
						
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
		      console.log(this.mybox)
//		      var topcomentId = {}
//		      var comentId = {}
		      var params = new FormData()
		      params.append('topcomentId',this.mybox);
		      params.append('comentId',this.mybox2)
		      fileAxios.post("topcoment/back/deletecoment",params).then(function(res){
		      		console.log(res)
					if(res.status == STATUS_OK && res.data.status==SUCCESS){
						//TODO 
						alert('删除成功');
						this.commentList = this.commentList.filter(item => this.mybox.indexOf(item.id) === -1);
				        this.commentList = this.commentList.filter(item => this.mybox2.indexOf(item.replyId) === -1);
				        this.mybox = [];
				        this.mybox2 = [];
					}else
						backEndExceptionHanlder(res);
				}).catch(function(err){
					unknownError(err);
				})
		      
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
				var that = this
				that.initComment(1)
			},
			turnToPrePage:function(){
				var that = this
				if(that.currentPageNo>1){
					that.currentPageNo -- 
					var pages = that.currentPageNo
					that.initComment(pages)
				}
				
			},
			turnToNextPage:function(){
				var that = this
				if(that.currentPageNo<that.totalPage){
					that.currentPageNo -- 
					var pages = that.currentPageNo
					that.initComment(pages)
				}
			},
			turnToLastPage:function(){
				var that = this
				var pages = that.totalPage
				that.initComment(pages)
			}

			
		}
	});
});