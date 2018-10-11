$(function() {
	var app = new Vue({
		el: '#frommain',
		data: {
			nickname: '',
			username: '',
			password: '',
			enpassword: '',
			realName: '',
			idCard: '',
			nameErr: '',
			passErr: '',
			enpassErr: '',
			realErr: '',
			idErr: '',
		},
		computed: {

		},
		methods: {
			submit: function() {
				//				var params = new FormData();
				var that = this
				that.nameErr = '';
				that.passErr = '';
				that.enpassErr = '';
				that.realErr = '';
				that.idErr = '';
				if(that.username == '' || that.nameErr == '用户名已被注册') {
					that.nameErr = '用户名不能为空'
					return false
				};
				if(!that.funcChina(that.username)) {
					that.nameErr = '不能包含中文'
					return false
				};
				if(that.password.length < 6) {
					that.passErr = '密码至少六位'
					return false
				};
				if(that.enpassword !== that.password) {
					that.enpassErr = '密码不一致'
					return false
				};
				if(that.realName == '') {
					that.realErr = '填写姓名'
					return false
				};
				console.log(that.password.length)
				if(!that.isCardNo(that.idCard)) {
					return false
				};

				console.log(typeof(that.idCard))
				var params = {
					username: this.username,
					password: this.password,
					realName: this.realName,
					idCard: this.idCard,
					nickname: this.nickname
				}
				//				params.append('username',this.username);
				//				params.append('password',this.password);
				//				params.append('realName',this.realName);
				//				params.append('idCard',this.idCard)

				jsonAxios.post('register', params).then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
						alert('注册成功')
						that.clear()
					} else
						backEndExceptionHanlder(res);
				}).catch(function(err) {
					console.log('err')

					unknownError(res);
				})
			},
			clear: function() {
				var that = this
				that.nickname = '';
				that.username = '';
				that.password = '';
				that.enpassword = '';
				that.realName = '';
				that.idCard = '';
			},
			isCardNo: function(card) {
				var that = this
				// 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X 
				var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
				if(reg.test(card) === false) {
					that.idErr = '身份证输入不合法'
					return false;
				}
				return true
			},
			funcChina: function(obj) {

				if(/.*[\u4e00-\u9fa5]+.*$/.test(obj)) {
					return false;
				}
				return true;
			},
			preflight: function() {
				var that = this
				var username = that.username;
				var params = new FormData();
				params.append('username', username)
				simpleAxios.get('preflight?username=' + username).then(function(res) {
					if(res.status == STATUS_OK && res.data.status == SUCCESS) {
						that.nameErr = ''
						console.log(res)
					} else {
						that.nameErr = '用户名已被注册'
					}
				}).catch(function(err) {

				})
			}
		},
	});
});