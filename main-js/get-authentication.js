
$(function(){
	var app = new Vue({
		el:'#authentication',
		data:{
			rawAuthentication : {},
			authenticationId : null,
			id:0,
		},
		computed : {
			authentication : function(){
				var that = this;
				return{
					customerName : getValue(that.rawAuthentication,'customerName'),
					identityNO: getValue(that.rawAuthentication,'identityNO'),
				    positiveIdentityUrl : "<img src='"+getValue(that.rawAuthentication,'positiveIdentityUrl')+"'></img>",
				    negativeIdentityUrl : "<img src='"+getValue(that.rawAuthentication,'negativeIdentityUrl')+"'></img>",
					address : getValue(that.rawAuthentication,'address'),
					tel : getValue(that.rawAuthentication,'tel'),
					authResult : getValue(that.rawAuthentication,'authResult'),
					id : getValue(that.rawAuthentication,'id')
				}
				
			}
		},
		created : function(){
			var that = this;
			that.initauthenticationId();
			that .initRawAuthResult();
		},
		
		methods : {
			initauthenticationId : function(){
				try{
					var search = window.location.search;
					search = search.substr(1,search.length-1);
					var id = search.split('=')[1];
				}catch(e){
					id = -1;
					alert('未检测到id,请重试');
				}
				this.authenticationId = id;
				console.log(this.authenticationId);
			},
			
			initRawAuthResult : function(authenticationId){
				var that = this;
				simpleAxios.get('authentication/back/getbackauthentication?id='+this.authenticationId).then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						that.rawAuthentication = res.data.authentication
					}else 
						backEndExceptionHanlder(res);
				}).catch(function(err){
					unknownError(err);
				})
			},
			
			passauthentication : function(id){
				console.log(id);
				var that = this;
				var params = new FormData();	
				params.append('authResult','认证通过');
				params.append('id',id);
				if (authentication.authResult == '认证通过'){
					alert('审核已完成，请勿重复审核')
				}else{
					simpleAxios.post('authentication/back/updateAuthentication',params).then(function(res){
						console.log(res)
						that.initRawAuthResult()
					}).catch(function(err){
						console.log(err)
					})
				}
				
			},
	
			notpassauthentication : function(id){
				console.log(id);
				var that = this;
				var params = new FormData();			
				params.append('authResult','认证不通过');
				params.append('id',id)
				if (authentication.authResult == '认证不通过'){
					alert('审核已完成，请勿重复审核')
				}else{
					simpleAxios.post('authentication/back/updateAuthentication',params).then(function(res){
						console.log(res)
						that.initRawAuthResult()
					}).catch(function(err){
						console.log(err)
					})
				}
			},
			
			backPage : function(){
				var url = "main-authentication.html";
				window.open(url,'mainFrame');
			}
		},
	
	})
});
