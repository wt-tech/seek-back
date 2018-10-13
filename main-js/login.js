
//
$(function(){
    var app = new Vue({
        el : '#vueApp',
        data : {
            username : '',
            password : ''
        },
        methods : {
            formSubmit : function(){

                var vueInstance = this;
                var params = new FormData();

                params.append('userCode',vueInstance.username);
                params.append('userPassword',vueInstance.password);

                simpleAxios.post('/login',params).then(function(res){
                    if(res.status == STATUS_OK && res.data.status == SUCCESS){
                        window.location.href = 'index.html';
                    }else
						backEndExceptionHanlder(res);
                }).catch(function(err){
                    unknownError(err);
                })
            },
        }
    });
})