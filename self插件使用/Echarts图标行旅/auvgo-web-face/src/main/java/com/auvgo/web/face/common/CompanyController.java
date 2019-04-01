package com.auvgo.web.face.common;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.auvgo.air.api.AirOrderService;
import com.auvgo.business.common.BaseUtils;
import com.auvgo.business.common.IBaseBusiness;
import com.auvgo.common.page.Page;
import com.auvgo.core.contant.AuvStatusContant;
import com.auvgo.core.query.QueryFilter;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.ConvertUtils;
import com.auvgo.core.utils.DateUtil;
import com.auvgo.core.utils.IdCardUtils;
import com.auvgo.core.utils.JsonMapper;
import com.auvgo.core.utils.JsonUtils;
import com.auvgo.core.utils.Md5Sign;
import com.auvgo.crm.api.CrmAppformService;
import com.auvgo.crm.api.CrmApproveRuleService;
import com.auvgo.crm.api.CrmApproveService;
import com.auvgo.crm.api.CrmCompanyService;
import com.auvgo.crm.api.CrmCostCenterService;
import com.auvgo.crm.api.CrmDepartmentService;
import com.auvgo.crm.api.CrmEmployeeCertService;
import com.auvgo.crm.api.CrmEmployeeLinshiService;
import com.auvgo.crm.api.CrmEmployeeService;
import com.auvgo.crm.api.CrmFuwufeiService;
import com.auvgo.crm.api.CrmJiesuanService;
import com.auvgo.crm.api.CrmPeisonaddressService;
import com.auvgo.crm.api.CrmPolicyAirContentService;
import com.auvgo.crm.api.CrmPolicyHotelService;
import com.auvgo.crm.api.CrmPolicyTrainService;
import com.auvgo.crm.api.CrmProductSetService;
import com.auvgo.crm.api.CrmProjectService;
import com.auvgo.crm.api.CrmRoleService;
import com.auvgo.crm.entity.CrmAppform;
import com.auvgo.crm.entity.CrmApprove;
import com.auvgo.crm.entity.CrmApproveRule;
import com.auvgo.crm.entity.CrmCompany;
import com.auvgo.crm.entity.CrmContantEmp;
import com.auvgo.crm.entity.CrmCostCenter;
import com.auvgo.crm.entity.CrmDepartment;
import com.auvgo.crm.entity.CrmEmpPeisong;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.crm.entity.CrmEmployeeCert;
import com.auvgo.crm.entity.CrmEmployeeLinshi;
import com.auvgo.crm.entity.CrmFuwufei;
import com.auvgo.crm.entity.CrmJiesuan;
import com.auvgo.crm.entity.CrmPeisonaddress;
import com.auvgo.crm.entity.CrmPolicyAirContent;
import com.auvgo.crm.entity.CrmProductSet;
import com.auvgo.crm.entity.CrmProject;
import com.auvgo.crm.entity.CrmRoleAcc;
import com.auvgo.crm.model.EmployeeSimpleModel;
import com.auvgo.crm.pojo.CrmEmployeeModel;
import com.auvgo.data.api.DataBaoxianCompanyService;
import com.auvgo.data.api.DataZidianKeyService;
import com.auvgo.data.entity.DataBaoxianCompany;
import com.auvgo.data.entity.DataZidianValue;
import com.auvgo.hotel.orm.bim.entity.Country;
import com.auvgo.sys.api.SysMenuService;
import com.auvgo.sys.entity.SysMenu;
import com.auvgo.web.contant.ErrorCode;
import com.auvgo.web.face.BaseController;
import com.auvgo.web.model.CompanyConfig;
import com.auvgo.web.model.CrmEmployeeLinshiModel;
import com.github.pagehelper.PageInfo;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

@Controller
public class CompanyController extends BaseController {

	private static JsonMapper jsonMapper = JsonMapper.nonNullMapper();
	@Autowired
	private CrmPolicyTrainService crmPolicyTrainService;
	@Autowired
	private CrmPolicyHotelService crmPolicyHotelService;
	@Autowired
	private CrmPolicyAirContentService airContentService;
	@Autowired
	private CrmFuwufeiService crmFuwufeiService;
	@Autowired
	private CrmProductSetService crmProductSetService;
	@Autowired
	private DataBaoxianCompanyService baoxianCompanyService;
	@Autowired
	private DataZidianKeyService zidianKeyService;
	@Autowired
	private CrmApproveService approveService;
	@Autowired
	private CrmEmployeeService employeeService;
	@Autowired
	private CrmJiesuanService jiesuanService;
	@Autowired
	private CrmProjectService projectService;
	@Autowired
	private CrmCostCenterService centerService;
	@Autowired
	private CrmPeisonaddressService PeisonaddressService;
	@Autowired
	private CrmAppformService crmAppformService;
	@Autowired
	private CrmDepartmentService crmDepartmentService;
	@Autowired
	private CrmEmployeeCertService crmEmployeeCertService;
	@Autowired
	private CrmEmployeeLinshiService crmEmployeeLinshiService;
	@Autowired
	private AirOrderService airOrderService;
	@Autowired
	private CrmApproveRuleService approveRuleService;
	@Autowired
	private CrmRoleService crmRoleService;
	@Autowired
	private SysMenuService sysMenuService;
	@Autowired
	private CrmCompanyService companyService;
	@Autowired
	private CrmApproveService crmApproveService;
	@Autowired
	private IBaseBusiness iBaseBusiness;
	@Autowired
	private CrmCostCenterService crmCostCenterService;
	@Autowired
	private CrmProjectService crmProjectService;
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
		tips.put(100, "证件姓名只能录入中文！");
	}

	@RequestMapping(value = "/crm")
	public String home() {
		return "chailv-manage";
	}

	/**
	 * 获取个人差旅信息（机票、酒店、火车票等） {"cid":"1","level":"员工职级"}
	 *
	 * @param companyid
	 * @param level
	 * @return
	 */
	@RequestMapping(value = "/mytravel", method = RequestMethod.POST)
	@ResponseBody
	public AuvgoResult getTravelinfo(String companyid, String level) {
		try {

			if (StringUtils.isBlank(companyid) || StringUtils.isBlank(level)) {
				return AuvgoResult.build(ErrorCode.WRONG_PARAMS, ErrorCode.getMsg(ErrorCode.WRONG_PARAMS));
			}
			Map<String, Object> travelM = Maps.newHashMap();
			String trainPolicy = crmPolicyTrainService.getCompanyPolicyByEmployeeLevel(companyid, Lists.newArrayList(level));
			travelM.put("trainPolicy", trainPolicy);
			String airPolicy = airContentService.getAirPolicyByEmplevel(Long.parseLong(companyid), 0, Lists.newArrayList(level));
			travelM.put("airPolicy", airPolicy);
			String hotelPolicy = crmPolicyHotelService.getCompanyPolicyByEmployeeLevel(companyid, Lists.newArrayList(level), "");
			travelM.put("hotelPolicy", hotelPolicy);
			String resultJson = JsonUtils.objectToJson(travelM);
			return AuvgoResult.build(ErrorCode.SUCCESS, "success", resultJson);
		} catch (Exception e) {
			return AuvgoResult.build(ErrorCode.WRONG_PARAMS, ErrorCode.getMsg(ErrorCode.WRONG_PARAMS));
		}
	}

	/**
	 * 判断该员工是否有权限查看差旅信息
	 *
	 * @return
	 */
	@RequestMapping("/getChailvauth")
	@ResponseBody
	public AuvgoResult getchailvBz() {
		CrmEmployee user = getUser();
		if (user.getName().equals("系统管理员")) {
			return AuvgoResult.build(200, "success", 1);
		}
		boolean flag = false;
		List<CrmRoleAcc> roidlist = crmRoleService.findRolesByCidAndEmpid(user.getCompanyid(), user.getId());
		Set<Long> checkMenus = Sets.newHashSet();
		for (CrmRoleAcc crmRoleAcc : roidlist) {
			checkMenus.addAll(crmRoleService.getCheckMenus(user.getCompanyid(), crmRoleAcc.getRoleid()));// 得到菜单id集合
		}
		if (checkMenus.isEmpty()) {
			return AuvgoResult.build(301, "没有权限,请进行角色菜单的设置", 0);
		}
		Iterator<Long> iterator = checkMenus.iterator();
		while (iterator.hasNext()) {
			Long menuid = iterator.next();
			if (0L == menuid) {
				continue;
			}
			SysMenu sysMenu = sysMenuService.getById(menuid);
			if (sysMenu == null) {
				return AuvgoResult.build(301, "没有权限,请进行设置", 0);
			}
			if ("差旅管理".contains(sysMenu.getName())) {
				flag = true;
				break;
			}
		}
		return AuvgoResult.build(200, "success", flag == true ? 1 : 0);
	}

	@RequestMapping("/getAirPolicy")
	@ResponseBody
	public AuvgoResult getAirPolicy(String level, int distance) {
		try {
			CrmEmployee user = getUser();
			String[] split = StringUtils.removeEnd(level, "/").split("/");
			String policyData = airContentService.getAirPolicyByEmplevel(user.getCompanyid(), distance, Arrays.asList(split));
			if ("201".contains(policyData)) {
				return AuvgoResult.build(201, "success", "公司未开启差旅标准");
			}
			if ("202".contains(policyData)) {
				return AuvgoResult.build(202, "success", "公司没有维护差旅标准");
			}
			if ("2021".contains(policyData)) {
				return AuvgoResult.build(2021, "success", "公司中该员工没有维护差旅标准");
			}
			CrmPolicyAirContent airContent = JsonUtils.jsonToPojo(policyData, CrmPolicyAirContent.class);
			return AuvgoResult.build(200, "success", airContent);
		} catch (Exception e) {

			e.printStackTrace();
			return AuvgoResult.build(300, "获取机票差旅政策失败");
		}
	}

	@RequestMapping("/toInformation")
	public String toInformation() {
		CrmEmployee user = getUser();
		// CrmEmployeeCert cert = crmEmployeeCertService.getById(user.getId());
		// setAttr("cert", cert);
		if (user.getBookrange() == null) {
			user.setBookrange(3);
		}
		setAttr("emp", user);
		return "/crm/personal-center/information";
	}

	@RequestMapping("/toEdit")
	@ResponseBody
	public AuvgoResult toEdit(CrmEmployee crmEmployee) {
		try {
			if (StringUtils.isBlank(crmEmployee.getEmail()) || StringUtils.isBlank(crmEmployee.getMobile()) || StringUtils.isBlank(crmEmployee.getName())) {
				return AuvgoResult.build(300, "请输入要修改的内容");
			}
			CrmEmployee user = getUser();
			// CrmEmployee employee =
			// employeeService.getById(user.getCompanyid(), user.getId());
			user.setMobile(crmEmployee.getMobile());
			user.setEmail(crmEmployee.getEmail());
			user.setName(crmEmployee.getName());
			if (StringUtils.isNotBlank(crmEmployee.getNameen())) {
				user.setNameen(crmEmployee.getNameen());
			}
			employeeService.saveOrUpdate(user);
			return AuvgoResult.build(200, "个人信息修改成功");
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "修改失败");
	}
	@RequestMapping("/isHuiChuan")
	@ResponseBody
	public AuvgoResult isHuiChuan() {
		CrmCompany company = getCompany();
		if(company!=null){
			if("HCJS".equals(company.getBianhao())||"HCYF".equals(company.getBianhao())){
				return AuvgoResult.build(200, "项目编码");
			}
		}
		return AuvgoResult.build(300, "项目中心");
	}
	@RequestMapping("/toEditPwd")
	public String toEditPwd() {
		return "/crm/personal-center/edit-pwd";
	}

	// 修改用户密码
	@RequestMapping("/EditBypwd")
	@ResponseBody
	public AuvgoResult EditBypwd(String oldpassword, String newpassword) {
		try {
			if (StringUtils.isBlank(oldpassword) || StringUtils.isBlank(newpassword)) {
				return AuvgoResult.build(300, "密码不能为空，请输入密码!!!");
			}
			CrmEmployee user = getUser();
			CrmEmployee employee = employeeService.getById(user.getCompanyid(), user.getId());
			CrmCompany company = companyService.getById(user.getCompanyid());
			String password = Md5Sign.MD5Encode(user.getUsername() + company.getBianhao().toUpperCase() + oldpassword).toUpperCase();
			if (!employee.getPassword().equals(password)) {
				return AuvgoResult.build(300, "您输入的密码有误,请重新输入!!");
			} else {
				employee.setPassword(Md5Sign.MD5Encode(user.getUsername() + company.getBianhao().toUpperCase() + newpassword).toUpperCase());
				employeeService.saveOrUpdate(employee);
				return AuvgoResult.ok();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "修改密码失败!!");
	}

	@RequestMapping("/toEditCredentials")
	public String toEditCredentials() {
		return "/crm/personal-center/edit-credentials";
	}

	@RequestMapping("/toCommonPersons")
	public String toCommonPersons(@RequestParam(defaultValue = "1") Integer pageNum, Integer pageSize, HttpServletRequest request) {
		/*
		 * 前台传来request中包含的参数 queryparam:查询条件 按姓名或电话查询
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
		PageInfo<CrmEmployeeLinshi> page = crmEmployeeLinshiService.findPageBy(pageNum, pageSize, fileter.buildSql(request), paramMap);
		setAttr("pageSize", pageSize);
		setAttr("page", page);
		return "/crm/personal-center/common-persons";
	}

	@RequestMapping("/toCommonPersonsAdd/{linshiId}")
	public String toCommonPersonsAdd(@PathVariable("linshiId") Long linshiId) {
		if (linshiId == null) {
			setAttr("Msg", "参数错误!");
			return "404";
		}
		if (linshiId != 0L) { // 修改
			CrmEmployeeLinshi ls = crmEmployeeLinshiService.getById(linshiId);
			setAttr("linshi", ls);
		}
		return "/crm/personal-center/common-persons-add";
	}

	@RequestMapping("/toBind")
	public String toBind() {
		return "/crm/personal-center/bind-12306";
	}

	@RequestMapping("/toBindAdd")
	public String toBindAdd() {
		return "/crm/personal-center/bind-12306-add";
	}

	// 获取服务费接口
	@RequestMapping("/getCompanyconfig")
	@ResponseBody
	public AuvgoResult getCompanyconfig() {
		try {
			CrmEmployee user = getUser();
			if (null == user) {
				return AuvgoResult.build(ErrorCode.ERROR_NONE, "登录信息为空");
			}
			CrmFuwufei fuwufei = crmFuwufeiService.getByCid(user.getCompanyid());
			CrmProductSet product = crmProductSetService.getByCid(user.getCompanyid());
			List<DataBaoxianCompany> list = baoxianCompanyService.getBaoxianByCompanyid(user.getCompanyid());
			CompanyConfig config = new CompanyConfig();
			config.setFuwufei(fuwufei);
			config.setProductSet(product);
			config.setList(list);
			return AuvgoResult.build(200, "success", JsonUtils.objectToJson(config));
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "获取服务费失败");
	}

	// 获取审批规则
	@SuppressWarnings({"unchecked"})
	@RequestMapping("/getShenpi")
	@ResponseBody
	public AuvgoResult getShenpi(String empids, String type, String webeiflage) {
		try {
			CrmEmployee user = getUser();
			if (null == user) {
				return AuvgoResult.build(300, "获取登录人信息出现异常");
			}
			if (StringUtils.isBlank(empids) || StringUtils.isBlank(type)) {
				log.info("/getShenpi 请求参数异常-->empids:{}, type:{}", empids, type);
				return AuvgoResult.build(300, "参数异常!");
			}
			Object[] empid = StringUtils.removeEnd(empids, "-").split("-");
			List<CrmEmployee> emplist = employeeService.getEmpListById(user.getCompanyid(), empid);
			// 匹配审批
			// 7888
			List<String> empIdL = ConvertUtils.extractElementPropertyToList(emplist, "id");
			// 1080
			List<String> deptIdL = ConvertUtils.extractElementPropertyToList(emplist, "deptid");
			List<String> depths = Lists.newArrayList();

			List<CrmApprove> approveList = approveService.matchApprove(user.getCompanyid(), Sets.newHashSet(empIdL), Sets.newHashSet(deptIdL), type, webeiflage);
			if (null != approveList && approveList.size() > 0) {
				for (CrmApprove ca : approveList) {
					Set<Long> empIds = approveService.findChooseEmployees(user.getCompanyid(), ca.getId());
					Set<Long> depts = approveService.findChooseDepts(user.getCompanyid(), ca.getId());
					for (CrmEmployee emp : emplist) {
						if (empIds.contains(emp.getId()) || depts.contains(emp.getDeptid())) {
							depths.add(String.valueOf(emp.getDeptid()));
						}
					}
					ca.setShenpirens(approveService.getShenpirenAndSpecialByApproveId(user.getCompanyid(), ca.getId(), webeiflage, null, depths));
					depths.clear();
				}
				log.info("/getShenpi response -->{}", jsonMapper.toJson(approveList));
				return AuvgoResult.build(ErrorCode.SUCCESS, "success", JsonUtils.objectToJson(approveList));
			} else {
				return AuvgoResult.build(200, "该用户无需审批");
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, JsonUtils.objectToJson("查询审批人出现异常"));
	}

	@RequestMapping("/getShowname")
	@ResponseBody
	public AuvgoResult getShownameAndCode() {
		try {
			CrmEmployee user = getUser();
			if (null == user) {
				return AuvgoResult.build(300, "获取登录人信息出现异常");
			}
			// 判断是否为笔克公司
			String flag = "1";// 0为笔克公司
			//List<String> bk = Arrays.asList(BK_NO);
			CrmCompany company = companyService.getById(user.getCompanyid());
			Boolean aBoolean = BaseUtils.vaildateBKCompany(company.getBianhao());
			if (aBoolean) {
				log.info("检查到位笔克公司信息companyid:{}", company.getId());
				flag = "0";
			}
			return AuvgoResult.build(ErrorCode.SUCCESS, ErrorCode.getMsg(ErrorCode.SUCCESS), flag);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(ErrorCode.ERROR, ErrorCode.getMsg(ErrorCode.ERROR));
	}

	// 获取项目中心
	@RequestMapping("/getProject")
	@ResponseBody
	public AuvgoResult getProject(String pagenum, String pagesize, String keyword) {
		CrmEmployee user = getUser();
		if (null == user) {
			return AuvgoResult.build(300, "获取登录人信息出现异常");
		}
		int pageNum = StringUtils.isBlank(pagenum) ? 1 : Integer.parseInt(pagenum);
		int pageSize = StringUtils.isBlank(pagesize) ? 5 : Integer.parseInt(pagesize);
		String SqlWhere = "";
		if (StringUtils.isNotBlank(keyword)) {
			SqlWhere = " (name like'" + keyword + "%' or code like'" + keyword + "%')";
		}
		PageInfo<CrmProject> projectList = projectService.findPageBy(pageNum, pageSize, user.getCompanyid(), SqlWhere);
		String resultJson = JsonUtils.objectToJson(projectList);
		log.info("reponse--> resultJson:{}", resultJson);
		return AuvgoResult.build(ErrorCode.SUCCESS, ErrorCode.getMsg(ErrorCode.SUCCESS), resultJson);
	}

	// 获取成本中心
	@RequestMapping("/getCostcenter")
	@ResponseBody
	public AuvgoResult getCostcenter(String pagenum, String pagesize, String keyword) {
		CrmEmployee user = getUser();
		if (null == user) {
			return AuvgoResult.build(300, "获取登录人信息出现异常");
		}
		if (null == keyword) {
			return AuvgoResult.build(300, "参数不能为空");
		}
		try {
			int pageNum = StringUtils.isBlank(pagenum) ? 1 : Integer.parseInt(pagenum);
			int pageSize = StringUtils.isBlank(pagesize) ? 5 : Integer.parseInt(pagesize);
			String SqlWhere = "";
			if (StringUtils.isNotBlank(keyword)) {
				SqlWhere = " (name like'" + keyword + "%' or code like'" + keyword + "%') ";
			}
			PageInfo<CrmCostCenter> costList = centerService.findPageBy(pageNum, pageSize, user.getCompanyid(), SqlWhere);
			String resultJson = JsonUtils.objectToJson(costList);
			log.info("reponse--> resultJson:{}", resultJson);
			return AuvgoResult.build(ErrorCode.SUCCESS, ErrorCode.getMsg(ErrorCode.SUCCESS), resultJson);
		} catch (NumberFormatException e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "查询成本中心出现异常");
	}

	// 获取配送地址
	@RequestMapping("/getPeison")
	@ResponseBody
	public AuvgoResult getPeison() {
		CrmEmployee user = getUser();
		if (null == user) {
			return AuvgoResult.build(300, "获取登录人信息出现异常");
		}
		CrmEmpPeisong emppeison = PeisonaddressService.getEmpPeisonSort(user.getId(), user.getCompanyid());
		CrmPeisonaddress peisonad = null;
		String addresslist = null;
		List<CrmPeisonaddress> list = PeisonaddressService.getListByCid(user.getCompanyid());
		List<CrmPeisonaddress> lists = Lists.newArrayList();
		if (null != emppeison && list.size() > 0) {
			peisonad = PeisonaddressService.getById(emppeison.getPeisonid());
			for (CrmPeisonaddress peisonaddress : list) {// 过滤掉存在的值..
				if (!peisonaddress.getId().toString().equals(peisonad.getId().toString()) && peisonaddress.getStatus() == 1) {
					lists.add(peisonaddress);
				}
			}
			peisonad.setIsdefault(1);
			lists.add(0, peisonad);// 默认插入第一个
			addresslist = JsonUtils.objectToJson(lists);
		} else {
			addresslist = JsonUtils.objectToJson(list);
		}
		log.info("querypeiSonaddrss reponse-->{}", jsonMapper.toJson(addresslist));
		return AuvgoResult.build(ErrorCode.SUCCESS, "success", addresslist);
	}

	// 获取当前登录人信息
	@RequestMapping("/getLoginUser")
	@ResponseBody
	public AuvgoResult getLoginUser() {
		CrmEmployee user = getUser();
		if (null == user) {
			return AuvgoResult.build(300, "登录人信息为空");
		}
		CrmEmployee employee;
		if ("系统管理员".equals(user.getName())) {
			employee = user;
		} else {
			employee = employeeService.getById(user.getCompanyid(), user.getId());
		}
		employee.setPassword("");
		employee.setTokencode("");
		return AuvgoResult.build(200, "success", JsonUtils.objectToJson(employee));
	}

	/*
	 * @RequestMapping("/getSingleAppForm")
	 *
	 * @ResponseBody public AuvgoResult getSingleAppForm() { try { CrmEmployee
	 * user = (CrmEmployee) getSessionAttr("user"); if (null == user ||
	 * StringUtils.isBlank(user.getOpenid())) { return AuvgoResult.build(201,
	 * "没有获取到单独的出差申请单"); } return AuvgoResult.build(200, "success",
	 * user.getOpenid()); } catch (Exception e) { e.printStackTrace(); } return
	 * AuvgoResult.build(300, "后台出现异常"); }
	 */

	@RequestMapping("/findAppForm")
	@ResponseBody
	public AuvgoResult findAppForm(String pagenum, String pagesize, HttpServletRequest request) {
		int pageNum = StringUtils.isBlank(pagenum) ? 1 : Integer.parseInt(pagenum);
		int pageSize = StringUtils.isBlank(pagesize) ? 10 : Integer.parseInt(pagesize);
		QueryFilter filter = new QueryFilter();
		CrmCompany company = getCompany();
		if ("CLKJ".equalsIgnoreCase(company.getBianhao())) {
			// 如果是长亮科技,则对出差申请单创建时间倒叙排序
			filter.setOrderField("app.createtime"); // 出差申请单申请时间
		} else {
			filter.setOrderField("app.travelstart"); // 出差开始时间
		}
		filter.setOrderDirection("desc"); // 倒叙排序
		// 利用QueryFilter添加排序规则
		/*
		 * filter.setOrderField("approvaltime"); // 提交出差申请单的时间
		 *
		 * filter.setOrderField("travelend"); // 出差结束时间
		 * filter.setOrderDirection("asc"); // 正序排序
		 */
		//
		Map<String, Object> params = initBaseParams();
		// Date date = new Date();
		String ordertime = request.getParameter("ordertime");
		String startTime = null;
		String endTime = null;
		if (null == ordertime) {
			return AuvgoResult.build(300, "数据异常");
		}
		String[] times = ordertime.split(",");
		startTime = times[0];
		if (!isDateStr(startTime)) {
			return AuvgoResult.build(300, "数据异常");
		}
		if (times.length > 1 && null != times[1]) {
			endTime = times[1];
			if (!isDateStr(endTime)) {
				return AuvgoResult.build(300, "数据异常");
			}
		} else {
			endTime = startTime;
		}
		params.put("q_LTE_app.travelstart", startTime);
		params.put("q_GTE_app.travelend", endTime + " 00:00:00");
		PageInfo<CrmAppform> appForms = crmAppformService.findPageByAndExtraParams(pageNum, pageSize, filter.buildSql(request), params);
		// 如果需要page对象,将下面解注
		// String json = JsonUtils.objectToJson(appForms);
		String json = JsonUtils.objectToJson(appForms);
		return AuvgoResult.build(200, "数据获取成功!", json);
	}

	// 初始化基本查询条件
	private Map<String, Object> initBaseParams() {
		Map<String, Object> extraParams = Maps.newHashMap();
		CrmEmployee user = getUser();
		// 用于存储额外的查询条件
		Long deptid = user.getDeptid();
		String level = user.getLevel();
		Long cid = user.getCompanyid();
		extraParams.put("level", level); // 必须添加 员工等级
		extraParams.put("companyid", cid); // 必须添加员工公司的id
		extraParams.put("empid", user.getId()); // 必须添加 员工id
		/*
		 * 如果员工等级是dept,那么将dept和dept的子部门都查出来,并将部门id重新拼接成字符串,中间用","隔开
		 */
		if (StringUtils.equals(level, "dept") && deptid != null && deptid != 0L) {
			List<CrmDepartment> dept = crmDepartmentService.getDeptAndSubDeptById(cid, deptid);
			StringBuffer sbBuffer = new StringBuffer();
			for (CrmDepartment d : dept) {
				sbBuffer.append(d.getId()).append(",");
			}
			extraParams.put("dept", StringUtils.removeEndIgnoreCase(sbBuffer.toString(), ","));
		}
		return extraParams;
	}

	/**
	 * 机票订单时, 查询乘机人
	 *
	 * @param keyword
	 * @author itVincent
	 */
	@RequestMapping("/getStaff")
	@ResponseBody
	public AuvgoResult querystaffs(String keyword) {
		/*
		 * 前台传来的数据: keyword:查询字符
		 */
		CrmEmployee user = getUser();
		if (null == user) {
			return AuvgoResult.build(300, "登录人信息有误");
		}
		if (StringUtils.isBlank(keyword)) {
			return AuvgoResult.build(300, "查询条件不能为空");
		}
		List<Map<String, Object>> emps = employeeService.findEmpLikeKeyword(String.valueOf(user.getCompanyid()), String.valueOf(user.getId()), keyword);
		List<CrmContantEmp> contantEmp = employeeService.getContantEmp(user.getCompanyid(), user.getId());
		if (null != emps && !emps.isEmpty()) {
			Iterator<Map<String, Object>> iterator = emps.iterator();
			while (iterator.hasNext()) {
				Map<String, Object> next = iterator.next();
				String Empid = String.valueOf(next.get("id"));// 员工id
				if (null != contantEmp && !contantEmp.isEmpty()) {
					for (CrmContantEmp crmContantEmp : contantEmp) {
						if (String.valueOf(crmContantEmp.getContactEmpid()).equals(Empid)) {
							next.put("linkEmpid", crmContantEmp.getEmployeeid());
							break;
						} else {
							next.put("linkEmpid", 0);
						}
					}
				} else {
					next.put("linkEmpid", 0);
				}
			}
		}
		return AuvgoResult.build(200, "请求成功!", JsonUtils.objectToJson(emps));
	}

	/**
	 * 机票订单时,新增员工的保存操作
	 *
	 * @param model
	 * @author itVincent
	 */
	@SuppressWarnings("unused")
	@RequestMapping("/add/staff")
	@ResponseBody
	public AuvgoResult addSimpleStaff(EmployeeSimpleModel model) {
		/*
		 * 前台传来的数据: deptid:部门id,name:新增员工姓名,certtype:证件类型,
		 * certno:证件号,mobile联系电话,zhiwei:员工职级,level:权限级别
		 */
		log.info("/add/staff param data -->name:{},deptid:{},certtype:{},certno:{},mobile:{},zhiwei:{},levle:{}", model.getName(), model.getDeptid(), model.getCerttype(),
				model.getCertno(), model.getMobile(), model.getZhiwei(), model.getLevel());
		CrmEmployee user = getUser();
		// 如果是身份证号
		if (null == model) {
			log.info("/add/staff param is null -->" + model);
			return AuvgoResult.build(300, "参数错误!");
		} else {
			model.setCompanyid(user.getCompanyid());
			CrmEmployee employee = new CrmEmployee();
			employee.setCerttype(model.getCerttype());
			employee.setCertno(model.getCertno().trim());
			employee.setAccno(model.getAccno());
			employee.setCompanyid(user.getCompanyid());
			employee.setMobile(model.getMobile());
			//添加编号
			if (StringUtils.isBlank(model.getAccno())) {
				if (StringUtils.isNotBlank(model.getMobile())) {
					model.setAccno(model.getMobile());
				} else {
					if (StringUtils.isNotBlank(model.getCertno()) && model.getCertno().length() > 8) {
						model.setAccno(model.getCertno().substring(model.getCertno().length() - 8, model.getCertno().length()));
					} else {
						employee.setAccno(model.getCertno());
						model.setAccno(model.getCertno());
					}
				}

			}
			//编号校验
			if (StringUtils.isNotBlank(model.getAccno()) && employeeService.exsistValue(user.getCompanyid(), "accno", model.getAccno())) {
				//生成随机数
				StringBuffer sb = new StringBuffer();
				Random rand = new Random();
				for (int i = 0; i < 6; i++) {
					sb.append(rand.nextInt(9));
				}
				model.setAccno(employee.getAccno() + sb.toString());
				employee.setAccno(employee.getAccno() + sb.toString());
			}
			//
			if(model.getCert().getIsChinese()){
				//中文
				if(!com.auvgo.core.string.StringUtils.isContainsChinese(model.getName())){
					return AuvgoResult.build(300,"请输入中文格式!!!");
				}
			}else{
				if(com.auvgo.core.string.StringUtils.isContainsChinese(model.getName())){
					return AuvgoResult.build(300,"请输入英文格式!!!");
				}
			}
			try {
				int validate = valideParamLegitimate(employee, user, 1);
				if (validate != 1) {
					return AuvgoResult.build(300, tips.get(validate));
				}
			} catch (Exception e) {
				// 参数在校验时出现异常
				log.info("/add/staff validate param error, you have a param is not program need! -->" + model);
				return AuvgoResult.build(300, tips.get(0));
			}
			CrmEmployee emp = employeeService.saveSimpleEmp(model);
			if (emp == null) {
				return AuvgoResult.build(300, "员工添加失败,请刷新后重试!");
			}
			return AuvgoResult.build(200, "员工添加成功!", JsonUtils.objectToJson(emp));
		}
	}

	/**
	 * 添加临时联系人
	 *
	 * @param linshi 临时联系人对象
	 * @return
	 * @author itVincent
	 */
//	@RequestMapping("/add/linshi")
//	@ResponseBody
//	public AuvgoResult addLinshi(CrmEmployeeLinshi linshi) {
//		if (null == linshi) {
//			log.info("/add/linshi param is null -->" + linshi);
//			return AuvgoResult.build(300, tips.get(0));
//		} else {
//			// 初始化参数
//			buildEmployeeLinshi(linshi);
//			try {
//				// 对参数做校验
//				// 对证件号去空格操作
//				linshi.setCertno(linshi.getCertno().trim());
////				int valide = valideParamLegitimate(null, linshi, getUser(), 1);
////				if (valide != 1) {
////					return AuvgoResult.build(300, tips.get(valide));
////				}
//				if (StringUtils.isNotBlank(linshi.getMobile()) && !linshi.getMobile().matches(MOBILE_REGEX)) {
//					return AuvgoResult.build(300, "请输入正确的联系方式!");
//				}
//			} catch (Exception e) {
//				log.info("/add/linshi validate param error, you have a param is not program need! -->" + linshi);
//				return AuvgoResult.build(300, tips.get(0));
//			}
//			Long id = crmEmployeeLinshiService.save(linshi);
//			linshi.setId(id);
//			return AuvgoResult.build(200, "保存成功!", JsonUtils.objectToJson(linshi));
//		}
//	}
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

	@Deprecated
	@RequestMapping("/get/linshi")
	@ResponseBody
	public AuvgoResult getLinshi() {
		CrmEmployee user = getUser();
		// 判断此人是否为预订人
		Integer ifallowbook = user.getIfallowbook();
		CrmEmployeeLinshiModel emplinshi = new CrmEmployeeLinshiModel();
		if (null != ifallowbook && ifallowbook == 1) {// 判断是否为预订人
			emplinshi.setCompanyid(user.getCompanyid());
			emplinshi.setCertno(user.getCertno());
			emplinshi.setCerttype(user.getCerttype());
			emplinshi.setEmpid(user.getId());
			emplinshi.setMobile(user.getMobile());
			emplinshi.setUsername(user.getName());
			emplinshi.setId(0L);// 标示该员工是员工
			emplinshi.setEmail(user.getEmail());
		}
		List<CrmEmployeeLinshiModel> emplist = Lists.newArrayList();
		List<CrmEmployeeLinshi> linshi = crmEmployeeLinshiService.getLinshi(user.getCompanyid(), user.getId());
		if (null != ifallowbook && ifallowbook == 1) {// 是预订人
			emplist.add(0, emplinshi);
			for (CrmEmployeeLinshi crmEmployeeLinshi : linshi) {
				CrmEmployeeLinshiModel emplinshi1 = new CrmEmployeeLinshiModel();
				emplinshi1.setEmail("");
				try {
					BeanUtils.copyProperties(emplinshi1, crmEmployeeLinshi);
					emplist.add(emplinshi1);
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}
		return AuvgoResult.build(200, "数据获取成功!", JsonUtils.objectToJson(emplist));
	}

	@RequestMapping("/get/newLinshi")
	@ResponseBody
	public AuvgoResult getNewLinshi() {
		List<CrmEmployee> result = Lists.newArrayList();
		try {
			CrmEmployee user = getUser();
			// 判断此人是否为预订人
			Integer ifallowbook = user.getIfallowbook();
			List<CrmContantEmp> contantEmp = employeeService.getContantEmp(user.getCompanyid(), user.getId());
			List<Long> employeeids = new ArrayList<Long>();

			if (null != contantEmp && !contantEmp.isEmpty()) {
				for (CrmContantEmp contant : contantEmp) {
					employeeids.add(contant.getContactEmpid());
				}
			} else {
				return AuvgoResult.build(300, "未设置常用出行人");
			}
			if (null != employeeids && !employeeids.isEmpty()) {
				CrmEmployeeModel crmemp = new CrmEmployeeModel();
				List<CrmEmployee> list = employeeService.getEmpListById(user.getCompanyid(), employeeids.toArray());
				Iterator<CrmEmployee> iterator = list.iterator();
				while (iterator.hasNext()) {
					crmemp = new CrmEmployeeModel();
					CrmEmployee next = iterator.next();
					if(next.getStatus() == 1 || next.getOpened() == 0){
						// 冻结和离职的原不允许预订
						iterator.remove();
						continue;
					}
					BeanUtils.copyProperties(crmemp, next);
					if (next.getId().longValue() == user.getId().longValue()) {
						iterator.remove();
						continue;
					}
					// 查询员工对应的成本中心和项目中心
					getCentAndProject(crmemp);
					result.add(crmemp);
				}
			}
			if (null != ifallowbook && ifallowbook == 1) {// 判断是否为预订人
				CrmEmployeeModel crmEmp = new CrmEmployeeModel();
				BeanUtils.copyProperties(crmEmp, user);
				getCentAndProject(crmEmp);
				result.add(0, crmEmp);
			}
		} catch (Exception e) {
			e.printStackTrace();
			log.error("getNewLinshi error ", e);
			return AuvgoResult.build(300, "常用出行人请求异常");
		}
		return AuvgoResult.build(200, "数据获取成功", JsonUtils.objectToJson(result));
	}

	private void getCentAndProject(CrmEmployeeModel crmemp) {
		CrmProject crmProject = crmProjectService.getProjectByEmployeIdAndDeptid(crmemp.getCompanyid(), crmemp.getId(), crmemp.getDeptid());
		if (null != crmProject) {
			crmemp.setItemNumber(crmProject.getName());// 项目名称
			crmemp.setItemNumberId(crmProject.getId());// 项目id
		} else {
			crmemp.setItemNumber("");// 项目名称
			crmemp.setItemNumberId(0L);// 项目id
		}
		List<CrmCostCenter> costEmployeeOrDept = crmCostCenterService.getCostEmployeeOrDept(crmemp.getCompanyid(), crmemp.getId(), crmemp.getDeptid());
		if (null != costEmployeeOrDept && !costEmployeeOrDept.isEmpty()) {
			crmemp.setCostName(costEmployeeOrDept.get(0).getName());// 项目名称
			crmemp.setCostId(costEmployeeOrDept.get(0).getId());// 项目id
		} else {
			crmemp.setCostName("");// 项目名称
			crmemp.setCostId(0L);// 项目id
		}
	}

	/**
	 * 根据常用人员的id删除
	 *
	 * @param request
	 * @return
	 * @author itVincent
	 */
	@RequestMapping("/deleteLinshi")
	@ResponseBody
	public AuvgoResult delete(HttpServletRequest request) {
		String linshiId = request.getParameter("linshiId");
		if (StringUtils.isBlank(linshiId)) {
			return AuvgoResult.build(300, "删除异常!");
		}
		Integer deleteById = crmEmployeeLinshiService.deleteById(Long.valueOf(linshiId));
		if (deleteById > 0) {
			return AuvgoResult.build(200, "删除成功!");
		}
		return AuvgoResult.build(300, "删除异常!");
	}


	/**
	 * 根据前端传回来的CrmEmployeeLinshi对象更新
	 *
	 * @param linshi 前端传回来CrmEmployeeLinshi对象
	 * @author itVincent
	 */
	@RequestMapping("/update/linshi")
	@ResponseBody
	public AuvgoResult updateLinshi(CrmEmployeeLinshi linshi) {
		if ("1".equals(linshi.getCerttype()) && !checkBirthdayIsNotChild(linshi.getCertno())) {
			return AuvgoResult.build(200, "系统暂不支持在线预订儿童票和婴儿票，如需预订请拨打客服电话4006060011");
		}
		linshi.setStatus(1L); // 设置能正常使用
		try {
			int validate = valideParamLegitimate(null, getUser(), 0);
			if (validate != 1) {
				return AuvgoResult.build(300, tips.get(validate));
			}
		} catch (Exception e) {
			log.info("/update/linshi 校验参数时异常!! {}", e);
		}
		Integer num = crmEmployeeLinshiService.saveOrUpdate(linshi);
		if (num > 0) {
			return AuvgoResult.build(200, "更新成功!");
		}
		return AuvgoResult.build(300, "更新异常!");
	}

	/**
	 * 根据提交订单的人来获取历史订单人的id和name
	 *
	 * @return 历史乘机人的 id和name
	 * @author itVincent
	 */
	@RequestMapping("/getAirHistory")
	@ResponseBody
	public AuvgoResult getHistoryPassengers() {
		CrmEmployee user = getUser();
		List<Map<String, Object>> historyPass = airOrderService.getHistoryPassByUserId(user.getCompanyid(), user.getId());
		if (null != historyPass && !historyPass.isEmpty()) {
			Iterator<Map<String, Object>> iterator = historyPass.iterator();
			while (iterator.hasNext()) {
				Map<String, Object> next = iterator.next();
				String empid = String.valueOf(next.get("id"));
				String deptid = String.valueOf(next.get("deptid"));
				CrmProject crmProjects = projectService.getProjectByEmployeIdAndDeptid(user.getCompanyid(), Long.valueOf(empid), Long.valueOf(deptid));
				if (null != crmProjects) {
					next.put("itemNumber", crmProjects.getName());
					next.put("itemNumberId", crmProjects.getId());
				} else {
					next.put("itemNumber", "");
					next.put("itemNumberId", 0l);
				}
				List<CrmCostCenter> costEmployeeOrDept = centerService.getCostEmployeeOrDept(user.getCompanyid(), Long.valueOf(empid), Long.valueOf(deptid));
				if (null != costEmployeeOrDept && !costEmployeeOrDept.isEmpty()) {
					next.put("costName", costEmployeeOrDept.get(0).getName());
					next.put("costId", costEmployeeOrDept.get(0).getId());
				} else {
					next.put("costName", "");
					next.put("costId", 0l);

				}
			}
		}
		return AuvgoResult.build(200, "数据获取成功!", JsonUtils.objectToJson(historyPass));
	}

	// 获取违背原因接口
	@RequestMapping("/getWeibei")
	@ResponseBody
	public AuvgoResult getWeibei(String type) {
		CrmEmployee user = getUser();
		if (null == user) {
			return AuvgoResult.build(300, "登录人信息有误");
		}
		if (StringUtils.isBlank(type)) {
			return AuvgoResult.build(ErrorCode.WRONG_PARAMS, ErrorCode.getMsg(ErrorCode.WRONG_PARAMS));
		}
		List<DataZidianValue> projectList = null;
		if ("air".equalsIgnoreCase(type)) {
			projectList = zidianKeyService.getzidianValueBYzidianKey(user.getCompanyid(), "jpviolationresaon");
		} else if ("airgq".equalsIgnoreCase(type)) {
			projectList = zidianKeyService.getzidianValueBYzidianKey(user.getCompanyid(), "jprefusereason");
		} else if ("train".equalsIgnoreCase(type)) {
			projectList = zidianKeyService.getzidianValueBYzidianKey(user.getCompanyid(), "hcpviolationresaon");
		} else if ("hotel".equalsIgnoreCase(type)) {
			projectList = zidianKeyService.getzidianValueBYzidianKey(user.getCompanyid(), "jdviolationreason");
		}
		String resultJson = JsonUtils.objectToJson(projectList);
		log.info("querypeiSonaddrss reponse--> resultJson:{}", resultJson);
		return AuvgoResult.build(ErrorCode.SUCCESS, ErrorCode.getMsg(ErrorCode.SUCCESS), resultJson);
	}

	// 判断是否开启无条件审批
	@RequestMapping("/checkApprove")
	@ResponseBody
	private AuvgoResult checkShenpi(String type) {
		CrmEmployee user = getUser();
		CrmApproveRule approveRule = approveRuleService.getByCid(user.getCompanyid());
		String[] yewutype = StringUtils.removeEnd(approveRule.getYewutype(), "/").split("/");
		String[] kaiqi = StringUtils.removeEnd(approveRule.getIskaiqi(), "/").split("/");
		String[] isneeds = StringUtils.removeEnd(approveRule.getIsneed(), "/").split("/");
		String need = "1";
		String jpkai = "0";
		for (int i = 0; i < yewutype.length; i++) {
			if (type.equalsIgnoreCase(yewutype[i])) {
				jpkai = kaiqi[i];
				need = isneeds[i];
			}
		}
		Map<String, String> maps = Maps.newHashMap();
		if ("1".equals(jpkai)) {
			maps.put("condition", jpkai);
		} else {
			maps.put("need", need);
		}
		return AuvgoResult.build(ErrorCode.SUCCESS, "success", JsonUtils.objectToJson(maps));
	}

	@RequestMapping("/crm/jiesuan")
	@ResponseBody
	public AuvgoResult getCompanyJiesuan() {
		CrmJiesuan jiesuan = null;
		try {
			CrmEmployee user = getUser();
			jiesuan = jiesuanService.getByCid(user.getCompanyid());
			return AuvgoResult.build(200, "success", jiesuan);
		} catch (Exception e) {
			log.error("getCompanyJiesuan", e);
		}
		// 默认结算为月结
		jiesuan = new CrmJiesuan();
		jiesuan.setFukuankemu("1");
		jiesuan.setQiyong("Y");
		return AuvgoResult.build(300, "success", jiesuan);
	}

	@RequestMapping("/getcert")
	@ResponseBody
	public AuvgoResult getCert(HttpServletRequest request) {
		// 1-->公司员工
		String certtype = request.getParameter("certtype"); // 证件类型
		String eid = request.getParameter("eid"); // 乘客id
		// 如果参数有一个为空,那么返回参数错误!
		if (StringUtils.isBlank(certtype) || StringUtils.isBlank(eid)) {
			return AuvgoResult.build(300, "请通知管理员维护证件信息");
		}
		Map<String, String> map = Maps.newHashMap();
		// 如果是1,乘客是员工
		CrmEmployeeCert empCert = crmEmployeeCertService.getCertByEmpidAndCertType(certtype, Long.valueOf(eid));
		if (empCert != null) {
			map.put("name", empCert.getUsername());
			map.put("certno", empCert.getCertificate());
			map.put("certtype", certtype);
			map.put("certtypeName", AuvStatusContant.idsTypeMap.get(certtype));
		}
		if (!map.containsKey("name")) {
			map.put("name", "");
		}
		if (!map.containsKey("certno")) {
			map.put("certno", "");
		}
		return AuvgoResult.build(200, "获取成功!", JsonUtils.objectToJson(map));
	}

	@RequestMapping("/updatepass")
	@ResponseBody
	public AuvgoResult updatePass() {
		String certtype = request.getParameter("certtype"); // 证件类型
		String certno = request.getParameter("certno"); // 证件号码
		String mobile = request.getParameter("mobile"); // 手机号
		String name = request.getParameter("name"); // 姓名
		String eid = request.getParameter("eid"); // 乘客id
		String email = request.getParameter("email"); // 乘客邮箱
		String birthday = request.getParameter("birthday");
		log.info("/crm/updatepass params-->certtype:{},certno:{},mobile:{},name:{},eid:{},email:{}", certtype, certno, mobile, name, eid, email);
		// 如果有数据没传过来,就会报异常:参数错误!
		if (StringUtils.isBlank(certtype) || StringUtils.isBlank(certno) || StringUtils.isBlank(mobile) || StringUtils.isBlank(name) || StringUtils.isBlank(eid)) {
			return AuvgoResult.build(300, "修改失败!");
		}
		// 对证件号做trim处理
		certno = certno.trim();
		Long id = Long.valueOf(eid);
		CrmEmployee user = getUser();
		CrmEmployee emp = employeeService.getById(user.getCompanyid(), id);
		emp.setCerttype(certtype);
		emp.setCertno(certno);
		emp.setMobile(mobile);
		emp.setBirthday(birthday);
		emp.setEmail(email);
		try {
			int validate = valideParamLegitimate(emp, user, 2);
			if (validate != 1) {
				return AuvgoResult.build(300, tips.get(validate));
			}
			List<CrmEmployeeCert> certs = crmEmployeeCertService.findByCidAndEmpid(emp.getCompanyid(), emp.getId());// wqq
			CrmEmployeeCert currentCert = null;
			if (null == certs || certs.isEmpty()) {
				// 说明证件表中没有此人的证件,则添加此类证件,并设置为默认
				currentCert = new CrmEmployeeCert();
				currentCert.setCompanyid(user.getCompanyid());
				currentCert.setEmpid(Long.valueOf(eid));
				currentCert.setCerttype(certtype);
				currentCert.setCertificate(certno);
				currentCert.setBirthday(birthday);
				currentCert.setIsdefault(1);
				currentCert.setCreatetime(new Date());
				currentCert.setUsername(name);
			} else {
				// 说明此人有其他的证件
				for (CrmEmployeeCert crmEmployeeCert : certs) {
					// 判断当前证件是否已存在,如果存在
					if (crmEmployeeCert.getCerttype().equalsIgnoreCase(certtype)) {
						currentCert = crmEmployeeCert;
						break;
					}
				}
			}
			if (null == currentCert) {
				// 如果已存在类型没有
				currentCert = new CrmEmployeeCert();
				currentCert.setCompanyid(user.getCompanyid());
				currentCert.setEmpid(Long.valueOf(eid));
				currentCert.setCerttype(certtype);
				currentCert.setBirthday(birthday);
				currentCert.setCertificate(certno);
				currentCert.setIsdefault(1);
				currentCert.setCreatetime(new Date());
				currentCert.setUsername(name);
			} else {
				currentCert.setCertificate(certno);
				currentCert.setUsername(name);
				currentCert.setBirthday(birthday);
			}
			crmEmployeeCertService.saveOrUpdate(currentCert);
			crmEmployeeCertService.setDefaultCert(user.getCompanyid(), user.getId(), currentCert.getCerttype(), currentCert.getCertificate());
			employeeService.saveOrUpdate(emp);
		} catch (Exception e) {
			log.info("/crm/updatepass 验证账号或保存时出现异常!");
			return AuvgoResult.build(300, "更新异常!");
		}
		CrmEmployee employee = employeeService.getById(user.getCompanyid(), id);
		/** 为了给前台做适应统一字段 */
		employee.setUsername(employee.getName());
		return AuvgoResult.build(200, "修改成功!", JsonUtils.objectToJson(employee));


	}

	// TODO
	private boolean isDateStr(String date) {
		String regex = "[0-9]{4}-[0-9]{2}-[0-9]{2}";
		return date.matches(regex);
	}

	// 租车
	@RequestMapping("/rent/car")
	public String RentCar() {
		return "/DemandSheet/rentCar-demand";
	}

	@RequestMapping("/visa/demand")
	public String VisaDemand() {
		return "/DemandSheet/visa-demand";
	}

	@RequestMapping("/visa/create")
	@ResponseBody
	public AuvgoResult VisaCreate() {

		return AuvgoResult.build(200, "保存签证信息成功");
	}

	// 会议
	@RequestMapping("/metting/demand")
	public String MettingDemand() {
		return "/DemandSheet/metting-demand";
	}

	@RequestMapping("/metting/create")
	@ResponseBody
	public AuvgoResult MettingCreate() {

		return AuvgoResult.build(200, "保存会议信息成功");
	}

	/**
	 * 验证添加/修改 员工/常用联系人时对证件号的验证
	 *
	 * @param employee 员工信息
	 * @param linshi   临时乘客信息
	 * @param fun      添加/修改 1: 添加 2: 修改
	 * @return 0: 验证异常 1: 验证通过 11: 身份证号不合法 12: 其他证件不合法 13: 根据身份证号判断在12周岁以下 21:
	 * 员工添加时已存在 22: 员工修改时已存在 23: 员工已存在于常用联系人列表中 31: 常用联系人添加时已存在 32:
	 * 常用联系人修改时已存在 33: 常用联系人已是公司员工 41: 常用联系人数量已达30人
	 */
	private int valideParamLegitimate(CrmEmployee employee, CrmEmployee user, int fun) throws Exception {
		String certtype = null;
		String certno = null;
		if (employee != null) {
			certtype = employee.getCerttype();
			certno = employee.getCertno().trim();
			if (StringUtils.isBlank(certtype) || StringUtils.isBlank(certno)) {
				return 0;
			}
			// 验证证件号
			if ("1".equals(certtype)) {
				if (!IdCardUtils.validateCard(certno)) {
					return 11;
				}
				// 保存生日
				if (certno.length() >= 15) {
					employee.setBirthday(IdCardUtils.getBirthByIdCard(certno));
				}

				// 验证是否是儿童和婴儿
				/*
				 * if (!checkBirthdayIsNotChild(certno)) { return 13; }
				 */
			} else {
				if (certno.length() < 5 || certno.length() > 15) {
					return 12;
				}
				//通过ischina判断

			}
			// 验证是否在员工表中存在
			List<CrmEmployeeCert> certs = crmEmployeeCertService.exitCertno(certno, employee.getCompanyid());
			// 如果是新增
			if (fun == 1) {
				//证件姓名是否为中文
				if (StringUtils.isNotBlank(employee.getName()) && !com.auvgo.core.string.StringUtils.isContainsChinese(employee.getName())) {
					return 100;
				}
				if (certs.size() > 0) {
					return 21;
				}
				if (employeeService.exsistValue(employee.getCompanyid(), "accno", employee.getAccno())) {
					log.error("/crm/modifystaff error--> 员工工号已存在!");
					return 24;
				}
			} else {
				for (CrmEmployeeCert cert : certs) {
					if (cert.getEmpid().equals(employee.getId())) {
						continue;
					}
					return 22;
				}
			}
		} else {
			return 0;
		}
		return 1;
	}

	/**
	 * 获取审批规则
	 *
	 * @param pagenum
	 * @param pagesize
	 * @param keyword
	 * @return
	 */
	@RequestMapping("/getApproveAll")
	@ResponseBody
	public AuvgoResult getApprove(String pagenum, String pagesize, String keyword) {
		CrmEmployee user = getUser();
		if (null == user) {
			return AuvgoResult.build(300, "获取登录人信息出现异常");
		}
		if (null == keyword) {
			return AuvgoResult.build(300, "参数不能为空");
		}
		try {
			int pageNum = StringUtils.isBlank(pagenum) ? 1 : Integer.parseInt(pagenum);
			int pageSize = StringUtils.isBlank(pagesize) ? 5 : Integer.parseInt(pagesize);
			String SqlWhere = "";
			if (StringUtils.isNotBlank(keyword)) {
				SqlWhere = " name like'%" + keyword + "%'";
			}
			PageInfo<CrmApprove> apprveList = crmApproveService.findNewPageByForAPP(pageNum, pageSize, user.getCompanyid(), SqlWhere);
			CrmApprove crmApprove = new CrmApprove();
			crmApprove.setId(0L);
			crmApprove.setName("无需审批");
			List<CrmApprove> crmapprove = apprveList.getList();
			crmapprove.add(0, crmApprove);

			return AuvgoResult.build(ErrorCode.SUCCESS, ErrorCode.getMsg(ErrorCode.SUCCESS), JsonUtils.objectToJson(apprveList));
		} catch (NumberFormatException e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "查询审批规则出现异常");
	}

	/**
	 * 模糊查询国家
	 *
	 * @param keyword
	 * @param index
	 * @param size
	 * @return
	 */
	@RequestMapping("/country")
	@ResponseBody
	public AuvgoResult searchQuery(String keyword, Integer index, Integer size) {
		Map<String, Object> map = new HashMap<String, Object>();
		Page<Country> page = new Page<Country>(index == null ? 1 : index, size == null ? 15 : size);
		try {
			page = iBaseBusiness.findCountryPageKeyword(page, keyword);
			map.put("page", page);
			map.put("keyword", keyword);
		} catch (Exception e) {
			log.error("searchQuery error", e);
		}
		return AuvgoResult.build(200, "success", JsonUtils.objectToJson(map));
	}
}
