package com.auvgo.web.face.common;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import com.auvgo.business.common.BaseUtils;
import com.auvgo.business.common.IBaseBusiness;
import com.auvgo.business.common.module.CertRuleDescribeModel;
import com.auvgo.business.common.module.CertTypeModel;
import com.auvgo.constants.Language;
import com.auvgo.core.contant.AuvStatusContant;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.crm.pojo.CrmEmployeeCertModel;
import com.auvgo.web.face.BaseController;

/**
 * 员工证件
 * 
 * @author liucongcong
 *
 */
@Controller
@RequestMapping("/employess/cert")
public class EmployessCertController extends BaseController {

	/** 基础数据 **/
	private IBaseBusiness baseBusiness;

	@RequestMapping("/list")
	public ModelAndView list() {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			CrmEmployee user = getUser();
			List<CrmEmployeeCertModel> list = baseBusiness.getEmpCert(user.getCompanyid(), user.getId());
			map.put("certs", list);
		} catch (Exception e) {
			log.error("list fail", e);
		}
		return new ModelAndView("/crm/personal-center/credentials-infor", map);
	}

	@RequestMapping("/update/{certid}")
	public ModelAndView update(@PathVariable("certid") Long certid) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			CrmEmployee user = getUser();
			CrmEmployeeCertModel cretModel = null;
			if (certid == 0d) {
				cretModel = new CrmEmployeeCertModel();
				cretModel.setCerttype(AuvStatusContant.TRAIN_IDS_TYPE_ERDAI);
				cretModel.setDefaultLanguage(BaseUtils.certTypeLanager(cretModel.getCerttype()));
				cretModel.setBilingualism(BaseUtils.certBilingualism(cretModel.getCerttype()));
				cretModel.setIsChinese(Language.CN.equals(cretModel.getDefaultLanguage()) ? true : false);
			} else {
				cretModel = baseBusiness.getEmpCertInfo(certid);
			}
			// 系统支持的证件类型
			List<CertTypeModel> certtype = baseBusiness.obtainCerttype();
			// 证件规则
			List<CertRuleDescribeModel> certRules = baseBusiness.certRuleDescribe();
			map.put("cert", cretModel);
			map.put("certtype", certtype);
			map.put("certRules", certRules);
			map.put("employee", user);
		} catch (Exception e) {
			log.error("update fail", e);
		}
		return new ModelAndView("/crm/personal-center/edit-credentials", map);
	}

	@Autowired(required = false)
	public void setBaseBusiness(IBaseBusiness baseBusiness) {
		this.baseBusiness = baseBusiness;
	}

}
