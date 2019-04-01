package com.auvgo.web.face.person;

import com.auvgo.core.string.StringUtils;
import com.auvgo.core.utils.AESUtil;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.Md5Sign;
import com.auvgo.core.utils.RandomValidateCode;
import com.auvgo.crm.api.CrmCompanyService;
import com.auvgo.crm.api.CrmEmpFindpwService;
import com.auvgo.crm.api.CrmEmployeeService;
import com.auvgo.crm.entity.CrmCompany;
import com.auvgo.crm.entity.CrmEmpFindpw;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.crm.pojo.CrmEmployeeModel;
import com.auvgo.web.face.BaseController;
import com.auvgo.web.model.FindType;
import com.auvgo.web.model.PersonFind;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * Created by 小四 on 2018/3/19.
 */
@RequestMapping(value = "/person")
@Controller
public class FindPasswdController extends BaseController {
	private static final Logger logger = LogManager.getLogger(FindPasswdController.class);
	@Autowired
	private CrmCompanyService crmCompanyService;
	@Autowired
	private CrmEmployeeService crmEmployeeService;
	@Autowired
	private CrmEmpFindpwService findpwService;


	@RequestMapping(value = "/forgetPw")
	public String toPage() {
		return "/common/find-passwd";
	}


	/**
	 * 获取随机码
	 *
	 * @return
	 */
	@RequestMapping("/getRandom")
	@ResponseBody
	public AuvgoResult getRandomCode() {
		RandomValidateCode validateCode = new RandomValidateCode();
		String content = validateCode.getCode(4);
		System.out.println(content);
		try {
			String result = AESUtil.AESEncode(content, AESUtil.keyword);
			return AuvgoResult.build(200, "success", result);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "fail");
	}


	@RequestMapping(value = "/getVerify")
	public void getVerify(HttpServletRequest request, HttpServletResponse response) {
		String random = request.getParameter("random_yzm");
		response.setContentType("image/jpeg");//设置相应类型,告诉浏览器输出的内容为图片
		response.setHeader("Pragma", "No-cache");//设置响应头信息，告诉浏览器不要缓存此内容
		response.setHeader("Cache-Control", "no-cache");
		response.setDateHeader("Expire", 0);
		RandomValidateCode validateCode = new RandomValidateCode();
		try {
			validateCode.getRandcode(request, response, random);//输出验证码图片方法
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * 验证码验证
	 *
	 * @param random
	 * @param codeRandom
	 * @return
	 */
	@RequestMapping("/checkRandom")
	@ResponseBody
	public AuvgoResult checkRandom(String random, String codeRandom) {
		if (StringUtils.isBlank(random) || StringUtils.isBlank(codeRandom)) {
			return AuvgoResult.build(300, "请输入验证码");
		}
		try {
			String result = AESUtil.AESDncode(codeRandom, AESUtil.keyword);
			if (!result.equalsIgnoreCase(random)) {
				return AuvgoResult.build(300, "验证码有误");
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(200, "验证码通过");
	}

	@RequestMapping("/getUserMsg")
	@ResponseBody
	public AuvgoResult getUserMsg(HttpServletRequest request) {
		String kahao = request.getParameter("kahao");
		String username = request.getParameter("username");
		String random = request.getParameter("random");
		String codeRandom = request.getParameter("codeRandom");
		if(StringUtils.isBlank(random) || StringUtils.isBlank(codeRandom)){
			return AuvgoResult.build(305,"参数有误,请重试");
		}
		try {
			String result = AESUtil.AESDncode(codeRandom, AESUtil.keyword);
			if (!result.equalsIgnoreCase(random)) {
				return AuvgoResult.build(305, "验证码输入有误");
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		if (StringUtils.isBlank(kahao) || StringUtils.isBlank(username)) {
			return AuvgoResult.build(300, "请输入用户名或者卡号");
		}
		CrmCompany crmCompany = crmCompanyService.findByKaHao(kahao);
		if (null == crmCompany) {
			return AuvgoResult.build(301, "商旅卡号不存在,请核实");
		}
		if(crmCompany.getStatus()==1){
			return AuvgoResult.build(304,"公司状态非法,禁止此类操作");
		}
		CrmEmployeeModel employee = crmEmployeeService.getCasLoginByUsername(crmCompany.getId(), username);
		if (null == employee) {
			return AuvgoResult.build(304, "用户名不存在,请检查");
		}
		if(null == employee.getKaitong() || 0==employee.getKaitong() || null==employee.getStatus() || 1 == employee.getStatus()){
			return  AuvgoResult.build(304,"您的账号无登陆权限，请您联系贵公司的相关负责人。");
		}
		if (!employee.getUsername().equals(username)) {
			return AuvgoResult.build(304, "用户名不存在，请核实");
		}
		//检查是否存在邮箱和手机号
		if (StringUtils.isBlank(employee.getMobile()) && StringUtils.isBlank(employee.getEmail())) {
			return AuvgoResult.build(302, "系统中未检测到您的手机号或邮箱，如需帮助请拨打4006060011");
		}
		List<CrmEmpFindpw> findEmplist = findpwService.findPwByEmpidAndCidCurrentDate(employee.getId(),
				crmCompany.getId(), new Date());
		if (findEmplist.size() > 2) {
			return AuvgoResult.build(303, "您今天找回密码的机会已用尽");
		}
		return AuvgoResult.build(200, "success");//
	}

	@RequestMapping("/toFindPage")
	public String toFindPage(HttpServletRequest request) {
		String kahao = request.getParameter("kahao");
		String username = request.getParameter("username");
		CrmCompany crmCompany = crmCompanyService.findByKaHao(kahao);
		CrmEmployeeModel employee = crmEmployeeService.getCasLoginByUsername(crmCompany.getId(), username);
		Map<String, String> map = Maps.newHashMap();
		PersonFind personFind = new PersonFind();
		personFind.setCompanyid(crmCompany.getId());
		personFind.setEmpid(employee.getId());
		List<FindType> list = Lists.newArrayList();
		if (StringUtils.isNotBlank(employee.getEmail())) {
			String msg = getSecuretMsg(employee.getEmail(), "email");
			FindType findType = new FindType();
			findType.setFindType("2");
			findType.setValue(msg);
			list.add(findType);
		}
		if (StringUtils.isNotBlank(employee.getMobile())) {
			String msg = getSecuretMsg(employee.getMobile(), "mobile");
			FindType findType = new FindType();
			findType.setFindType("1");
			findType.setValue(msg);
			list.add(findType);
		}
		personFind.setList(list);
		setAttr("userMsg", personFind);
		return "/common/reset-passwd";
	}


	/**
	 * 对邮箱或者手机号进行处理
	 *
	 * @param msg
	 * @param type
	 * @return
	 */
	public String getSecuretMsg(String msg, String type) {
		StringBuilder sb = new StringBuilder();
		if (type.equals("email")) {
			int index = msg.indexOf("@");
			String email_tail = msg.substring(index, msg.length());
			String email_head = msg.substring(0, index);
			if (email_head.length() > 3) {
				sb.append(email_head.substring(0, 3) + "***" + email_tail);
			} else {
				sb.append(email_head.substring(0, 1) + "***" + email_tail);
			}
			return sb.toString();
		} else if (type.equals("mobile")) {
			if (msg.length() != 11) {// 非法号码
				return "";
			}
			if (msg.length() == 11) {
				return sb.append(msg.substring(0, 3) + "***" + msg.substring(7, 11)).toString();
			} else {
				return "";
			}
		}
		return "";
	}

	@RequestMapping(value = "/sendIdentify")
	@ResponseBody
	public AuvgoResult sendIdentify(@RequestParam("choose") String choose, @RequestParam("empid") String empid, @RequestParam("companyid") String companyid) {
		if (StringUtils.isBlank(choose) || StringUtils.isBlank(empid) || StringUtils.isBlank(companyid)) {
			return AuvgoResult.build(300, "信息有误");
		}
		findpwService.sendValidateMsg(Long.parseLong(empid), Long.parseLong(companyid), choose);
		return AuvgoResult.build(200, "验证码正在发送,请查收");
	}

	@RequestMapping(value = "/confirmChangePw", method = RequestMethod.POST)
	@ResponseBody
	public AuvgoResult confirmChangePw(HttpServletRequest request) {
		String code = request.getParameter("code");
		String cid = request.getParameter("cid");
		String empid = request.getParameter("loginId");
		String password = request.getParameter("password");
		if (StringUtils.isBlank(code) || StringUtils.isBlank(cid) || StringUtils.isBlank(empid) || StringUtils.isBlank(password)) {
			return AuvgoResult.build(300, "参数有误,请重试");
		}


		// 验证验证码是否正确,是否过了时效,半小时
		CrmEmpFindpw empFindpw = findpwService.getFindPwByEmpid(Long.parseLong(empid), new Date());
		if (null == empFindpw) {
			return AuvgoResult.build(300, "验证码输入错误");
		}
		if (!empFindpw.getMsgContent().equals(code)) {
			return AuvgoResult.build(301, "验证码输入错误");
		}
		Date findData = empFindpw.getFindData();
		long chazhi = new Date().getTime() - findData.getTime();
		long sign = chazhi / 1000 / 60;// 判断日期是否超过30分钟
		if (sign > 30) {
			return AuvgoResult.build(300, "验证码已超时，请重新获取");
		}
		CrmEmployee employee = crmEmployeeService.getById(empFindpw.getCompanyid(), Long.parseLong(empid));
		CrmCompany company = crmCompanyService.getById(empFindpw.getCompanyid());
		//密码加密
		employee.setPassword(Md5Sign
				.MD5Encode(employee.getUsername() + company.getBianhao().toUpperCase() + password));//员工密码加密
		// 验证通过,更新密码
		try {
			crmEmployeeService.saveOrUpdate(employee);
			empFindpw.setStatus(1);
			findpwService.saveOrUpdate(empFindpw);
			findpwService.sendSuccessUpdatePw(empFindpw.getCountFind(), employee);
			return AuvgoResult.build(200, "密码已发送，请注意查收您的手机或邮箱信息~");
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "系统偶尔也会累，请重新提交或拨打客服电话");
	}

}
