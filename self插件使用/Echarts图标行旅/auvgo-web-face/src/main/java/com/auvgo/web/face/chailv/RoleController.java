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
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.auvgo.core.query.QueryFilter;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.crm.api.CrmDepartmentService;
import com.auvgo.crm.api.CrmEmployeeService;
import com.auvgo.crm.api.CrmRoleService;
import com.auvgo.crm.entity.CrmCompany;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.crm.entity.CrmRole;
import com.auvgo.sys.api.SysMenuService;
import com.auvgo.web.contant.ErrorCode;
import com.auvgo.web.face.BaseController;
import com.github.pagehelper.PageInfo;
import com.google.common.collect.Lists;

@Controller
@RequestMapping("/crm/role")
public class RoleController extends BaseController {
	
	@Autowired
	CrmRoleService roleService;
	@Autowired
	SysMenuService  menuService;
	@Autowired
	CrmEmployeeService employeeService;
	@Autowired
	CrmDepartmentService departmentService;
	
	
	@RequestMapping("")
	public String page(@RequestParam(defaultValue = "1") int pageNum,Integer pageSize, HttpServletRequest request) {
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		if(null == company){
			setAttr("msg", "请您重新登录！");
			return "redirect:/login";
		}
		pageSize = null == pageSize?PAGE_SIZE.intValue():pageSize;
		QueryFilter filter = new QueryFilter();
		PageInfo<CrmRole> page = roleService.findPageBy(pageNum, pageSize, company.getId(), filter.buildSql(request));
		if (page.getPageNum() > 1 && page.getSize() == 0) {
			page = roleService.findPageBy(pageNum - 1, pageSize, company.getId(), filter.buildSql(request));
		}
		request.setAttribute("page", page);
		request.setAttribute("pageSize", pageSize);
		return "crm/role-permissions";
	}

	@RequestMapping("/add/{cid}")
	public String add(@PathVariable Long cid, Model model) {
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		model.addAttribute("cid", company.getId());
		model.addAttribute("menutree", menuService.getMenuZtree(1));//1表示前台的菜单
		return "crm/role-add";
	}

	@RequestMapping("/edit/{id}")
	public String edit(@PathVariable Long id, Model model) {
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		model.addAttribute("cid", company.getId());// 公司id
		Set<Long> checkMenus = roleService.getCheckMenus(company.getId(), id);
		StringBuffer sb = new StringBuffer("/");
		for (Long long1 : checkMenus) {
			sb.append(long1+"/");
		}
		setAttr("Menus", sb.toString());
		model.addAttribute("menutree", menuService.getMenuCheckedZtree(1, checkMenus));//添加角色页面的菜单
		model.addAttribute("role", roleService.getById(id));
		return "crm/role-add";
	}

	@RequestMapping("/remove/{id}")
	@ResponseBody
	public AuvgoResult remove(@PathVariable Long id) {
		try {
			CrmCompany company = (CrmCompany) getSessionAttr("company");
			roleService.deleteById(company.getId(), id);
			return AuvgoResult.build(ErrorCode.SUCCESS, ErrorCode.getMsg(ErrorCode.SUCCESS));
		} catch (Exception e) {
			return AuvgoResult.build(ErrorCode.ERROR, "删除角色失败");
		}
	}

	//跳转到角色关联员工
	@SuppressWarnings("deprecation")
	@RequestMapping("/relationemployee/{roleid}")
	public String relationemployee(@PathVariable Long roleid,HttpServletRequest request,String deptid) {
		QueryFilter filter = new QueryFilter();
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		//List<CrmEmployee> page = employeeService.getALLEmployeeName(company.getId(),filter.buildSql(request));//查询所有的员工id和姓名
		Long cid = company.getId();
		List<CrmEmployee> list = Lists.newArrayList();
		
		PageInfo<CrmEmployee> result = employeeService.findPageByDeptid(1, 50, cid, filter.buildSql(request),deptid);
		list.addAll(result.getList());
		for (int page = 2; page < result.getPages(); page++) {
			PageInfo<CrmEmployee> pageList = employeeService.findPageByDeptid(page, 50, cid, filter.buildSql(request),deptid);
			list.addAll(pageList.getList());
		}

		
		List<CrmEmployee> newEmp = Lists.newArrayList();
		List<CrmEmployee> existEmployee = Lists.newArrayList();
 		Set<Long> chooseEmpid = roleService.getCheckedRoleEmployee(company.getId(), roleid);
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
		setAttr("page", newEmp);//显示左侧在未勾选的
		setAttr("existEmployee", existEmployee);//放在右侧已经勾选的
		setAttr("depttree", departmentService.getDeptZtree(company.getId(), null));
		setAttr("roleId", roleid);
		setAttr("deptid", deptid);
		return "crm/role-permissions-user";
	}
	
	//保存勾选上的员工
	@RequestMapping(value = "/save", method = RequestMethod.POST)
	@ResponseBody
	public AuvgoResult saveRole(CrmRole role, String menuId, String authrity) {
		try {
			String menuids[] = menuId.split("/");
			String authritys[] = authrity.split("/");
			roleService.saveOrUpdate(role, menuids, authritys);
			return AuvgoResult.build(ErrorCode.SUCCESS,ErrorCode.getMsg(ErrorCode.SUCCESS));
		} catch (Exception e) {
			e.printStackTrace();
			return AuvgoResult.build(500, "保存角色失败");
		}
	}
	
	@RequestMapping(value = "/saveemployee", method = RequestMethod.POST)
	@ResponseBody
	public AuvgoResult saveemployee(Long roleid, String employeeids) {
		try {
			CrmCompany company = (CrmCompany) getSessionAttr("company");
			String employeeid[] = StringUtils.removeEnd(employeeids, "-").split("-");
			roleService.saveRoleEmployee(company.getId(), roleid, employeeid);
			return AuvgoResult.ok();
		} catch (Exception e) {
			return AuvgoResult.build(500, "分配角色用户失败");
		}
	}
	
	

}
