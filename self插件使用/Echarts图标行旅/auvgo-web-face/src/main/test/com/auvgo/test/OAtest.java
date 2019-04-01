package com.auvgo.test;

import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.Map;

import com.auvgo.core.utils.JsonUtils;
import com.auvgo.core.utils.Md5Sign;
import com.auvgo.web.model.caslog.ApproveShenpiRen;
import com.auvgo.web.model.caslog.CasRoute;
import com.auvgo.web.model.caslog.CustomInfo;
import com.auvgo.web.model.caslog.TravelPassenger;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

public class OAtest {

	public static void main(String[] args) throws UnsupportedEncodingException {
//		String appkey = "gr54gwrg52sd4f6";
//		String username = "realxxs_a"; // 登录人姓名
//		String securet = "531b26522ff663a650b15bb75288152e";
		
		String appkey = "kjkhio89645hkjbsad";
		String username = "liucong"; // 登录人姓名
		String securet = "1291d12c887aa6be56d9960f12451a1f";
		
		String sign = Md5Sign.createSign(appkey + username.toUpperCase() + securet, securet);
		String url = "192.168.1.108:8085";
		//String url = "192.168.1.212:8085";
		System.out.println(sign);
		Map<String, Object> map = Maps.newHashMap();
		map.put("product", "hotel"); // // 产品类型train-火车, air-机票, hotel-酒店,center-个人中心,approve-审批列表,index-首页
		map.put("traverorderno", "RES568840"); // 出差单号
		map.put("costname", "常亮成本中心");// 成本中心
		map.put("proname", "常亮项目中心");// 项目中心
		// map.put("route", getCasroute()); // 行程
		//map.put("shenpi", getAppro()); // 审批人
		map.put("custinfo", getCustomInfo());// 登录公司信息
		//map.put("passengers", getPass()); // 出行人
		map.put("approveRuleName", "芳级审批"); // 审批级别名称
		String data = JsonUtils.objectToJson(map);
		System.out.println("数据：" + data);
		data = java.net.URLEncoder.encode(data, "UTF-8");
		System.out.println(url + "/oa/caslogin/" + appkey + "/" + username + "/" + sign + "?p=" + data);
	}

	// 行程
	private static CasRoute getCasroute() {
		CasRoute casroute = new CasRoute(); // 行程信息实体
		casroute.setFrom("平凉");//出发城市名
		casroute.setFromcode("pingliang"); //出发城市编码
		casroute.setArrivecode("pingliangnan");//到达城市编码
		casroute.setArrive("平凉南");//到达城市

		//		casroute.setFrom("南京");
		//		casroute.setFromcode("NKG");
		//		casroute.setArrivecode("SHE");
		//		casroute.setArrive("沈阳");
		//		
		//		casroute.setFrom("艺龙测试");
		//		casroute.setFromcode("5389");
		//		casroute.setArrivecode("pingliangnan");
		//		casroute.setArrive("平凉南");

		casroute.setIsCanModify("1");//是否可以修改,0 不可以修改,1 可以修改
		casroute.setStartdate("2018-06-10");//出发日期
		casroute.setArrivedate("2018-06-13");//到达日期
		return casroute;
	}

	// 审批人
	private static List<ApproveShenpiRen> getAppro() {
		ApproveShenpiRen shenpi = new ApproveShenpiRen();// 审批人
		shenpi.setUsername("dafang"); //审批人登录名
		shenpi.setEmail("dafang@auvgo.com");//邮箱
		shenpi.setLevel("1");//审批等级
		shenpi.setMobile("15520225698");//手机
		shenpi.setName("大方");//审批人姓名
		shenpi.setIsDefaultApprove("1");//1是,2否 如果超出标准追加一级审批

		ApproveShenpiRen shenpi2 = new ApproveShenpiRen();// 审批人
		shenpi2.setUsername("xiaofang");
		shenpi2.setEmail("xiaofang@auvgo.com");
		shenpi2.setLevel("2");
		shenpi2.setMobile("15520225698");
		shenpi2.setName("小方");
		shenpi2.setIsDefaultApprove("1");

		ApproveShenpiRen shenpi3 = new ApproveShenpiRen();// 审批人
		shenpi3.setUsername("zhongfang");
		shenpi3.setEmail("zhongfang@auvgo.com");
		shenpi3.setLevel("3");
		shenpi3.setMobile("15010225682");
		shenpi3.setName("中方");
		shenpi3.setIsDefaultApprove("0");
		List<ApproveShenpiRen> list = Lists.newArrayList();
		list.add(shenpi);
		list.add(shenpi2);
		list.add(shenpi3);

		return list;
	}

	// 登录公司信息
	public static CustomInfo getCustomInfo() {
		CustomInfo info = new CustomInfo();
//		info.setBackUrl("http://www.baiduf.com.cn/data/update");//需要推送的url
//		info.setIsNeedPush("1");//是否需要推送数据;"0"需要,"1" 不需要
//		info.setOutOrderno("88745200");//第三方公司的单号
//		info.setEmCode("realxxs_a");// 员工登录用户名
//		info.setCusCode("AUVGO");//公司卡号
//		info.setBookMobile("18555609382");//预订人手机号
//		info.setBookUserName("小四");//预订人姓名
		
		info.setBackUrl("http://www.baiduf.com.cn/data/update");//需要推送的url
		info.setIsNeedPush("1");//是否需要推送数据;"0"需要,"1" 不需要
		info.setOutOrderno("88745200");//第三方公司的单号
		info.setEmCode("liucong");// 员工登录用户名
		info.setCusCode("HYCS");//公司卡号
		info.setBookMobile("18555609382");//预订人手机号
		info.setBookUserName("刘聪从");//预订人姓名
		
		return info;
	}

	// 出行人
	public static List<TravelPassenger> getPass() {
		List<TravelPassenger> passlist = Lists.newArrayList();
		TravelPassenger pa1 = new TravelPassenger();
		pa1.setAccno("17701332522");//员工编号(必填)
		pa1.setCertType("B");//证件类型 1为身份证 B为护照
		pa1.setCertno("ER349087"); // 证件号
		pa1.setName("王迪");//员工姓名
		pa1.setDepartName("行政部");//员工部门名称
		pa1.setMobile("15966325874");//出行人的手机号
		pa1.setLevel("1");//员工职级,如果有差旅政策审批,请转换到在我司设置的对应的员工等级,如果没有差旅政策,传-1
		passlist.add(pa1);

		TravelPassenger pa2 = new TravelPassenger();
		pa2.setAccno("18830881737");
		pa2.setCertType("B");
		pa2.setCertno("ER851587");
		pa2.setName("徐天天");
		pa2.setDepartName("行政部");
		pa2.setLevel("1");
		pa2.setMobile("15066325874");
		passlist.add(pa2);

		return passlist;
	}
}
