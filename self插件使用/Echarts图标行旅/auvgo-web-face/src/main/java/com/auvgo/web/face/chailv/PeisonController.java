package com.auvgo.web.face.chailv;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import com.auvgo.core.query.QueryFilter;
import com.auvgo.core.string.RegExpValidator;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.crm.api.CrmCompanyService;
import com.auvgo.crm.api.CrmPeisonaddressService;
import com.auvgo.crm.entity.CrmCompany;
import com.auvgo.crm.entity.CrmPeisonaddress;
import com.auvgo.web.contant.ErrorCode;
import com.auvgo.web.face.BaseController;
import com.github.pagehelper.PageInfo;

@Controller
@RequestMapping("/crm/psaddress")
public class PeisonController extends BaseController {
	@Autowired
	private CrmPeisonaddressService peisonaddressService;
	@Autowired
	private CrmCompanyService  companyService;

	@RequestMapping("/")
	public String toPage(@RequestParam(defaultValue = "1") int pageNum,Integer pageSize) {
		CrmCompany company = getCompany();
		if(null == company){
			setAttr("msg", "请您重新登录！");
			return "redirect:/login";
		}
		Long cid = company.getId();
		pageSize = null == pageSize?PAGE_SIZE.intValue():pageSize;
		QueryFilter filter = new QueryFilter();
		PageInfo<CrmPeisonaddress> page = peisonaddressService.findPageBy(pageNum, pageSize, cid, filter.buildSql(request));
		setAttr("page", page);
		request.setAttribute("pageSize", pageSize);
		return "/crm/address-distrbution";
	}
	
	@RequestMapping("/add")
	public String toAddPage(){
		return "/crm/address-add";
	}
	
	@RequestMapping("/edit/{addid}")
	public String toEditPage(@PathVariable("addid")Long addid){
			CrmPeisonaddress address = peisonaddressService.getById(addid);
			setAttr("address", address);
			return "/crm/address-add";
	}	
	@RequestMapping("/save")
	@ResponseBody
	public AuvgoResult save(CrmPeisonaddress address){
		String companycode = address.getCompanycode();
		try {
			if(null ==address.getId()){
				if(null !=companycode || !"".equals(companycode)){
					CrmCompany crmcompany = companyService.findByKaHao(companycode.toUpperCase());
					if(null == crmcompany){
						return AuvgoResult.build(300, "公司卡号输入有误");
					}
					address.setCompanyid(crmcompany.getId());
					address.setCompanycode(companycode.toUpperCase());
					address.setCompanyname(crmcompany.getName());
				}else{
					return AuvgoResult.build(300, "公司卡号输入有误");
				}
			}
			String linkmobile = address.getLinkmobile();
			if (StringUtils.isNotBlank(linkmobile)) {
				if (!RegExpValidator.isMobile(linkmobile)) {
					return AuvgoResult.build(300, "手机号码格式有误");
				}
				
			}
			peisonaddressService.saveOrUpdate(address);
			return AuvgoResult.ok();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(ErrorCode.SUCCESS, ErrorCode.getMsg(ErrorCode.SUCCESS));
	}
	
	@RequestMapping("/remove")
	@ResponseBody
	public AuvgoResult remove(@RequestParam("id") Long id){
		try {
			peisonaddressService.deleteById(id);
			return AuvgoResult.build(ErrorCode.SUCCESS, ErrorCode.getMsg(ErrorCode.SUCCESS));
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "删除失败!!");
	}
	
	@RequestMapping("/editStatus/{id}/{status}")
	public String editStatus(@PathVariable("id") Long id,@PathVariable("status") Integer status){
		try {
			if(null != status){
				CrmPeisonaddress crmPeisonaddress = new CrmPeisonaddress();
				crmPeisonaddress.setStatus(status);
				crmPeisonaddress.setId(id);
				peisonaddressService.saveOrUpdate(crmPeisonaddress);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "redirect:/crm/psaddress/";
	}
}
