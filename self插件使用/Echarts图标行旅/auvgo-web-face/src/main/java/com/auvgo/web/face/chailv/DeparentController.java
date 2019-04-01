package com.auvgo.web.face.chailv;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.util.StringUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.auvgo.core.query.QueryFilter;
import com.auvgo.core.string.RegExpValidator;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.crm.api.CrmCostCenterService;
import com.auvgo.crm.api.CrmDepartmentService;
import com.auvgo.crm.api.CrmEmployeeService;
import com.auvgo.crm.entity.CrmCompany;
import com.auvgo.crm.entity.CrmDepartment;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.web.face.BaseController;
import com.github.pagehelper.PageInfo;
import com.google.common.collect.Lists;

@Controller
@RequestMapping("/crm/depart")
public class DeparentController extends BaseController {

	@Autowired
	private CrmDepartmentService deptService;
	@Autowired
	private CrmCostCenterService centerService;
	@Autowired
	private CrmEmployeeService crmEmployeeService;
	@RequestMapping("")
	public String page(@RequestParam(defaultValue = "1") int pageNum,Integer pageSize, HttpServletRequest request) {
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		if(null == company){
			setAttr("msg", "请您重新登录！");
			return "redirect:/login";
		}
		pageSize = null == pageSize?PAGE_SIZE.intValue():pageSize;
		
		QueryFilter filter = new QueryFilter();
		PageInfo<CrmDepartment> page = deptService.findPageBy(pageNum, pageSize, company.getId(), filter.buildSql(request));
		request.setAttribute("depttree", deptService.getDeptZtree(company.getId(), null));
		request.setAttribute("page", page);
		request.setAttribute("pageSize", pageSize);
		return "crm/department";
	}

	@RequestMapping("/dept")
	public String pageIn(@RequestParam(defaultValue = "1") int pageNum,Integer pageSize, HttpServletRequest request) {
		pageSize = null == pageSize?PAGE_SIZE:pageSize;
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		QueryFilter filter = new QueryFilter();
		PageInfo<CrmDepartment> page = deptService.findPageBy(pageNum, pageSize, company.getId(), filter.buildSql(request));
		List<CrmDepartment> list = deptService.getDepartMentByCompanyId(company.getId());
		List<CrmDepartment> newList = Lists.newArrayList();
		for (CrmDepartment crmDepartment : list) {
			List<String> asList = Arrays.asList(crmDepartment.getDepth().split("\\/"));
			if(asList.contains(String.valueOf(page.getList().get(0).getId()))){
				newList.add(crmDepartment);
			}
		}
		PageInfo<CrmDepartment> pageInfo = new PageInfo<CrmDepartment>();
		pageInfo.setList(new ArrayList<CrmDepartment>());
		pageInfo.getList().addAll(newList);
		request.setAttribute("depttree", deptService.getDeptZtree(company.getId(), null));
		pageInfo.setPageNum(pageNum);
		request.setAttribute("page", pageInfo);
		request.setAttribute("pageSize", pageSize);
		return "crm/department";
		
	}

	
	@RequestMapping("/add/{cid}")
	public String add(@PathVariable Long cid, Model model) {
		model.addAttribute("cid", cid);
		model.addAttribute("depttree", deptService.getDeptZtree(cid, null));
		return "crm/department-add";
	}

	@RequestMapping("/edit/{cid}/{id}")
	public String edit(@PathVariable Long cid, @PathVariable Long id, Model model) {
		model.addAttribute("dept", deptService.getById(cid, id));
		model.addAttribute("cid", cid);// 公司id
		model.addAttribute("depttree", deptService.getDeptZtree(cid, null));
		return "crm/department-add";
	}

	@RequestMapping(value = "/save", method = RequestMethod.POST)
	@ResponseBody
	public AuvgoResult save(CrmDepartment dept) {
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		CrmDepartment sondep=null;
		Integer existDept=0;
		String bianhao = dept.getBianhao().trim();
		String mobile = dept.getMobile();
		if (StringUtils.isNotBlank(mobile)) {
			if (!RegExpValidator.isMobile(mobile)) {
				return AuvgoResult.build(300, "手机号码格式错误");
			}
			
		}
		if(null != dept.getPid() && 0 != dept.getPid() && null !=dept.getId()){
			 sondep = deptService.getById(company.getId(), dept.getPid());
		if(sondep.getPid().toString().equals(dept.getId().toString()) || sondep.getId().toString().equals(dept.getId().toString())){
			return AuvgoResult.build(300, "不能将该部门设置为父部门");
			}
		}
		if(null==dept.getId()){
			 existDept = deptService.existDept(bianhao,company.getId());
		}
		if(existDept>0){
			return AuvgoResult.build(300, "此部门编号已经存在");
		}
		dept.setBianhao(bianhao);
		deptService.saveOrUpdate(dept);
		return AuvgoResult.ok();
	}

	@RequestMapping("/remove/{id}")
	@ResponseBody
	public AuvgoResult remove( @PathVariable Long id) {
		if(null==id){
			return AuvgoResult.build(300, "删除数据有误");
		}
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		deptService.deleteById(company.getId(),id);
		deleteSonDepart(company.getId(), id);
		return AuvgoResult.ok();
	}
	
	
	//递归删除子部门
	private void deleteSonDepart(Long cid,Long pid){
		List<CrmDepartment> list = deptService.getDepByPid(cid,pid);
		if(null ==list || list.size()==0){
			return ;
		}else{
			for (CrmDepartment crmDepartment : list) {
				deptService.deleteById(crmDepartment.getCompanyid(), crmDepartment.getId());
				deleteSonDepart(crmDepartment.getCompanyid(),crmDepartment.getPid());
			}
		}
		
	}
	
	

	@SuppressWarnings({ "rawtypes", "unchecked" })
	@RequestMapping("/download")
	public ResponseEntity download(HttpServletRequest request) throws IOException {
		String dfileName = "部门导入模板.xls";
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
		headers.setContentDispositionFormData("attachment", new String(dfileName.getBytes("utf-8"), "ISO8859-1"));
		String path = this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath() + "download";
		// 获取到项目中的src路径
		File file = new File(path + File.separator + dfileName);
		return new ResponseEntity(FileUtils.readFileToByteArray(file), headers, HttpStatus.CREATED);
	}

	@RequestMapping("/toupload/{cid}")
	public String toupload(@PathVariable("cid") Long cid) {
		return "crm/department-upload";
	}

	@RequestMapping("/upload/{cid}")
	@ResponseBody
	public AuvgoResult upload(@PathVariable("cid") Long cid, HttpServletRequest request) {
		MultipartHttpServletRequest mulRequest = (MultipartHttpServletRequest) request;
		POIFSFileSystem fileSystem = null;
		HSSFWorkbook hssf = null;
		try {
			MultipartFile file = mulRequest.getFile("mydepfile");
			if (null == file) {
				return AuvgoResult.build(300, "上传文件不能为空");
			}
			fileSystem = new POIFSFileSystem(file.getInputStream());
			hssf = new HSSFWorkbook(fileSystem);
			HSSFSheet sheet = hssf.getSheetAt(0);
			for (int i = 1; i <= sheet.getLastRowNum(); i++) {
				HSSFRow row = sheet.getRow(i);
				if (null == row.getCell(0)) {
					continue;
				}
				if (null == row.getCell(1)) {
					continue;
				}
				if (null == row.getCell(2)) {
					continue;
				}
				String DepLeader = null;
				String DepMobile = null;
				row.getCell(0).setCellType(CellType.STRING);
				String bianhao = row.getCell(0).getStringCellValue().trim();// 本部门编号
				String name = row.getCell(1).getStringCellValue().trim();// 部门名称
				row.getCell(2).setCellType(CellType.STRING);// 上级部门编号
				String parentbianhao = row.getCell(2).getStringCellValue().trim();// 上级部门编号
				if (null != row.getCell(3) || "".equals(row.getCell(3))) {
					row.getCell(3).setCellType(CellType.STRING);
					DepLeader = row.getCell(3).getStringCellValue();// 部门领导人
				}
				if (null != row.getCell(4) || "".equals(row.getCell(4))) {
					row.getCell(4).setCellType(CellType.STRING);
					DepMobile = row.getCell(4).getStringCellValue();// 部门电话
					if (StringUtils.isNotBlank(DepMobile)) {
						if (!RegExpValidator.isMobile(DepMobile)) {
							log.info("部门名称:"+name+",部门电话"+DepMobile+"格式有误");
						}
						
					}
				}
				CrmDepartment department = new CrmDepartment();
				department.setCompanyid(cid);
				department.setBianhao(bianhao);
				department.setName(name);
				department.setMobile(DepMobile);
				department.setContact(DepLeader);
				CrmDepartment Dept = deptService.getDepartMentByBianhaoAndCompanyId(parentbianhao, cid);
				if (null != Dept) {
					department.setPid(Dept.getId());
				} else {
					department.setPid(0L);
				}
				department.setCreatetime(new Date());
				department.setStatus(0);
				CrmDepartment dept = deptService.getDepartMentByBianhaoAndCompanyId(bianhao, cid);
				if (null == dept) {
					deptService.saveOrUpdate(department);
				} else {
					department.setId(dept.getId());
					deptService.updateDepart(department);
				}
			}
			return AuvgoResult.build(200, "部门批量上传成功");
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (null != hssf) {
					hssf.close();
				}
				if (null != fileSystem) {
					fileSystem.close();
				}
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return AuvgoResult.build(300, "导入失败,请保证excel格式为03版本");
	}
	
	//批量生成成本中心
	@RequestMapping("/saveList/{companyid}")
	@ResponseBody
	public AuvgoResult saveCostList(String ss,@PathVariable("companyid") Long cid){
		String[] str = StringUtils.removeEnd(ss, "-").split("-");
		try {
			centerService.saveList(cid,str);
			return AuvgoResult.ok();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "批量保存成本中心失败");
		
	}
	
	@RequestMapping("/editStatus/{deptid}/{status}")
	public String editStatus(@PathVariable("deptid") Long deptid,@PathVariable("status") Integer status){
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		CrmDepartment department = deptService.getById(company.getId(), deptid);
		department.setStatus(status);
		deptService.updateDepart(department);
		editDepartList(department.getCompanyid(),department.getId(),status);
		editEmployeeList(department.getCompanyid(),department.getId(),status);
		return "redirect:/crm/depart";
	}
	
	
	//递归删除子部门
	private void editDepartList(Long cid,Long pid,Integer status){
		List<CrmDepartment> list = deptService.getDepByPid(cid,pid);
		if(null ==list || list.size()==0){
			return ;
		}else{
			for (CrmDepartment crmDepartment : list) {
				crmDepartment.setStatus(status);
				deptService.updateDepart(crmDepartment);
				editDepartList(crmDepartment.getCompanyid(),crmDepartment.getId(),status);
			}
		}
		
	}
	
	//编辑员工
	private void editEmployeeList(Long cid,Long pid,Integer status){
		
		List<CrmEmployee> list = crmEmployeeService.findAllEmployeeByCompanyId(cid);
		if(null ==list || list.size()==0){
			return ;
		}else{
			List<CrmEmployee> newList = Lists.newArrayList();
			for (CrmEmployee crmEmployee : list) {
				if(StringUtils.isBlank(crmEmployee.getDepth())) continue;
				List<String> pidList = Arrays.asList(crmEmployee.getDepth().split("\\/"));
				if(pidList.contains(String.valueOf(pid))){
					if(status==0){
						crmEmployee.setKaitong(1);
					}else{
						crmEmployee.setKaitong(0);
					}
					newList.add(crmEmployee);
				}
			}
			crmEmployeeService.updateEmployee(newList);
		}
	}
	

}
