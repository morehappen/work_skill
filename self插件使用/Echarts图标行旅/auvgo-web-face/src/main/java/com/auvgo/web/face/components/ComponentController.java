package com.auvgo.web.face.components;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.auvgo.business.common.BaseErrorMsg;
import com.auvgo.business.common.IBaseBusiness;
import com.auvgo.business.common.module.CertRuleDescribeModel;
import com.auvgo.business.common.module.CertTypeModel;
import com.auvgo.business.common.module.UpdateCrmEmployeeModel;
import com.auvgo.common.page.Page;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.crm.pojo.CrmEmployeeAllCertModel;
import com.auvgo.crm.pojo.CrmEmployeeCertModel;
import com.auvgo.hotel.orm.bim.entity.Country;
import com.auvgo.web.face.BaseController;

@Controller
@RequestMapping("/component")
public class ComponentController extends BaseController {
	/** 基础数据 **/
	private IBaseBusiness baseBusiness;

	// ============== 国家 =====================

	/**
	 * 分页查询国家
	 *
	 * @param data
	 * @return
	 */
	@RequestMapping(value = "/country", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult country(String pagenum, String pagesize, String keyword) {
		AuvgoResult result = null;
		try {
			pagenum = StringUtils.isBlank(pagenum) ? "1" : pagenum;
			pagesize = StringUtils.isBlank(pagesize) ? "15" : pagesize;
			Page<Country> page = new Page<Country>(Integer.valueOf(pagenum), Integer.valueOf(pagesize));
			page = baseBusiness.findCountryPageKeyword(page, keyword);
			result = AuvgoResult.build(200, "OK", page);
		} catch (Exception e) {
			if (e.getMessage() != null && e.getMessage().indexOf("timeout") > -1) {
				result = AuvgoResult.build(201, "网络超时，请查网络连接！");
			} else {
				result = AuvgoResult.build(300, e.getMessage());
			}
			log.error("country fail", e);
		}
		return result;
	}

	/**
	 * 查询所有国家
	 *
	 * @param data
	 * @return
	 */
	@RequestMapping(value = "/all/country", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult allCountry() {
		AuvgoResult result = null;
		try {
			Country c = new Country();
			c.setStatus(true);
			List<Country> countrys = baseBusiness.findByCountry(c);
			result = AuvgoResult.build(200, "OK", countrys);
		} catch (Exception e) {
			if (e.getMessage() != null && e.getMessage().indexOf("timeout") > -1) {
				result = AuvgoResult.build(201, "网络超时，请查网络连接！");
			} else {
				result = AuvgoResult.build(300, e.getMessage());
			}
			log.error("allCountry fail", e);
		}
		return result;
	}

	// ============== 证件 ===================

	/**
	 * 获取证件类型
	 *
	 * @return
	 */
	@RequestMapping(value = "/obtain/certtype", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult obtainCerttype() {
		AuvgoResult result = null;
		try {
			List<CertTypeModel> list = baseBusiness.obtainCerttype();
			result = AuvgoResult.build(200, "OK", list);
		} catch (Exception e) {
			if (e.getMessage() != null && e.getMessage().indexOf("timeout") > -1) {
				result = AuvgoResult.build(201, "网络超时，请查网络连接！");
			} else {
				result = AuvgoResult.build(300, e.getMessage());
			}
			log.error("obtainCerttype fail", e);
		}
		return result;
	}

	/**
	 * 查询员工证件列表
	 *
	 * @param data
	 * @return
	 */
	@RequestMapping(value = "/obtain/certificate", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult obtainCertificate(String cid, String empid) {
		AuvgoResult result = null;
		try {
			if (StringUtils.isBlank(cid)) {
				result = AuvgoResult.build(300, "公司id为空");
			} else if (StringUtils.isBlank(empid)) {
				result = AuvgoResult.build(300, "员工id为空");
			} else {
				List<CrmEmployeeCertModel> list = baseBusiness.getEmpCert(Long.valueOf(cid), Long.valueOf(empid));
				result = AuvgoResult.build(200, "OK", list);
			}
		} catch (Exception e) {
			if (e.getMessage() != null && e.getMessage().indexOf("timeout") > -1) {
				result = AuvgoResult.build(201, "网络超时，请查网络连接！");
			} else {
				result = AuvgoResult.build(300, e.getMessage());
			}
			log.error("obtainCertificate fail", e);
		}
		return result;
	}

	/**
	 * 根据员工id 获取所有的证件信息（包括员工没有的证件）
	 *
	 * @param data
	 * @return
	 */
	@RequestMapping("/getEmpAllCert")
	@ResponseBody
	public AuvgoResult getEmpAllCert(String cid, String empid) {
		AuvgoResult result = null;
		try {
			if (StringUtils.isBlank(cid)) {
				result = AuvgoResult.build(300, "公司id为空");
			} else if (StringUtils.isBlank(empid)) {
				result = AuvgoResult.build(300, "员工id为空");
			} else {
				CrmEmployeeAllCertModel model = baseBusiness.findEmployeeInfoAndCert(Long.valueOf(cid), Long.valueOf(empid));
				result = AuvgoResult.build(200, "OK", model);
			}
		} catch (Exception e) {
			if (e.getMessage() != null && e.getMessage().indexOf("timeout") > -1) {
				result = AuvgoResult.build(201, "网络超时，请查网络连接！");
			} else {
				result = AuvgoResult.build(300, e.getMessage());
			}
			log.error("getEmpAllCert fail", e);
		}
		return result;
	}

	/**
	 * 保存或修改员工证件信息
	 *
	 * @param data
	 * @return
	 */
	@RequestMapping(value = "/save/update/cert", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult saveOrUpdateCert(CrmEmployeeCertModel cert) {
		AuvgoResult result = null;
		try {
			List<CrmEmployeeCertModel> empcert = baseBusiness.saveOrUpdateCertCheckConflict(cert);
			if (empcert != null && !empcert.isEmpty()) {
				result = AuvgoResult.build(411, "生日不一致", empcert);
			} else {
				if (cert.getId() == null) {
					result = AuvgoResult.build(200, "保存成功");
				} else {
					result = AuvgoResult.build(200, "修改成功");
				}
			}
		} catch (Exception e) {
			if (e.getMessage() != null && e.getMessage().indexOf("timeout") > -1) {
				result = AuvgoResult.build(201, "网络超时，请查网络连接！");
			} else {
				result = AuvgoResult.build(300, e.getMessage());
			}
			log.error("saveOrUpdateCert fail", e);
		}
		return result;
	}

	/**
	 * 修改证件为默认值
	 *
	 * @param data
	 * @return
	 */
	@RequestMapping(value = "/update/cert/defult", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult updateCertIsDefault(CrmEmployeeCertModel cert) {
		AuvgoResult result = null;
		try {
			baseBusiness.updateCertIsDefault(cert);
			result = AuvgoResult.build(200, "设置默认成功");
		} catch (Exception e) {
			if (e.getMessage() != null && e.getMessage().indexOf("timeout") > -1) {
				result = AuvgoResult.build(201, "网络超时，请查网络连接！");
			} else {
				result = AuvgoResult.build(300, e.getMessage());
			}
			log.error("saveOrUpdateCert fail", e);
		}
		return result;
	}

	/**
	 * 删除证件信息
	 *
	 * @param data
	 * @return
	 */
	@RequestMapping(value = "/delete/cert", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult deleteCert(String certId) {
		AuvgoResult result = null;
		try {
			if (StringUtils.isBlank(certId)) {
				result = AuvgoResult.build(300, "证件id为空");
			} else {
				Boolean deleteCert = baseBusiness.deleteCert(Long.valueOf(certId));
				result = AuvgoResult.build(200, "删除成功", deleteCert);
			}
		} catch (Exception e) {
			if (e.getMessage() != null && e.getMessage().indexOf("timeout") > -1) {
				result = AuvgoResult.build(201, "网络超时，请查网络连接！");
			} else {
				result = AuvgoResult.build(300, e.getMessage());
			}
			log.error("deleteCert fail", e);
		}
		return result;
	}

	/**
	 * 获取证件规则描述
	 *
	 * @param data
	 * @return
	 */
	@RequestMapping(value = "/cert/rule/describe", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult certRuleDescribe() {
		AuvgoResult result = null;
		try {
			List<CertRuleDescribeModel> list = baseBusiness.certRuleDescribe();
			result = AuvgoResult.build(200, "OK", list);
		} catch (Exception e) {
			if (e.getMessage() != null && e.getMessage().indexOf("timeout") > -1) {
				result = AuvgoResult.build(201, "网络超时，请查网络连接！");
			} else {
				result = AuvgoResult.build(300, e.getMessage());
			}
			log.error("certRuleDescribe fail", e);
		}
		return result;
	}

	/**
	 * 添加或编辑员工信息如果有证件信息则检查证件信息
	 * 
	 * @param updateEm
	 *            修改信息
	 * @return
	 */
	@RequestMapping(value = "/save/update/employee", method = { RequestMethod.POST, RequestMethod.GET })
	public @ResponseBody AuvgoResult saveOrUpdateEmployee(UpdateCrmEmployeeModel updateEm) {
		AuvgoResult auvgoResult = null;
		try {
			CrmEmployee user = getUser();
			Map<String, Object> map = new HashMap<String, Object>();
			List<CrmEmployeeCertModel> list = baseBusiness.saveOrUpdateEmployee(updateEm, user, map);
			if (list != null && !list.isEmpty()) {
				auvgoResult = AuvgoResult.build(Integer.valueOf(BaseErrorMsg.ERR_411.getCode()), BaseErrorMsg.ERR_411.getMsg(), list);
			} else {
				auvgoResult = AuvgoResult.build(Integer.valueOf(BaseErrorMsg.ERR_200.getCode()), BaseErrorMsg.ERR_200.getMsg(), map.get("crmEmployee"));
			}
		} catch (Exception e) {
			if (e.getMessage() != null && e.getMessage().indexOf("timeout") > -1) {
				auvgoResult = AuvgoResult.build(Integer.valueOf(BaseErrorMsg.ERR_201.getCode()), BaseErrorMsg.ERR_201.getMsg());
			} else {
				auvgoResult = AuvgoResult.build(Integer.valueOf(BaseErrorMsg.ERR_300.getCode()), e.getMessage());
			}
			log.error("saveOrUpdateEmployee fail", e);
		}
		return auvgoResult;
	}

	@Autowired(required = false)
	public void setBaseBusiness(IBaseBusiness baseBusiness) {
		this.baseBusiness = baseBusiness;
	}

}
