//获取seekId


$(function(){
	
	var seek = new Vue({
		el : '#seeks',
		data : {
			id:'',
			userCode:'',
			userName:'',
		},
		
		created : function(){
			this.initAdmin();
			this.GetArgsFromHref()
		},
		
		methods : {
			
			initAdmin : function(){
				try{
					var search = window.location.search;
					search = search.substr(1,search.length-1);
					
					var id = search.split('=')[1];
					
				}catch(e){
					id = -1;
					alert('未检测到id,请重试');
				}
			},
			GetArgsFromHref : function (sHref, sArgName){
				    var search = window.location.search;
					var str = search.split('？');
					var str2 = str.toString().split('&')
					var id = str2[0].split('=')[1]
					var name = str2[1].split('=')[1]
					var userCode = str2[2].split('=')[1]
					var userName = this.getParams(name)
					console.log(userName)
					this.id = id;
					this.userCode = userCode;
					this.userName = userName
			},
			getParams : function (key) {
			    return decodeURI(key);  
			},
			submit:function(){
				
			},
			reset:function(){
				
			}

		}
	});
})