package com.auvgo.web.face.chailv;

import java.util.List;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.auvgo.core.query.QueryFilter;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.ValidFormResult;
import com.auvgo.crm.api.CrmApproveService;
import com.auvgo.crm.api.CrmDepartmentService;
import com.auvgo.crm.api.CrmEmployeeService;
import com.auvgo.crm.entity.CrmApprove;
import com.auvgo.crm.entity.CrmCompany;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.web.face.BaseController;
import com.github.pagehelper.PageInfo;
import com.google.common.collect.Lists;

@Controller
@RequestMapping("/crm/approve")
public class ShenpiController extends BaseController {
	@Autowired
	CrmApproveService approveService;
	@Autowired
	CrmDepartmentService departmentService;
	@Autowired
	CrmEmployeeService employeeService;

	@RequestMapping("/")
	public String approve( @RequestParam(defaultValue = "1") int pageNum,Integer pageSize, HttpServletRequest request) {
		CrmCompany company = getCompany();
		if(null == company){
			setAttr("msg", "请您重新登录！");
			return "redirect:/login";
		}
		pageSize = null == pageSize?PAGE_SIZE.intValue():pageSize;
		Long cid = company.getId();
		QueryFilter filter = new QueryFilter();
		PageInfo<CrmApprove> page = approveService.findPageBy(pageNum, pageSize, cid, filter.buildSql(request));
		request.setAttribute("page", page);
		request.setAttribute("pageSize", pageSize);
		return "crm/approve-manage";
	}

	@RequestMapping("/add")
	public String add() {
		return "crm/add-approve-manage";
	}

	@RequestMapping("/edit/{approveid}")
	public String edit(@PathVariable("approveid") Long approveid, Model model) {
		CrmCompany company = getCompany();
		if(null == company){
			setAttr("msg", "请您重新登录！");
			return "redirect:/login";
		}
		Long cid = company.getId();
		model.addAttribute("approve", approveService.getByCid(cid, approveid));
		return "crm/add-approve-manage";
	}

	@RequestMapping("/save")
	@ResponseBody
	public ValidFormResult save(CrmApprove approve, String[] spname, String[] splevel, String[] spuserid) {
		try {
			 Integer length=null;
			if(null ==approve.getId()){
			  length = approveService.checkSpname(approve.getCompanyid(),approve.getName());
			}
			 if(null==length){
				 approveService.saveOrUpdate(approve, spname, splevel, spuserid);
			 }else{
				 return ValidFormResult.error("已经包含该审批名称");
			 }
			return ValidFormResult.ok();
		} catch (Exception e) {
			return ValidFormResult.error("设置审批人失败" + e.getMessage());
		}
	}
	/**
	 * 关联部门
	 * @param cid 员工公司id
	 * @param approveid 审批id
	 * @param model
	 * @return
	 */
	@RequestMapping("/relationdept/{approveid}")
	public String relationdept( @PathVariable("approveid") Long approveid, Model model) {
		CrmCompany company = getCompany();
		if(null == company){
			setAttr("msg", "请您重新登录！");
			return "redirect:/login";
		}
		Long cid = company.getId();
		Set<Long> choosedepts = approveService.findChooseDepts(cid, approveid);
		model.addAttribute("depttree", departmentService.getDeptZtree(cid, choosedepts));
		return "crm/approve-dept-associated";
	}

	/**
	 * 关联个人
	 * @param cid
	 * @param approveid
	 * @param pageNum
	 * @param request
	 * @return
	 */
	@SuppressWarnings("deprecation")
	@RequestMapping("/relationemployee/{approveid}")
	public String relationemployee(@PathVariable("approveid") Long approveid,
			@RequestParam(defaultValue = "1") int pageNum, HttpServletRequest request,String deptid) {
		QueryFilter filter = new QueryFilter();
		CrmCompany company = getCompany();
		if(null == company){
			setAttr("msg", "请您重新登录！");
			return "redirect:/login";
		}
		Long cid = company.getId();
		List<CrmEmployee> list = Lists.newArrayList();
		
		PageInfo<CrmEmployee> result = employeeService.findPageByDeptid(pageNum, 50, cid, filter.buildSql(request),deptid);
		list.addAll(result.getList());
		for (int page = 2; page < result.getPages(); page++) {
			PageInfo<CrmEmployee> pageList = employeeService.findPageByDeptid(page, 50, cid, filter.buildSql(request),deptid);
			list.addAll(pageList.getList());
		}
		
		Set<Long> chooseEmpid = approveService.findChooseEmployees(cid, approveid);
		List<CrmEmployee> existEmployee = Lists.newArrayList();
		List<CrmEmployee> newEmp = Lists.newArrayList();
		for (int i = 0; i < list.size(); i++) {
			if(chooseEmpid.contains(list.get(i).getId())){
				existEmployee.add(list.get(i));
			}else{
				newEmp.add(list.get(i));
			}
		}
		if(chooseEmpid.size()>0 && existEmployee.size() ==0){//搜索进来的..
			existEmployee=employeeService.getEmpListById(company.getId(), chooseEmpid.toArray());
		}
		setAttr("depttree", departmentService.getDeptZtree(cid, null));
		setAttr("page", newEmp);
		setAttr("exits",existEmployee );
		setAttr("approveId", approveid);
		setAttr("deptid", deptid);
		return "crm/approve-employee-associated";
	}

	@RequestMapping("/saveapprovedept")
	@ResponseBody
	public AuvgoResult saveapprovedept(@RequestParam("approveid") Long approveid,@RequestParam("deptids") String deptids) {
		try {
			CrmCompany company = getCompany();
			if(null == company){
				return AuvgoResult.build(300, "请您重新登录！");
			}
			Long cid = company.getId();
			approveService.saveAndDeleteApproveDept(cid, approveid, deptids);
			return AuvgoResult.ok();
		} catch (Exception e) {
			return AuvgoResult.build(500, e.getMessage());
		}
	}

	@RequestMapping("/saveapproveemployee")
	@ResponseBody
	public AuvgoResult saveapproveemployee(@RequestParam("approveid") Long approveid,
			@RequestParam("employeeids") String employeeids) {
		try {
			CrmCompany company = getCompany();
		
			if(null == company || null == approveid ){
				return AuvgoResult.build(300, "请您重新登录！");
			}
			Long cid = company.getId();
			String[] ids = StringUtils.removeEnd(employeeids, "-").split("-");
			approveService.saveApproveEmployee(cid, approveid, ids);
			return AuvgoResult.ok();
		} catch (Exception e) {
			return AuvgoResult.build(500, e.getMessage());
		}
	}

	@RequestMapping("/remove/{approveid}")
	@ResponseBody
	public AuvgoResult remove(@PathVariable("approveid") Long approveid) {
		try {
			CrmCompany company = getCompany();
			if(null == company){
				return AuvgoResult.build(300, "请您重新登录!");
			}
			Long cid = company.getId();
			
			approveService.remove(cid, approveid);
			return AuvgoResult.ok();
		} catch (Exception e) {
			return AuvgoResult.build(500, e.getMessage());
		}
	}

}
