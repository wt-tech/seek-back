Vue.component('vtd', {
	props: ['content'],
	template: `<td align="center" valign="middle" v-html="content" class="borderright borderbottom"></td>`
});

$(function() {
	var app = new Vue({
		el: '#admin',
		data: {
			totalCount: '',
			totalPage: '',
			currentPageNo: 1,
			adminList: []
		},
		computed: {
			comadmList: function() {
				var that = this;
				return that.adminList.map(function(admin, index) {
					return {
						index: index + 1,
						userName: getValue(admin, 'userName'),
						userCode: getValue(admin, 'userCode'),
						userPassword: getValue(admin, 'userPassword'),
						id: getValue(admin, 'id')
					}
				})
			}
		},
		created: function() {
			var that = this
			that.getAdminList()
		},
		methods: {
			getAdminList: function(pages) {
				var that = this
				var currentPageNo = pages || 1
				simpleAxios.get('back/logins?currentPageNo=' + currentPageNo).then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
						var resData = res.data;
						that.adminList = resData.users;
						that.totalPage = Math.ceil(resData.totalCount / resData.pageSize);
						that.totalCount = resData.totalCount;
					} else
						backEndExceptionHanlder(res);
				}).catch(function(err) {
					console.log(err)
				})
			},
			turnToUpdatePage: function(e) {
				console.log(e)
				var id = e.id
				var userName = e.userName
				var userCode = e.userCode
				var url = '../adminList/updataAdmin.html?id=' + id + '&userName=' + userName + '&userCode=' + userCode
				window.open(url)
			},

			firstPage: function() {
				var that = this;
				that.currentPageNo = 1;
				that.getAdminList(that.currentPageNo);
			},

			prevPage: function() {
				var that = this;
				if(that.currentPageNo > 1) {
					var currentPageNo = that.currentPageNo;
					currentPageNo--;
					that.currentPageNo = currentPageNo;
					that.getAdminList(currentPageNo);
				} else {
					alert('已经是第一页');
				}
			},

			nextPage: function() {
				var that = this;
				var currentPageNo = that.currentPageNo;
				if(that.totalPage == currentPageNo) {
					alert('已经是最后一页');
				} else {
					currentPageNo++;
					that.currentPageNo = currentPageNo;
					that.getAdminList(currentPageNo);
				}
			},

			lastPage: function() {
				var that = this;
				that.currentPageNo = that.totalPage;
				that.getAdminList(that.totalPage);
			},
				
		},

	})
})