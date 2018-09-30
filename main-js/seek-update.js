//获取seekId


$(function(){
	
	var seek = new Vue({
		el : '#seeks',
		data : {
			seek:{
				sequence:'',
				address:{ 
					"birthCityName": null, 
					"birthCountyName": null, 
					"birthProvinceName": null, 
					"missCityName": null, 
					"missCountyName": null, 
					"missProvinceName": null
				}
			},
			missprovince:[],
			initmissporv:'',
			initmisscity:'',
			initmisscunty:'',
			misscity:[],
			missconty:[],
			imgs:[],
			seekId : null,
			banner : {
				id : null,
				imgName : null,
				onUse : null,
				uploadTime : null,
				url : null
			},
			bannerBak :{//备份banner,点击重置按钮生效
				id : null,
				imgName : null,
				onUse : null,
				uploadTime : null,
				url : null
			},
		},
		
		created : function(){
			this.initSeekId();
			this.initSeek();
		},
		
		methods : {
			
			initSeekId : function(){
				try{
					var search = window.location.search;
					search = search.substr(1,search.length-1);
					var id = search.split('=')[1];
				}catch(e){
					id = -1;
					alert('未检测到id,请重试');
				}
				this.seekId = id;
				console.log(id)
			},
			
			initSeek : function(){
				this.getSeek(this.seekId);
			},
			
			getSeek : function(seekId){
				var that = this;
				simpleAxios.get('seek/back/getseek?id='+this.seekId).then(function(res){
					console.log(res)
					if(res.status == STATUS_OK){
						that.seek = res.data.seekcontent;
						that.imgs = res.data.seekcontent.seekimgs.split(',')
						that.missprovince = res.data.listprovince
						that.seek.missDate = that.seek.missDate.split(' ')[0]
						that.seek.pubdate = that.seek.pubdate.split(' ')[0]
						that.seek.birthdate = that.seek.birthdate.split(' ')[0]
						that.seek.id = that.seekId;
						
						$.extend(that.bannerBak,that.banner);
						console.log(that.imgs)
					}else
						backEndExceptionHanlder(res);					
				}).catch(function(res){
					unknownError(res);
				});
			},
			
			submit:function(e){
				var that = this
				var params = that.prepareUpdateParams()
				console.log(that.seekId)
				fileAxios.post("seek/back/updateseek",params).then(function(res){
					if(res.status == STATUS_OK && res.data.status==SUCCESS){
						//TODO 
						alert('修改成功');
					}else
						backEndExceptionHanlder(res);
				}).catch(function(err){
					unknownError(err);
				})
			},
			reset:function(e){
				
			},
		
		
			prepareUpdateParams : function(){
				var that = this;
				var params = new FormData();

//				console.log(birthdate,missDate)
				params.append("id",that.seekId);
				params.append("missName",that.seek.missName);
				params.append("missDetailPlace",that.seek.missDetailPlace);
				params.append("plot",that.seek.plot);
				params.append("feature",that.seek.feature);
				params.append("otherInformation",that.seek.otherInformation);
				params.append("contactName",that.seek.contactName);
				params.append("contactTel",that.seek.contactTel);
				params.append("contactWechat",that.seek.contactWechat);
				params.append("contactQQ",that.seek.contactQQ);
				params.append("extraTel",that.seek.extraTel);
				return params;
			},
			
			

			reset : function(){
				window.close();
			},
			

		}
	});
})