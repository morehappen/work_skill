package com.auvgo.web.face.common;

import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.JsonMapper;
import com.auvgo.crm.api.CrmEmployeeService;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.crm.pojo.CrmEmployeeModel;
import com.auvgo.web.face.BaseController;
import com.auvgo.web.model.caslog.CasBookModel;
import com.auvgo.web.model.caslog.TravelPassenger;
import com.google.common.collect.Lists;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

/**
 * Created by realxxs on 2018/5/26.
 */
@Controller
@RequestMapping("/cas")
public class CasInfoController extends BaseController {
	private static final JsonMapper jsonMapper = JsonMapper.nonDefaultMapper();
	private static Logger LOGGER = LogManager.getLogger(CasInfoController.class);
	@Autowired
	private CrmEmployeeService employeeService;

	@RequestMapping(value = "/getCasInfo", method = RequestMethod.GET)
	@ResponseBody
	public AuvgoResult getCasInfo() {
		try {
			CasBookModel casBookModel = jsonMapper.fromJson(getSessionAttr("casModel") + "", CasBookModel.class);
			if (null == casBookModel) {
				return AuvgoResult.build(201, "没有获取到登录信息");
			}
			return AuvgoResult.build(200, "success", casBookModel);
		} catch (Exception e) {
			LOGGER.error("/cas/getCasInfo", e);
		}
		return AuvgoResult.build(300, "后台出现异常");
	}

	@RequestMapping(value = "/getCasEmp", method = RequestMethod.GET)
	@ResponseBody
	public AuvgoResult getCasEmployee() {
		List<CrmEmployee> list = Lists.newArrayList();
		CasBookModel casBookModel = jsonMapper.fromJson(getSessionAttr("casModel") + "", CasBookModel.class);
		if (null == casBookModel) {
			return AuvgoResult.build(201, "没有获取到登录信息", list);
		}
		List<TravelPassenger> passlist = casBookModel.getPassengers();
		if (null == passlist) {
			AuvgoResult.build(201, "该登录没有传递员工数据过来", list);
		}
		CrmEmployee loginUser = (CrmEmployee) getSessionAttr("user");
		for (TravelPassenger pass : passlist) {
			CrmEmployeeModel employee = new CrmEmployeeModel();
			if (StringUtils.isNotBlank(pass.getAccno())) {
				employee = employeeService.getCasLoginByUsername(loginUser.getCompanyid(), pass.getAccno());
			} else {
				employee.setId(0L);
				employee.setUsername(pass.getAccno());
				employee.setCertno(pass.getCertno());
				employee.setCerttype(pass.getCertType());
				employee.setName(pass.getName());
				employee.setZhiwei(pass.getLevel());
			}
			list.add(employee);
		}
		//判断是否是本公司维护的员工
		return AuvgoResult.build(200, "该登录传递员工信息过来了", list);
	}


}
