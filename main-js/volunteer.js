
//class="bggray" 可以让改行单元格变灰 奇数行,偶数行

//td组件
Vue.component('std',{
	props : ['content'],
	template : `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});


$(function(){
	var app = new Vue({
		el:'#volunteer',
		data:{
			rawVolunteerList : [],
			currentPageNo : 1,
			field : ['id','index','customerName','identityNO','positiveIdentityUrl','negativeIdentityUrl','address','tel','volResult'],//index指序号
			totalPage: '',
			totalCount:'',
		},
		computed : {
			volunteerList : function(){
				var that = this;
				return that.rawVolunteerList.map(function(volunteer,index){
					return{
						index : index +1,
						customerName : getValue(volunteer,'customerName'),
						identityNO: getValue(volunteer,'identityNO'),
						positiveIdentityUrl : "<img src='"+getValue(volunteer,'positiveIdentityUrl')+"'></img>",
//						positiveIdentityUrl : "<img src='http://192.168.0.105:8080/statics/seek01/volunteer-img/7.jpg'></img>",
						negativeIdentityUrl : "<img src='"+getValue(volunteer,'negativeIdentityUrl')+"'></img>",
//						negativeIdentityUrl : "<img src='http://192.168.0.105:8080/statics/seek01/volunteer-img/7.jpg'></img>",
						address : getValue(volunteer,'address'),
						tel : getValue(volunteer,'tel'),
						volResult : getValue(volunteer,'volResult'),
						id : getValue(volunteer,'id')
					}
				})
			}
		},
		created : function(){
			var that = this;
			that .initRawVolunteerList()
		},
		
		methods : {
			initRawVolunteerList : function(PageNo){
				var that = this
//				var params = new FormData();
				var currentPageNo = PageNo || that.currentPageNo
//				params.append('currentPageNo',currentPageNo)
				simpleAxios.get('volunteer/back/listvolunteer?currentPageNo='+currentPageNo).then(function(res){
					if(res.status == STATUS_OK && res.data.status == SUCCESS){
						var resData = res.data
						that.rawVolunteerList = resData.volunteers
						that.totalPage = Math.ceil(resData.totalCount/resData.pageSize)
						that.totalCount = resData.totalCount
						console.log(res)
						console.log(that.rawVolunteerList)
					}else 
						backEndExceptionHanlder(res);
					
				}).catch(function(err){
					unknownError(err);
				})
			},
			passvolunteer : function(volunteer){
				console.log(volunteer.id,volunteer)
				var that = this
				var params = new FormData()
				var id = volunteer.id				
				params.append('volResult','审核通过')
				params.append('id',id)
				if (volunteer.volResult == '审核通过'){
					alert('审核已完成，请勿重复审核')
				}else{
					simpleAxios.post('volunteer/back/updatevolunteer',params).then(function(res){
						console.log(res)
						that.initRawVolunteerList()
					}).catch(function(err){
						console.log(err)
					})
				}
				
			},
			
			notpassvolunteer : function(volunteer){
				console.log(volunteer.id,volunteer)
				var that = this
				var params = new FormData()
				var id = volunteer.id				
				params.append('volResult','审核不通过')
				params.append('id',id)
				if (volunteer.volResult == '审核不通过'){
					alert('审核已完成，请勿重复审核')
				}else{
					simpleAxios.post('volunteer/back/updatevolunteer',params).then(function(res){
						console.log(res)
						that.initRawVolunteerList()
					}).catch(function(err){
						console.log(err)
					})
				}
				
			},
			
			firstPage : function(){
				var that = this
				var currentPageNo  = 1 
				that.initRawVolunteerList(currentPageNo)
			},
			prevPage : function(){
				var that = this
				if (that.currentPageNo > 1 ){					
					var currentPageNo  = that. currentPageNo
					currentPageNo -- 
					that.currentPageNo = currentPageNo
					that.initRawVolunteerList(currentPageNo)
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
					that.initRawVolunteerList(currentPageNo)
				}
			},
			lastPage :function(){
				var that = this
				that.currentPageNo = that.totalPage
				that.initRawVolunteerList(that.totalPage)
			}
			
		},
	
	})
});
