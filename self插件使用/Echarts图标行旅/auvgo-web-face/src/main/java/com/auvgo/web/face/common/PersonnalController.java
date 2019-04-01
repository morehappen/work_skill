package com.auvgo.web.face.common;

import com.auvgo.core.contant.AuvStatusContant;
import com.auvgo.core.query.QueryFilter;
import com.auvgo.core.string.RegExpValidator;
import com.auvgo.core.utils.*;
import com.auvgo.crm.api.*;
import com.auvgo.crm.entity.*;
import com.auvgo.web.face.BaseController;
import com.github.pagehelper.PageInfo;
import com.google.common.collect.Maps;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/personal")
public class PersonnalController extends BaseController {
	@Autowired
	private CrmEmployeeCertService crmEmployeeCertService;
	@Autowired
	private CrmEmployeeLinshiService crmEmployeeLinshiService;
	@Autowired
	private CrmEmployeeService crmEmployeeService;
	@Autowired
	private CrmCompanyService crmCompanyService;
	@Autowired
	private CrmEmpTraincountService crmEmpTraincountService;
	@Autowired
	private  CrmProjectService crmProjectService;
	@Autowired
	private  CrmCostCenterService crmCostCenterService;
	@Autowired
	private  CrmApproveService crmApproveService;
	private static Map<Integer, String> tips = Maps.newHashMap();
	static {
		tips.put(0, "参数错误!");
		tips.put(11, "请输入18位与证件信息一致的证件号码!");
		tips.put(12, "请输入5-15位与证件信息一致的证件号码!");
		tips.put(13, "暂不支持添加儿童/婴儿信息!");
		tips.put(14, "请输入正确的联系方式!");
		tips.put(21, "您添加的员工已存在，请不要重复提交!");
		tips.put(22, "您添加的员工已存在，请不要重复提交!");
		tips.put(23, "您添加的员工已存在联系人列表中，请不要重复提交!");
		tips.put(24, "员工工号已占用，请更换!");
		tips.put(31, "您添加的联系人已存在，请不要重复提交!");
		tips.put(32, "您添加的联系人已存在，请不要重复提交!");
		tips.put(33, "您添加的联系人已存在员工列表中，请不要重复提交!");
		tips.put(41, "常用联系人数量已达上限30人!");
	}
	// 证件修改
	@RequestMapping("/toCredentials")
	public String toCredentials() {
		try {
			CrmEmployee user = getUser();
			List<CrmEmployeeCert> certs = crmEmployeeCertService.findByCidAndEmpid(user.getCompanyid(), user.getId());
			setAttr("certs",certs);
			setAttr("curruser", user);
			/*String birthday = user.getBirthday();
			log.info("/personal/toCredentials birthday = {}", birthday);
			if (StringUtils.isNotBlank(birthday) && !birthday.contains("-")) {
				StringBuffer sb = new StringBuffer();
				sb.append(birthday.substring(0,4)).append("-").append(birthday.substring(4,6)).append("-").append(birthday.substring(6));
				setAttr("birthday", sb.toString());
			}*/
			return "/crm/personal-center/credentials-infor";
		} catch (Exception e) {
			e.printStackTrace();
			log.warn("/personal/toCredentials error --> ");
			return "/common/error";
		}
	}
	
	@RequestMapping("/toEditCredentials/{certid}")
	public String toEditCredentials(@PathVariable("certid")Long certid) {
		if (certid == null) {
			setAttr("Msg", "参数错误!");
			return "404";
		}
		CrmEmployeeCert cert =null;
		if (certid == 0l) {
			cert = new CrmEmployeeCert();
			cert.setCerttype(AuvStatusContant.TRAIN_IDS_TYPE_ERDAI);
		}else {
			cert = crmEmployeeCertService.getById(certid);
		}
		setAttr("cert", cert);
		CrmEmployee user = getUser();
		String birthday = user.getBirthday();
		if (null != birthday && !"".equals(birthday.trim()) && !birthday.contains("-")) {
			StringBuffer sb = new StringBuffer();
			sb.append(birthday.substring(0,4)).append("-").append(birthday.substring(4,6)).append("-").append(birthday.substring(6));
			setAttr("birthday", sb.toString());
		}
		setAttr("curruser", user);
		// 获取证件类型信息
		// sort idsTypeMap to 身份证、护照、港澳通行证、台胞证、其他
		setAttr("idsTypeMap", AuvStatusContant.idsTypeMap);
		return "/crm/personal-center/edit-credentials";
	}
	
	@RequestMapping("/deleteCert")
	@ResponseBody
	public AuvgoResult deleteCert(HttpServletRequest request){
		String certid = request.getParameter("certid");
		if (StringUtils.isBlank(certid)) {
			return AuvgoResult.build(300, "参数错误,请核查后重试!");
		}
		try {
			CrmEmployee user = getUser();
			// 判断是否删除的是最后一个证件号,如果是的话,不允许删除
			List<CrmEmployeeCert> certs = crmEmployeeCertService.findByCidAndEmpid(user.getCompanyid(), user.getId());
			if (certs.size() <= 1) {
				return AuvgoResult.build(300, "您必须至少维护一个证件信息!");
			}
			// 获取将要删除的证件信息
			CrmEmployeeCert cert = crmEmployeeCertService.getById(Long.valueOf(certid));
			// 将此证件在证件表中删除
			Integer num = crmEmployeeCertService.deleteById(Long.valueOf(certid));
			if (num == 0) {
				return AuvgoResult.build(300, "删除失败!");
			}
			// 获取当前用户的信息
			CrmEmployee emp = crmEmployeeService.getById(user.getCompanyid(), user.getId());
			// 判断当前默认使用的证件号是不是该删除的证件号,如果是
			if (cert.getCerttype().equals(emp.getCerttype()) && cert.getCertificate().equals(emp.getCertno())) {
				List<CrmEmployeeCert> certList = crmEmployeeCertService.findByCidAndEmpid(user.getCompanyid(), user.getId());
				if (certList.size() > 0) {
					CrmEmployeeCert certno = certList.get(0);
					// 说明还有其他证件
					emp.setCerttype(certno.getCerttype());
					emp.setCertno(certno.getCertificate());
					/**
					 * 将员工姓名同时保存
					 * @author vincent
					 * @version 20171213
					 */
					emp.setName(certno.getUsername());
					certno.setIsdefault(1);	// 设置为默认使用的证件号
					// 如果删除的证件是身份证的话
					if ("1".equals(cert.getCerttype())) {
						emp.setGuoji(null == certList.get(0).getGuoji()?"":certList.get(0).getGuoji());
					}
					crmEmployeeCertService.saveOrUpdate(certno);
				} else {
					emp.setCerttype(" ");
					emp.setCertno(" ");
					//emp.setBirthday(" ");
				}
				// 保存员工信息
				crmEmployeeService.updateOnly(emp);
			} else {
				// 如果否
				// 不做任何操作
			}
		} catch (Exception e) {
			e.printStackTrace();
			return AuvgoResult.build(300, "删除异常!");
		}
		return AuvgoResult.build(200, "删除成功!");
	}
	// TODO saveOrUpdateCert
	@RequestMapping("/saveOrUpdateCert")
	@ResponseBody
	public AuvgoResult saveCert(CrmEmployeeCert cert){
		String url = "/personal/saveOrUpdateCert";
		log.info(url + " params --> {}", cert);
		String checkParams = checkParams(cert, url, cert.getId() == null ? 1 : 2);
		if (StringUtils.isNotBlank(checkParams)) {
			return AuvgoResult.build(300, checkParams);
		}
		// 校验完成，保证数据的完整性
		CrmEmployee user = getUser();
		int status = 0;
		String typeStr = null;
		if (null == cert.getId()) {
			// 保存
			status = envelopeData(cert, user, 1);
			typeStr = "保存";
		} else {
			// 修改
			status = envelopeData(cert, user, 2);
			typeStr = "修改";
		}
		if (status == 0) {
			log.info(url + " envelopeData has problem that cert is null");
			return AuvgoResult.build(300, typeStr + "异常！");
		}
		crmEmployeeCertService.saveOrUpdate(cert);
		CrmEmployee emp = crmEmployeeService.getById(cert.getCompanyid(), cert.getEmpid());
		if (cert.getCerttype().equals(emp.getCerttype())) {
			emp.setCertno(cert.getCertificate());
			emp.setName(cert.getUsername());
			emp.setBirthday(cert.getBirthday());
			try {
				crmEmployeeService.saveOrUpdate(emp);
			} catch (Exception e) {
				e.printStackTrace();
				log.error("修改员工时失败! --> {}", e);
			}
		}
		return AuvgoResult.build(200, typeStr + "成功！", cert);
	}
	
	/**
	 * 
	 * @param cert
	 * @param user
	 * @param type 1：保存，2：修改
	 */
	private int envelopeData(CrmEmployeeCert cert, CrmEmployee user, int type) {
		if (cert == null) {
			return 0;
		}
		cert.setCompanyid(user.getCompanyid());
		cert.setEmpid(user.getId());
		List<CrmEmployeeCert> certs = crmEmployeeCertService.findByCidAndEmpid(cert.getCompanyid(), cert.getEmpid());
		if (type == 1) {
			if (null == certs || certs.isEmpty()) {
				cert.setIsdefault(1);
			}
			cert.setCreatetime(new Date());
		}else{
			if(null != certs && !certs.isEmpty() && cert.getIsdefault() == 1){
				for(CrmEmployeeCert empcert : certs){
					if(empcert.getIsdefault() == 1){
						empcert.setIsdefault(0);
						crmEmployeeCertService.saveOrUpdate(empcert);
					}
				}
			}
		}
		return 1;
	}

	/**
	 * 
	 * @param cert
	 * @param url
	 * @param opType	操作类型 1：新增，2：修改
	 * @return
	 */
	private String checkParams(CrmEmployeeCert cert, String url, int opType) {
		if (cert == null) {
			log.info(url + " object cert is null!");
			return "证件信息错误!";
		}
		CrmEmployee user = getUser();
		/*if (null == cert.getCompanyid() || null == cert.getEmpid()) {
			log.info(url + " param companyid or empid is null --> companyid:{}, empid:{}", cert.getCompanyid(), cert.getEmpid());
			return "请求参数异常！";
		}*/
		if (StringUtils.isBlank(cert.getUsername())) {
			log.info(url + " param username is null --> username:{}", cert.getUsername());
			return "姓名不能为空！";
		}
		if (StringUtils.isBlank(cert.getCerttype()) || StringUtils.isBlank(cert.getCertificate())) {
			log.info(url + " param certtype or certno is null --> certtype:{}, certno:{}", cert.getCerttype(), cert.getCertificate());
			return "证件信息错误!";
		} else {
			if ("1".equals(cert.getCerttype())) {
				if (!IdCardUtils.validateCard(cert.getCertificate())) {
					return "请填写正确的证件号";
				}
			} else if (cert.getCertificate().length() < 5 || cert.getCertificate().length() > 15) {
				return "请输入5-15位与证件信息一致的证件号码";
			}
		}
		if (!"1".equals(cert.getCerttype()) && StringUtils.isBlank(cert.getGuoji())) {
			log.info(url + " param guoji is null --> guoji:{}", cert.getGuoji());
			return "请填写国籍！";
		}
		if (!"1".equals(cert.getCerttype()) && StringUtils.isBlank(cert.getPassportdate())) {
			log.info(url + " param passportdate is null --> passportdate:{}", cert.getPassportdate());
			return "请填写证件有效期！";
		}
		if (!"1".equals(cert.getCerttype()) && StringUtils.isBlank(cert.getBirthday())) {
			log.info(url + " param birthday is null --> birthday:{}", cert.getBirthday());
			return "请填写出生日期！";
		}
		// 验证证件类型重复
		CrmEmployeeCert oldCert = crmEmployeeCertService.getCertByEmpidAndCertType(cert.getCerttype(), user.getId());
		log.info(url + " oldCert = {}" ,oldCert);
		if (oldCert != null && opType == 1) {
			log.info(url + " This cert type has exist! --> certtype:{}", cert.getCerttype());
			return "证件号已存在，请重新输入";
		}
		List<CrmEmployeeCert> certs = crmEmployeeCertService.exitCertno(cert.getCertificate(), user.getCompanyid());
		if (opType == 1) {
			if (certs.size() > 0) {
				log.info(url + " The certno has exist! --> certno:{}", cert.getCertificate());
				return "证件号已存在，请重新输入";
			}
		} else if (opType ==2) {
			for (CrmEmployeeCert crmEmployeeCert : certs) {
				if (crmEmployeeCert.getEmpid().equals(user.getId()) && crmEmployeeCert.getCerttype().equals(cert.getCerttype())) {
					continue;
				}
				log.info(url + " The certno has exist! --> certno:{}", cert.getCertificate());
				return "证件号已存在，请重新输入";
			}
		}
		return null;
	}

	// TODO
	@RequestMapping("/setDefaultCert")
	@ResponseBody
	public AuvgoResult setDefaultCert(@RequestParam("certid")Long certId){
		if (null == certId) {
			log.info("/personal/setDefaultCert certId is null! --> certId:{}", certId);
			return AuvgoResult.build(300, "设置失败！");
		}
		CrmEmployeeCert cert = crmEmployeeCertService.getById(certId);
		if (null == cert) {
			log.info("/personal/setDefaultCert this type cert is null! --> cert:{}", certId);
			return AuvgoResult.build(300, "设置失败！");
		}
		CrmEmployee user = getUser();
		crmEmployeeCertService.setDefaultCert(user.getCompanyid(), user.getId(), cert.getCerttype(), cert.getCertificate());
		/********同步员工表*********/
		user.setName(cert.getUsername());
		user.setCerttype(cert.getCerttype());
		user.setCertno(cert.getCertificate());
		try {
			crmEmployeeService.saveOrUpdate(user);
		} catch (Exception e) {
			log.info("/personal/setDefaultCert There is a problem in a function in update CrmEmployee --> {}", e);
			return AuvgoResult.build(300, "设置失败！");
		}
		return AuvgoResult.build(200, "设置成功!");
	}
	
	// 常用联系人修改
	// 转到常用联系人界面
	@RequestMapping("/toCommonPersons")
	public String toCommonPersons(@RequestParam(defaultValue = "1") Integer pageNum, Integer pageSize, HttpServletRequest request) {
		/*
		 * 前台传来request中包含的参数
		 * queryparam:查询条件 按姓名或电话查询
		 */
		pageSize = pageSize == null ? PAGE_SIZE : pageSize;
		QueryFilter fileter = new QueryFilter();
		CrmEmployee user = getUser();
		String param = request.getParameter("where");
		setAttr("where", param);
		Map<String, Object> paramMap = Maps.newHashMap();
		paramMap.put("companyid", user.getCompanyid());
		paramMap.put("empid", user.getId());
		paramMap.put("where", param);
		PageInfo<CrmEmployee> page = crmEmployeeService.findPageBy(pageNum, pageSize, fileter.buildSql(request), paramMap);
//		PageInfo<CrmEmployeeLinshi> page = crmEmployeeLinshiService.findPageBy(pageNum, pageSize, fileter.buildSql(request), paramMap);
		if (pageNum > 1 && page.getList().size() == 0) {
			pageNum--;
			page = crmEmployeeService.findPageBy(pageNum, pageSize, fileter.buildSql(request), paramMap);
		}
		setAttr("pageSize", pageSize);
		setAttr("page", page);
		setAttr("users", user);
		// 专项添加/修改常用联系人页面
		return "/crm/personal-center/common-persons";
	}
	@RequestMapping("/toCommonPersonsAdd/{linshiId}")
	public String toCommonPersonsAdd(@PathVariable("linshiId")Long linshiId) {
		if (linshiId== null) {
			setAttr("Msg", "参数错误!");
			return "404";
		}
		if (linshiId != 0l) {	// 修改
			CrmEmployeeLinshi ls = crmEmployeeLinshiService.getById(linshiId);
			setAttr("linshi", ls);
		} 
		return "/crm/personal-center/common-persons-add";
	}
	// 删除常用联系人
	@RequestMapping("/deleteLinshi")
	@ResponseBody
	public AuvgoResult delete(HttpServletRequest request) {
		String linshiId = request.getParameter("linshiId");
		if (StringUtils.isBlank(linshiId)) {
			return AuvgoResult.build(300, "删除异常!");
		}
		CrmEmployee user = getUser();
//		Integer deleteById = crmEmployeeLinshiService.deleteById(Long.valueOf(linshiId));
		Integer deleteById = crmEmployeeService.deleteBycontantEmpId(user.getCompanyid(),user.getId(),Long.valueOf(linshiId));
		if (deleteById > 0) {
			return AuvgoResult.build(200, "删除成功!");
		}
		return AuvgoResult.build(300, "删除异常!");
	}
	
	// 添加/修改常用联系人
	@RequestMapping("/saveOrUpdateLinshi")
	@ResponseBody
	public AuvgoResult saveOrUpdateLinshi(CrmEmployeeLinshi linshi){
		if (null == linshi) {
			log.info("/personal/saveOrUpdateLinshi param wrong --> " + linshi);
			return AuvgoResult.build(300, "参数错误!");
		}
		String mobile = linshi.getMobile();
		if (StringUtils.isNotBlank(mobile)) {
			if (!RegExpValidator.isMobile(mobile)) {
				return AuvgoResult.build(300, "手机号码输入错误");
			}
			
		}
		buildEmployeeLinshi(linshi);
		try {
			// 如果是保存
			if (null == linshi.getId()) {
				int valide = valideParamLegitimate(null, linshi, getUser(), 1);
				if (valide != 1) {
					return AuvgoResult.build(300, tips.get(valide));
				}
				// save方法
				Long id = crmEmployeeLinshiService.save(linshi);
				linshi.setId(id);
				return AuvgoResult.build(200, "保存成功!", JsonUtils.objectToJson(linshi));
			} else {
				// 如果是修改
				int valide = valideParamLegitimate(null, linshi, getUser(), 2);
				if (valide != 1) {
					return AuvgoResult.build(300, tips.get(valide));
				}
				// update方法
				Integer num = crmEmployeeLinshiService.saveOrUpdate(linshi);
				if (num > 0) {
					return AuvgoResult.build(200, "更新成功!");
				}
				return AuvgoResult.build(300, "更新异常!");
			}
		} catch (Exception e) {
			log.error("/personal/saveOrUpdateLinshi There is a problem in validting params !!!" + e);
			return AuvgoResult.build(300, "参数错误!");
		}
	}
	
	private boolean checkBirthdayIsNotChild(String certno) {
		if (certno == null) {
			return false;
		}
		String src = IdCardUtils.getBirthByIdCard(certno);
		Calendar calendar = Calendar.getInstance();
		calendar.add(Calendar.YEAR, -12);
		Date date = calendar.getTime();
		String target = DateUtil.getDateStrByParam("yyyyMMdd", date);
		if (src.compareTo(target) > 0) {
			return false;
		}
		return true;
	}
	
	@RequestMapping("/toInformation")
	public String toInformation(HttpServletRequest request) {
		CrmEmployee user = getUser();
//		CrmEmployeeCert cert = crmEmployeeCertService.getById(user.getId());
//		setAttr("cert", cert);
		if(user.getBookrange() ==null){
			user.setBookrange(3);
		}
		setAttr("emp", user);
		//判断是否是系统管理员
		if(user.getName().equals("系统管理员")){
			String header = request.getHeader("Referer");
			String[] urlArry = header.split("\\/");
			String url="/";
			for (int i = 0; i < urlArry.length; i++) {
				if(i>=3){
					url+=urlArry[i]+"/";
				}
			}
			return "redirect:"+url;
		}
		//成本中心
		List<CrmCostCenter> cercost= null;
		    cercost = crmCostCenterService.getCostEmployeeOrDept(user.getCompanyid(),user.getId(),user.getDeptid());
		if(null !=cercost &&cercost.size()>0){
			setAttr("certcost",cercost.get(0));
		}
		//项目中心
		List<CrmProject> crmpro = null;
		crmpro = crmProjectService.getprojectEmployeeOrDept(user.getCompanyid(),user.getId(),user.getDeptid());
		if (null != crmpro && crmpro.size() > 0) {
			setAttr("crmpro",crmpro.get(0));
		}
		//获取审批规则
		try {
			CrmApprove crmapp = crmApproveService.getApproveByEmployeeId(user.getCompanyid(),user.getId(),user.getDeptid());
			setAttr("approve",crmapp);
		} catch (Exception e) {
		}
		return "/crm/personal-center/information";
	}
	@RequestMapping("/toEdit")
	@ResponseBody
	public AuvgoResult toEdit(CrmEmployee crmEmployee){
		try {
			if(StringUtils.isBlank(crmEmployee.getMobile()) || StringUtils.isBlank(crmEmployee.getName()) ){
				return AuvgoResult.build(300, "请检查用户名和手机号是否填写");
			}
			if(StringUtils.isNotBlank(crmEmployee.getEmail()) && !checkEmail(crmEmployee.getEmail())){
				return AuvgoResult.build(300, "请输入正确的邮箱格式");
			}
			String mobile = crmEmployee.getMobile();
			if (StringUtils.isNotBlank(mobile)) {
				if (!RegExpValidator.isMobile(mobile)) {
					return AuvgoResult.build(300, "请输入正确的联系手机");
				}
			}
			CrmEmployee user = getUser();
//			CrmEmployee employee = employeeService.getById(user.getCompanyid(), user.getId());
			user.setMobile(crmEmployee.getMobile());
			user.setEmail(crmEmployee.getEmail());
			user.setName(crmEmployee.getName());
			user.setFullname(crmEmployee.getFullname());
			crmEmployeeService.saveOrUpdate(user);
			return AuvgoResult.build(200, "保存成功！");
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "修改失败!!!");
	}
	//检验邮箱的格式是否正确
	public boolean checkEmail(String email){
		 String format = "^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*\\.[a-zA-Z0-9]{2,6}$" ;
		 if(email.matches(format))
			 return true;
		 else 
			 return false;
	}
	@RequestMapping("/toEditPwd")
	public String toEditPwd() {
		return "/crm/personal-center/edit-pwd";
	}
	//修改用户密码
    @RequestMapping("/EditBypwd")
    @ResponseBody
	public AuvgoResult EditBypwd(String oldpassword,String newpassword){
    	try {
    		if(StringUtils.isBlank(oldpassword) || StringUtils.isBlank(newpassword)){
    			return AuvgoResult.build(300, "密码不能为空，请输入密码!!!");
    		}
			CrmEmployee user = getUser();
			CrmEmployee employee = crmEmployeeService.getById(user.getCompanyid(), user.getId());
			CrmCompany company = crmCompanyService.getById(user.getCompanyid());
			String password = Md5Sign.MD5Encode(user.getUsername() + company.getBianhao().toUpperCase() + oldpassword).toUpperCase();
			if(!employee.getPassword().equalsIgnoreCase(password)){
				return AuvgoResult.build(300, "您输入的密码有误,请重新输入!!");
			}else{
				employee.setPassword( Md5Sign.MD5Encode(user.getUsername() + company.getBianhao().toUpperCase() + newpassword).toUpperCase());
				crmEmployeeService.saveOrUpdate(employee);
				return AuvgoResult.build(200, "密码修改成功！");
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
    	return AuvgoResult.build(300, "修改密码失败!!");
	}

    /**
	 * 获取12306账号
	 *
	 * @return
	 */
	@RequestMapping("/toBind")
	public String getAccount(){
		CrmEmployee user = getUser();
		CrmEmpTraincount account = crmEmpTraincountService.getByCidAndEmpid(user.getCompanyid(), user.getId());
		setAttr("trainAccount",account);
		setAttr("accountuser",user);
		return "/crm/personal-center/bind-12306";
	}
	
	/**
	 * 获取12306账号
	 *
	 * @return
	 */
	@RequestMapping("/toBindAdd")
	public String accountEdit(){
		CrmEmployee user = getUser();
		CrmEmpTraincount account = crmEmpTraincountService.getByCidAndEmpid(user.getCompanyid(), user.getId());
		setAttr("trainAccount",account);
		setAttr("accountuser",user);
		return "/crm/personal-center/bind-12306-add";
	}
	
	
	private void buildEmployeeLinshi(CrmEmployeeLinshi linshi) {
		CrmEmployee user = getUser();
		linshi.setCompanyid(user.getCompanyid());
		linshi.setEmpid(user.getId());
		linshi.setStatus(1L); // 默认使用状态为正常
		linshi.setCreatetime(new Date());
		// 排序字段暂未赋值
	}
	/**
	 * 验证添加/修改 员工/常用联系人时对证件号的验证
	 * @param employee	员工信息
	 * @param linshi	临时乘客信息
	 * @param fun	添加/修改
	 * 1: 添加
	 * 2: 修改
	 * @return
	 * 0: 验证异常
	 * 1: 验证通过
	 * 11: 身份证号不合法
	 * 12: 其他证件不合法
	 * 13: 根据身份证号判断在12周岁以下
	 * 21: 员工添加时已存在
	 * 22: 员工修改时已存在
	 * 23: 员工已存在于常用联系人列表中
	 * 31: 常用联系人添加时已存在
	 * 32: 常用联系人修改时已存在
	 * 33: 常用联系人已是公司员工
	 * 41: 常用联系人数量已达30人
	 */
	private int valideParamLegitimate(CrmEmployee employee, CrmEmployeeLinshi linshi, CrmEmployee user, int fun) throws Exception{
		String certtype = null;
		String certno = null;
		if (employee != null) {
			certtype = employee.getCerttype();
			certno = employee.getCertno();
			if (StringUtils.isBlank(certtype) || StringUtils.isBlank(certno)) {
				return 0;
			}
			// 验证证件号
			if ("1".equals(certtype)) {
				if (!IdCardUtils.validateCard(certno)) {
					return 11;
				}
				// 验证是否是儿童和婴儿
				if (!checkBirthdayIsNotChild(certno)) {
					return 13;
				}
			} else {
				if (certno.length() < 5 || certno.length() > 15) {
					return 12;
				}
			}
			// 验证是否在员工表中存在
			List<CrmEmployeeCert> certs = crmEmployeeCertService.exitCertno(certno, employee.getCompanyid());
			// 如果是新增
			if (fun == 1) {
				if (certs.size() > 0) {
					return 21;
				}
			} else {
				for (CrmEmployeeCert cert : certs) {
					if (cert.getEmpid().equals(employee.getId())) {
						continue;
					}
					return 22;
				}
			}
			// 验证是否在常用联系人列表中存在
			linshi = new CrmEmployeeLinshi();
			linshi.setCompanyid(employee.getCompanyid());
			linshi.setCerttype(certtype);
			linshi.setCertno(certno);
			List<CrmEmployeeLinshi> linshis = crmEmployeeLinshiService.findByLinshi(linshi);
			if (linshis.size() > 0) {
				return 23;
			}
		} else if (linshi != null) {
			certtype = linshi.getCerttype();
			certno = linshi.getCertno();
			if (StringUtils.isBlank(certtype) || StringUtils.isBlank(certno)) {
				return 0;
			}
			if ("1".equals(certtype)) {
				if (!IdCardUtils.validateCard(certno)) {
					return 11;
				}
				// 验证是否是儿童和婴儿
				if (!checkBirthdayIsNotChild(certno)) {
					return 13;
				}
			} else {
				if (certno.length() < 5 || certno.length() > 15) {
					return 12;
				}
			}
			// 验证常用联系人时否存在
			List<CrmEmployeeLinshi> linshis = crmEmployeeLinshiService.findByLinshi(linshi);
			if (fun == 1) {
				if (linshis.size() > 0) {
					return 31;
				}
				if (crmEmployeeLinshiService.getLinshi(user.getCompanyid(), user.getId()).size() >= 30) {
					return 41;
				}
			} else {
				for (CrmEmployeeLinshi ls : linshis) {
					if (ls.getId().equals(linshi.getId())) {
						continue;
					}
					return 32;
				}
			}
			// 验证联系人是否存在员工列表中
			List<CrmEmployeeCert> certs = crmEmployeeCertService.exitCertno(certno, linshi.getCompanyid());
			if (certs.size() > 0) {
				return 33;
			}
		} else {
			return 0;
		}
		return 1;
	}
	@RequestMapping("/RelevationSave")
	@ResponseBody
	private AuvgoResult save(String empListId) {
		try {
			CrmEmployee user = getUser();
			String[] empId = StringUtils.removeEnd(empListId, "-").split("-");
			List<CrmContantEmp> contantEmp = crmEmployeeService.getContantEmp(user.getCompanyid(), user.getId());
			if (null != contantEmp && !contantEmp.isEmpty() && contantEmp.size() >=30) {
				return AuvgoResult.build(300, "最多关联30个员工");
			}
			int size = empId.length + contantEmp.size();
			if (size >30) {
				return AuvgoResult.build(300, "最多关联30个员工");
			}
			List<CrmEmployee> empList = crmEmployeeService.getEmpListById(user.getCompanyid(), empId);
			CrmCompany company = crmCompanyService.getById(user.getCompanyid());
			if (null != empList && !empList.isEmpty()) {
				for (CrmEmployee emp : empList) {
					CrmContantEmp crmContantEmp = new CrmContantEmp();
					crmContantEmp.setCompanyid(emp.getCompanyid());
					crmContantEmp.setCompanycode(company.getBianhao());
					crmContantEmp.setEmployeeid(user.getId());
					crmContantEmp.setContactEmpid(emp.getId());
					crmContantEmp.setCreatetime(new Date());
					crmEmployeeService.crmContantsaveOrUpdate(crmContantEmp);
				}
			}
			return AuvgoResult.build(200, "关联员工成功!");
		} catch (Exception e) {
			log.error("RelevationSave error", e);
		}
		return AuvgoResult.build(300, "系统偶尔也会累，请稍后重试");
	}
}