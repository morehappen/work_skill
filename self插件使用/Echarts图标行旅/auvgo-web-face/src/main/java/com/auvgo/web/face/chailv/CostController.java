package com.auvgo.web.face.chailv;

import com.auvgo.core.query.QueryFilter;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.JsonUtils;
import com.auvgo.crm.api.CrmCostCenterService;
import com.auvgo.crm.api.CrmDepartmentService;
import com.auvgo.crm.api.CrmEmployeeService;
import com.auvgo.crm.entity.CrmCompany;
import com.auvgo.crm.entity.CrmCostCenter;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.web.contant.ErrorCode;
import com.auvgo.web.face.BaseController;
import com.github.pagehelper.PageInfo;
import com.google.common.collect.Lists;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
import org.apache.poi.ss.usermodel.CellType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.util.*;

@Controller
@RequestMapping("/crm/cost")
public class CostController extends BaseController {
	Logger logger = LoggerFactory.getLogger(getClass());
		
	@Autowired
	CrmCostCenterService costCenterService;
	@Autowired
	CrmDepartmentService deptService;
	@Autowired
	CrmEmployeeService employeeService;
	
	
	@RequestMapping("")
	public String page(@RequestParam(defaultValue = "1") int pageNum,Integer pageSize, HttpServletRequest request) {
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		pageSize = null == pageSize?PAGE_SIZE.intValue():pageSize;
		QueryFilter filter = new QueryFilter();
		PageInfo<CrmCostCenter> page = costCenterService.findPageBy(pageNum, pageSize, company.getId(), filter.buildSql(request));
		if (page.getList().size() == 0 && pageNum != 1) {
			page = costCenterService.findPageBy(pageNum - 1, pageSize, company.getId(), filter.buildSql(request));
		}
		request.setAttribute("page", page);
		request.setAttribute("pageSize", pageSize);
		return "/crm/cost-center";
	}

	@RequestMapping("/add")
	public String add( Model model) {
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		model.addAttribute("cid", company.getId());
		return "/crm/cost-center-add";
	}

	@RequestMapping("/save")
	@ResponseBody
	public AuvgoResult save(CrmCostCenter costCenter) {
		logger.debug("/crm/cost/save"+costCenter);
		try {
			costCenter.setParentid(0L);
			costCenterService.saveOrUpdate(costCenter);
			return AuvgoResult.ok();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "保存失败!!");
	}

	@RequestMapping("/edit/{id}")
	public String edit(@PathVariable("id") Long id, Model model) {
		CrmCostCenter costCenter = costCenterService.getById(id);
		model.addAttribute("costcenter", costCenter);
		return "/crm/cost-center-add";
	}

	@RequestMapping("/remove/{id}")
	@ResponseBody
	public AuvgoResult remove(@PathVariable("id") Long id) {
		try {
			costCenterService.deleteById(id,getCompany().getId());
			return AuvgoResult.ok();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "删除失败!");
	}
	
	
	@RequestMapping("/empupload")
	public String toEmpupload() {
		return "crm/cost-center-upload";
	}

	
	
	//下载模板
	@SuppressWarnings({ "rawtypes", "unchecked" })
	@RequestMapping("/download")
	public ResponseEntity download() throws IOException {
		String dfileName = "成本中心导入模板.xls";
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
		headers.setContentDispositionFormData("attachment", new String(dfileName.getBytes("utf-8"), "ISO8859-1"));
		String path = this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath() + "download";
		File file = new File(path + File.separator + dfileName);
		return new ResponseEntity(FileUtils.readFileToByteArray(file), headers, HttpStatus.CREATED);
	}

	//批量上传成本中心
	@SuppressWarnings("resource")
	@RequestMapping("/uploadCost")
	@ResponseBody
	public AuvgoResult uploadCost(HttpServletRequest request){
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		MultipartHttpServletRequest mulRequest = (MultipartHttpServletRequest) request;
		POIFSFileSystem fileSystem = null;
		HSSFWorkbook hssf = null;
		StringBuffer sb= new StringBuffer("存在同名的成本中心有:");
		StringBuffer sb3 = new StringBuffer("必填项没写全的有");
		try {
			MultipartFile file = mulRequest.getFile("costfile");
			fileSystem = new POIFSFileSystem(file.getInputStream());
			hssf = new HSSFWorkbook(fileSystem);
			HSSFSheet sheet = hssf.getSheetAt(0);
			for (int i = 1; i <= sheet.getLastRowNum(); i++) {
				HSSFRow row = sheet.getRow(i);
				if (null == row.getCell(0) || StringUtils.isBlank(row.getCell(0).toString())) {// 成本中心编号必填
					continue;
				}
				if (null == row.getCell(1) || StringUtils.isBlank(row.getCell(1).toString())) {// 成本中心编号必填
					row.getCell(0).setCellType(CellType.STRING);
					sb3.append(row.getCell(0).toString());
					continue;
				}
				if (null == row.getCell(2) || StringUtils.isBlank(row.getCell(2).toString())) {// 成本中心状态必填
					row.getCell(1).setCellType(CellType.STRING);
					sb3.append(row.getCell(1).toString());
					continue;
				}
				CrmCostCenter costcenter = new CrmCostCenter();
				row.getCell(0).setCellType(CellType.STRING);
				String costBianhao=row.getCell(0).getStringCellValue().trim();//成本中心编号
				row.getCell(1).setCellType(CellType.STRING);
				String costName=row.getCell(1).getStringCellValue().trim();//成本中心名称
				Integer checkExsit = costCenterService.checkExsit(company.getId(),costBianhao,costName);
				if(checkExsit>0){
					sb.append(costBianhao+"--"+costName);
					continue;
				}
				row.getCell(2).setCellType(CellType.STRING);
				String costStatus=row.getCell(2).getStringCellValue().trim();//成本中心状态
				costcenter.setCompanyid(company.getId());
				costcenter.setName(costName);
				costcenter.setCode(costBianhao);
				costcenter.setStatus(Integer.valueOf(costStatus));
				costcenter.setCreatetime(new Date());
				costCenterService.saveOrUpdate(costcenter);
				}
			if("存在同名的成本中心有:".equals(sb.toString())){
				return AuvgoResult.build(ErrorCode.SUCCESS, "全部批量保存成功");
			}else{
				return AuvgoResult.build(ErrorCode.SUCCESS, "部门批量保存成功"+sb.toString());
			}
		}catch(Exception e){
			e.printStackTrace();
			return AuvgoResult.build(ErrorCode.ERROR, "请按Excel要求的填写值,同时保证Excel是2003版本");
		}
	}
	
	
	//跳转成本中心关联部门
	@RequestMapping("/toRelatePage/{costId}")
	public String toRelateDepartmentPage(@PathVariable("costId") Long costId){
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		Set<Long> checkdeps = costCenterService.getCheckDepMenus(company.getId(), costId);
		request.setAttribute("depttree", deptService.getDeptZtree(company.getId(), checkdeps));
		setAttr("costid", costId);
		setAttr("companyid", company.getId());
		return "/crm/cost-center-associated-dept";//跳转到关联部门的页面
	}
	
	//关联部门和成本中心
	@RequestMapping("/save/relateDepart")
	@ResponseBody
	public AuvgoResult saveRelateDepart(Long costid, String deptids,String flag){
		if(null == costid || StringUtils.isBlank(deptids)){
			return AuvgoResult.build(ErrorCode.WRONG_PARAMS, ErrorCode.getMsg(ErrorCode.WRONG_PARAMS));
		}
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		if (StringUtils.isBlank(flag)){
			List<Map<String,Object>> list = costCenterService.getCostByDept(company.getId(),deptids);
			List<Map<String,Object>> lists = Lists.newArrayList();
			if (list != null && !list.isEmpty()){
				Iterator<Map<String, Object>> iterator = list.iterator();
				while (iterator.hasNext()){
					Map<String, Object> next = iterator.next();
					String costId = String.valueOf(next.get("id"));
					if(Long.valueOf(costId).longValue() != costid.longValue()){
						lists.add(next);
					}
				}
				if(null != lists && !lists.isEmpty()){
					return AuvgoResult.build(300,"error", JsonUtils.objectToJson(lists));
				}
			}
		}
		try {
			String[] deptid = StringUtils.removeEnd(deptids, "/").split("/");
			costCenterService.saveDepartAndCost(company.getId(),costid,deptid);
			return AuvgoResult.build(ErrorCode.SUCCESS, ErrorCode.getMsg(ErrorCode.SUCCESS));
		} catch (Exception e) {
			e.printStackTrace();
			return AuvgoResult.build(ErrorCode.ERROR_NONE, ErrorCode.getMsg(ErrorCode.ERROR_NONE));
		}
	}
	@SuppressWarnings("deprecation")
	@RequestMapping("/toRelateEmpPage/{costId}")
	public String toEmpPage(@PathVariable("costId") Long costId,HttpServletRequest request,String deptid){
		QueryFilter filter = new QueryFilter();
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		Long cid = company.getId();
		List<CrmEmployee> list = Lists.newArrayList();
		
		PageInfo<CrmEmployee> result = employeeService.findPageByDeptid(1, 50, cid, filter.buildSql(request),deptid);
		list.addAll(result.getList());
		for (int page = 2; page < result.getPages(); page++) {
			PageInfo<CrmEmployee> pageList = employeeService.findPageByDeptid(page, 50, cid, filter.buildSql(request),deptid);
			list.addAll(pageList.getList());
		}

		List<CrmEmployee> existEmployee = Lists.newArrayList();
		List<CrmEmployee> newEmp= Lists.newArrayList();
		Set<Long> chooseEmpid =costCenterService.getCheckedRoleEmployee(company.getId(),costId);
		for (int i = 0; i < list.size(); i++) {
			if(chooseEmpid.contains(list.get(i).getId())){
				existEmployee.add(list.get(i));
			}else{
				newEmp.add(list.get(i));
			}
		}
		List<Long> checkdept = Lists.newArrayList();
		if(null != chooseEmpid && !chooseEmpid.isEmpty()){
			List<CrmEmployee> emps = employeeService.getEmpListById(company.getId(),chooseEmpid.toArray());
			for (CrmEmployee depts : emps){
				checkdept.add(depts.getDeptid());
			}
			request.setAttribute("choosedeptids",checkdept);
		}
		setAttr("depttree", deptService.getDeptZtree(company.getId(), null));
		setAttr("costid", costId);
		setAttr("deptid", deptid);
		setAttr("companyid", company.getId());
		setAttr("page", newEmp);//显示左侧在未勾选的
		setAttr("existEmployee", existEmployee);//放在右侧已经勾选的
		return "/crm/cost-center-associated";
	}
	
	/**
	 * 批量保存关联的人和成本中心
	 * @param costId
	 * @param cid
	 * @param employeeids
	 * @return
	 */
	@RequestMapping("/saveRelateEmployee")
	@ResponseBody
	public AuvgoResult saveRelateEmployee(Long costId,String employeeids,String flag,String deptid){
		if(null == costId){
			return AuvgoResult.build(ErrorCode.WRONG_PARAMS, ErrorCode.getMsg(ErrorCode.WRONG_PARAMS));
		}
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		List<Map<String,Object>> list;
		if(StringUtils.isBlank(flag)){
			list = costCenterService.getCostByEmps(company.getId(),employeeids);
			List<Map<String,Object>> lists = Lists.newArrayList();
			if (list != null && list.isEmpty()){
				Iterator<Map<String, Object>> iterator = list.iterator();
				while (iterator.hasNext()){
					Map<String, Object> next = iterator.next();
					String costid = String.valueOf(next.get("id"));
					if(Long.valueOf(costid).longValue() != costId.longValue()){
						lists.add(next);
					}
				}
				if(null !=lists && !lists.isEmpty()){
					return AuvgoResult.build(300,"error", JsonUtils.objectToJson(lists));
				}
			}else{
				list = costCenterService.getCostByDept(company.getId(),deptid);
				if (list != null && !list.isEmpty()){
					Iterator<Map<String, Object>> iterator = list.iterator();
					while (iterator.hasNext()){
						Map<String, Object> next = iterator.next();
						String costid = String.valueOf(next.get("id"));
						if(Long.valueOf(costid).longValue() != costId.longValue()){
							lists.add(next);
						}
					}
					if (null != lists && !lists.isEmpty()){
						return AuvgoResult.build(300, "error", JsonUtils.objectToJson(lists));
					}
				}
			}
		}
		String[] empids = StringUtils.removeEnd(employeeids, "/").split("/");
		costCenterService.saveEmpIdAndCostId(costId,company.getId(),empids);
		return AuvgoResult.build(ErrorCode.SUCCESS, ErrorCode.getMsg(ErrorCode.SUCCESS));
	}
	
	@RequestMapping("/editStatus/{id}/{status}")
	public String editStatus(@PathVariable("id") Long id,@PathVariable("status") Integer status){
		if(null==id || null==status){
			return "redirect:/crm/cost";
		}
		CrmCostCenter costCenter = costCenterService.getById(id);
		if(null != costCenter){
			costCenter.setStatus(status);
			costCenterService.saveOrUpdate(costCenter);
		}
		return "redirect:/crm/cost";
	}
	
}
