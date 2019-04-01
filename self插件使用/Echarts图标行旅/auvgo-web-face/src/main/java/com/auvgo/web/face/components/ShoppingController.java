package com.auvgo.web.face.components;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.auvgo.business.common.IApproveRuleBusiness;
import com.auvgo.business.common.IShoppingCrmComponentBusiness;
import com.auvgo.business.common.module.CrmEmployeeLinshiModel;
import com.auvgo.business.common.module.CrmEmployeeModel;
import com.auvgo.business.common.module.UpdateCrmEmployeeModel;
import com.auvgo.business.hotel.book.IHotelBookingBusiness;
import com.auvgo.common.page.Page;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.crm.entity.CrmApprove;
import com.auvgo.crm.entity.CrmCompany;
import com.auvgo.crm.entity.CrmCostCenter;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.crm.entity.CrmEmployeeLinshi;
import com.auvgo.crm.entity.CrmProject;
import com.auvgo.crm.model.EmployeeSimpleModel;
import com.auvgo.data.entity.DataZidianValue;
import com.auvgo.web.face.BaseController;
import com.google.common.collect.Lists;

/**
 * 定义采购过程中需要的数据 EG:常用联系人 、部门、项目、成本中心
 * 
 * @author wangmi
 *
 */
@Controller
public class ShoppingController extends BaseController {
	@Autowired
	private IShoppingCrmComponentBusiness shoppingCrmComponentBusiness;
	/** 审批规则 **/
	private IApproveRuleBusiness approveRuleBusiness;
	private IHotelBookingBusiness hotelBookingBusiness;

	/**
	 * 获取常用联系人 新方法
	 * 
	 * @param module
	 *            业务线 air-机票 hotel-酒店 train-火车票 taxi-用车 travel-出差申请单
	 * @return
	 */
	@RequestMapping(value = "/shopping/obtain/contact/{module}", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult obtainContacts(@PathVariable("module") String module, String keyword) {
		AuvgoResult auvgoResult = null;
		try {
			Map<String, Object> data = new HashMap<String, Object>(2);
			CrmEmployee user = getUser();
			List<CrmEmployee> contacts = shoppingCrmComponentBusiness.obtainContacts(user, module, keyword);
			data.put("user", user);
			data.put("contacts", contacts);
			auvgoResult = AuvgoResult.build(200, "OK", data);
		} catch (Exception e) {
			log.error("obtainContacts fail", e);
			if (e.getMessage() != null && e.getMessage().indexOf("timeout") > -1) {
				auvgoResult = AuvgoResult.build(201, "网络超时，请查网络连接！");
			} else {
				auvgoResult = AuvgoResult.build(300, e.getMessage());
			}
		}
		return auvgoResult;
	}

	/**
	 * 模糊查询员工
	 * 
	 * @param module
	 *            业务线 air-机票 hotel-酒店 train-火车票 taxi-用车 travel-出差申请单
	 * @param index
	 *            当前页数
	 * @param size
	 *            每页大小
	 * @param keyword
	 *            关键字
	 * @return
	 */
	@RequestMapping(value = "/shopping/query/employee", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult queryEmployee(String module, Integer index, Integer size, String keyword) {
		AuvgoResult auvgoResult = null;
		try {
			CrmEmployee user = getUser();
			Page<CrmEmployee> page = new Page<CrmEmployee>(index == null ? 1 : index, size == null ? 15 : size);
			Page<CrmEmployeeModel> pageModel = shoppingCrmComponentBusiness.getEmployeesByKeyword(page, user, keyword, module);
			auvgoResult = AuvgoResult.build(200, "OK", pageModel);
		} catch (Exception e) {
			log.error("queryEmployee fail", e);
			if (e.getMessage() != null && e.getMessage().indexOf("timeout") > -1) {
				auvgoResult = AuvgoResult.build(201, "网络超时，请查网络连接！");
			} else {
				auvgoResult = AuvgoResult.build(300, e.getMessage());
			}
		}
		return auvgoResult;
	}

	/**
	 * 根据员工id查询员工信息
	 * 
	 * @param empids
	 *            员工id多个用,号分隔
	 * @return
	 */
	@RequestMapping(value = "/shopping/employess/ids", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult getEmployessByids(String empids) {
		AuvgoResult auvgoResult = null;
		try {
			CrmEmployee user = getUser();
			List<CrmEmployee> list = shoppingCrmComponentBusiness.getEmployessByids(empids, user);
			auvgoResult = AuvgoResult.build(200, "OK", list);
		} catch (Exception e) {
			if (e.getMessage() != null && e.getMessage().indexOf("timeout") > -1) {
				auvgoResult = AuvgoResult.build(201, "网络超时，请查网络连接！");
			} else {
				auvgoResult = AuvgoResult.build(300, e.getMessage());
			}
			log.error("getEmployessByids fail", e);
		}
		return auvgoResult;
	}

	/**
	 * 获取旅客信息
	 *
	 * @return
	 */
	@RequestMapping(value = "/shopping/gust/detail", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult gustDetail(String empids, String module) {
		AuvgoResult auvgoResult = null;
		try {
			CrmEmployee user = getUser();
			List<CrmEmployee> list = shoppingCrmComponentBusiness.getEmployessByids(empids, user);
			Map<String, Object> resultData = new HashMap<String, Object>();
			transformCustom(list, module, resultData);
			auvgoResult = AuvgoResult.build(200, "OK", resultData);
		} catch (Exception e) {
			if (e.getMessage() != null && e.getMessage().indexOf("timeout") > -1) {
				auvgoResult = AuvgoResult.build(201, "网络超时，请查网络连接！");
			} else {
				auvgoResult = AuvgoResult.build(300, e.getMessage());
			}
			log.error("gustDetail fail", e);
		}
		return auvgoResult;
	}

	// 转换员工信息
	private void transformCustom(List<CrmEmployee> employees, String module, Map<String, Object> resultData) throws Exception {
		if (employees != null && !employees.isEmpty()) {
			if (StringUtils.isBlank(module) || "hotel".equals(module)) {
				Map<String, Object> map = hotelBookingBusiness.transformHotelCustom(employees);
				resultData.putAll(map);
			}
		}
	}

	/**
	 * 部门信息
	 * 
	 * @param module
	 * @param contactId
	 * @return
	 */
	@RequestMapping(value = "/dept/{parent}", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult dept(@PathVariable("parent") String parent) {
		AuvgoResult auvgoResult = null;
		try {
			CrmCompany company = getCompany();
			String depteTree = shoppingCrmComponentBusiness.depteTree(company, parent);
			auvgoResult = AuvgoResult.build(200, "OK", depteTree);
		} catch (Exception e) {
			log.error("dept fail", e);
			auvgoResult = AuvgoResult.build(300, "ERROR");
		}
		return auvgoResult;
	}

	/**
	 * 获取项目中心
	 * 
	 * @param pagenum
	 *            当前页数
	 * @param pagesize
	 *            每页大小
	 * @param keyword
	 *            关键字查询
	 * @return
	 */
	@RequestMapping(value = "/shopping/project", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult project(String pagenum, String pagesize, String keyword) {
		AuvgoResult auvgoResult = null;
		CrmEmployee user = getUser();
		try {
			Page<CrmProject> projectList = shoppingCrmComponentBusiness.getProjectByCid(user, pagenum, pagesize, keyword);
			auvgoResult = AuvgoResult.build(200, "OK", projectList);
		} catch (Exception e) {
			log.error("project fail", e);
			auvgoResult = AuvgoResult.build(300, "ERROR");
		}
		return auvgoResult;
	}

	/**
	 * 根据公司员工和部门查询成本中心
	 * 
	 * @param pagenum
	 * @param pagesize
	 * @param keyword
	 * @param departmentid
	 * @param employeeid
	 * @return
	 */
	@RequestMapping(value = "/shopping/cost/center", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult costCenter(String pagenum, String pagesize, String keyword, String departmentid, String employeeid) {
		AuvgoResult auvgoResult = null;
		CrmEmployee user = getUser();
		try {
			int pageNum = StringUtils.isBlank(pagenum) ? 1 : Integer.parseInt(pagenum); // 当前页数
			int pageSize = StringUtils.isBlank(pagesize) ? 5 : Integer.parseInt(pagesize); // 每页大小
			Page<CrmCostCenter> costCenterList = shoppingCrmComponentBusiness.getCostCenterBypidAndempid(user, pageNum, pageSize, keyword, departmentid, employeeid);
			auvgoResult = AuvgoResult.build(200, "OK", costCenterList);
		} catch (Exception e) {
			log.error("costCenter fail", e);
			auvgoResult = AuvgoResult.build(300, "ERROR");
		}
		return auvgoResult;
	}

	/**
	 * 获取审批人
	 * 
	 * @param empids
	 *            当前员工id多个用,分隔
	 * @param module
	 *            审批模块 ApproveModule
	 * @param webeiflage
	 *            违背标识 0未违背 1违背
	 * @param violatePrice
	 *            违背价格（产品每日价格）
	 * @return
	 */
	@RequestMapping(value = "/shopping/approve", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult approve(String empids, String module, String webeiflage, Double violatePrice) {
		AuvgoResult auvgoResult = null;
		try {
			CrmEmployee user = getUser();
			List<CrmApprove> approve = approveRuleBusiness.getApprove(empids, module, webeiflage, violatePrice, user);
			auvgoResult = AuvgoResult.build(200, "OK", approve);
		} catch (Exception e) {
			log.error("approve fail", e);
			auvgoResult = AuvgoResult.build(300, "ERROR");
		}
		return auvgoResult;
	}

	/**
	 * 获取公司数据管理
	 * 
	 * @param type
	 *            类型 hotel:酒店超标原因 air:机票超标原因 airReturn:机票退票超标原因 train:火车票超标原因
	 *            rank:公司职级
	 * @return
	 */
	@RequestMapping(value = "/shopping/baseData", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult baseData(String type) {
		AuvgoResult auvgoResult = null;
		try {
			CrmEmployee user = getUser();
			List<DataZidianValue> overReason = shoppingCrmComponentBusiness.getBaseData(user, type);
			auvgoResult = AuvgoResult.build(200, "OK", overReason);
		} catch (Exception e) {
			log.error("overReason fail", e);
			auvgoResult = AuvgoResult.build(300, "ERROR");
		}
		return auvgoResult;
	}

	/**
	 * 订单填写页面新增员工
	 * 
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/shopping/addCrmEmployee", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult addCrmEmployee(EmployeeSimpleModel model) {
		AuvgoResult auvgoResult = null;
		try {
			CrmEmployee user = getUser();
			CrmEmployee crmEmployee = shoppingCrmComponentBusiness.addCrmEmployee(user, model);
			auvgoResult = AuvgoResult.build(200, "OK", crmEmployee);
		} catch (Exception e) {
			log.error("addLinkEmployee fail", e);
			auvgoResult = AuvgoResult.build(300, e.getMessage());
		}
		return auvgoResult;
	}

	/**
	 * 修改员工或员工联系人信息
	 * 
	 * @param updateEm
	 *            修改信息
	 * @param module
	 *            业务线 air-机票 hotel-酒店 train-火车票 taxi-用车 travel-出差申请单
	 * @return
	 */
	@RequestMapping(value = "/shopping/updateEmp/{module}", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult updateEmp(UpdateCrmEmployeeModel updateEm, @PathVariable("module") String module) {
		AuvgoResult auvgoResult = null;
		try {
			CrmEmployee user = getUser();
			String updateEmp = shoppingCrmComponentBusiness.updateEmp(updateEm, user, module);
			auvgoResult = AuvgoResult.build(200, "OK", updateEmp);
		} catch (Exception e) {
			log.error("addLinkEmployee fail", e);
			auvgoResult = AuvgoResult.build(300, e.getMessage());
		}
		return auvgoResult;
	}

	// ================= 废弃方法 =============

	/**
	 * 常用联系人列表 方法废弃新方法 obtainContacts
	 * 
	 * @param module
	 *            业务线 air-机票 hotel-酒店 train-火车票 taxi-用车 travel-出差申请单
	 * @return
	 */
	@RequestMapping(value = "/frequent/contact/{module}", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult contacts(@PathVariable("module") String module) {
		AuvgoResult auvgoResult = null;
		CrmEmployee user = getUser();
		List<CrmEmployeeLinshiModel> contacts = null;
		try {
			contacts = shoppingCrmComponentBusiness.initContacts(user, module);
			auvgoResult = AuvgoResult.build(200, "OK", contacts);
		} catch (Exception e) {
			log.error("contacts fail", e);
			auvgoResult = AuvgoResult.build(300, "ERROR");
		}
		return auvgoResult;
	}

	/**
	 * 旅客信息 方法废弃 新方法queryEmployees
	 * 
	 * @param module
	 *            业务模块儿
	 * @param contactId
	 *            员工id-0 或 联系人id-1 多个用,号分隔
	 * @return
	 */
	@RequestMapping(value = "/gust/{module}/{contactId}", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult gustDetail(@PathVariable("module") String module, @PathVariable("contactId") String contactId, HttpServletRequest request) {
		Map<String, Object> data = new HashMap<String, Object>();
		String index = request.getParameter("index");
		CrmEmployee user = getUser();
		try {
			List<CrmEmployee> employee = shoppingCrmComponentBusiness.contactDetail(user, module, contactId);
			data.put("gusts", Lists.newArrayList(employee));
			data.put("index", index);
			data.put("module", module);
		} catch (Exception e) {
			log.error("gustDetail fail", e);
			return AuvgoResult.build(300, e.getMessage());
		}
		return AuvgoResult.build(200, "OK", data);
	}

	/**
	 * 模糊查询员工 方法废弃新方法getEmployessByids
	 * 
	 * @param keyword
	 * @return
	 */
	@RequestMapping(value = "/shopping/queryEmployees", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult queryEmployees(String keyword) {
		AuvgoResult auvgoResult = null;
		try {
			CrmEmployee user = getUser();
			List<CrmEmployee> employees = shoppingCrmComponentBusiness.getEmployees(user, keyword);
			auvgoResult = AuvgoResult.build(200, "OK", employees);
		} catch (Exception e) {
			log.error("queryEmployees fail", e);
			auvgoResult = AuvgoResult.build(300, e.getMessage());
		}
		return auvgoResult;
	}

	/**
	 * 订单填写页面新增联系人 方法废弃
	 * 
	 * @param link
	 * @return
	 */
	@RequestMapping(value = "/shopping/addLinkEmployee", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult addLinkEmployee(CrmEmployeeLinshi link) {
		AuvgoResult auvgoResult = null;
		try {
			CrmEmployee user = getUser();
			CrmEmployeeLinshi linkEmployee = shoppingCrmComponentBusiness.addLinkEmployee(user, link);
			auvgoResult = AuvgoResult.build(200, "OK", linkEmployee);
		} catch (Exception e) {
			log.error("addLinkEmployee fail", e);
			auvgoResult = AuvgoResult.build(300, e.getMessage());
		}
		return auvgoResult;
	}

	@Autowired(required = false)
	public void setApproveRule(IApproveRuleBusiness approveRuleBusiness) {
		this.approveRuleBusiness = approveRuleBusiness;
	}

	@Autowired(required = false)
	public void setHotelBookingBusiness(IHotelBookingBusiness hotelBookingBusiness) {
		this.hotelBookingBusiness = hotelBookingBusiness;
	}

}