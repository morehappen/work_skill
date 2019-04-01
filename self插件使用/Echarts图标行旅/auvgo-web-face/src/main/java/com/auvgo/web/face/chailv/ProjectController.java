package com.auvgo.web.face.chailv;

import com.auvgo.core.query.QueryFilter;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.DateUtil;
import com.auvgo.core.utils.JsonUtils;
import com.auvgo.crm.api.CrmDepartmentService;
import com.auvgo.crm.api.CrmEmployeeService;
import com.auvgo.crm.api.CrmProjectService;
import com.auvgo.crm.entity.CrmCompany;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.crm.entity.CrmProject;
import com.auvgo.web.contant.ErrorCode;
import com.auvgo.web.face.BaseController;
import com.github.pagehelper.PageInfo;
import com.google.common.collect.Lists;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

@Controller
@RequestMapping("/crm/project/")
public class ProjectController extends BaseController {
	@Autowired
	private CrmProjectService projectService;
	@Autowired
	private CrmEmployeeService crmEmployeeService;
	@Autowired
	private CrmDepartmentService crmDepartmentService;
	@RequestMapping("/")
	public String page(@RequestParam(defaultValue = "1") Integer pageNum, Integer pageSize,  HttpServletRequest request) {
		CrmCompany company = getCompany();
		if(null == company){
			setAttr("msg", "请您重新登录！");
			return "redirect:/login";
		}
		Long cid = company.getId();
		pageSize = null == pageSize?PAGE_SIZE.intValue():pageSize;
		QueryFilter filter = new QueryFilter();
		PageInfo<CrmProject> page = projectService.findPageBy(pageNum,pageSize, cid, filter.buildSql(request));
		List<CrmProject> list = page.getList();
		DateFormat fmt = new SimpleDateFormat("yyyy-MM-dd"); 
		//String now = fmt.format(new Date());
		try {
			//Date nowtime=fmt.parse(now);
			Date nowtime= new Date();
		for (CrmProject crmProject : list) {
			Date start=fmt.parse(crmProject.getStartdate());//项目开始时间
			Date end=fmt.parse(crmProject.getEnddate());//项目结束时间
			Calendar endNow = Calendar.getInstance();
			endNow.setTime(end);
			endNow.add(Calendar.DAY_OF_YEAR,1);//
		    Date endDate=endNow.getTime();
	        
			if(!endDate.before(nowtime)){
				if(nowtime.after(start)){
					crmProject.setStatus(1);//项目进行时
				}else{
					crmProject.setStatus(0);//项目未开始
				}
			}else{
				crmProject.setStatus(2);//表示项目结束
			}
		 }
		} catch (ParseException e) {
			e.printStackTrace();
		}
		request.setAttribute("page", page);
		request.setAttribute("list", list);
		request.setAttribute("pageSize", pageSize);
		return "/crm/project-manage";
	}
	
	@RequestMapping("/add")
	public String toAddPage(Model model){
		return "/crm/project-add";
		
	}
	
	@RequestMapping("/edit/{proid}")
	public String toEditPage(@PathVariable("proid")Long proid,Model model){
			CrmProject project = projectService.getById(proid);
			model.addAttribute("pro", project);
			return "/crm/project-add";
	}
	
	@RequestMapping("/save")
	@ResponseBody
	public AuvgoResult save(CrmProject project){
		try {
			if(null == project || null ==project.getCompanyid()){
				return AuvgoResult.build(300, "输入数据有误！");
			}
			
			Integer exist = projectService.checkExist(project.getCompanyid(), project.getCode());
			
			if(null == project.getId()){//保存
				if(exist>0){
					return AuvgoResult.build(300, "已存在此项目编码，请您重新输入！");
				}
			}else{
				CrmProject crmProject = projectService.getById(project.getId());
				if(exist>0 &&!crmProject.getCode().equals(project.getCode())){
					return AuvgoResult.build(300, "已存在此项目编码，请您重新输入！");
				}
			}
			if(DateUtil.getDifferenceBetweenDay(new Date(),DateUtil.getDateFormat(project.getStartdate()))>=0){
				project.setStatus(1);
			}
			projectService.saveOrUpdate(project);
			return AuvgoResult.build(200, "保存成功！");
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "保存失败!!");
	}
	
	@RequestMapping("/remove/{id}")
	@ResponseBody
	public AuvgoResult remove(@PathVariable("id") Long id){
		try {
			projectService.deleteById(id,getCompany().getId());
			return AuvgoResult.ok();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "删除失败!!");
	}
	//关联员工查询
	@SuppressWarnings("deprecation")
	@RequestMapping("/toRelateEmpPage/{proId}")
	public String toEmpPage(@PathVariable("proId") Long proId,HttpServletRequest request,String deptid){
		QueryFilter filter = new QueryFilter();
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		Long cid = company.getId();
		List<CrmEmployee> list = Lists.newArrayList();
		PageInfo<CrmEmployee> result = crmEmployeeService.findPageByDeptid(1, 50, cid, filter.buildSql(request),deptid);
		list.addAll(result.getList());
		for (int page = 2; page < result.getPages(); page++) {
			PageInfo<CrmEmployee> pageList = crmEmployeeService.findPageByDeptid(page, 50, cid, filter.buildSql(request),deptid);
			list.addAll(pageList.getList());
		}
		List<CrmEmployee> existEmployee = Lists.newArrayList();
		List<CrmEmployee> newEmp= Lists.newArrayList();
		Set<Long> chooseEmpid =projectService.getProjectEmployee(company.getId(),proId);
		for (int i = 0; i < list.size(); i++) {
			if(chooseEmpid.contains(list.get(i).getId())){
				existEmployee.add(list.get(i));
			}else{
				newEmp.add(list.get(i));
			}
		}
		List<Long> checkdept = Lists.newArrayList();
		if(null != chooseEmpid && !chooseEmpid.isEmpty()){
			List<CrmEmployee> emps = crmEmployeeService.getEmpListById(cid,chooseEmpid.toArray());
			for (CrmEmployee depts : emps){
				checkdept.add(depts.getDeptid());
			}
			request.setAttribute("choosedeptids",checkdept);
		}
		setAttr("depttree", crmDepartmentService.getDeptZtree(company.getId(), null));
		setAttr("proid", proId);
		setAttr("deptid", deptid);
		setAttr("companyid", company.getId());
		setAttr("page", newEmp);//显示左侧在未勾选的
		setAttr("existEmployee", existEmployee);//放在右侧已经勾选的
		return "/crm/project-center-associated";
	}
	/**
	 * 关联的人
	 * @param proId
	 * @param employeeids
	 * @return
	 */
	@RequestMapping("/saveRelateEmployee")
	@ResponseBody
	public AuvgoResult saveRelateEmployee(Long proId,String employeeids,String flag,String deptid){
		if(null == proId || StringUtils.isBlank(employeeids)){
			return AuvgoResult.build(ErrorCode.WRONG_PARAMS, ErrorCode.getMsg(ErrorCode.WRONG_PARAMS));
		}
		try {
			CrmCompany company = (CrmCompany) getSessionAttr("company");
			if(StringUtils.isBlank(flag)){
				List<Map<String,Object>> emps;
				emps = projectService.getCidAndEmployees(company.getId(),employeeids);//先查员工
				List<Map<String,Object>> lists = Lists.newArrayList();
				if (emps != null && !emps.isEmpty()){
					Iterator<Map<String, Object>> iterator = emps.iterator();
					while(iterator.hasNext()){
						Map<String, Object> next = iterator.next();
						String projectId = String.valueOf(next.get("id"));
						if(Long.valueOf(projectId).longValue() != proId.longValue()){
							lists.add(next);
						}
					}
					if(null != lists && !lists.isEmpty()){
						return  AuvgoResult.build(300,"error", JsonUtils.objectToJson(lists));
					}
				}else{
					emps= projectService.getCidAndDepts(company.getId(),deptid);
					if (emps != null && !emps.isEmpty()){
						Iterator<Map<String, Object>> iterator = emps.iterator();
						while(iterator.hasNext()){
							Map<String, Object> next = iterator.next();
							String projectId = String.valueOf(next.get("id"));
							if(Long.valueOf(projectId).longValue() != proId.longValue()){
								lists.add(next);
							}
						}
					}
					if (null != lists && !lists.isEmpty()){
						return  AuvgoResult.build(300,"error", JsonUtils.objectToJson(lists));
					}
				}
			}
			projectService.saveEmpAndProject(company.getId(),proId,employeeids);
			return AuvgoResult.build(ErrorCode.SUCCESS, ErrorCode.getMsg(ErrorCode.SUCCESS));
		} catch (Exception e) {
			log.error("saveRelateEmployee error",e);
			return  AuvgoResult.build(ErrorCode.ERROR,ErrorCode.getMsg(ErrorCode.ERROR));
		}
	}

	//跳转项目中心关联部门
	@RequestMapping("/toRelatePage/{proId}")
	public String toRelateDepartmentPage(@PathVariable("proId") Long proId){
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		Set<Long> checkdeps = projectService.getProjectdept(company.getId(), proId);
		request.setAttribute("depttree", crmDepartmentService.getDeptZtree(company.getId(), checkdeps));
		setAttr("project", proId);
		setAttr("companyid", company.getId());
		return "/crm/project-center-associated-dept";//跳转到关联部门的页面
	}
	//关联部门
	@RequestMapping("/save/relateDepart")
	@ResponseBody
	public AuvgoResult saveRelateDepart(Long proid, String deptids,String flag){
		if(null == proid || StringUtils.isBlank(deptids)){
			return AuvgoResult.build(ErrorCode.WRONG_PARAMS, ErrorCode.getMsg(ErrorCode.WRONG_PARAMS));
		}
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		if(StringUtils.isBlank(flag)){
			List<Map<String,Object>> emps= projectService.getCidAndDepts(company.getId(),deptids);
			if(null != emps && !emps.isEmpty()){
			List<Map<String,Object>>	lists = Lists.newArrayList();
				Iterator<Map<String, Object>> iterator = emps.iterator();
				while(iterator.hasNext()){
					Map<String, Object> next = iterator.next();
					String projectId = String.valueOf(next.get("id"));
					if(Long.valueOf(projectId).longValue() != proid.longValue()){
						lists.add(next);
					}
				}
				if (null != lists && !lists.isEmpty()){
					return  AuvgoResult.build(300,"error", JsonUtils.objectToJson(lists));
				}
			}
		}
		try {
			projectService.saveDepAndProject(company.getId(),proid,deptids);
			return AuvgoResult.build(ErrorCode.SUCCESS, ErrorCode.getMsg(ErrorCode.SUCCESS));
		} catch (Exception e) {
			log.error("saveRelateDepart error ",e);
			return AuvgoResult.build(ErrorCode.ERROR_NONE, ErrorCode.getMsg(ErrorCode.ERROR_NONE));
		}
	}
}
