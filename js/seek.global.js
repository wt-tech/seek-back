//新建axios实例,普通form表单
var simpleAxios = axios.create({
    baseURL : '/seek01/back',
    timeout : 60000,
    withCredentials: true, // 允许携带cookie
    headers:{
        'Content-type': 'application/x-www-form-urlencoded'
    }
});
//axios实例,携带文件上传
var fileAxios = axios.create({
    baseURL : '/seek01/back',
    timeout : 60000,
    withCredentials: true, // 允许携带cookie
    headers:{
        'Content-type': 'multipart/form-data'
    }
});

var _pageSize = 7;//分页,每页显示条目
var _imgsizes = 20971520;//图片大小最大为20M


