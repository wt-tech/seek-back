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

				console.log(birthdate,missDate)
				params.append("id",that.seekId);
				params.append("sequence",that.seek.sequence);
				params.append("title",that.seek.title);
				params.append("seekType",that.seek.seekType);
				params.append("missName",that.seek.missName);
				params.append("gender",that.seek.gender);
//				params.append("birthdate",birthdate);
//				params.append("missDate",missDate);
				params.append("birthProvinceName",that.seek.address.birthProvinceName);
				params.append("birthCountyName",that.seek.address.birthCountyName);
				params.append("birthCityName",that.seek.address.birthCityName);
				params.append("missProvinceName",that.seek.address.missProvinceName);
				params.append("missCountyName",that.seek.address.missCountyName);
				params.append("missCityName",that.seek.address.missCityName);
				params.append("missDetailPlace",that.seek.missDetailPlace);
				params.append("plot",that.seek.plot);
				params.append("feature",that.seek.feature);
				params.append("relationship",that.seek.relationship);
				params.append("otherInformation",that.seek.otherInformation);
				params.append("seekSubtype",that.seek.seekSubtype);
				params.append("contactName",that.seek.contactName);
				params.append("contactTel",that.seek.contactTel);
				params.append("contactWechat",that.seek.contactWechat);
				params.append("contactQQ",that.seek.contactQQ);
				params.append("extraTel",that.seek.extraTel);
				params.append("pubdate",that.seek.pubdate);
//				params = that.appendImg(params);
				return params;
			},
			
			
//			missprovinceChange:function(e){
//				console.log(e.target.value)
//				var that = this
//				var id = e.target.value
//				simpleAxios.get('seek/back/city?id='+id).then(function(res){
//					
//				if(res.status == STATUS_OK){
//						that.misscity = res.data.citylist
//						
//						console.log(that.misscity[0])
//						var cityId = that.misscity[0].id
//						simpleAxios.get('seek/back/county?id='+cityId).then(function(res){
//							
//						if(res.status == STATUS_OK){
//								that.missconty = res.data.countylist
//							}else
//								backEndExceptionHanlder(res);
//								
//						}).catch(function(res){
//							unknownError(res);
//						});
//					}else
//						backEndExceptionHanlder(res);
//						
//				}).catch(function(res){
//					unknownError(res);
//				});
//				
//			},
//			misscityChange:function(e){
//				var that = this 
//				var id = e.target.value
//				simpleAxios.get('seek/back/county?id='+id).then(function(res){
//					
//				if(res.status == STATUS_OK){
//						that.missconty = res.data.countylist
//					}else
//						backEndExceptionHanlder(res);
//						
//				}).catch(function(res){
//					unknownError(res);
//				});
//			},
			
			
			
			
			
//			porvinceClick:function(e){
//				var that = this
//				that.porvhide = false
////				console.log(e)
//			}
//			displayImg : function(){
//							
//              var img = $('#imgInput')[0].files[0];
//				var reads = new FileReader();
//				reads.readAsDataURL(img);
//				reads.onload = function(e){
//					$('#img').attr('src',this.result);
//				}
//          },
//		
//			reset : function(){
//				$.extend(this.banner,this.bannerBak);
//				//重置预览图片
//				$('#img').attr('src',this.banner.url);
//			},
			
			//点击提交按钮
//			submit : function(){
//				var that = this;
//				var params = that.prepareUpdateParams();
//				fileAxios.post("banner/back/updatebanner",params).then(function(res){
//					if(res.status == STATUS_OK && res.data.status==SUCCESS){
//						//TODO 
//						alert('修改成功');
//					}else
//						backEndExceptionHanlder(res);
//				}).catch(function(err){
//					unknownError(err);
//				})
//			},
//			
//			prepareUpdateParams : function(){
//				var that = this;
//				var params = new FormData();
//				params.append("id",that.banner.id);
//				params.append("imgName",that.banner.imgName);
//				params.append("onUse",that.banner.onUse);
//				params.append("uploadTime",that.banner.uploadTime);
//				params.append("url",that.banner.url);
//				params = that.appendImg(params);
//				return params;
//			},
//			appendImg : function(params){
//				var img = $('#imgInput')[0].files[0];
//				params.append("bannerImg",img);
//				return params;
//			}
		}
	});
})