// js验证

// 空
function empty(s){
	if(s==""){
		return false;
	}
	return true;
}

// email验证
function isEmail(s){
	// var reg=;
	var patrn = /^\w+([-+.@\w])*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
	if (!patrn.exec(s)) return false  ;
	return true;
}
// 国内电话传真
function isTel(s){   
	var patrn=/[^\d-]/;   
	if (patrn.exec(s)) {return false;} ;
	if(s.length<7){return false;}
	return true;  
}   

// 手机
function isPhone(s){ 
	var patrn=/^(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9])\d{8}$/;  
	if (!patrn.exec(s)) return false ;
	return true ;
}

//手机号验证 1开头 11位
function isPhoneSimp(s){ 
	var patrn=/^(1)\d{10}$/;  
	if (!patrn.exec(s)) return false ;
	return true ;
}

//香港手机号码
function isHongKongPhone(s){
	var patrn=/^(00)?852(56|59|6|9)\d{7}$/;
	if (!patrn.exec(s)) return false ;
	return true ;
}
  
// QQ验证
function isQQ(s){
	var patrn=/[1-9][0-9]{4,}/;   
	if (!patrn.exec(s)) return false;
	return true; 
}

// 邮编
function isZipCode(s){
	var patrn=/^[1-9][0-9]{5}$/;
	if (!patrn.exec(s)&&!isSpace(s)) return false;
	return true;
}

// 身份证
function isID(s){
	var patrn=/d{15}|d{18}/;   
	if (!patrn.exec(s)) return false;
	return true; 
}

// 是否全数字
function isDigit(s) 
{ 
	var patrn=/^[0-9]{1,20}$/; 
	if (!patrn.exec(s)) return false ;
	return true ;
}
//是否数字和.
function isRate(s) { 
	var patrn=/^[0-9]{1,20}.?[0-9]*$/; 
	if (!patrn.exec(s)) return false ;
	return true ;
} 
// 是否中文
function isZw(s){
	var patrn=/[\u4e00-\u9fa5]/; 
	if (!patrn.exec(s)) return false; 
	return true; 
}
// 匹配帐号是否合法(字母开头，允许5-16字节，允许字母数字下划线)：
function isUserName(s){
	 var patrn=/^[a-zA-Z][a-zA-Z0-9_]{4,15}$/; 
	if (!patrn.exec(s)) return false; 
	return true; 
}

// 验证是否含有^%&’,;=?$”等字符：“”
function isSpecial(s){
	var patrn=/[\^%&',;=?$x22]+/; 
	if (patrn.exec(s)) return false; 
	return true; 
}

// 是否是字母数字汉字
function standard(s){
	var path = /^[\u4E00-\u9FA5A-Za-z0-9_]+$/;
	if (!path.exec(s)) {
		return false;
	}
	return true;
}
//是否是字母汉字
function isName(s){
	var path = /^[\u4E00-\u9FA5A-Za-z]+$/;
	if (!path.exec(s)) {
		return false;
	}
	return true;
}


//转换为大写
function uppercase(obj){
	var val=obj.value.toLocaleUpperCase();
	obj.value=val;
}

//定义检测函数,返回0/1/2/3分别代表无效/差/一般/强
function getResult(s){
 if(s.length < 4){
  return 0;
 }
 var ls = 0;
 if (s.match(/[a-z]/ig)){
  ls++;
 }
 if (s.match(/[0-9]/ig)){
  ls++;
 }
  if (s.match(/(.[^a-z0-9])/ig)){
  ls++;
 }
 if (s.length < 6 && ls > 0){
  ls--;
 }
 return ls;
}

// 身份证
function isIdCardNo(num) {
    num = num.toUpperCase();
    // 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X。
    if (! (/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(num))) {
       // layer.msg('输入的身份证号长度不对，或者号码不符合规定！\n15位号码应全为数字，18位号码末位可以为数字或X。',2,-1);
        return false;
    }
    // 校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
    // 下面分别分析出生日期和校验位
    var len, re;
    len = num.length;
    if (len == 15) {
        re = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/);
        var arrSplit = num.match(re);
        // 检查生日日期是否正确
        var dtmBirth = new Date('19' + arrSplit[2] + '/' + arrSplit[3] + '/' + arrSplit[4]);
        var bGoodDay;
        bGoodDay = (dtmBirth.getYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
        if (!bGoodDay) {
        	//layer.msg('您输入的身份证号不正确请核对后重新输入！',2,-1);
            return false;
        } else {
            // 将15位身份证转成18位
            // 校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
            var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
            var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
            var nTemp = 0,
            i;
            num = num.substr(0, 6) + '19' + num.substr(6, num.length - 6);
            for (i = 0; i < 17; i++) {
                nTemp += num.substr(i, 1) * arrInt[i];
            }
            num += arrCh[nTemp % 11];
            return num;
        }
    }
    if (len == 18) {
        re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
        var arrSplit = num.match(re);
        // 检查生日日期是否正确
        var dtmBirth = new Date(arrSplit[2] + "/" + arrSplit[3] + "/" + arrSplit[4]);
        var bGoodDay;
        bGoodDay = (dtmBirth.getFullYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
        if (!bGoodDay) {
        	//layer.msg('您输入的身份证号不正确请核对后重新输入！',2,-1);
            return false;
        } else {
            // 检验18位身份证的校验码是否正确。 //校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
            var valnum;
            var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
            var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
            var nTemp = 0,
            i;
            for (i = 0; i < 17; i++) {
                nTemp += num.substr(i, 1) * arrInt[i];
            }
            valnum = arrCh[nTemp % 11];
            if (valnum != num.substr(17, 1)) {
            	//layer.msg('您输入的身份证号不正确请核对后重新输入！',2,-1);
                return false;
            }
            return num;
        }
    }
    return false;
} // JavaScript Document


var Wi = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1 ];    // 加权因子   
var ValideCode = [ 1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2 ];            // 身份证验证位值.10代表X   
function IdCardValidate(idCard) { 
    idCard = trim(idCard.replace(/ /g, ""));               //去掉字符串头尾空格                     
    if (idCard.length == 15) {   
        return isValidityBrithBy15IdCard(idCard);       //进行15位身份证的验证    
    } else if (idCard.length == 18) {   
        var a_idCard = idCard.split("");                // 得到身份证数组   
        if(isValidityBrithBy18IdCard(idCard)&&isTrueValidateCodeBy18IdCard(a_idCard)){   //进行18位身份证的基本验证和第18位的验证
            return true;   
        }else {   
            return false;   
        }   
    } else {   
        return false;   
    }   
}

/**  
 * 判断身份证号码为18位时最后的验证位是否正确  
 * @param a_idCard 身份证号码数组  
 * @return  
 */  
function isTrueValidateCodeBy18IdCard(a_idCard) {   
    var sum = 0;                             // 声明加权求和变量   
    if (a_idCard[17].toLowerCase() == 'x') {   
        a_idCard[17] = 10;                    // 将最后位为x的验证码替换为10方便后续操作   
    }   
    for ( var i = 0; i < 17; i++) {   
        sum += Wi[i] * a_idCard[i];            // 加权求和   
    }   
    valCodePosition = sum % 11;                // 得到验证码所位置   
    if (a_idCard[17] == ValideCode[valCodePosition]) {   
        return true;   
    } else {   
        return false;   
    }   
}   

/**  
  * 验证18位数身份证号码中的生日是否是有效生日  
  * @param idCard 18位书身份证字符串  
  * @return  
  */  
function isValidityBrithBy18IdCard(idCard18){   
    var year =  idCard18.substring(6,10);   
    var month = idCard18.substring(10,12);   
    var day = idCard18.substring(12,14);   
    var temp_date = new Date(year,parseFloat(month)-1,parseFloat(day));   
    // 这里用getFullYear()获取年份，避免千年虫问题   
    if(temp_date.getFullYear()!=parseFloat(year)   
          ||temp_date.getMonth()!=parseFloat(month)-1   
          ||temp_date.getDate()!=parseFloat(day)){   
            return false;   
    }else{   
        return true;   
    }   
}  

/**  
   * 验证15位数身份证号码中的生日是否是有效生日  
   * @param idCard15 15位书身份证字符串  
   * @return  
   */  
function isValidityBrithBy15IdCard(idCard15){   
	var year =  idCard15.substring(6,8);   
    var month = idCard15.substring(8,10);   
    var day = idCard15.substring(10,12);   
    var temp_date = new Date(year,parseFloat(month)-1,parseFloat(day));   
    // 对于老身份证中的你年龄则不需考虑千年虫问题而使用getYear()方法   
    if(temp_date.getYear()!=parseFloat(year)   
        ||temp_date.getMonth()!=parseFloat(month)-1   
        ||temp_date.getDate()!=parseFloat(day)){   
        return false;   
    }else{   
        return true;   
    }   
}   
//去掉字符串头尾空格   
function trim(str) {   
    return str.replace(/(^\s*)|(\s*$)/g, "");   
}

/**  
 * 通过身份证判断是男是女  
 * @param idCard 15/18位身份证号码   
 * @return 'female'-女、'male'-男  
 */  
function maleOrFemalByIdCard(idCard){   
    idCard = trim(idCard.replace(/ /g, ""));        // 对身份证号码做处理。包括字符间有空格。   
    if(idCard.length==15){   
        if(idCard.substring(14,15)%2==0){   
            return 'female';   
        }else{   
            return 'male';   
        }   
    }else if(idCard.length ==18){   
        if(idCard.substring(14,17)%2==0){   
            return 'female';   
        }else{   
            return 'male';   
        }   
    }else{   
        return null;   
    }   
}
/**
 * 
 * 根据身份证提取证件号
 */
 function getBirthdayFromIdCard(idCard) {
  	var birthday = "";
	if(idCard != null && idCard != ""){
		if(idCard.length == 15){
			birthday = "19"+idCard.substr(6,6);
		} else if(idCard.length == 18){
			birthday = idCard.substr(6,8);
		}
	
		birthday = birthday.replace(/(.{4})(.{2})/,"$1-$2-");
	}
	
	return birthday;
}

