

//新建axios实例,普通form表单
var simpleAxios = axios.create({
	baseURL : 'http://192.168.0.105:8080/seek01/',
	// baseURL : 'http://192.168.0.177:8888/seek01/',
    timeout : 60000,
    withCredentials: true, // 允许携带cookie
    headers:{
        'Content-type': 'application/x-www-form-urlencoded'
    }
});
//axios实例,携带文件上传
var fileAxios = axios.create({
	baseURL : 'http://192.168.0.105:8080/seek01/',
    // baseURL : 'http://192.168.0.177:8888/seek01/',
    timeout : 60000,
    withCredentials: true, // 允许携带cookie
    headers:{
        'Content-type': 'multipart/form-data'
    }
});

var _pageSize = 7;//分页,每页显示条目
var _imgsizes = 20971520;//图片大小最大为20M

const STATUS_OK = 200;
const SUCCESS = 'success';
const FAIL = 'fail';
const TEN = 10;


 function backEndExceptionHanlder(res){
	if(res.status==STATUS_OK && res.data.status == FAIL){//后端的GloblalExceptionHandler抛出的错误信息
		let tips = res.data.tips;
		alert(tips);
	}
}

function unknownError(err){
	console.log(typeof	err);
	console.log(err);
	alert('未知错误');
}


/**
 * 获取object的key属性的值
 * 若不存在该属性,或该属性为null均返回空字符串
 */
function getValue(object,key){
	var value = null;
	try{
		value = object[key];
	}catch(err){
		value = null;
	}
	return value==null?'':value;
}

/**
 * 对字符串类型的日期时间简单处理
 * 返回日期部分
 */
function getDateOfDateTime(dateTime){
	if(dateTime == null || typeof dateTime != 'string')
		return '';
	if(dateTime.length <= TEN)
		return dateTime;
	return dateTime.substr(0,TEN);
}

/**
 * 根据数组内部元素的id(如果有)定位索引.
 */
Array.prototype.indexOfByElementId = function(elementId){
	var index = -1;//找到的索引
	this.some(function(element,indax,that){
		if(element.id == elementId){
			index = indax;
			return true;
		}
		return false;
	});
	return index;
}


Array.prototype.remove = function(elementId){
	var result = false;
	var index = this.indexOfByElementId; 
	if(index != -1){
		this.splice(index,1);
		result = true;
	}
	return result;
}


