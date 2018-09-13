//获取bannerId


$(function(){
	
	var banner = new Vue({
		el : '#banner',
		data : {
			banner : {
				id : null,
				imgName : null,
				onUse : null,
				url : null
			}
		},
		
		created : function(){
			this.initBanner();
		},
		
		methods : {
			
			displayImg : function(){
                var img = $('#imgInput')[0].files[0];
				var reads = new FileReader();
				reads.readAsDataURL(img);
				reads.onload = function(e){
					$('#img').attr('src',this.result);
				}
            },
			
			//点击提交按钮
			submit : function(){
				var that = this;
				var params = that.prepareUpdateParams();
				fileAxios.post("banner/updatebanner",params).then(function(res){
					if(res.status == STATUS_OK && res.data.status==SUCCESS){
						//TODO 
						alert('修改成功');
					}else
						backEndExceptionHanlder(res);
				}).catch(function(err){
					unknownError(err);
				})
			},
			
			prepareUpdateParams : function(){
				var that = this;
				var params = new FormData();
				params.append("id",that.banner.id);
				params.append("imgName",that.banner.imgName);
				params.append("onUse",that.banner.onUse);
				params.append("url",that.banner.url);
				
				return params;
			}
		}
	});
})