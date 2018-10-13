
$(function(){
	var app = new Vue({
		el : '#seeks',
		data : {
			seektype : "",
			customerId:'',
			
			url:'',
			sequence : '',
			gender: '',
			title : '',
			missName :'',
			birthdate:'',
			missdate:'',
			missDetailPlace:'',
			plot:'',
			feature : '',
			otherInformation : '',
			seekSubtype : '',
			
			contactName:'',
			contactTel:'',
			contactWechat:'',
			contactQQ : '',
			contactAddress : '',
			extraTel : '',
			
			birthProvince : '',
			birthCity :'',
			birthCounty : '',
			birthsheng:[],
			shi:[],
			xian:[],
			
			missProvince : '',
			missCity :'',
			missCounty : '',
			misssheng:[],
			missshi:[],
			missxian:[],
			
		},
		computed : {
			
		},
		created : function(){
			var that = this
			that.initseeky();
			that.initBirthAddress();
			that.radom()
		},
		methods : {
			initseeky: function() {
				try {
					var search = window.location.search;
					search = search.substr(1, search.length - 1);
					var id = search.split('=')[1];
				} catch(e) {
					id = -1;
					alert('未检测到id,请重试');
				}
				this.seektype = id;
				console.log(this.seektype)
				
			},
			displayImg:function(){
				var img = $('#imgInput')[0].files[0];
				var reads = new FileReader();
				reads.readAsDataURL(img);
				reads.onload = function(e){
					$('#img').attr('src',this.result);
				}
			},
			submit:function(){
				http://
				var that = this;
				var str = that.missdate
				var str1 = that.birthdate;
				var birthdate = new Date(Date.parse(str1.replace(/-/g, "/"))).format('yyyy-MM-dd hh:mm:ss');
				var missdate = new Date(Date.parse(str.replace(/-/g, "/"))).format('yyyy-MM-dd hh:mm:ss');
//				alert(new Date(Date.parse(str1.replace(/-/g, "/"))).format('yyyy-MM-dd hh:mm:ss'))
				
			
				
				if(that.seektyp == 'y'){
					var seektype = '寻亲'
				}else{
					var seektype = '寻人'
				}
				
				var params = {
					customer : {
						id : that.customerId
					},
					address:{
						birthProvinceId : that.birthProvince,
						birthCityId : that.birthCity,
						birthCountyId : that.birthCounty,
						missProvinceId : that.missProvince,
						missCityId : that.missCity,
						missCountyId :that.missCounty,
					},
					seektype : seektype,
					sequence : that.sequence,
					title : that.title,
					missName : that.missName,
					gender : that.gender,					
					birthdate : birthdate,
					missdate : missdate,
					missDetailPlace : that.missDetailPlace,
					plot : that.plot,
					feature : that.feature,
					seekSubtype : that.seekSubtype,
					contactName : that.contactName,
					contactTel : that.contactTel,
					contactWechat : that.contactWechat,
					contactQQ : that.contactQQ,
					contactAddress : that.contactAddress,
					extraTel : that.extraTel,	
				};
				
				if(params.missName == ''){
					alert('请填写失踪者姓名');
					return false;
				}else if(params.gender == ''){
					alert('请选择性别');
					return false;
				}else if(params.birthdate == '' || params.birthdate =="NaN-aN-aN aN:aN:aN"){
					alert('请选择出生日期');
					return false;
				}else if(params.missdate == '' || params.missdate =="NaN-aN-aN aN:aN:aN"){
					alert('请选择失踪日期');
					return false;
				}else if(params.missDetailPlace == ''){
					alert('请填写详细地点');
					return false;
				}else if(params.plot == ''){
					alert('请填写失踪经过');
					return false;
				}else if(params.feature == ''){
					alert('请填写相貌特征');
					return false;
				}else if(params.seekSubtype == ''){
					alert('请选择失踪原因');
					return false;
				}else if(params.contactName == ''){
					alert('请填写联系人姓名');
					return false;
				}else if(!(/^1[34578]\d{9}$/.test(params.contactTel))){
					alert('手机号格式错误');
					return false;
				}else if(params.contactAddress == ''){
					alert('请填写联系地址');
					return false;
				}else if(params.address.birthProvinceId == '' || params.address.birthCityId == ''){
					alert('请选择籍贯地址');
					return false;
				}else if(params.address.missProvinceId == '' || params.address.missCityId == ''){
					alert('请选择失踪地址');
					return false;
				}
				
				
				
				jsonAxios.post('seek/back/saveseek',params).then(function(res){
					if(res.status == STATUS_OK && res.data.status==SUCCESS){
						console.log(res)
						var seekId = res.data.seeksId;
						var seekImg = $('#imgInput')[0].files[0];
						console.log(seekId,seekImg)
						if(seekImg){
							var params = new FormData();
							params.append('seekImg',seekImg);
							params.append('seekId',seekId);
							fileAxios.post('seek/saveseekImg',params).then(function(res){
								console.log(res)
								if(res.status == STATUS_OK && res.data.status==SUCCESS){
										//TODO 
									alert('发布成功');				
									window.close();
									
									}else
										backEndExceptionHanlder(res);
								}).catch(function(err){
									console.log(err)
								})
						}else
							backEndExceptionHanlder(res);
						}
						
				}).catch(function(err){
					
				})
			},
			
			
			reset:function(){
				window.close()
			},
			
			
			//获取随机数
			radom : function(){
				var that = this;
				if(that.seektype != 'y'){
					that.sequence = getRandomString(5,true)
				}else{
					that.sequence = getRandomString(5,false)
				};
				
				function getRandomString(length=5,isSeekPerson) {
				  let stamp = new Date().getTime();
				  let chars = [
				    'a', 'b', 'c', 'd', 'e', 'f', 'g',
				    'h', 'i', 'j', 'k', 'l', 'm', 'n',
				    'o', 'p', 'q', 'r', 's', 't',
				    'u', 'v', 'w', 'x', 'y', 'z'];
				
				  let randomString = '';
				  for (let i = 0; i < length; i++) {
				    randomString = randomString + chars[Math.ceil(Math.random() * 25)];
				  }
				  let prefix = isSeekPerson ? 'xr' : 'xJ';
				  randomString = prefix + stamp ;
				  return randomString.toUpperCase();
				}
				console.log(getRandomString(5,false))
			},
			
			initBirthAddress:function(){
				var that = this
//				/seek/back/province
				simpleAxios.get('/seek/back/province').then(function(res){
					if(res.status == STATUS_OK && res.data.status==SUCCESS){
						that.birthsheng = res.data.listprovince;
						that.misssheng = res.data.listprovince;
						that.customerId = res.data.volunteercustomerId
						if(!res.data.volunteercustomerId){
							alert('您不是志愿者，不能发布寻人或寻亲');
							window.close();
						}
						console.log(res)
					}else
						backEndExceptionHanlder(res);
				}).catch(function(err){
					console.log(err)
				})
			},
			changebirthsheng : function(e){
				var that = this;
				var id = that.birthProvince;
				simpleAxios.get('/seek/back/city?id='+id).then(function(res){
					if(res.status == STATUS_OK && res.data.status==SUCCESS){
						that.shi = res.data.citylist;
						that.xian=[];
						
					}else
						backEndExceptionHanlder(res);
				}).catch(function(err){
					console.log(err)
				})
			},
			changebirthshi : function(){
				var that = this;
				var id = that.birthCity;
				simpleAxios.get('/seek/back/county?id='+id).then(function(res){
					if(res.status == STATUS_OK && res.data.status==SUCCESS){
						that.xian = res.data.countylist;
//						that.misssheng = res.data.listprovince;
						console.log(res)
					}else
						backEndExceptionHanlder(res);
				}).catch(function(err){
					console.log(err)
				})
				
			},
			changemisssheng : function(e){
				var that = this;
				var id = that.missProvince;
				simpleAxios.get('/seek/back/city?id='+id).then(function(res){
					if(res.status == STATUS_OK && res.data.status==SUCCESS){
						that.missshi = res.data.citylist;
						that.missxian=[];
					}else
						backEndExceptionHanlder(res);
				}).catch(function(err){
					console.log(err)
				})
			},
			changemissshi : function(){
				var that = this;
				var id = that.missCity;
				simpleAxios.get('/seek/back/county?id='+id).then(function(res){
					if(res.status == STATUS_OK && res.data.status==SUCCESS){
						that.missxian = res.data.countylist;
//						that.misssheng = res.data.listprovince;
						console.log(res)
					}else
						backEndExceptionHanlder(res);
				}).catch(function(err){
					console.log(err)
				})
				
			},
			
			
			
			
		}
	})
})
