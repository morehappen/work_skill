package com.auvgo.web.face.order;

import com.auvgo.air.api.AirGaiQianService;
import com.auvgo.air.api.AirInternationalXuqiudanService;
import com.auvgo.air.api.AirOrderNoshowService;
import com.auvgo.air.api.AirOrderService;
import com.auvgo.air.api.AirTuiPiaoService;
import com.auvgo.air.entity.*;
import com.auvgo.core.contant.*;
import com.auvgo.core.query.QueryFilter;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.DateUtil;
import com.auvgo.core.utils.DateUtils;
import com.auvgo.core.utils.IdCardUtils;
import com.auvgo.core.utils.JsonUtils;
import com.auvgo.core.utils.Md5Sign;
import com.auvgo.core.utils.ValidFormResult;
import com.auvgo.crm.api.*;
import com.auvgo.crm.entity.*;
import com.auvgo.hotel.api.HotelOrderService;
import com.auvgo.hotel.entity.HotelOrder;
import com.auvgo.hotel.entity.HotelOrderApprove;
import com.auvgo.hotel.entity.HotelOrderRemark;
import com.auvgo.sys.api.SysOperationNoteService;
import com.auvgo.sys.entity.SysOperationNote;
import com.auvgo.train.api.TrainGaiqianOrderService;
import com.auvgo.train.api.TrainOrderService;
import com.auvgo.train.api.TrainTuipiaoService;
import com.auvgo.train.entity.*;
import com.auvgo.web.face.BaseController;
import com.auvgo.web.model.HotelPolicyBean;
import com.github.pagehelper.PageInfo;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/myChailv")
public class MyChailvController extends BaseController {
	@SuppressWarnings("unused")
	private static final String Sqlwhere = null;
	protected Logger log = LoggerFactory.getLogger(getClass());
	@Autowired
	private CrmPolicyTrainService policyTrainService;
	@Autowired
	private CrmPolicyService policyService;
	@Autowired
	private CrmPolicyHotelService policyHotelService;
	@Autowired
	private CrmEmployeeService employeeService;
	@Autowired
	private CrmCompanyService companyService;
	@Autowired
	private CrmCostCenterService crmCostCenterService;
	@Autowired
	private CrmProjectService crmProjectService;
	@Autowired
	private AirOrderService airOrderService;
	@Autowired
	private AirTuiPiaoService airTuiPiaoService;
	@Autowired
	private AirGaiQianService airGaiQianService;
	@Autowired
	private AirInternationalXuqiudanService airInternationalXuqiudanService;
	@Autowired
	private TrainOrderService trainOrderService;
	@Autowired
	private TrainTuipiaoService trainTuipiaoService;
	@Autowired
	private TrainGaiqianOrderService trainGaiqianOrderService;
	@Autowired
	private HotelOrderService hotelOrderService;
	@Autowired
	private CrmAppformService crmAppformService;
	@Autowired
	private CrmDepartmentService crmDepartmentService;
	@Autowired
	private SysOperationNoteService noteService;
	@Autowired
	private AirOrderNoshowService airOrderNoshowService;
	@Autowired
	CrmEmployeeService crmEmployeeService;

	/**
	 * 获取个人差旅信息（机票、酒店、火车票等） {"cid":"1","level":"员工职级"}
	 *
	 * @return
	 */
	@RequestMapping(value = "")
	public String getTravelinfo() {
		try {
			CrmCompany company = getCompany();
			CrmEmployee user = getUser();

			if (null == company || null == company.getId() || null == user) {
				return "redirect:/login";
			}
			String level = user.getZhiwei();
			String companyid = company.getId().toString();
			String airPolicyStr = policyService
					.getCompanyPolicyByEmployeeLevel(companyid,
							Lists.newArrayList(level));
			if (airPolicyStr.equals("201") || airPolicyStr.equals("202")) {
				setAttr("mairPolicy", null);
			} else {
				CrmPolicy airPolicy = JsonUtils.jsonToPojo(airPolicyStr,
						CrmPolicy.class);
				setAttr("mairPolicy", airPolicy);
			}

			String trainPolicyStr = policyTrainService
					.getCompanyPolicyByEmployeeLevel(companyid,
							Lists.newArrayList(level));
			if (trainPolicyStr.equals("201") || trainPolicyStr.equals("202") || trainPolicyStr.equals("2021")) {
				setAttr("mtrainPolicy", null);
			} else {
				CrmPolicyTrain trainPolicy = JsonUtils.jsonToPojo(
						trainPolicyStr, CrmPolicyTrain.class);
				Map<String, String> mapTrain = new HashMap<String, String>();
				mapTrain.put("9", "商务座");
				mapTrain.put("P", "特等座");
				mapTrain.put("M", "一等座");
				mapTrain.put("O", "二等座");
				mapTrain.put("6", "高级软卧");
				mapTrain.put("4", "软卧");
				mapTrain.put("3", "硬卧");
				mapTrain.put("2", "软座");
				mapTrain.put("1", "硬座");

				String gaotie = trainPolicy.getGaotie();
				String[] gaotieArray = gaotie.split("/");
				String gaotieZ = "";
				for (int i = 0; i < gaotieArray.length; i++) {
					gaotieZ += mapTrain.get(gaotieArray[i]) + ",";

				}

				String donche = trainPolicy.getDonche();
				String[] doncheArray = donche.split("/");
				String doncheZ = "";
				for (int i = 0; i < doncheArray.length; i++) {
					doncheZ += mapTrain.get(doncheArray[i]) + ",";
				}

				String pukuai = trainPolicy.getPukuai();
				String[] pukuaiArray = pukuai.split("/");
				String pukuaiZ = "";
				for (int i = 0; i < pukuaiArray.length; i++) {
					pukuaiZ += mapTrain.get(pukuaiArray[i]) + ",";

				}
				gaotieZ = StringUtils.removeEnd(gaotieZ, ",");
				doncheZ = StringUtils.removeEnd(doncheZ, ",");
				pukuaiZ = StringUtils.removeEnd(pukuaiZ, ",");
				trainPolicy.setGaotie(gaotieZ.equals("null") ? null : gaotieZ);
				trainPolicy.setDonche(doncheZ.equals("null") ? null : doncheZ);
				trainPolicy.setPukuai(pukuaiZ.equals("null") ? null : pukuaiZ);
				setAttr("mtrainPolicy", trainPolicy);
			}

			String hotelPolicyStr = policyHotelService
					.getCompanyPolicyByEmployeeLevel(companyid,
							Lists.newArrayList(level), "");
			if (hotelPolicyStr.equals("201") || hotelPolicyStr.equals("202")) {
				setAttr("mhotelPolicy", null);
			} else {
				HotelPolicyBean hotelPolicy = JsonUtils.jsonToPojo(
						hotelPolicyStr, HotelPolicyBean.class);
				setAttr("mhotelPolicy", hotelPolicy.getPolicy());
			}

			return "my-chailv";
		} catch (Exception e) {
			return "redirect:/crm";
		}
	}

	@RequestMapping("/modifypersonalinfor")
	public String toEditpersonalinfor() {
		return "/crm/my-chailv/modify-personal-infor";
	}

	@RequestMapping(value = "/save", method = RequestMethod.POST)
	@ResponseBody
	public ValidFormResult save(CrmEmployee employee) {
		try {
			String certno = employee.getCertno();
			String password = employee.getPassword();
			CrmEmployee emplo = employeeService.getById(
					employee.getCompanyid(), employee.getId());
			if (employee.getCerttype().equals("1")) {
				boolean validateCard = IdCardUtils.validateCard(certno);
				if (validateCard) {
					if (null != employee.getId()
							&& StringUtils.isNotBlank(password)) {
						// 处理用户名和密码
						CrmCompany company = companyService.getById(employee
								.getCompanyid());
						if (!emplo.getPassword().equalsIgnoreCase(password)) {// 前台用户改了密码
							employee.setPassword(Md5Sign.MD5Encode(
									employee.getUsername()
											+ company.getBianhao()
											.toUpperCase() + password)
									.toUpperCase());
						}
					}
					if (null == employee.getId()) {
						Integer exitCertno = employeeService.exitCertno(certno,
								employee.getCompanyid());
						if (exitCertno > 0) {
							return ValidFormResult
									.error("身份证号码重复,请不要输入重复的身份证号");
						}
					} else {// 更新员工信息时候
						if (null != emplo.getCertno()) {
							if (!emplo.getCertno().equalsIgnoreCase(
									employee.getCertno())) {// 2次身份证号不一样,校验身份证号是否存在
								Integer exitCertno = employeeService
										.exitCertno(certno,
												employee.getCompanyid());
								if (exitCertno > 0) {
									return ValidFormResult
											.error("身份证号码重复,请不要输入重复的身份证号");
								}
							}
						}
					}
				} else {
					return ValidFormResult.error("身份证号码有误,请检验是否有空格");
				}
			} else {
				// 验证护照
				if (certno != null && certno != "") {
					if (null != employee.getId()
							&& StringUtils.isNotBlank(password)) {
						// 处理用户名和密码
						CrmCompany company = companyService.getById(employee
								.getCompanyid());
						if (!emplo.getPassword().equalsIgnoreCase(password)) {// 前台用户改了密码
							employee.setPassword(Md5Sign.MD5Encode(
									employee.getUsername()
											+ company.getBianhao()
											.toUpperCase() + password)
									.toUpperCase());
						}
					}
					if (null == employee.getId()) {
						Integer exitCertno = employeeService.exitCertno(certno,
								employee.getCompanyid());
						if (exitCertno > 0) {
							return ValidFormResult.error("护照号码重复,请不要输入重复的护照号码");
						}
					} else {// 更新员工信息时候
						if (null != emplo.getPassportno()) {
							if (!emplo.getPassportno().equalsIgnoreCase(
									employee.getPassportno())) {// 2次护照不一样,校验护照是否存在
								Integer exitCertno = employeeService
										.exitCertno(certno,
												employee.getCompanyid());
								if (exitCertno > 0) {
									return ValidFormResult
											.error("护照号码重复,请不要输入重复的护照号码");
								}
							}
						}
					}
				} else {
					return ValidFormResult.error("护照号码有误,请检验是否有空格");
				}
			}

			employeeService.saveOrUpdate(employee);
			if (null != employee && null != employee.getId()) {
				CrmEmployee user = getUser();
				CrmCompany company = companyService.getById(user.getCompanyid());
				SysOperationNote sysOperationNote = new SysOperationNote(user.getId(), user.getName(),
						user.getDeptname(), new Date(), "修改员工" + employee.getName() + "信息", company.getId(),
						company.getSimpname(), "修改员工信息");
				noteService.saveOrUpdate(sysOperationNote);
			}
			CrmEmployee user = employeeService.getById(employee.getCompanyid(),
					employee.getId());
			setSessionAttr("user", user);
			return ValidFormResult.ok();

		} catch (Exception e) {
			e.printStackTrace();
			log.debug("/myChailv/save-->" + e.getMessage());
			return ValidFormResult.error("保存员工失败");
		}
	}

	@RequestMapping("/toAirOrder")
	public String toAirOrder(@RequestParam(defaultValue = "1") Integer pageNum,
							 Integer pageSize, HttpServletRequest request) {
		pageSize = null == pageSize ? PAGE_SIZE.intValue() : pageSize;
		QueryFilter filter = new QueryFilter();
		Map<String, Object> extraParams = initBaseParams();
		// 查询数据
		PageInfo<Map<String, Object>> page = airOrderService.findPageByAndEmpLevel(pageNum, pageSize, filter.buildSql(request), extraParams);
		List<Map<String, Object>> list = page.getList();
		Map<String, String> bzMap = Maps.newHashMap();
		for (Map<String, Object> map : list) {
			String orderno = map.get("orderno").toString();
			Integer s = airOrderService.getRemarkListByOrderno(orderno);
			if (s > 0) {
				bzMap.put(orderno, "1");
			} else {
				bzMap.put(orderno, "0");
			}
		}
		CrmCompany company = getCompany();
		// 将成本中心查出来并setAttr();
		List<CrmCostCenter> costCenters = crmCostCenterService
				.getListBycid(company.getId());
		setAttr("costCenters", costCenters);
		// 将项目有查出来并setAttr();
		List<CrmProject> projects = crmProjectService.getListBycid(company
				.getId());
		setAttr("projects", projects);

		setAttr("bzFlag", bzMap);
		setAttr("page", page);
		setAttr("statusUtil", new AuvStatusContant());
		setAttr("airUtils", new AirStatusContant());
		setAttr("baseStatus", new BaseStatusContant());
		setAttr("pageSize", pageSize);

		// 用于数据回显
		String dateType = (String) request.getParameter("dateType");
		if (!(null == dateType || "".equals(dateType))) {
			setAttr("dateType", dateType);
			if ("createtime".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_orders_createtime"));
				setAttr("LTE_date", getAttr("q_LTE_orders_createtime"));
			} else if ("deptdate".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_routes_deptdate"));
				setAttr("LTE_date", getAttr("q_LTE_routes_deptdate"));
			}
		}
		return "/crm/my-chailv/air-order";
	}

	@RequestMapping("/toNewAirOrder/{type}")
	public String toNewAirOrder(@RequestParam(defaultValue = "1") Integer pageNum,
								Integer pageSize, @PathVariable("type") String type, HttpServletRequest request) {
		pageSize = null == pageSize ? PAGE_SIZE.intValue() : pageSize;
		QueryFilter filter = new QueryFilter();
		Map<String, Object> extraParams = initBaseParams();
		// type必须传,否则会报空指针异常
		extraParams.put("type", type);
		PageInfo<Map<String, Object>> page = airOrderService.findPageByEmpLevel(pageNum, pageSize, filter.buildSql(request), extraParams);
		if (null == page) {
			setAttr("Msg", "您访问的页面飞到火星去了,我们帮您把它找回~");
			return "/common/404";
		}
		// 查询数据
		List<Map<String, Object>> list = page.getList();
		Map<String, String> bzMap = Maps.newHashMap();
		for (Map<String, Object> map : list) {
			String orderno = map.get("orderno").toString();
			Integer s = airOrderService.getRemarkListByOrderno(orderno);
			if (s > 0) {
				bzMap.put(orderno, "1");
			} else {
				bzMap.put(orderno, "0");
			}
		}
		CrmCompany company = getCompany();
		// 将成本中心查出来并setAttr();
		List<CrmCostCenter> costCenters = crmCostCenterService
				.getListBycid(company.getId());
		setAttr("costCenters", costCenters);
		// 将项目有查出来并setAttr();
		List<CrmProject> projects = crmProjectService.getListBycid(company.getId());
		setAttr("projects", projects);
		setAttr("bzFlag", bzMap);
		setAttr("page", page);
		setAttr("statusUtil", new AuvStatusContant());
		setAttr("airUtils", new AirStatusContant());
		setAttr("baseStatus", new BaseStatusContant());
		setAttr("pageSize", pageSize);

		// 用于数据回显
		String dateType = (String) request.getParameter("dateType");
		if (!(null == dateType || "".equals(dateType))) {
			setAttr("dateType", dateType);
			if ("createtime".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_orders_createtime"));
				setAttr("LTE_date", getAttr("q_LTE_orders_createtime"));
			} else if ("deptdate".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_routes_deptdate"));
				setAttr("LTE_date", getAttr("q_LTE_routes_deptdate"));
			}
		} else {
			setAttr("dateType", "createtime");
		}

		boolean prePayCompany = FenxiaostatusContant.isPrePayCompany(company.getServerNo());
		if (prePayCompany) {
			setAttr("fengxiaoFlag", "1");
		} else {
			setAttr("fengxiaoFlag", "2");
		}
		return "/crm/my-chailv/air-order";
	}
	@RequestMapping("/toNoshowAirOrder/{type}")
	public String toNoshowAirOrder(@RequestParam(defaultValue = "1") Integer pageNum,
			Integer pageSize, @PathVariable("type") String type, HttpServletRequest request) {
		pageSize = null == pageSize ? PAGE_SIZE.intValue() : pageSize;
		// 拼接查询参数
		String buildSql="";
		Map<String, Object> sqlParam = Maps.newHashMap();
		buildNoShowSql(request,sqlParam);
		CrmCompany company = getCompany();
		sqlParam.put("q_EQ_orders.companyid", company.getId());
		CrmEmployee employee = getUser();
		QueryFilter filter = new QueryFilter();
		if("all".equals(type)){
			String checkLevel = checkLevel(sqlParam, company.getId(), employee.getId());
			buildSql = filter.buildSQL(sqlParam);
			if(checkLevel!=null){
				buildSql+=checkLevel;
			}
		}else{
			buildSql = filter.buildSQL(sqlParam);
			buildSql+=" and ( (users.mid="+employee.getId()+" and users.type='0' ) or orders.bookuserid="+employee.getId()+")";
		}
		PageInfo<AirOrderNoshow> page = airOrderNoshowService.findPageBy(pageNum, pageSize, buildSql);
		if (null == page) {
			setAttr("Msg", "您访问的页面飞到火星去了,我们帮您把它找回~");
			return "/common/404";
		}
		setAttr("tag", "airNoShow");
		setAttr("statusUtil", new AuvStatusContant());
		setAttr("airUtils", new AirStatusContant());
		setAttr("baseStatus", new BaseStatusContant());
		setAttr("page", page);
		setAttr("pageSize", pageSize);
		return "/crm/my-chailv/air-order-noshow-list";
	}
	@RequestMapping("/toAirTuiOrder")
	public String toAiTuirOrder(
			@RequestParam(defaultValue = "1") Integer pageNum,
			Integer pageSize, HttpServletRequest request) {
		CrmEmployee user = getUser();
		pageSize = null == pageSize ? PAGE_SIZE.intValue() : pageSize;
		QueryFilter filter = new QueryFilter();
		Map<String, Object> extraParams = initBaseParams();

		extraParams.put("tjuserid", user.getId());
		// 查询数据
		PageInfo<Map<String, Object>> page = airTuiPiaoService.findPageByAndEmpLevel(pageNum, pageSize, filter.buildSql(request), extraParams);

		List<Map<String, Object>> list = page.getList();
		Map<String, String> bzMap = Maps.newHashMap();
		for (Map<String, Object> map : list) {
			String orderno = (String) map.get("orderno");
			Integer s = airOrderService.getRemarkListByOrderno(orderno);
			if (s > 0) {
				bzMap.put(orderno, "1");
			} else {
				bzMap.put(orderno, "0");
			}

		}

		CrmCompany company = getCompany();
		// 将成本中心查出来并setAttr();
		List<CrmCostCenter> costCenters = crmCostCenterService
				.getListBycid(company.getId());
		setAttr("costCenters", costCenters);
		// 将项目有查出来并setAttr();
		List<CrmProject> projects = crmProjectService.getListBycid(company
				.getId());
		setAttr("projects", projects);

		setAttr("bzFlag", bzMap);
		setAttr("page", page);
		setAttr("statusUtil", new AuvStatusContant());
		setAttr("airUtils", new AirStatusContant());
		setAttr("baseStatus", new BaseStatusContant());
		setAttr("pageSize", pageSize);
		// 用于数据回显
		String dateType = (String) request.getParameter("dateType");
		if (!(null == dateType || "".equals(dateType))) {
			setAttr("dateType", dateType);
			if ("tuipiaotime".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_tuipiao_createtime"));
				setAttr("LTE_date", getAttr("q_LTE_tuipiao_createtime"));
			} else if ("deptdate".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_routes_deptdate"));
				setAttr("LTE_date", getAttr("q_LTE_routes_deptdate"));
			}
		}
		return "/crm/my-chailv/air-refund";
	}

	@RequestMapping("/toNewAirTuiOrder/{type}")
	public String toNewAiTuirOrder(@RequestParam(defaultValue = "1") Integer pageNum, Integer pageSize, @PathVariable("type") String type, HttpServletRequest request) {
		pageSize = null == pageSize ? PAGE_SIZE.intValue() : pageSize;
		QueryFilter filter = new QueryFilter();
		Map<String, Object> extraParams = initBaseParams();
		extraParams.put("type", type);
		// 查询数据
		// PageInfo<Map<String, Object>> page = airTuiPiaoService.findPageByAndEmpLevel(pageNum, pageSize, filter.buildSql(request), extraParams);
		PageInfo<Map<String, Object>> page = airTuiPiaoService.findPageByEmpLevel(pageNum, pageSize, filter.buildSql(request), extraParams);
		if (null == page) {
			setAttr("Msg", "迷失儿童被人贩带走,我们会速速追回~");
			return "/common/404";
		}
		List<Map<String, Object>> list = page.getList();
		Map<String, String> bzMap = Maps.newHashMap();
		for (Map<String, Object> map : list) {
			String orderno = (String) map.get("orderno");
			Integer s = airOrderService.getRemarkListByOrderno(orderno);
			if (s > 0) {
				bzMap.put(orderno, "1");
			} else {
				bzMap.put(orderno, "0");
			}

		}

		CrmCompany company = getCompany();
		// 将成本中心查出来并setAttr();
		List<CrmCostCenter> costCenters = crmCostCenterService
				.getListBycid(company.getId());
		setAttr("costCenters", costCenters);
		// 将项目有查出来并setAttr();
		List<CrmProject> projects = crmProjectService.getListBycid(company
				.getId());
		setAttr("projects", projects);

		setAttr("bzFlag", bzMap);
		setAttr("page", page);
		setAttr("statusUtil", new AuvStatusContant());
		setAttr("airUtils", new AirStatusContant());
		setAttr("baseStatus", new BaseStatusContant());
		setAttr("pageSize", pageSize);
		// 用于数据回显
		String dateType = (String) request.getParameter("dateType");
		if (!(null == dateType || "".equals(dateType))) {
			setAttr("dateType", dateType);
			if ("tuipiaotime".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_tuipiao_createtime"));
				setAttr("LTE_date", getAttr("q_LTE_tuipiao_createtime"));
			} else if ("deptdate".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_routes_deptdate"));
				setAttr("LTE_date", getAttr("q_LTE_routes_deptdate"));
			}
		}
		return "/crm/my-chailv/air-refund";
	}

	@RequestMapping("/toAirGaiOrder")
	public String toAirGaiOrder(@RequestParam(defaultValue = "1") Integer pageNum, Integer pageSize, HttpServletRequest request) {
		pageSize = null == pageSize ? PAGE_SIZE.intValue() : pageSize;
		QueryFilter filter = new QueryFilter();
		CrmEmployee user = getUser();
		Map<String, Object> extraParams = initBaseParams();
		extraParams.put("tjuserid", user.getId());
		// 查询数据
		PageInfo<Map<String, Object>> page = airGaiQianService.findPageByAndEmpLevel(pageNum, pageSize, filter.buildSql(request), extraParams);

		List<Map<String, Object>> list = page.getList();
		Map<String, String> bzMap = Maps.newHashMap();
		for (Map<String, Object> map : list) {
			String orderno = (String) map.get("orderno");
			Integer s = airOrderService.getRemarkListByOrderno(orderno);
			if (s > 0) {
				bzMap.put(orderno, "1");
			} else {
				bzMap.put(orderno, "0");
			}
		}
		CrmCompany company = getCompany();
		// 将成本中心查出来并setAttr();
		List<CrmCostCenter> costCenters = crmCostCenterService
				.getListBycid(company.getId());
		setAttr("costCenters", costCenters);
		// 将项目有查出来并setAttr();
		List<CrmProject> projects = crmProjectService.getListBycid(company
				.getId());
		setAttr("projects", projects);

		setAttr("bzFlag", bzMap);
		setAttr("page", page);
		setAttr("statusUtil", new AuvStatusContant());
		setAttr("airUtils", new AirStatusContant());
		setAttr("baseStatus", new BaseStatusContant());
		setAttr("pageSize", pageSize);
		// 用于数据回显
		String dateType = (String) request.getParameter("dateType");
		if (!(null == dateType || "".equals(dateType))) {
			setAttr("dateType", dateType);
			if ("gaiqiantime".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_gaiqian_createtime"));
				setAttr("LTE_date", getAttr("q_LTE_gaiqian_createtime"));
			} else if ("deptdate".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_routes_deptdate"));
				setAttr("LTE_date", getAttr("q_LTE_routes_deptdate"));
			}
		}
		return "/crm/my-chailv/air-endrose";
	}

	@RequestMapping("/toNewAirGaiOrder/{type}")
	public String toNewAirGaiOrder(@RequestParam(defaultValue = "1") Integer pageNum, Integer pageSize, @PathVariable("type") String type, HttpServletRequest request) {
		pageSize = null == pageSize ? PAGE_SIZE.intValue() : pageSize;
		QueryFilter filter = new QueryFilter();
		Map<String, Object> extraParams = initBaseParams();
		extraParams.put("type", type);
		// 查询数据
		// PageInfo<Map<String, Object>> page = airGaiQianService.findPageByAndEmpLevel(pageNum, pageSize, filter.buildSql(request), extraParams);
		PageInfo<Map<String, Object>> page = airGaiQianService.findPageByEmpLevel(pageNum, pageSize, filter.buildSql(request), extraParams);
		if (null == page) {
			setAttr("Msg", "啥?风把我们的网页刮跑了?我这就去把它找回~");
			return "/common/404";
		}
		List<Map<String, Object>> list = page.getList();
		Map<String, String> bzMap = Maps.newHashMap();
		for (Map<String, Object> map : list) {
			String orderno = (String) map.get("orderno");
			Integer s = airOrderService.getRemarkListByOrderno(orderno);
			if (s > 0) {
				bzMap.put(orderno, "1");
			} else {
				bzMap.put(orderno, "0");
			}
		}
		CrmCompany company = getCompany();
		// 将成本中心查出来并setAttr();
		List<CrmCostCenter> costCenters = crmCostCenterService
				.getListBycid(company.getId());
		setAttr("costCenters", costCenters);
		// 将项目有查出来并setAttr();
		List<CrmProject> projects = crmProjectService.getListBycid(company
				.getId());
		setAttr("projects", projects);

		setAttr("bzFlag", bzMap);
		setAttr("page", page);
		setAttr("statusUtil", new AuvStatusContant());
		setAttr("airUtils", new AirStatusContant());
		setAttr("baseStatus", new BaseStatusContant());
		setAttr("pageSize", pageSize);
		// 用于数据回显
		String dateType = (String) request.getParameter("dateType");
		if (!(null == dateType || "".equals(dateType))) {
			setAttr("dateType", dateType);
			if ("gaiqiantime".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_gaiqian_createtime"));
				setAttr("LTE_date", getAttr("q_LTE_gaiqian_createtime"));
			} else if ("deptdate".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_routes_deptdate"));
				setAttr("LTE_date", getAttr("q_LTE_routes_deptdate"));
			}
		}
		return "/crm/my-chailv/air-endrose";
	}

	@RequestMapping("/toAirOrderDetail/{airOrderId}")
	public String toAirOrderDetail(@PathVariable("airOrderId") String airOrderId) {
		String isnoshow = request.getParameter("isnoshow"); 
		setAttr("isnoshow",isnoshow);	
		Boolean isover=false;
		AirOrder airOrder = airOrderService.getOrderByorderNo(airOrderId);
		if(airOrder.getChupiaotime()!=null){
		 Date overDate = DateUtil.getAroundDate(airOrder.getChupiaotime(), 1);//过期日期
		 int result = DateUtils.compareToTime(new Date(), overDate);
		 if(result==1){
			 isover=true;
		 }
		}
		 setAttr("isover", isover);
		 Boolean ishowtg=false;
		List<AirOrderRoute> routelist = airOrder.getRoutes();
		List<AirOrderPassenger> passengers = airOrder.getPassengers();
		List<AirOrderApprove> approves = airOrder.getApproves();
		List<AirOrderRoutePass> routePass = airOrder.getRoutePass();
		Map<String,AirOrderRoutePass> distinkRp=new HashMap<>();
		//获取票号数量
		if(routePass!=null&&routePass.size()>0){
			AirOrderRoutePass pass = routePass.get(0);
			String piaohao = pass.getPiaohao();
			if(StringUtils.isNotEmpty(piaohao)&&piaohao.indexOf(",")>0){
				setAttr("isManyph",piaohao.split(",").length);	
			}
			if(pass.getTuipiaostatus()!=2){
				ishowtg=true;
			}
			//国际票
			if(airOrder.getTickettype()==1){
				List<AirOrderRoutePass> rps=new ArrayList<>();
			for(AirOrderRoutePass rp :routePass){
				if(StringUtils.isNotEmpty(rp.getPiaohao())&&distinkRp.get(rp.getPiaohao())==null){
					distinkRp.put(rp.getPiaohao(),rp);
					rps.add(rp);
				}
			}
			routePass=rps;
			}
		}
		setAttr("ishowtg",ishowtg);	
		AirOrderPayment payment = airOrderService.getPayment(airOrderId);
		AirOrderRemark orderremark = new AirOrderRemark();
		orderremark.setOrderno(airOrderId);
		List<AirOrderLog> orderLogList = null;
		for (int i = 0; i < passengers.size(); i++) {

			passengers.get(i).setBxCode(routePass.get(i).getBxCode());
			passengers.get(i).setBxName(routePass.get(i).getBxName());
		}
		setAttr("routePass", routePass);
		setAttr("userlist", passengers);
		setAttr("routelist", routelist);
		setAttr("airOrder", airOrder);
		int size = routePass.size();
		Double total = routePass.get(0).getTotalprice() * size;//总价
		Double price = routePass.get(0).getPrice() * size;//总票价
		Double airporttax = routePass.get(0).getAirporttax() * size;
		Double bxPayMoney = routePass.get(0).getBxPayMoney() * size;
		Double fuwufei = routePass.get(0).getFuwufee() * size;
		DecimalFormat df = new DecimalFormat("#.00");
		String totalformat = null;
		String priceformat = null;
		String airporttaxformat = null;
		String bxPayMoneyformat = null;
		String fuwufeiformat = null;
		if (total != 0.0) {
			totalformat = df.format(total);
		} else {
			totalformat = "0.0";
		}
		if (price != 0.0) {
			priceformat = df.format(price);
		} else {
			priceformat = "0.0";
		}
		if (airporttax != 0.0) {
			airporttaxformat = df.format(airporttax);
		} else {
			airporttaxformat = "0.0";
		}
		if (bxPayMoney != 0.0) {
			bxPayMoneyformat = df.format(bxPayMoney);
		} else {
			bxPayMoneyformat = "0.0";
		}
		if (fuwufei != 0.0) {
			fuwufeiformat = df.format(fuwufei);
		} else {
			fuwufeiformat = "0.0";
		}
		if (!FenxiaostatusContant.isPrePayCompany(airOrder.getServerNo())) {
			setAttr("fenxiaoFlag", "1");
		}
		setAttr("YinPaytotal", totalformat);
		setAttr("priceformat", priceformat);
		setAttr("airporttaxformat", airporttaxformat);
		setAttr("bxPayMoneyformat", bxPayMoneyformat);
		setAttr("fuwufeiformat", fuwufeiformat);
		setAttr("payment", payment);
		setAttr("statusUtil", new AuvStatusContant());
		setAttr("airUtil", new AirStatusContant());
		setAttr("baseUtil", new BaseStatusContant());
		setAttr("orderLogList", orderLogList);
		setAttr("approveMap", getAirShenpiMap(approves));
		setAttr("approvestatus", airOrder.getApprovestatus());
		return "/crm/my-chailv/air-order-detail";
	}

	@RequestMapping("/toAirRefundDetail/{airOrderId}")
	public String toAirRefundDetail(@PathVariable("airOrderId") String airOrderId) {
		AirTuipiao tuipiaoOrder = airTuiPiaoService.getTuipiaoByTpOrderNo(airOrderId);
		AirOrder airOrder = airOrderService.getOrderByorderNo(tuipiaoOrder.getOldorderno());
		List<AirOrderRoutePass> routePass = airOrder.getRoutePass();
		setAttr("tuipiaoOrder", tuipiaoOrder);
		setAttr("airUtil", new AirStatusContant());
		// 计算退款总金额和退款手续费
		List<AirTuipiaoPassenger> passengers = tuipiaoOrder.getTuipiaoPassengers();
		// 保险，以后保险跟人后，要遍历所有的乘客
		Double bxPayMoney = 0.0;
		// 退票手续费
		Double tuiPrice = 0.0;
		for (AirTuipiaoPassenger pass : passengers) {
			bxPayMoney += pass.getBxPayMoney() == null ? 0.0 : pass.getBxPayMoney();
			if (pass.getKhYinkou() != null) {
				tuiPrice += pass.getKhYinkou();
			}
		}
		// 机建燃油费
		Double tax = 0.0;
		List<AirOrderRoute> routes = tuipiaoOrder.getRoutes();
		for (AirOrderRoute route : routes) {
			if (null != route.getAirporttax()) {
				tax += route.getAirporttax();
			}
			if (null != route.getFueltax()) {
				tax += route.getFueltax();
			}
		}
		tax *= passengers.size();
		// 总退票价
		Double total = passengers.get(0).getPrice() * passengers.size() - tuiPrice + tax + bxPayMoney;
		setAttr("airOrder", airOrder);
		setAttr("routePass", routePass);
		setAttr("tuiPrice", tuiPrice);
		setAttr("tuiTotal", total);
		setAttr("approvestatus", tuipiaoOrder.getApprovestatus());
		return "/crm/my-chailv/air-refund-detail";
	}

	@RequestMapping("/toAirEndroseDetail/{gaiOrderId}")
	public String toAirEndroseDetail(@PathVariable("gaiOrderId") String gaiOrderId) {
		AirGaiqian gaiqianOrder = airGaiQianService.getGaiqianByGqOrderNo(gaiOrderId);
		String orderno = gaiqianOrder.getOldorderno();
		AirOrder airOrder = airOrderService.getOrderByorderNo(orderno);
		List<AirOrderRoutePass> routePass = airOrder.getRoutePass();
		setAttr("routePass", routePass);
		for (AirOrderRoutePass airOrderRoutePass : routePass) {
			if (StringUtils.isNotBlank(airOrderRoutePass.getBxName())) {
				setAttr("bxFlag", 1);
				break;
			}
		}
		List<AirOrderRoute> routes = airOrder.getRoutes();
		setAttr("orgcityname", routes.get(0).getOrgcityname());
		setAttr("dstcityname", routes.get(0).getDstcityname());
		setAttr("gaiqianOrder", gaiqianOrder);
		setAttr("airOrder", airOrder);
		setAttr("airUtil", new AirStatusContant());
		setAttr("approveMap", getAirShenpiMap(gaiqianOrder.getApproves()));
		setAttr("approvestatus", gaiqianOrder.getApprovestatus());
		return "/crm/my-chailv/air-endrose-detail";
	}

	@RequestMapping("/toTrainOrder")
	public String toTrainOrder(@RequestParam(defaultValue = "1") Integer pageNum, Integer pageSize, HttpServletRequest request) {
		pageSize = null == pageSize ? PAGE_SIZE.intValue() : pageSize;
		QueryFilter filter = new QueryFilter();
		Map<String, Object> extraParams = initBaseParams();
		// 查询数据
		PageInfo<Map<String, Object>> page = trainOrderService.findPageByAndEmpLevel(pageNum, pageSize, filter.buildSql(request), extraParams);

		List<Map<String, Object>> list = page.getList();
		Map<String, String> bzMap = Maps.newHashMap();
		for (Map<String, Object> map : list) {
			String orderno = (String) map.get("orderno");
			Integer s = trainOrderService.getRemarkListByOrdernoCount(orderno);
			if (s > 0) {
				bzMap.put(orderno, "1");
			} else {
				bzMap.put(orderno, "0");
			}
		}
		CrmCompany company = getCompany();
		// 将成本中心查出来并setAttr();
		List<CrmCostCenter> costCenters = crmCostCenterService
				.getListBycid(company.getId());
		setAttr("costCenters", costCenters);
		// 将项目有查出来并setAttr();
		// 这个选项在飞机票中会出现,但是在火车票中暂未出现,因此,在此处先备注,以备后用
		/*List<CrmProject> projects = crmProjectService.getListBycid(company
				.getId());
		setAttr("projects", projects);*/

		setAttr("bzFlag", bzMap);
		setAttr("page", page);
		setAttr("statusUtil", new AuvStatusContant());
		setAttr("airUtils", new AirStatusContant());
		setAttr("baseStatus", new BaseStatusContant());
		setAttr("pageSize", pageSize);
		// 用于数据回显
		String dateType = (String) request.getParameter("dateType");
		if (!(null == dateType || "".equals(dateType))) {
			setAttr("dateType", dateType);
			if ("createtime".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_orders_createtime"));
				setAttr("LTE_date", getAttr("q_LTE_orders_createtime"));
			} else if ("deptdate".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_orders_travel_time"));
				setAttr("LTE_date", getAttr("q_LTE_orders_travel_time"));
			}
		}
		return "/crm/my-chailv/train-order";
	}

	@RequestMapping("/toNewTrainOrder/{type}")
	public String toNewTrainOrder(@RequestParam(defaultValue = "1") Integer pageNum, Integer pageSize, @PathVariable("type") String type, HttpServletRequest request) {
		pageSize = null == pageSize ? PAGE_SIZE.intValue() : pageSize;
		QueryFilter filter = new QueryFilter();
		Map<String, Object> extraParams = initBaseParams();
		extraParams.put("type", type);
		// 查询数据
		// PageInfo<Map<String, Object>> page = trainOrderService.findPageByAndEmpLevel(pageNum, pageSize, filter.buildSql(request), extraParams);
		PageInfo<Map<String, Object>> page = trainOrderService.findPageByEmpLevel(pageNum, pageSize, filter.buildSql(request), extraParams);
		if (null == page) {
			setAttr("Msg", "这是在哪啊?我怎么迷路了呢???");
			return "/common/404";
		}
		List<Map<String, Object>> list = page.getList();
		Map<String, String> bzMap = Maps.newHashMap();
		for (Map<String, Object> map : list) {
			String orderno = (String) map.get("orderno");
			Integer s = trainOrderService.getRemarkListByOrdernoCount(orderno);
			if (s > 0) {
				bzMap.put(orderno, "1");
			} else {
				bzMap.put(orderno, "0");
			}
		}
		CrmCompany company = getCompany();
		// 将成本中心查出来并setAttr();
		List<CrmCostCenter> costCenters = crmCostCenterService
				.getListBycid(company.getId());
		setAttr("costCenters", costCenters);
		// 将项目有查出来并setAttr();
		// 这个选项在飞机票中会出现,但是在火车票中暂未出现,因此,在此处先备注,以备后用
		/*List<CrmProject> projects = crmProjectService.getListBycid(company
				.getId());
		setAttr("projects", projects);*/
		setAttr("bzFlag", bzMap);
		setAttr("page", page);
		setAttr("statusUtil", new AuvStatusContant());
		setAttr("airUtils", new AirStatusContant());
		setAttr("baseStatus", new BaseStatusContant());
		setAttr("pageSize", pageSize);
		// 用于数据回显
		String dateType = (String) request.getParameter("dateType");
		if (!(null == dateType || "".equals(dateType))) {
			setAttr("dateType", dateType);
			if ("createtime".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_orders_createtime"));
				setAttr("LTE_date", getAttr("q_LTE_orders_createtime"));
			} else if ("deptdate".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_orders_travel_time"));
				setAttr("LTE_date", getAttr("q_LTE_orders_travel_time"));
			}
		}

		boolean prePayCompany = FenxiaostatusContant.isPrePayCompany(company.getServerNo());
		if (prePayCompany) {
			setAttr("fengxiaoFlag", "1");
		} else {
			setAttr("fengxiaoFlag", "2");
		}


		return "/crm/my-chailv/train-order";
	}

	@RequestMapping("/toTrainOrderDetail/{trainOrderId}")
	public String toTrainOrderDetail(@PathVariable("trainOrderId") String trainOrderId) {
		TrainOrder trainOrder = trainOrderService.getOrderByorderNo(trainOrderId);
		setAttr("trainOrder", trainOrder);
		List<TrainOrderUsers> users = trainOrder.getUsers();
		int flag = 0;
		if (null != users && users.size() > 1) {
			for (int i = 0; i < users.size() - 1; i++) {
				Double amount = users.get(i).getAmount();
				Double amount2 = users.get(i + 1).getAmount();
				if (amount.doubleValue() != amount2.doubleValue()) {
					flag = 1;
					break;
				}
			}
		}
		double totalPrice = 0.0;
		if (null != users && !users.isEmpty()) {
			for (int i = 0; i < users.size(); i++) {
				totalPrice += users.get(i).getTotalprice();
			}
		}
		setAttr("totalPrice", totalPrice);
		setAttr("Amountflag", flag);
		setAttr("trainUtil", new AuvStatusContant());
		List<TrainOrderApprove> approves = trainOrder.getApproves();
		setAttr("approveMap", getTrainShenpiMap(approves));
		setAttr("approvestatus", trainOrder.getApprovestatus());
		if (!FenxiaostatusContant.isPrePayCompany(trainOrder.getServerNo())) {
			setAttr("fenxiaoFlag", "1");
		}
		return "/crm/my-chailv/train-order-detail";
	}

	@RequestMapping("/toTrainGaiOrder")
	public String toTrainGaiOrder(@RequestParam(defaultValue = "1") Integer pageNum, Integer pageSize, HttpServletRequest request) {
		pageSize = null == pageSize ? PAGE_SIZE.intValue() : pageSize;
		QueryFilter filter = new QueryFilter();
		Map<String, Object> extraParams = initBaseParams();
		// 查询数据
		PageInfo<Map<String, Object>> page = trainGaiqianOrderService.findPageByAndEmpLevel(pageNum, pageSize, filter.buildSql(request), extraParams);

		List<Map<String, Object>> list = page.getList();
		Map<String, String> bzMap = Maps.newHashMap();
		for (Map<String, Object> map : list) {
			String orderno = (String) map.get("orderno");
			Integer s = trainOrderService.getRemarkListByOrdernoCount(orderno);
			if (s > 0) {
				bzMap.put(orderno, "1");
			} else {
				bzMap.put(orderno, "0");
			}
		}
		// 将成本中心查出来并setAttr();
		// 这个选项在飞机票中会出现,但是在火车票中暂未出现,因此,在此处先备注,以备后用
		/*CrmCompany company = getCompany();
		List<CrmCostCenter> costCenters = crmCostCenterService
				.getListBycid(company.getId());
		setAttr("costCenters", costCenters);
		// 将项目有查出来并setAttr();
		List<CrmProject> projects = crmProjectService.getListBycid(company
				.getId());
		setAttr("projects", projects);*/

		setAttr("bzFlag", bzMap);
		setAttr("page", page);
		setAttr("statusUtil", new AuvStatusContant());
		setAttr("airUtils", new AirStatusContant());
		setAttr("baseStatus", new BaseStatusContant());
		setAttr("pageSize", pageSize);
		return "/crm/my-chailv/train-endrose";
	}

	@RequestMapping("/toNewTrainGaiOrder/{type}")
	public String toNewTrainGaiOrder(@RequestParam(defaultValue = "1") Integer pageNum, Integer pageSize, @PathVariable("type") String type, HttpServletRequest request) {
		pageSize = null == pageSize ? PAGE_SIZE.intValue() : pageSize;
		QueryFilter filter = new QueryFilter();
		Map<String, Object> extraParams = initBaseParams();
		extraParams.put("type", type);
		// 查询数据
		// PageInfo<Map<String, Object>> page = trainGaiqianOrderService.findPageByAndEmpLevel(pageNum, pageSize, filter.buildSql(request), extraParams);
		PageInfo<Map<String, Object>> page = trainGaiqianOrderService.findPageByEmpLevel(pageNum, pageSize, filter.buildSql(request), extraParams);
		if (null == page) {
			setAttr("Msg", "据说火星上有人类,我先上去看看~");
			return "/common/404";
		}
		List<Map<String, Object>> list = page.getList();
		Map<String, String> bzMap = Maps.newHashMap();
		for (Map<String, Object> map : list) {
			String orderno = (String) map.get("orderno");
			Integer s = trainOrderService.getRemarkListByOrdernoCount(orderno);
			if (s > 0) {
				bzMap.put(orderno, "1");
			} else {
				bzMap.put(orderno, "0");
			}
		}
		// 将成本中心查出来并setAttr();
		// 这个选项在飞机票中会出现,但是在火车票中暂未出现,因此,在此处先备注,以备后用
		/*CrmCompany company = getCompany();
		List<CrmCostCenter> costCenters = crmCostCenterService
				.getListBycid(company.getId());
		setAttr("costCenters", costCenters);
		// 将项目有查出来并setAttr();
		List<CrmProject> projects = crmProjectService.getListBycid(company
				.getId());
		setAttr("projects", projects);*/

		setAttr("bzFlag", bzMap);
		setAttr("page", page);
		setAttr("statusUtil", new AuvStatusContant());
		setAttr("airUtils", new AirStatusContant());
		setAttr("baseStatus", new BaseStatusContant());
		setAttr("pageSize", pageSize);
		return "/crm/my-chailv/train-endrose";
	}

	@RequestMapping("/toTrainEndroseDetail/{endroseOrderId}")
	public String toTrainEndroseDetail(@PathVariable("endroseOrderId") String endroseOrderId) {
		TrainGaiqianOrder endroseOrder = trainGaiqianOrderService.getOrderByorderNo(endroseOrderId);
		TrainOrder orderByorderNo = trainOrderService.getOrderByorderNo(endroseOrder.getOOrderno());
		setAttr("orderByorderNo", orderByorderNo);
		setAttr("endroseOrder", endroseOrder);
		setAttr("trainUtil", new AuvStatusContant());
		setAttr("approvestatus", endroseOrder.getApprovestatus());
		double gaiCharges = 0.0;
		Double gaibug = endroseOrder.getGaiBumoney();
		Double gaiTuimoney = endroseOrder.getGaiTuimoney();
		if(null==gaiTuimoney || null==gaibug) {
			gaiCharges=gaiCharges =endroseOrder.getGaiqianTotalPrice()-endroseOrder.getOldTotalPrice();
		}else{
			if (gaibug != gaiTuimoney) {
				if (gaibug > 0) {
					gaiCharges = gaibug;
				}
				if (gaiTuimoney > 0) {
					gaiCharges = -gaiTuimoney;
				}
			}
		}
		setAttr("gaiCharges", gaiCharges);
		return "/crm/my-chailv/train-endrose-detail";
	}

	@RequestMapping("/toTrainTuiOrder")
	public String toTrainTuiOrder(@RequestParam(defaultValue = "1") Integer pageNum, Integer pageSize, HttpServletRequest request) {
		pageSize = null == pageSize ? PAGE_SIZE.intValue() : pageSize;
		QueryFilter filter = new QueryFilter();
		Map<String, Object> extraParams = initBaseParams();
		// 查询数据
		PageInfo<Map<String, Object>> page = trainTuipiaoService.findPageByAndEmpLevel(pageNum, pageSize, filter.buildSql(request), extraParams);

		List<Map<String, Object>> list = page.getList();
		Map<String, String> bzMap = Maps.newHashMap();
		for (Map<String, Object> map : list) {
			String orderno = (String) map.get("orderno");
			Integer s = trainOrderService.getRemarkListByOrdernoCount(orderno);
			if (s > 0) {
				bzMap.put(orderno, "1");
			} else {
				bzMap.put(orderno, "0");
			}
		}
		// 这个选项在飞机票中会出现,但是在火车票中暂未出现,因此,在此处先备注,以备后用
		/*CrmCompany company = getCompany();
		// 将成本中心查出来并setAttr();
		List<CrmCostCenter> costCenters = crmCostCenterService
				.getListBycid(company.getId());
		setAttr("costCenters", costCenters);
		// 将项目有查出来并setAttr();
		List<CrmProject> projects = crmProjectService.getListBycid(company
				.getId());
		setAttr("projects", projects);*/

		setAttr("bzFlag", bzMap);
		setAttr("page", page);
		setAttr("statusUtil", new AuvStatusContant());
		setAttr("airUtils", new AirStatusContant());
		setAttr("baseStatus", new BaseStatusContant());
		setAttr("pageSize", pageSize);
		return "/crm/my-chailv/train-refund";
	}

	@RequestMapping("/toNewTrainTuiOrder/{type}")
	public String toNewTrainTuiOrder(@RequestParam(defaultValue = "1") Integer pageNum, Integer pageSize, @PathVariable("type") String type, HttpServletRequest request) {
		pageSize = null == pageSize ? PAGE_SIZE.intValue() : pageSize;
		QueryFilter filter = new QueryFilter();
		Map<String, Object> extraParams = initBaseParams();
		extraParams.put("type", type);
		// 查询数据
		// PageInfo<Map<String, Object>> page = trainTuipiaoService.findPageByAndEmpLevel(pageNum, pageSize, filter.buildSql(request), extraParams);
		PageInfo<Map<String, Object>> page = trainTuipiaoService.findPageByEmpLevel(pageNum, pageSize, filter.buildSql(request), extraParams);
		if (null == page) {
			setAttr("Msg", "我这是在哪?我..我..我迷失了自己~");
			return "/common/404";
		}
		List<Map<String, Object>> list = page.getList();
		Map<String, String> bzMap = Maps.newHashMap();
		for (Map<String, Object> map : list) {
			String orderno = (String) map.get("orderno");
			Integer s = trainOrderService.getRemarkListByOrdernoCount(orderno);
			if (s > 0) {
				bzMap.put(orderno, "1");
			} else {
				bzMap.put(orderno, "0");
			}
		}
		// 这个选项在飞机票中会出现,但是在火车票中暂未出现,因此,在此处先备注,以备后用
		/*CrmCompany company = getCompany();
		// 将成本中心查出来并setAttr();
		List<CrmCostCenter> costCenters = crmCostCenterService
				.getListBycid(company.getId());
		setAttr("costCenters", costCenters);
		// 将项目有查出来并setAttr();
		List<CrmProject> projects = crmProjectService.getListBycid(company
				.getId());
		setAttr("projects", projects);*/
		setAttr("bzFlag", bzMap);
		setAttr("page", page);
		setAttr("statusUtil", new AuvStatusContant());
		setAttr("airUtils", new AirStatusContant());
		setAttr("baseStatus", new BaseStatusContant());
		setAttr("pageSize", pageSize);
		return "/crm/my-chailv/train-refund";
	}

	@RequestMapping("/toTrainRefundDetail/{trainRefundId}")
	public String toTrainRefundDetail(@PathVariable("trainRefundId") String refundId) {
		TrainTuipiao refundOrder = trainTuipiaoService.getOrderByorderNo(refundId);
		TrainOrder order = trainOrderService.getSigleOrderByOrderNo(refundOrder.getCompanyid(), refundOrder.getOdOrderno());
		setAttr("refundOrder", refundOrder);
		setAttr("orderUser", order.getUsers());
		setAttr("order", order);
		setAttr("trainUtil", new AuvStatusContant());
		return "/crm/my-chailv/train-refund-detail";
	}

	@RequestMapping("/toTrainTimeTable")
	public String toTrainTimeTable() {
		return "/crm/my-chailv/train-time-table";
	}

	@RequestMapping("/toHotelOrder")
	public String toHotelOrder(@RequestParam(defaultValue = "1") Integer pageNum, Integer pageSize, HttpServletRequest request) {
		pageSize = null == pageSize ? PAGE_SIZE.intValue() : pageSize;
		QueryFilter filter = new QueryFilter();
		Map<String, Object> extraParams = initBaseParams();

		// 查询数据
		PageInfo<Map<String, Object>> page = hotelOrderService.findPageByAndEmpLevel(pageNum, pageSize, filter.buildSql(request), extraParams);

		List<Map<String, Object>> list = page.getList();
		HashMap<String, Object> bzMap = Maps.newHashMap();
		for (Map<String, Object> map : list) {
			String orderno = (String) map.get("orderno");
			List<HotelOrderRemark> bz = hotelOrderService.getOrderRemarkList(orderno);
			if (bz.size() > 0) {
				bzMap.put(orderno, "1");
			} else {
				bzMap.put(orderno, "0");
			}
		}
		CrmCompany company = getCompany();
		// 将成本中心查出来并setAttr();
		List<CrmCostCenter> costCenters = crmCostCenterService
				.getListBycid(company.getId());
		setAttr("costCenters", costCenters);
		// 将项目有查出来并setAttr();
		List<CrmProject> projects = crmProjectService.getListBycid(company.getId());
		setAttr("projects", projects);

		setAttr("bzFlag", bzMap);
		setAttr("page", page);
		setAttr("baseUtil", new BaseStatusContant());
		setAttr("hotelUtil", new HotelStatusContant());
		setAttr("pageSize", pageSize);
		// 用于数据回显
		String dateType = (String) request.getParameter("dateType");
		if (!(null == dateType || "".equals(dateType))) {
			setAttr("dateType", dateType);
			if ("yuding".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_orders_createtime"));
				setAttr("LTE_date", getAttr("q_LTE_orders_createtime"));
			} else if ("ruzhu".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_orders_arrivalDate"));
				setAttr("LTE_date", getAttr("q_LTE_orders_arrivalDate"));
			} else if ("lidian".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_orders_departureDate"));
				setAttr("LTE_date", getAttr("q_LTE_orders_departureDate"));
			}
		}
		return "/crm/my-chailv/hotel-order";
	}

	@RequestMapping("/toNewHotelOrder/{type}")
	public String toNewHotelOrder(@RequestParam(defaultValue = "1") Integer pageNum, Integer pageSize, @PathVariable("type") String type, HttpServletRequest request) {
		pageSize = null == pageSize ? PAGE_SIZE.intValue() : pageSize;
		QueryFilter filter = new QueryFilter();
		Map<String, Object> extraParams = initBaseParams();
		extraParams.put("type", type);
		// 查询数据
//		PageInfo<Map<String, Object>> page = hotelOrderService.findPageByAndEmpLevel(pageNum, pageSize, filter.buildSql(request), extraParams);
		PageInfo<Map<String, Object>> page = hotelOrderService.findPageByEmpLevel(pageNum, pageSize, filter.buildSql(request), extraParams);
		if (null == page) {
			setAttr("Msg", "我这是在哪?我..我..我迷失了自己~");
			return "/common/404";
		}
		List<Map<String, Object>> list = page.getList();
		HashMap<String, Object> bzMap = Maps.newHashMap();
		for (Map<String, Object> map : list) {
			String orderno = (String) map.get("orderno");
			List<HotelOrderRemark> bz = hotelOrderService.getOrderRemarkList(orderno);
			if (bz.size() > 0) {
				bzMap.put(orderno, "1");
			} else {
				bzMap.put(orderno, "0");
			}
		}
		CrmCompany company = getCompany();
		// 将成本中心查出来并setAttr();
		List<CrmCostCenter> costCenters = crmCostCenterService
				.getListBycid(company.getId());
		setAttr("costCenters", costCenters);
		// 将项目有查出来并setAttr();
		List<CrmProject> projects = crmProjectService.getListBycid(company.getId());
		setAttr("projects", projects);

		setAttr("bzFlag", bzMap);
		setAttr("page", page);
		setAttr("baseUtil", new BaseStatusContant());
		setAttr("hotelUtil", new HotelStatusContant());
		setAttr("pageSize", pageSize);
		// 用于数据回显
		String dateType = (String) request.getParameter("dateType");
		if (!(null == dateType || "".equals(dateType))) {
			setAttr("dateType", dateType);
			if ("yuding".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_orders_createtime"));
				setAttr("LTE_date", getAttr("q_LTE_orders_createtime"));
			} else if ("ruzhu".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_orders_arrivalDate"));
				setAttr("LTE_date", getAttr("q_LTE_orders_arrivalDate"));
			} else if ("lidian".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_orders_departureDate"));
				setAttr("LTE_date", getAttr("q_LTE_orders_departureDate"));
			}
		}

		boolean prePayCompany = FenxiaostatusContant.isPrePayCompany(company.getServerNo());
		if (prePayCompany) {
			setAttr("fengxiaoFlag", "1");
		} else {
			setAttr("fengxiaoFlag", "2");
		}


		return "/crm/my-chailv/hotel-order";
	}

	/**
	 * 是否可改签或退票
	 * @param orderno
	 * @param type   0改签 1退票
	 * @return
	 * 	// 机票退票状态
	public static int AIR_TUIPIAO_WEITUI = 0;// 未退票
	public static int AIR_TUIPIAO_SHENQINGZHONG = 1;// 已提交
	public static int AIR_TUIPIAO_YITUIPIAO = 2;// 已退票
	public static int AIR_TUIPIAO_TUISHIBAI = 3;// 退票失败
	public static int AIR_TUIPIAO_CANCEL = 4;// 取消退票
	public static int AIR_TUIPIAO_TUIPIAO_ING = 5;// 退票中
	public static int AIR_TUIMONEY_HAVING = 6; //退款中
	public static int AIR_TUIPIAO_CHEKED = 7; //已核算

	// 机票改签状态
	public static int AIR_GAIQIAN_WEIGAI = 0;// 未改签
	public static int AIR_GAIQIAN_GAI_ING = 1;// 改签中
	public static int AIR_GAIQIAN_SUCCESS = 2;// 改签成功
	public static int AIR_GAIQIAN_YITIJIAO = 6;// 改签已提交
	public static int AIR_GAIQIAN_FAIL = 3;// 改签失败
	public static int AIR_GAIQIAN_CANCLE = 4;// 取消改签
	public static int AIR_GAIQIAN_CONFIRM = 5;// 改签已确认
	 */
	@RequestMapping("/iscantg/{orderno}/{type}")
	@ResponseBody
	public AuvgoResult iscantg(@PathVariable("orderno") String orderno,@PathVariable("type") String type) {
		log.info("/iscantg -->request orderno:{}", orderno);
		//是否改签 1表示改签申请中,0表示未改签,2改签成功,3改签失败,4取消改签
		//退票状态:0表示未退票,1表示已经申请退票,2退票成功,3退票失败,4 取消退票
		AuvgoResult result=AuvgoResult.ok();
		AirOrder airOrder = airOrderService.getOrderByorderNo(orderno);
		Boolean iscan=false;
		Boolean isgqing=false;
		Boolean isgqwc=false;
		Boolean istping=false;
		Boolean istpwc=false;
		List<AirOrderRoutePass> routePass = airOrder.getRoutePass();
		for(AirOrderRoutePass pass:routePass){
			Integer gaiqianstatus = pass.getGaiqianstatus();
			Integer tuipiaostatus = pass.getTuipiaostatus();
			if((gaiqianstatus==0||gaiqianstatus==3||gaiqianstatus==4)&&(tuipiaostatus==0||tuipiaostatus==3||tuipiaostatus==4)){
				iscan=true;
			}else if(gaiqianstatus==1||gaiqianstatus==6||gaiqianstatus==5){
				isgqing=true;
			}else if(gaiqianstatus==2){
				isgqwc=true;
			}else if(tuipiaostatus==2||tuipiaostatus==5||tuipiaostatus==6){
				istpwc=true;
			}else if(tuipiaostatus==1||tuipiaostatus==7){
				istping=true;
			}
			
		}
		//若果不存在可以改签或退票的乘机人 判断是哪种
		if(!iscan){
			result.setStatus(300);
		    if("0".equals(type)){
		    	//没有可操作的改签
		    	if(!isgqwc&&!isgqing){
		    		result.setMsg("您的订单已操作过退票／改签，如需再次操作请拨打客服电话4006060011");
		    	}else if(isgqwc){
		    		result.setMsg("您的订单已操作过退票／改签，如需再次操作请拨打客服电话4006060011");
		    	}else if(isgqing){
		    		result.setMsg("此订单已申请改签，请耐心等待~");
		    	}
		    }else{
		    	//没有可退票的改签
		    	if(!istping&&!istpwc){
		    		result.setMsg("您的订单已操作过退票／改签，如需再次操作请拨打客服电话4006060011");
		    	}else if(istpwc){
		    		result.setMsg("您的订单已操作过退票／改签，如需再次操作请拨打客服电话4006060011");
		    	}else if(istping){
		    		result.setMsg("此订单已申请退票，请耐心等待~");
		    	}
		    }
		}

		return result;
	}
	// 初始化基本查询条件
	private Map<String, Object> initBaseParams() {
		Map<String, Object> extraParams = Maps.newHashMap();
		CrmEmployee user = getUser();
		// 用于存储额外的查询条件
		Long deptid = user.getDeptid();
		String level = user.getLevel();
		Long cid = user.getCompanyid();
		extraParams.put("level", level);    // 必须添加 员工等级
		extraParams.put("companyid", cid);        // 必须添加员工公司的id
		extraParams.put("empid", user.getId());    // 必须添加 员工id
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

	@RequestMapping("/toHotelOrderDetail/{orderno}")
	public String toOrderDetail(@PathVariable("orderno") String orderno) {
		HotelOrder hotelOrder = hotelOrderService.getOrderByOrderNo(orderno);
		Long cid = hotelOrder.getCompanyid();
		//审批人
		List<HotelOrderApprove> approveList = hotelOrder.getApproves();
		Map<Integer, List<HotelOrderApprove>> maps = Maps.newHashMap();// 按照审批级别把里面的审批人分类
		for (HotelOrderApprove approves : approveList) {
			if (maps.containsKey(approves.getLevel())) {
				List<HotelOrderApprove> list = maps.get(approves.getLevel());
				list.add(approves);
			} else {
				List<HotelOrderApprove> list = Lists.newArrayList();
				list.add(approves);
				maps.put(approves.getLevel(), list);
			}
		}

		// 成本中心列表
		List<CrmCostCenter> costList = crmCostCenterService.getListBycid(cid);
		// 获取项目
		List<CrmProject> projectlist = crmProjectService.getListBycid(cid);

		setAttr("costList", JsonUtils.objectToJson(costList));
		setAttr("projectlist", JsonUtils.objectToJson(projectlist));
		setAttr("hotelOrder", hotelOrder);
		boolean selfPay = hotelOrder.getPaymentType().equals("SelfPay") ? true : false;
		String status_str = "";
		Map<String, String> mapStatus = getStateString(hotelOrder.getStatus(), hotelOrder.getApprovestatus(), hotelOrder.getPaystatus(), selfPay, status_str);
		setAttr("status_str", mapStatus.get("status_str"));

		setAttr("approveMap", maps);
		setAttr("approvestatus", hotelOrder.getApprovestatus());
		return "/crm/my-chailv/hotel-order-detail";
	}

	/**
	 * 判断酒店订单状态
	 *
	 * @param status
	 * @param approvestatus
	 * @param paystatus
	 * @param selfPay
	 * @param status_str
	 * @return
	 */
	private Map<String, String> getStateString(int status, int approvestatus, int paystatus, boolean selfPay, String status_str) {
		Map<String, String> mapStatus = Maps.newHashMap();
		//已取消（6）
		if (status == HotelStatusContant.HOTEL_ORDER_STATUS_CANCEL) {
			status_str = "已取消";
		}
		//如果是  已提交，待审批/无需审批，未支付 （没有调用艺龙接口之前的初始状态）
		else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_SUBMIT &&
				(approvestatus == HotelStatusContant.COM_APPROVE_STATUS || approvestatus == HotelStatusContant.COM_APPROVE_STATUS_NO)
				&& (paystatus == HotelStatusContant.HOTEL_PAY_STATUS || paystatus == HotelStatusContant.HOTEL_PAY_WEIDANBAN)) {
			status_str = "处理中";
		}
		//如果无需审批（3）、或者审批通过（1）
		else if (approvestatus == HotelStatusContant.COM_APPROVE_STATUS_NO ||
				approvestatus == HotelStatusContant.COM_APPROVE_STATUS_SUCCESS) {
			//审批步骤结束，进行订单状态的判断
			// 现付 到店付
			if (selfPay) {
				status_str = checkOrderState(status, paystatus, mapStatus, status_str);
			} else {
				// 预付
				status_str = checkOrderState4PrePay(status, paystatus, status_str);
			}
		}
		//如果审批否决（2）
		else if (approvestatus == HotelStatusContant.COM_APPROVE_STATUS_FAIL) {
			status_str = "审批否决";
		}
		// 如果是待审批（已经闭合）（5）
		else if (approvestatus == HotelStatusContant.COM_APPROVE_STATUS_WAIT) {
			status_str = "待审批";
		} else if (approvestatus == HotelStatusContant.COM_APPROVE_STATUS_ING) {
			// 4
			status_str = "审批中";
		}
		mapStatus.put("status_str", status_str);
		return mapStatus;
	}

	/**
	 * 判断订单的状态、包括了担保状态
	 *
	 * @param status_str
	 */
	private String checkOrderState(int status, int paystatus, Map<String, String> mapStatus, String status_str) {
		//  现付，担保
		// 等待担保4
		if (paystatus == HotelStatusContant.HOTEL_PAY_DAIDANBAO) {
			status_str = "等待担保";
		/*
		        现付不担保
		        现付担保成功
		        预付支付成功以后
         */
			//现付不担保
			//已确认 4
		} else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_YIQUEREN) {
			status_str = "等待入住";
			//确认成功 8
		} else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_SUCCESS) {
			status_str = "已完成";
		} else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_SUCCESS) {
			//支付成功  1
			status_str = "支付成功";
		} else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_DANBAO_ING) {
			//6
			status_str = "担保中";
		} else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN) {
			//等待确认 2
			status_str = "等待确认";
			//  现付担保失败
		} else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_DANBAO_FAIL) {
			//担保失败 7
			status_str = "担保失败";
			//   确认中
		} else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_ING) {
			//3
			status_str = "确认中";
			mapStatus.put("cancel", "取消");
			//确认失败
		} else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_FAIL) {
			//3
			status_str = "确认失败";
		}
		return status_str;

	}

	/**
	 * 判断订单的状态、不包括担保状态，其实可以跟上面合并
	 *
	 * @param status_str
	 */
	private String checkOrderState4PrePay(int status, int paystatus, String status_str) {
		//确认中
		if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_ING) {
			// 3
			status_str = "确认中";
			//确认失败
		} else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_FAIL) {
			//5
			status_str = "确认失败";

			//已确认
		} else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_YIQUEREN) {
			//4  已确认
			status_str = "等待入住";
			//确认成功
		} else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_SUCCESS) {
			//8  已完成
			status_str = "已完成";
		} else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_DAITUIKUAN) {
			//8
			status_str = "待退款";
		} else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_TUIKUAN_SUCCESS) {
			// 9;
			status_str = "退款成功";
		} else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_TUIKUAN_FAIL) {
			// 10
			status_str = "退款失败";
			//订单已提交、待支付
		} else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_CANCEL) {
			//6
			status_str = "已取消";
		} else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_SUBMIT) {
			//7
			status_str = checkPayStatus(paystatus, status_str);
			//已确认
		} else if (status == HotelStatusContant.HOTEL_ORDER_STATUS_QUEREN_YIQUEREN) {
			//4
			status_str = "等待入住";
		}
		return status_str;
	}

	/**
	 * 支付状态的判断
	 *
	 * @param status_str
	 */
	private String checkPayStatus(int paystatus, String status_str) {
		if (paystatus == HotelStatusContant.HOTEL_PAY__DAIZHIFU) {
			//待支付 3
			status_str = "待支付";
		} else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_FAIL) {
			//支付失败 8192
			status_str = "支付中";
		} else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_ZHIFU_ING) {
			//支付中 4096
			status_str = "支付中";
		} else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS_SUCCESS) {
			//支付成功 1
			status_str = "支付成功";
		} else if (paystatus == HotelStatusContant.HOTEL_PAY_STATUS) {
			//未支付 0
			status_str = "未支付";
		}
		return status_str;
	}

	@RequestMapping("/toHotelLocation")
	public String toHotelLocation() {
		return "/crm/my-chailv/hotel-map";
	}


	@RequestMapping("/toChailvApp")
	public String toChailvApp(@RequestParam(defaultValue = "1") Integer pageNum, Integer pageSize, HttpServletRequest request) {
		pageSize = null == pageSize ? PAGE_SIZE.intValue() : pageSize;
		QueryFilter filter = new QueryFilter();
		// 用于order by
		String dateType = request.getParameter("dateType");
		if (!(null == dateType || "".equals(dateType))) {
			if (StringUtils.equals(dateType, "shenqing")) {
				filter.setOrderField("approvaltime");
			} else if (StringUtils.equals(dateType, "start")) {
				filter.setOrderField("travelstart");
			} else if (StringUtils.equals(dateType, "end")) {
				filter.setOrderField("travelend");
			}
		} else {
			// default
			filter.setOrderField("approvaltime");
		}
		filter.setOrderDirection("desc");
		// 用于自己相差如的sql查询条件
		Map<String, Object> extraParams = initBaseParams();
		/**
		 * 使用此方法是建议传入当前用户对象 user
		 */
		PageInfo<CrmAppform> page = crmAppformService.findPageByAndExtraParams(pageNum, pageSize, filter.buildSql(request), extraParams);
		// 用作数据回显
		if (!(null == dateType || "".equals(dateType))) {
			setAttr("dateType", dateType);
			if ("shenqing".equals(dateType)) {
				setAttr("gte_date", getAttr("q_GTE_approvaltime"));
				setAttr("lte_date", getAttr("q_LTE_approvaltime"));
			} else if ("start".equals(dateType)) {
				setAttr("gte_date", getAttr("q_GTE_travelstart"));
				setAttr("lte_date", getAttr("q_LTE_travelstart"));
			} else if ("end".equals(dateType)) {
				setAttr("gte_date", getAttr("q_GTE_travelend"));
				setAttr("lte_date", getAttr("q_LTE_travelend"));
			}
		}
		setAttr("page", page);
		setAttr("baseStatus", new BaseStatusContant());
		setAttr("pageSize", pageSize);
		return "/crm/my-chailv/chailv-application";
	}

	@RequestMapping("/toNewChailvApp/{type}")
	public String toNewChailvApp(@RequestParam(defaultValue = "1") Integer pageNum, Integer pageSize, @PathVariable("type") String type, HttpServletRequest request) {
		pageSize = null == pageSize ? PAGE_SIZE.intValue() : pageSize;
		QueryFilter filter = new QueryFilter();
		Map<String, Object> extraParams = initBaseParams();
		// 用于order by
		String dateType = request.getParameter("dateType");
		if (!(null == dateType || "".equals(dateType))) {
			if (StringUtils.equals(dateType, "shenqing")) {
				extraParams.put("orderfield", "approvaltime");
			} else if (StringUtils.equals(dateType, "start")) {
				extraParams.put("orderfield", "travelstart");
			} else if (StringUtils.equals(dateType, "end")) {
				extraParams.put("orderfield", "travelend");
			}
		} else {
			// default
			extraParams.put("orderfield", "approvaltime");
		}
		extraParams.put("orderdirection", "desc");
		// 用于自己相差如的sql查询条件
		extraParams.put("type", type);
		/**
		 * 使用此方法是建议传入当前用户对象 user
		 */
		// PageInfo<CrmAppform> page = crmAppformService.findPageByAndExtraParams(pageNum, pageSize, filter.buildSql(request),extraParams);
		PageInfo<CrmAppform> page = crmAppformService.findPageByExtraParams(pageNum, pageSize, filter.buildSql(request), extraParams);
		if (null == page) {
			setAttr("Msg", "想要功夫深,铁杵磨成针~");
			return "/common/404";
		}
		// 用作数据回显
		if (!(null == dateType || "".equals(dateType))) {
			setAttr("dateType", dateType);
			if ("shenqing".equals(dateType)) {
				setAttr("gte_date", getAttr("q_GTE_approvaltime"));
				setAttr("lte_date", getAttr("q_LTE_approvaltime"));
			} else if ("start".equals(dateType)) {
				setAttr("gte_date", getAttr("q_GTE_travelstart"));
				setAttr("lte_date", getAttr("q_LTE_travelstart"));
			} else if ("end".equals(dateType)) {
				setAttr("gte_date", getAttr("q_GTE_travelend"));
				setAttr("lte_date", getAttr("q_LTE_travelend"));
			}
		} else {
			setAttr("dateType", "shenqing");
		}
		setAttr("page", page);
		setAttr("baseStatus", new BaseStatusContant());
		setAttr("pageSize", pageSize);
		return "/crm/my-chailv/chailv-application";
	}

	@RequestMapping("/toChailvAppDetail/{cid}/{appId}")
	public String toChailvAppDetail(@PathVariable("cid") Long cid, @PathVariable("appId") String appid) {
		CrmAppform appForm = crmAppformService.findByApprovalNo(cid, appid);
		setAttr("appForm", appForm);
		setAttr("baseStatus", new BaseStatusContant());
		// 审批信息
		if (null != appForm.getApproves()) {
			Map<Integer, List<CrmAppformApprove>> approveMap = getAppformShenpiMap(appForm.getApproves());
			setAttr("approveMap", approveMap);
		}
		Long employeeid = appForm.getEmployeeid();
		Long companyid = appForm.getCompanyid();
		CrmEmployee employee = employeeService.getById(companyid, employeeid);
		setAttr("employee", employee);
		setAttr("approvestatus", appForm.getApprovestatus());
		return "/crm/my-chailv/chailv-application-detail";
	}

	/**
	 * 查询经停站点
	 */
/*	@SuppressWarnings("unchecked")
	@RequestMapping("/luguochezhan/{querydate}/{fromcode}/{tocode}/{train_no}/{order_no}/{type}")
	public String searchSubwayStation(@PathVariable("querydate") String querydate, @PathVariable("fromcode") String fromcode,
									  @PathVariable("tocode") String tocode, @PathVariable("train_no") String train_no, @PathVariable("order_no") String order_no, @PathVariable("type") String type) {

		String station = trainSearchService.station(querydate, fromcode, tocode, train_no);
		Map<String, Object> maps = JsonUtils.jsonToPojo(station, Map.class);
		setAttr("maps", maps);
		String fromStation = null;
		String arriveStation = null;
		if (StringUtils.equals(type, "1")) {
			TrainOrder order = trainOrderService.getOrderByorderNo(order_no);
			fromStation = order.getRoute().getFromStation();
			arriveStation = order.getRoute().getArriveStation();
		} else if (StringUtils.equals(type, "2")) {
			TrainTuipiao order = trainTuipiaoService.getOrderByorderNo(order_no);
			fromStation = order.getOrderRoute().getFromStation();
			arriveStation = order.getOrderRoute().getArriveStation();
		} else if (StringUtils.equals(type, "3")) {
			TrainGaiqianOrder order = trainGaiqianOrderService.getOrderByorderNo(order_no);
			fromStation = order.getGaiqianRoute().getFromStation();
			arriveStation = order.getGaiqianRoute().getArriveStation();
		}
		setAttr("fromStation", fromStation);
		setAttr("arriveStation", arriveStation);
		return "/crm/my-chailv/train-time-table";

	}*/
	@RequestMapping("/toNewAirInternationalOrder/{type}")
	public String toNewAirInternationalOrder(@RequestParam(defaultValue = "1") Integer pageNum, Integer pageSize, @PathVariable("type") String type, HttpServletRequest request) {
		QueryFilter filter = new QueryFilter();
		pageSize = null == pageSize ? PAGE_SIZE : pageSize;
		Map<String, Object> extraParams = initBaseParams();
		extraParams.put("type", type);
		PageInfo<AirInternationalXuqiudan> page = airInternationalXuqiudanService.findPageByEmpLevel(pageNum, pageSize, filter.buildSql(request), extraParams);
		if (null == page) {
			setAttr("Msg", "等不到天黑,烟火不会太完美~");
			return "/common/404";
		}
		// 获取状态集合
		setAttr("page", page);
		setAttr("pageSize", pageSize);
		setAttr("airIntern", new AirStatusContant());
		return "/crm/my-chailv/airinternatonal-order";
	}

	@RequestMapping("/airInternationalOrderDetail/{orderno}")
	public String airInternationalOrderDetail(@PathVariable("orderno") String orderno) {
		if (StringUtils.isBlank(orderno)) {
			log.info("/myChailv/airInternationalOrderDetail orderno 前台没有给出-->orderno:{}", orderno);
			setAttr("Msg", "青,取之于蓝而青于蓝~");
			return "/common/404";
		}
		AirInternationalXuqiudan order = airInternationalXuqiudanService.findByOrderNo(orderno);
		setAttr("order", order);
		setAttr("airUtil", new AirStatusContant());
		return "/crm/my-chailv/airinternatonal-order-detail";
	}

	private Map<Integer, List<AirOrderApprove>> getAirShenpiMap(List<AirOrderApprove> approveList) {
		Map<Integer, List<AirOrderApprove>> maps = Maps.newHashMap();// 按照审批级别把里面的审批人分类
		for (AirOrderApprove approves : approveList) {
			if (maps.containsKey(approves.getLevel())) {
				List<AirOrderApprove> list = maps.get(approves.getLevel());
				list.add(approves);
			} else {
				List<AirOrderApprove> list = Lists.newArrayList();
				list.add(approves);
				maps.put(approves.getLevel(), list);
			}
		}
		return maps;
	}

	private Map<Integer, List<TrainOrderApprove>> getTrainShenpiMap(List<TrainOrderApprove> approveList) {
		Map<Integer, List<TrainOrderApprove>> maps = Maps.newHashMap();// 按照审批级别把里面的审批人分类
		for (TrainOrderApprove approves : approveList) {
			if (maps.containsKey(approves.getLevel())) {
				List<TrainOrderApprove> list = maps.get(approves.getLevel());
				list.add(approves);
			} else {
				List<TrainOrderApprove> list = Lists.newArrayList();
				list.add(approves);
				maps.put(approves.getLevel(), list);
			}
		}
		return maps;
	}

	private Map<Integer, List<CrmAppformApprove>> getAppformShenpiMap(List<CrmAppformApprove> approveList) {
		Map<Integer, List<CrmAppformApprove>> maps = Maps.newHashMap();// 按照审批级别把里面的审批人分类
		for (CrmAppformApprove approves : approveList) {
			if (maps.containsKey(approves.getLevel())) {
				List<CrmAppformApprove> list = maps.get(approves.getLevel());
				list.add(approves);
			} else {
				List<CrmAppformApprove> list = Lists.newArrayList();
				list.add(approves);
				maps.put(approves.getLevel(), list);
			}
		}
		return maps;
	}
	private void buildNoShowSql(HttpServletRequest request, Map<String, Object> sqlParam) {
		String datetype = request.getParameter("dateType");
		if(StringUtils.isEmpty(datetype)){
			datetype="0";
		}
		setAttr("dateType", datetype);
		String begindt = request.getParameter("begindt");
		String enddt = request.getParameter("enddt");
		String bookusername = request.getParameter("bookusername");
		String username = request.getParameter("username");
		String proid = request.getParameter("proid");
		String costid = request.getParameter("costid");
		String isoverdue = request.getParameter("isoverdue");
		if(StringUtils.isNotEmpty(begindt)){
			if ( "0".equalsIgnoreCase(datetype)) {
				sqlParam.put("q_GTE_DATE_FORMAT(orders.createtime,'%Y-%m-%d')",begindt);
			}else if ("1".equalsIgnoreCase(datetype)) {
				sqlParam.put("q_GTE_DATE_FORMAT(orders.depttimes,'%Y-%m-%d')",begindt);
			}
			setAttr("begindt", begindt);
		}
		if(StringUtils.isNotEmpty(enddt)){
			if ("0".equalsIgnoreCase(datetype)) {
				sqlParam.put("q_LTE_DATE_FORMAT(orders.createtime,'%Y-%m-%d')",enddt);
			}else if ("1".equalsIgnoreCase(datetype)) {
				sqlParam.put("q_LTE_DATE_FORMAT(orders.depttimes,'%Y-%m-%d')", enddt);
			}
			setAttr("enddt", enddt);
		}
		if(StringUtils.isNotEmpty(bookusername)){
			sqlParam.put("q_LIKE_orders.bookusername", bookusername);
			setAttr("bookusername", bookusername);
		}
		if(StringUtils.isNotEmpty(username)){
			sqlParam.put("q_LIKE_orders.username", username);
			setAttr("username", username);
		}
		if(StringUtils.isNotEmpty(proid)){
			sqlParam.put("q_EQ_orders.proid", proid);
			setAttr("proid", proid);
		}
		if(StringUtils.isNotEmpty(costid)){
			sqlParam.put("q_EQ_orders.costid", costid);
			setAttr("costid", costid);
		}
		if(StringUtils.isNotEmpty(isoverdue)){
			if(!"2".equals(isoverdue)){
				sqlParam.put("q_EQ_orders.isoverdue", isoverdue);
			}
			setAttr("isoverdue", isoverdue);
		}else{
			sqlParam.put("q_EQ_orders.isoverdue", "0");
			setAttr("isoverdue", "0");
		}
	}
	private String checkLevel(Map<String, Object> sqlParam, Long cid, Long empid) {
		CrmEmployee emp = crmEmployeeService.getById(Long.valueOf(cid), Long.valueOf(empid));
		String level = emp.getLevel();
		if (null == level) {
			// 个人
			sqlParam.put("q_EQ_emp.id", empid);
		} else if ("all".equals(level)) {
			// 全公司
		} else if ("dept".equals(level)) {
			// 部门及以下
			List<CrmDepartment> depts = crmDepartmentService.getDeptAndSubDeptById(Long.valueOf(cid), emp.getDeptid());
			StringBuffer sb = new StringBuffer();
			sb.append(" and emp.deptid in(");
			for (CrmDepartment crmDepartment : depts) {
				sb.append(crmDepartment.getId()).append(",");
			}
			return StringUtils.removeEnd(sb.toString(), ",") + ")";

		} else if ("geren".equals(level)) {
			// 个人
			sqlParam.put("q_EQ_emp.id", empid);
			return null;
		} else {
			// 其他也是个人
			sqlParam.put("q_EQ_emp.id", empid);
			return null;
		}
		return "";
	}
}
