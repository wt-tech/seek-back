
$(function(){
	var app = new Vue({
		el:'#volunteer',
		data:{
			rawVolunteer : {},
			volunteerId : null,
			id:0,
		},
		computed : {
			volunteer : function(){
				var that = this;
				return{
					sequence:getValue(that.rawVolunteer,'sequence'),
					customerName : getValue(that.rawVolunteer,'customerName'),
					identityNO: getValue(that.rawVolunteer,'identityNO'),
				    positiveIdentityUrl : "<img src='"+getValue(that.rawVolunteer,'positiveIdentityUrl')+"'></img>",
				    negativeIdentityUrl : "<img src='"+getValue(that.rawVolunteer,'negativeIdentityUrl')+"'></img>",
					address : getValue(that.rawVolunteer,'address'),
					tel : getValue(that.rawVolunteer,'tel'),
					volResult : getValue(that.rawVolunteer,'volResult'),
					id : getValue(that.rawVolunteer,'id')
				}
				
			}
		},
		created : function(){
			var that = this;
			that.initvolunteerId();
			that .initRawVolResult();
		},
		
		methods : {
			initvolunteerId : function(){
				try{
					var search = window.location.search;
					search = search.substr(1,search.length-1);
					var id = search.split('=')[1];
				}catch(e){
					id = -1;
					alert('未检测到id,请重试');
				}
				this.volunteerId = id;
				console.log(this.volunteerId);
			},
			
			initRawVolResult : function(volunteerId){
				var that = this;
				simpleAxios.get('volunteer/back/getvolunteer?id='+this.volunteerId).then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						that.rawVolunteer = res.data.volunteer
					}else 
						backEndExceptionHanlder(res);
				}).catch(function(err){
					unknownError(err);
				})
			},
			
			passvolunteer : function(id){
				console.log(id);
				var that = this;
				var params = new FormData();	
				params.append('volResult','审核通过');
				params.append('id',id);
				if (volunteer.volResult == '审核通过'){
					alert('审核已完成，请勿重复审核')
				}else{
					simpleAxios.post('volunteer/back/updatevolunteer',params).then(function(res){
						console.log(res)
						that.initRawVolResult()
					}).catch(function(err){
						console.log(err)
					})
				}
				
			},
	
			notpassvolunteer : function(id){
				console.log(id);
				var that = this;
				var params = new FormData();			
				params.append('volResult','审核不通过');
				params.append('id',id)
				if (volunteer.volResult == '审核不通过'){
					alert('审核已完成，请勿重复审核')
				}else{
					simpleAxios.post('volunteer/back/updatevolunteer',params).then(function(res){
						console.log(res)
						that.initRawVolResult()
					}).catch(function(err){
						console.log(err)
					})
				}
			},
			
			backPage : function(){
				var url = "main-volunteer.html";
				window.open(url,'mainFrame');
			}
		},
	
	})
});
