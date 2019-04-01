package com.auvgo.web.face.chailv;

import com.auvgo.core.contant.AuvStatusContant;
import com.auvgo.core.contant.FenxiaostatusContant;
import com.auvgo.core.query.QueryFilter;
import com.auvgo.core.string.RegExpValidator;
import com.auvgo.core.utils.*;
import com.auvgo.crm.api.*;
import com.auvgo.crm.entity.*;
import com.auvgo.crm.model.CrmEmpInsiderModel;
import com.auvgo.crm.pojo.CrmEmployeeModel;
import com.auvgo.data.api.DataZidianKeyService;
import com.auvgo.data.api.DataZidianValueService;
import com.auvgo.data.entity.DataZidianValue;
import com.auvgo.sys.api.SysOperationNoteService;
import com.auvgo.sys.entity.SysOperationNote;
import com.auvgo.web.contant.ErrorCode;
import com.auvgo.web.face.BaseController;
import com.github.pagehelper.PageInfo;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
import org.apache.poi.ss.usermodel.CellType;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;


@Controller
@RequestMapping("/crm/employee")
public class EmployeeController extends BaseController {
	@Autowired
	private CrmEmployeeService employeeService;
	@Autowired
	private CrmEmployeeCertService employeeCertService;
	@Autowired
	private CrmDepartmentService deptService;
	@Autowired
	private CrmCompanyService companyService;
	@Autowired
	private DataZidianKeyService zidianKeyService;
	@Autowired
	private DataZidianValueService zidianValueService;
	@Autowired
	private CrmRoleService roleService;
	@Autowired
	private CrmEmpInsiderService insiderService;
	@Autowired
	private SysOperationNoteService noteService;
	@Autowired
	private CrmEmployeeCertService crmEmployeeCertService;

	//跳转
	@RequestMapping("toForget")
	public String toForget() {
		return "common/fotget-password-retrieve";
	}


	@RequestMapping("")
	public String page(@RequestParam(defaultValue = "1") int pageNum, Integer pageSize, HttpServletRequest request) {
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		if (null == company) {
			setAttr("msg", "请您重新登录！");
			return "redirect:/login";
		}
		pageSize = null == pageSize ? 7 : pageSize;
		QueryFilter filter = new QueryFilter();
		PageInfo<CrmEmployeeModel> page = employeeService.PcfindPageBy(pageNum, pageSize, company.getId(), filter.buildSql(request));
		request.setAttribute("depttree", deptService.getDeptZtree(company.getId(), null));
		List<DataZidianValue> staffList = zidianKeyService.getzidianValueBYzidianKey(company.getId(), "stafflevels");
		request.setAttribute("AllStaff", staffList);
		request.setAttribute("levelmap", getLevel(company.getId()));
		request.setAttribute("rolemap", getRoles(company.getId()));
		request.setAttribute("page", page);
		request.setAttribute("pageSize", pageSize);
		Map<String, String> rolesMap = getRoles(company.getId());
		Map<Long, String> roles = Maps.newHashMap();
		for (CrmEmployee employee : page.getList()) {
			List<CrmRoleAcc> list = roleService.findRolesByCidAndEmpid(employee.getCompanyid(), employee.getId());
			StringBuilder sb = new StringBuilder();
			for (CrmRoleAcc crmRoleAcc : list) {
				String roleName = rolesMap.get(crmRoleAcc.getRoleid().toString());
				if (StringUtils.isNotBlank(roleName)) {
					sb.append(roleName).append(",");
				}
			}
			String rolesNames = StringUtils.removeEndIgnoreCase(sb.toString(), ",");
			if (StringUtils.isBlank(rolesNames.trim())) {
				rolesNames = "--";
			}
			roles.put(employee.getId(), rolesNames);
		}
		setAttr("roles", roles);
		if (FenxiaostatusContant.isPrePayCompany(company.getServerNo())) {
			setAttr("certmap", new AuvStatusContant());
			return "crm/fenxiao-employee";
		} else {
			return "crm/employee";
		}
	}

	@RequestMapping("/emp")
	public String pageByDeptid(@RequestParam(defaultValue = "1") int pageNum, Integer pageSize, HttpServletRequest request) {
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		QueryFilter filter = new QueryFilter();
		if (null == company) {
			setAttr("msg", "请您重新登录！");
			return "redirect:/login";
		}
		Long cid = company.getId();
		//String deptid = request.getParameter("q_EQ_deptid");
		pageSize = null == pageSize ? PAGE_SIZE : pageSize;
		//PageInfo<CrmEmployee> page = employeeService.findPageByDeptid(pageNum, pageSize, cid, "",deptid);
		PageInfo<CrmEmployee> page = employeeService.findPageByDeptid(pageNum, pageSize, cid, filter.buildSql(request));
		request.setAttribute("depttree", deptService.getDeptZtree(cid, null));
		request.setAttribute("levelmap", getLevel(cid));
		request.setAttribute("rolemap", getRoles(cid));
		request.setAttribute("page", page);
		setAttr("pageSize", pageSize);
		return "crm/employee";
	}


	@RequestMapping(value = "/fenxiaoAdd")
	public String tofenxiaoAdd(Model model, HttpServletRequest request) {
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		String empid = request.getParameter("empid");
		if (StringUtils.isNotBlank(empid)) {
			CrmEmployee employee = employeeService.getById(company.getId(), Long.parseLong(empid));
			setAttr("emp", employee);
		}
		CrmDepartment depart = deptService.getDepartMentByBianhaoAndCompanyId(company.getBianhao() + "-LSBM", company.getId());
		model.addAttribute("depttree", deptService.getDeptZtree(company.getId(), null));
		List<DataZidianValue> staffList = zidianKeyService.getzidianValueBYzidianKey(company.getId(), "stafflevels");
		model.addAttribute("AllStaff", staffList);
		model.addAttribute("defultdepart", depart);
		return "crm/fenxiao-employee-add";
	}


	@RequestMapping("/getDefaultDept")
	@ResponseBody
	public AuvgoResult getFenxiaoLinShiDepart() {
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		CrmDepartment depart = deptService.getDepartMentByBianhaoAndCompanyId(company.getBianhao() + "-LSBM", company.getId());
		return AuvgoResult.build(200, "success", depart);
	}

	/**
	 * 审批管理需要用到
	 *
	 * @return
	 */
	@RequestMapping(value = "/jqauto", produces = "application/json;charset=UTF-8")
	@ResponseBody
	public String autocomplete() {
		CrmCompany company = getCompany();
		if (null == company) {
			setAttr("msg", "请您重新登录！");
			return "redirect:/login";
		}
		List<CrmEmployee> result = employeeService.findShenpiren(company.getId());
		return JsonUtils.objectToJson(result);
	}
	/**
	 * 按关键字查找审批人
	 * @param cid
	 * @param keyword
	 * @return
	 */
	@RequestMapping(value = "/autoByKeyword/{cid}", produces = "application/json;charset=UTF-8")
	@ResponseBody
	public List<CrmEmployee>  autoByKeyword(@PathVariable("cid") Long cid,String keyword) {
		List<CrmEmployee> list = employeeService.findShenpirenByKeyword(cid,keyword);
		return list;
	}
	@RequestMapping("/add")
	public String add(Model model) {
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		model.addAttribute("depttree", deptService.getDeptZtree(company.getId(), null));
		List<DataZidianValue> staffList = zidianKeyService.getzidianValueBYzidianKey(company.getId(), "stafflevels");
		model.addAttribute("AllStaff", staffList);
		model.addAttribute("rolemap", getRoles(company.getId()));
		return "crm/employee-add";
	}

	@RequestMapping("/edit/{flag}/{id}")
	public String edit(@PathVariable Long id, @PathVariable("flag") String flag, Model model) {
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		model.addAttribute("emp", employeeService.getById(company.getId(), id));
		List<DataZidianValue> staffList = zidianKeyService.getzidianValueBYzidianKey(company.getId(), "stafflevels");
		model.addAttribute("AllStaff", staffList);
		model.addAttribute("rolemap", getRoles(company.getId()));
		model.addAttribute("depttree", deptService.getDeptZtree(company.getId(), null));
		//获取证件信息
		try {
			model.addAttribute("certList", crmEmployeeCertService.findByCidAndEmpid(company.getId(), id));
		} catch (Exception e) {
			log.error("getDefalutCert error", e);
		}
		//获取知情人信息
		List<CrmEmpInsider> list = insiderService.findByEmpId(id);
		List<CrmEmpInsiderModel> modelList = Lists.newArrayList();
		for (CrmEmpInsider crmEmpInsider : list) {
			CrmEmpInsiderModel modelInsider = new CrmEmpInsiderModel();
			BeanUtils.copyProperties(crmEmpInsider, modelInsider);
			String type = crmEmpInsider.getType();
			if (StringUtils.isNotBlank(type)) {
				String[] split = StringUtils.removeEnd(type, "/").split("/");
				for (String s : split) {
					switch (s) {
						case "air":
							modelInsider.setAir(s + "/");
							break;
						case "train":
							modelInsider.setTrain(s + "/");
							break;
						case "hotel":
							modelInsider.setHotel(s + "/");
							break;
						default:
							break;
					}
				}
			}
			modelList.add(modelInsider);
		}
		model.addAttribute("insiderList", modelList);

		if (flag.equals("2")) {
			return "/crm/personal-center/common-persons-edit";
		}
		return "crm/employee-add";
	}

	@RequestMapping("/empupload")
	public String toEmpupload() {
		return "crm/employee-upload";
	}

	// Excel批量上传员工
	@RequestMapping("/upload")
	@ResponseBody
	public AuvgoResult empupload(HttpServletRequest request) {
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		MultipartHttpServletRequest mulRequest = (MultipartHttpServletRequest) request;
		POIFSFileSystem fileSystem = null;
		HSSFWorkbook hssf = null;
		CrmCompany crmCompany = companyService.getById(company.getId());
		StringBuffer sb = new StringBuffer("证件号有误的人员:");
		StringBuffer sb2 = new StringBuffer("必填项为空的人员:");
		StringBuffer sb3 = new StringBuffer("工号存在重复的人员:");
		StringBuffer sb4 = new StringBuffer("用户名重复:");
		StringBuffer sb5 = new StringBuffer("证件号重复的人员:");
		StringBuffer allsb = new StringBuffer();
		try {
			MultipartFile file = mulRequest.getFile("empfile");
			fileSystem = new POIFSFileSystem(file.getInputStream());
			hssf = new HSSFWorkbook(fileSystem);
			HSSFSheet sheet = hssf.getSheetAt(0);
			List<CrmEmployee> Employees = Lists.newArrayList();
			List<CrmEmployee> exitlist = Lists.newArrayList();
			for (int i = 1; i <= sheet.getLastRowNum(); i++) {
				HSSFRow row = sheet.getRow(i);
				if (null == row.getCell(1) || "".equals(row.getCell(1)) || StringUtils.isBlank(row.getCell(1).toString())) {// 姓名必填
					continue;
				}
				String name = row.getCell(1).getStringCellValue().trim();//姓名
				boolean exsistValueName = companyService.exsistValueName(company.getId(), "username", name);
				//boolean exsistValue = employeeService.exsistValue(cid, "name", name); 
				if (exsistValueName) {
					sb4.append(name).append(",");//
					continue;
				}
				if (null == row.getCell(3) || "".equals(row.getCell(3)) || StringUtils.isBlank(row.getCell(3).toString())) {// 员工职级必填
					sb2.append(name + ",");
					continue;
				}
				if (null == row.getCell(5) || "".equals(row.getCell(5)) || StringUtils.isBlank(row.getCell(5).toString())) {// 证件号必填
					sb2.append(name + ",");
					continue;
				}
				row.getCell(2).setCellType(CellType.STRING);
				row.getCell(4).setCellType(CellType.STRING);
				String certtype = row.getCell(4).getStringCellValue();// 证件类型
				row.getCell(5).setCellType(CellType.STRING);
				String certno = row.getCell(5).getStringCellValue().trim();// 证件号
				CrmDepartment department = null;
				CrmEmployee employee = new CrmEmployee();
				if ("1".equals(certtype)) {
					if (StringUtils.isNotBlank(certno)) {
						boolean isright = IdCardUtils.validateCard(certno);
						if (isright) {
							String birthday = IdCardUtils.getBirthByIdCard(certno);
							String sex = IdCardUtils.getGenderByIdCard(certno);
							String guoji = IdCardUtils.getProvinceByIdCard(certno);
							employee.setSex(sex);
							employee.setBirthday(birthday);
							employee.setGuoji(guoji);
						} else {
							sb.append(name + ",");
							continue;//不保存...继续循环
						}
					}
				} else {//非身份证,不校验
					employee.setCerttype(certtype);
					employee.setCertno(certno);
				}
				String mobile = null;
				String email = null;
				String depbianhao = null;
				String deptname = null;// 部门编号
				String accno = null;
				if (null != row.getCell(0) || "".equals(row.getCell(0))) {//工号
					row.getCell(0).setCellType(CellType.STRING);
					accno = row.getCell(0).getStringCellValue();
				}

				deptname = row.getCell(2).getStringCellValue().trim();// 所属部门
				row.getCell(3).setCellType(CellType.STRING);
				String zhiwei = row.getCell(3).getStringCellValue().trim();// 职位
				if (null != row.getCell(6) || "".equals(row.getCell(6))) {
					row.getCell(6).setCellType(CellType.STRING);
					mobile = row.getCell(6).getStringCellValue().trim();// 手机号
					if (StringUtils.isNotBlank(mobile)) {
						if (!RegExpValidator.isMobile(mobile)) {
							log.info(name + "手机号码:" + mobile + "格式有误");
						}

					}
				}
				if (null != row.getCell(7) || "".equals(row.getCell(7))) {
					row.getCell(7).setCellType(CellType.STRING);
					email = row.getCell(7).getStringCellValue().trim();// 联系邮箱
				}
				if (null != row.getCell(8) || "".equals(row.getCell(8))) {
					row.getCell(8).setCellType(CellType.STRING);
					depbianhao = row.getCell(8).getStringCellValue().trim();// 部门编号
				}
				if (null != depbianhao) {
					department = deptService.getDepartMentByBianhaoAndCompanyId(depbianhao, company.getId());
				}
				employee.setAccno(accno);
				employee.setName(name.replaceAll(" ", ""));
				employee.setKaitong(0);
				employee.setDeptname(deptname);
				employee.setZhiwei(zhiwei);
				employee.setCerttype(certtype);
				employee.setCertno(certno);
				employee.setMobile(mobile);
				employee.setAddempflage(0);
				employee.setEmail(email);
				employee.setLevel("geren");
				employee.setCompanyid(company.getId());
				employee.setAddcustflage(0);
				employee.setIfallowbook(0);
				employee.setIfapprove(0);
				employee.setUsername(accno);
				log.info("加密开始 username--->" + employee.getUsername() + "卡号" + crmCompany.getBianhao() + "小写");
				String passwords = Md5Sign.MD5Encode(employee.getUsername() + crmCompany.getBianhao().toUpperCase() + crmCompany.getBianhao().toLowerCase() + "888");
				employee.setPassword(passwords);
				employee.setKaitong(1);
				if (department != null) {
					employee.setDepth(department.getDepth());// 设置部门深度
					employee.setDeptid(department.getId()); // 设置部门id
				} else {
					employee.setDeptid(0L);
					employee.setDepth("0");
					employee.setDeptid(0L);
				}

				//全拼和简拼
				String simplename = Pinyin4jUtil.converterToFirstSpell(name);
				String fullname = Pinyin4jUtil.converterToSpell(name);
				fullname = fullname.length() > 500 ? fullname.substring(0, fullname.indexOf(",")) : fullname;
				simplename = simplename.length() > 100 ? simplename.substring(0, simplename.indexOf(",")) : simplename;
				employee.setFullname(fullname);
				employee.setSimplename(simplename);

				employee.setCreatetime(new Date());
				employee.setStatus(0);
				employee.setIfvip(0);
				employee.setIfchaosong(0);
				CrmEmployee crmemp = employeeService.getEmpBycertnoAndCid(certno, company.getId());
				List<CrmEmployee> accelist = employeeService.getEmpByAccnoAndCid(accno, company.getId());

				//判断工号和员工和公司的用户名是否相同
				if (employeeService.exsistValue(employee.getCompanyid(), "username", accno) || companyService.exsistValueName(employee.getCompanyid(), "username", accno)) {
					sb3.append(employee.getName() + ",");
					continue;
				}
				//1.比较导入的数据 
				if (!Employees.isEmpty()) {
					boolean flag = false;
					for (int j = 0; j < Employees.size(); j++) {
						CrmEmployee emp = Employees.get(j);
						if (null != emp) {
							String certno2 = emp.getCertno();
							String accno2 = emp.getAccno();
							if (StringUtils.isNotBlank(certno) && StringUtils.isNotBlank(certno2) && !accno.equals(accno2) && certno.equals(certno2)) {
								flag = true;
								sb5.append(name + ",");
							}
						}
					}
					if (flag) {
						continue;
					}
				}
				//2.导入的数据与数据库的数据
				if (StringUtils.isNotBlank(certno)) {
					boolean flag = false;
					Integer exitCertno = employeeService.exitCertno(certno, company.getId());
					if (exitCertno > 0) {
						flag = true;
						sb5.append(name + "与数据库证件号冲突").append(",");
					}
					if (flag) {
						continue;
					}
				}
				//1.比较导入的数据 
				if (!Employees.isEmpty()) {
					boolean flag = false;
					for (int j = 0; j < Employees.size(); j++) {
						CrmEmployee emp = Employees.get(j);
						if (null != emp) {
							String certno2 = emp.getCertno();
							String accno2 = emp.getAccno();
							if (StringUtils.isNotBlank(certno) && StringUtils.isNotBlank(certno2) && !accno.equals(accno2) && certno.equals(certno2)) {
								flag = true;
								sb5.append(name + ",");
							}
						}
					}
					if (flag) {
						continue;
					}
				}
				//2.导入的数据与数据库的数据
				if (StringUtils.isNotBlank(certno)) {
					boolean flag = false;
					Integer exitCertno = employeeService.exitCertno(certno, company.getId());
					if (exitCertno > 0) {
						flag = true;
						sb5.append(name + "与数据库证件号冲突").append(",");
					}
					if (flag) {
						continue;
					}
				}
				if (null != crmemp) {// 已经存在更新
					if (null != accelist) {
						sb.append(employee.getName() + ",");
						continue;
					}

					employee.setId(crmemp.getId());
					exitlist.add(employee);
				}
				if (null != accelist && accelist.size() > 0) {
					sb3.append(employee.getName() + ",");
					continue;

				}
				//判断Employees
				int ano = 0;//员工号
				int aname = 0;
				if (Employees.size() > 0) {
					for (CrmEmployee employees : Employees) {
						String accno2 = employees.getAccno();
						if (accno == accno2) {//员工号
							ano++;
							sb3.append(employee.getName() + ",");
							continue;
						}
						if (exsistValueName) {
							aname++;
							sb4.append(name).append(",");//
							continue;
						}
					}
				}
				if (ano == 0 && aname == 0) {
					Employees.add(employee);
				}

			}
			if (Employees.size() > 0) {
				employeeService.importEmployeeFromExcel(Employees);
			}
			if (exitlist.size() > 0) {
				employeeService.updateEmployee(exitlist);// 批量更新员工信息
			}
			if ("证件号有误的人员:".equals(sb.toString()) && "必填项为空的人员:".equals(sb2.toString()) && "工号存在重复的人员:".equals(sb3.toString()) && "用户名重复:".equals(sb4.toString()) && "证件号重复的人员:".equals(sb5.toString())) {
				System.out.println(sb.toString());
				return AuvgoResult.build(200, "批量导入员工成功");
			} else {
				if (!"证件号有误的人员:".equals(sb.toString())) {
					allsb.append(sb.toString() + "  ");
				}
				if (!"必填项为空的人员:".equals(sb2.toString())) {
					allsb.append(sb2.toString() + "  ");

				}
				if (!"工号存在重复的人员:".equals(sb3.toString())) {
					allsb.append(sb3.toString() + "  ");

				}
				if (!"用户名重复:".equals(sb4.toString())) {
					allsb.append(sb4.toString() + "  ");
				}
				if (!"证件号重复的人员:".equals(sb5.toString())) {
					allsb.append(sb5.toString() + "  ");
				}
				return AuvgoResult.build(200, "部分批量导入员工成功,-->" + allsb.toString());
			}
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
		return AuvgoResult.build(300, "批量上传出现异常,请保证Excel数据按照要求填入");
	}

	// 弹出批量修改员工信息
	@RequestMapping("/editlist")
	public String editEmpPage(Model model) {
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		List<DataZidianValue> staffList = zidianKeyService.getzidianValueBYzidianKey(company.getId(), "stafflevels");
		model.addAttribute("AllStaff", staffList);
		model.addAttribute("cid", company.getId());
		String deptZtree = deptService.getDeptZtree(company.getId(), null);
		model.addAttribute("depttree", deptZtree);
		return "crm/employee-editlist";
	}

	// 批量修改员工信息
	@RequestMapping("/editEmpList")
	@ResponseBody
	public AuvgoResult editEmpList(String id, Long deptid, String zhiwei, String level, Integer kaitong, Integer ifallowbook, String password, Integer ifvip) {
		if (StringUtils.isBlank(id)) {
			return AuvgoResult.build(300, "登陆信息有误,或选择要修改的员工");
		}
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		CrmDepartment department = null;
		if (null != deptid) {
			department = deptService.getById(company.getId(), deptid);
		}
		List<CrmEmployee> list = Lists.newArrayList();
		try {
			String[] ids = StringUtils.removeEnd(id, "-").split("-");
			for (int i = 0; i < ids.length; i++) {
				CrmEmployee employee = employeeService.getById(company.getId(), Long.valueOf(ids[i]));
				if (null == employee) {
					continue;
				}
				if (null != department) {
					employee.setDepth(department.getDepth());
					employee.setDeptid(department.getId());
					employee.setDeptname(department.getName());
				}
				if (StringUtils.isNotBlank(zhiwei)) {
					employee.setZhiwei(zhiwei);
				}
				if (null != kaitong) {
					employee.setKaitong(kaitong);
				}
				if (null != ifallowbook) {
					employee.setIfallowbook(ifallowbook);
				}
				if (StringUtils.isNotBlank(level)) {
					employee.setLevel(level);
				}
				if (StringUtils.isNotBlank(password)) {
					employee.setPassword(Md5Sign.MD5Encode(employee.getUsername() + company.getBianhao().toUpperCase() + password));
				}
				//设置是否是vip
				if (ifvip != null) {
					employee.setIfvip(ifvip);
				}
				list.add(employee);
			}
			employeeService.updateEmployee(list);
			return AuvgoResult.build(200, "批量保存成功");
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "批量修改失败");

	}

	@RequestMapping(value = "/save", method = RequestMethod.POST)
	@ResponseBody
	public ValidFormResult newsave(CrmEmployee employee) {
		// 获取当前被操作员工的id
		Long id = employee.getId();
		// 获取公司id
		Long companyid = employee.getCompanyid();
		CrmEmployee now = null;
		if(id != null){
			now = employeeService.getById(companyid, id);
		}
		if (null == companyid) {
			return ValidFormResult.error("网络异常!301");
		}
		// 获取公司信息
		CrmCompany company = companyService.getById(companyid);
		/***前公共区域***/
		// 查出该公司下所有的人
		List<CrmEmployee> employees = employeeService.findAllCert(companyid);
		// 判空处理,保证集合不为null
		if (null == employees) {
			employees = Lists.newArrayList();
		}
		// 声明员工工号的集合
		Map<String, Long> accnos = Maps.newHashMapWithExpectedSize(employees.size());
		// 声明员工用户名的集合
		Map<String, Long> usernames = Maps.newHashMapWithExpectedSize(employees.size());
		//判断是否为分销
		if (FenxiaostatusContant.isPrePayCompany(getCompany().getServerNo())) {
			if (StringUtils.isNotEmpty(employee.getMobile())) {
				employee.setAccno(employee.getMobile());
				employee.setUsername(employee.getMobile());
			}
			if (StringUtils.isBlank(employee.getAccno()) && StringUtils.isBlank(employee.getMobile())) {
				if (employee.getCertno().length() > 8) {
					String result = employee.getCertno();
					String data = result.substring(result.length() - 8, result.length());
					employee.setUsername(data);
					employee.setAccno(data);
				} else {
					employee.setUsername(employee.getCertno());
					employee.setAccno(employee.getCertno());
				}
			}

			if (null == employee.getCertlist() || employee.getCertlist().isEmpty()) {
				List<CrmEmployeeCert> list = Lists.newArrayList();
				CrmEmployeeCert cert = new CrmEmployeeCert();
				cert.setUsername(employee.getName());
				cert.setCertificate(employee.getCertno());
				cert.setCerttype(employee.getCerttype());
				cert.setIsdefault(1);
				list.add(cert);
				employee.setCertlist(list);
			}

		}
		// 查出该公司下所有的证件
		for (CrmEmployee emp : employees) {
			accnos.put(emp.getAccno(), emp.getId());
			usernames.put(emp.getUsername(), emp.getId());
		}
		if (accnos.size() < employees.size()) {
			log.warn("检测出id为{}的公司中存在员工工号相同或有问题的员工,请尽快核查!", companyid);
		}
		if (usernames.size() < employees.size()) {
			log.warn("检测出id为{}的公司中存在用户名相同或有问题的员工,请尽快核查!", companyid);
		}
		/***验证区域***/
		// 手机号验证
		String mobile = employee.getMobile();
		if (!FenxiaostatusContant.isPrePayCompany(getCompany().getServerNo())) {
			if (StringUtils.isNotBlank(mobile)) {
				if (!RegExpValidator.isMobile(mobile)) {
					return ValidFormResult.error("请输入正确的手机号码!");
				}
				if(now == null || (now != null && !mobile.equals(now.getMobile()))){
					//手机号唯一性校验
					if (employeeService.exsistValue(getUser().getCompanyid(), "mobile", mobile)) {
						return ValidFormResult.error("手机号已存在!");
					}
				}
			}

		}
		// 邮箱号验证
		String email = employee.getEmail();
		if (null == email) {
			employee.setEmail("");
		}
		// 校验员工姓名
		if (StringUtils.isBlank(employee.getName())) {
			// 如果员工姓名为空
			return ValidFormResult.error("请输入员工姓名!");
		}
		// 姓名去空格
		employee.setName(employee.getName().replaceAll(" ", ""));
		// 先验证证件格式
		List<CrmEmployeeCert> certlist = employee.getCertlist();
		if (null != certlist && !certlist.isEmpty()) {
			for (CrmEmployeeCert cert : certlist) {
				if (cert.getIsdefault() != null && cert.getIsdefault() == 1) {
					employee.setCerttype(cert.getCerttype());
					employee.setCertno(cert.getCertificate());
				}
				if ("1".equals(cert.getCerttype())) {
					// 身份证号
					boolean validateCard = IdCardUtils.validateCard(cert.getCertificate());
					if (!validateCard) {
						// 身份证号格式不正确
						return ValidFormResult.error("请输入正确的身份证号!");
					}
					//获取生日
					employee.setBirthday(IdCardUtils.getBirthByIdCard(cert.getCertificate()));
				} else {
					// 其他证件号
					int length = cert.getCertificate().length();
					if (!(length >= 5 && length <= 15)) {
						// 其他证件号格式不正确
						return ValidFormResult.error("请输入正确的证件号!");
					}
				}
			}
		} else {
			employee.setCerttype("");
			employee.setCertno("");
		}
		if (null == id) {
			// 验证用户名
			if (StringUtils.isNotBlank(employee.getUsername()) && usernames.containsKey(employee.getUsername())) {
				// 用户名已存在
				return ValidFormResult.error("用户名已存在!");
			}
			// 验证员工工号
			if (accnos.containsKey(employee.getAccno())) {
				// 员工工号已存在
				return ValidFormResult.error("员工工号已存在!");
			}
			// 校验密码
			if (StringUtils.isBlank(employee.getPassword())) {
				// 用户密码不能为空
			}
			if (StringUtils.isBlank(employee.getZhiwei())) {
				employee.setZhiwei("1");
			}
			if (StringUtils.isBlank(employee.getLevel())) {
				employee.setLevel("geren");
			}
			if (StringUtils.isBlank(employee.getDeptname()) && null != employee.getDeptid()) {
				CrmDepartment crmDepartments = deptService.getById(employee.getCompanyid(), employee.getDeptid());
				if (null != crmDepartments) {
					employee.setDeptname(crmDepartments.getName());
				}
			}

		} else {
			// 验证用户名
			if (usernames.containsKey(employee.getUsername()) && !usernames.get(employee.getUsername()).equals(employee.getId())) {
				// 用户名已存在
				return ValidFormResult.error("用户名已存在!");
			}
			// 验证员工工号
			if (accnos.containsKey(employee.getAccno()) && !accnos.get(employee.getAccno()).equals(employee.getId())) {
				// 员工工号已存在
				return ValidFormResult.error("员工工号已存在!");
			}
			String username = now.getUsername();
			if (StringUtils.isNotBlank(username) && !username.equals(employee.getUsername())) {
				// 进行密码加密
				String pwd = Md5Sign.MD5Encode(employee.getUsername() + company.getBianhao().toUpperCase() + company.getBianhao().toLowerCase() + "888");
				employee.setPassword(pwd);
			}
		}
		// 后公共区域
		Long deptid = employee.getDeptid();
		CrmDepartment depart = deptService.getById(employee.getCompanyid(), deptid);
		if (depart != null) {
			if (null != depart.getDepth()) {
				employee.setDepth(depart.getDepth());
			}
		}
		employee.setKaitong(1); // 设置账号开通
		employee.setIfvip(0); // 默认不是vip
		//全拼和简拼
		String simplename = Pinyin4jUtil.converterToFirstSpell(employee.getName());
		String fullname = Pinyin4jUtil.converterToSpell(employee.getName());
		fullname = fullname.length() > 500 ? fullname.substring(0, fullname.indexOf(",")) : fullname;
		simplename = simplename.length() > 100 ? simplename.substring(0, simplename.indexOf(",")) : simplename;
		employee.setFullname(fullname);
		employee.setSimplename(simplename);
		try {
			Long employeeid = employeeService.saveOrUpdate(employee);
			if (null != employee && null != employee.getId()) {
				CrmEmployee user = getUser();
				CrmCompany com = companyService.getById(user.getCompanyid());
				SysOperationNote sysOperationNote = new SysOperationNote(user.getId(), user.getName(),
						user.getDeptname(), new Date(), "修改员工" + employee.getName() + "信息", com.getId(),
						com.getSimpname(), "修改员工信息");
				noteService.saveOrUpdate(sysOperationNote);
			}
			employee.setId(employeeid);
			// 将证件号保存到证件表中
			if (null != certlist && !certlist.isEmpty()) {
				crmEmployeeCertService.deleteByCidAndEmpid(companyid, employeeid);//删除数据库中所有证件
				for (CrmEmployeeCert cert : certlist) {
					cert.setId(null);
					cert.setCompanyid(companyid);
					cert.setEmpid(employeeid);
					if (com.auvgo.core.string.StringUtils.isContainsChinese(cert.getUsername())) {//是中文
						cert.setIsChinese(true);
					} else {
						cert.setIsChinese(false);
					}
					cert.setCreatetime(new Date());
					// 保存证件号
					employeeCertService.saveOrUpdate(cert);
				}
			} else {
				crmEmployeeCertService.deleteByCidAndEmpid(companyid, employeeid);//删除数据库中所有证件
			}
		} catch (Exception e) {
			e.printStackTrace();
			log.error("保存员工或证件号时出现异常!-->{}", e);
		}
		CrmEmployee sessionUser = getUser();
		if (null != sessionUser && sessionUser.getAccno().equals(employee.getAccno())) {
			CrmEmployee user = employeeService.getById(employee.getCompanyid(), employee.getId());
			setSessionAttr("user", user);
		}

		//知情人
		insiderService.removeByEmpid(employee.getId());
		List<CrmEmpInsiderModel> insiderlist = employee.getInsiderlist();
		StringBuilder sb = new StringBuilder();
		if (null != insiderlist && !insiderlist.isEmpty()) {
			for (CrmEmpInsiderModel model : insiderlist) {
				CrmEmpInsider empInsider = new CrmEmpInsider();
				BeanUtils.copyProperties(model, empInsider);
				empInsider.setEmpid(employee.getId());
				sb.append(StringUtils.isBlank(model.getAir()) ? "" : model.getAir())
						.append(StringUtils.isBlank(model.getHotel()) ? "" : model.getHotel())
						.append(StringUtils.isBlank(model.getTrain()) ? "" : model.getTrain());
				empInsider.setType(sb.toString());
				empInsider.setCompanyid(employee.getCompanyid());
				insiderService.saveOrUpdate(empInsider);
				//清空
				sb.setLength(0);
			}
		}
		return ValidFormResult.ok();
	}

	@Deprecated
	@RequestMapping(value = "/save123", method = RequestMethod.POST)
	@ResponseBody
	public ValidFormResult save(CrmEmployee employee) {
		try {
			String certno = employee.getCertno();
			String password = employee.getPassword();
			String mobile = employee.getMobile();
			employee.setName(employee.getName().replaceAll(" ", ""));//把姓名的空格去掉
			// 验证手机号码
			if (StringUtils.isNotBlank(mobile)) {
				if (!RegExpValidator.isMobile(mobile)) {
					return ValidFormResult.error("请填写正确的手机号码");
				}
			}
			CrmEmployee emplo = employeeService.getById(employee.getCompanyid(), employee.getId());
			if (employee.getCerttype().equals("1")) {
				boolean validateCard = IdCardUtils.validateCard(certno);
				if (validateCard) {
					if (null != employee.getId() && StringUtils.isNotBlank(password)) {
						// 处理用户名和密码
						CrmCompany company = companyService.getById(employee.getCompanyid());
						if (!emplo.getPassword().equalsIgnoreCase(password)) {// 前台用户改了密码
							employee.setPassword(Md5Sign.MD5Encode(employee.getUsername() + company.getBianhao().toUpperCase() + password).toUpperCase());
						}
					}
					if (null == employee.getId()) {
						Integer exitCertno = employeeService.exitCertno(certno, employee.getCompanyid());
						if (exitCertno > 0) {
							return ValidFormResult.error("身份证号码重复,请不要输入重复的身份证号");
						}
					} else {// 更新员工信息时候
						if (null != emplo.getCertno()) {
							if (!emplo.getCertno().equalsIgnoreCase(employee.getCertno())) {// 2次身份证号不一样,校验身份证号是否存在
								Integer exitCertno = employeeService.exitCertno(certno, employee.getCompanyid());

								if (exitCertno > 0) {
									return ValidFormResult.error("身份证号码重复,请不要输入重复的身份证号");
								}
							}
						}
					}
				} else {
					return ValidFormResult.error("身份证号码有误,请检验是否有空格");
				}
			} else {
				// 验证护照
				if (certno != null && certno != "") {
					if (null != employee.getId() && StringUtils.isNotBlank(password)) {
						// 处理用户名和密码
						CrmCompany company = companyService.getById(employee.getCompanyid());
						if (!emplo.getPassword().equalsIgnoreCase(password)) {// 前台用户改了密码
							employee.setPassword(Md5Sign.MD5Encode(employee.getUsername() + company.getBianhao().toUpperCase() + password).toUpperCase());
						}
					}
					if (null == employee.getId()) {
						Integer exitCertno = employeeService.exitCertno(certno, employee.getCompanyid());
						if (exitCertno > 0) {
							return ValidFormResult.error("护照号码重复,请不要输入重复的护照号码");
						}
					} else {// 更新员工信息时候
						if (StringUtils.isNotBlank(emplo.getPassportno())) {
							if (!emplo.getPassportno().equalsIgnoreCase(employee.getPassportno())) {// 2次护照不一样,校验护照是否存在
								Integer exitCertno = employeeService.exitCertno(certno, employee.getCompanyid());
								if (exitCertno > 0) {
									return ValidFormResult.error("护照号码重复,请不要输入重复的护照号码");
								}
							}
						}
					}
				} else {
					return ValidFormResult.error("护照号码有误,请检验是否有空格");
				}
			}

			//保存时判断用户名是否相同
			if (null != employee.getId()) {
				CrmEmployee employeeDB = employeeService.getById(employee.getCompanyid(), employee.getId());
				if (StringUtils.isNotBlank(employeeDB.getUsername()) && !(employeeDB.getUsername().equals(employee.getUsername()))) {
					if (employeeService.exsistValue(employee.getCompanyid(), "username", employee.getUsername()) || companyService.exsistValueName(employee.getCompanyid(), "username", employee.getUsername())) {
						return ValidFormResult.error("用户名已存在,请更换");
					}
				}
			} else {//添加时
				if (employeeService.exsistValue(employee.getCompanyid(), "username", employee.getUsername()) || companyService.exsistValueName(employee.getCompanyid(), "username", employee.getUsername())) {
					return ValidFormResult.error("用户名已存在,请更换");
				}
			}
			Long deptid = employee.getDeptid();
			CrmDepartment depart = deptService.getById(employee.getCompanyid(), deptid);
			if (depart != null) {
				if (null != depart.getDepth()) {
					employee.setDepth(depart.getDepth());
				}
			}
			employee.setKaitong(1);
			//全拼和简拼
			String simplename = Pinyin4jUtil.converterToFirstSpell(employee.getName());
			String fullname = Pinyin4jUtil.converterToSpell(employee.getName());
			fullname = fullname.length() > 500 ? fullname.substring(0, fullname.indexOf(",")) : fullname;
			simplename = simplename.length() > 100 ? simplename.substring(0, simplename.indexOf(",")) : simplename;
			employee.setFullname(fullname);
			employee.setSimplename(simplename);
			employeeService.saveOrUpdate(employee);
			CrmEmployee sessionUser = getUser();
			if (null != sessionUser && sessionUser.getAccno().equals(employee.getAccno())) {
				CrmEmployee user = employeeService.getById(employee.getCompanyid(), employee.getId());
				setSessionAttr("user", user);
			}

			//知情人
			insiderService.removeByEmpid(employee.getId());
			List<CrmEmpInsiderModel> insiderlist = employee.getInsiderlist();
			StringBuilder sb = new StringBuilder();
			for (CrmEmpInsiderModel model : insiderlist) {
				CrmEmpInsider empInsider = new CrmEmpInsider();
				BeanUtils.copyProperties(model, empInsider);
				empInsider.setEmpid(employee.getId());
				sb.append(StringUtils.isBlank(model.getAir()) ? "" : model.getAir())
						.append(StringUtils.isBlank(model.getHotel()) ? "" : model.getHotel())
						.append(StringUtils.isBlank(model.getTrain()) ? "" : model.getTrain());
				empInsider.setType(sb.toString());
				empInsider.setCompanyid(employee.getCompanyid());
				insiderService.saveOrUpdate(empInsider);
				//清空
				sb.setLength(0);
			}
			return ValidFormResult.ok();

		} catch (Exception e) {
			e.printStackTrace();
			return ValidFormResult.error("用户名已存在,请更换!");
		}
	}

	@RequestMapping("/removeEmp/{empid}")
	@ResponseBody
	public AuvgoResult remove(@PathVariable("empid") Long empid) {
		try {
			CrmCompany company = (CrmCompany) getSessionAttr("company");
			CrmEmployee crmEmployee = employeeService.getById(company.getId(), empid);
			Integer deleteById = employeeService.deleteById(company.getId(), empid);
			if (deleteById > 0) {
				CrmEmployee user = getUser();
				CrmCompany com = companyService.getById(user.getCompanyid());
				SysOperationNote sysOperationNote = new SysOperationNote(user.getId(), user.getName(),
						user.getDeptname(), new Date(), "pc前台根据 员工id删除员工信息" + crmEmployee.getName() + "的数据", com.getId(),
						com.getSimpname(), "删除员工信息");
				noteService.saveOrUpdate(sysOperationNote);
			}
			return AuvgoResult.build(ErrorCode.SUCCESS, ErrorCode.getMsg(ErrorCode.SUCCESS));
		} catch (Exception e) {
			return AuvgoResult.build(ErrorCode.ERROR, ErrorCode.getMsg(ErrorCode.ERROR));
		}
	}

	@RequestMapping("/showdept/{id}")
	public String showdept(@PathVariable("id") Long empId, Model model) {
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		Set<Long> idsets = Sets.newHashSet();
		if (null != empId && empId != 0) {
			CrmEmployee emp = employeeService.getById(company.getId(), empId);
			idsets = emp.getBookDeptIds();
		}
		model.addAttribute("depttree", deptService.getDeptZtree(company.getId(), idsets));
		return "crm/employee-daiding-dept";
	}

	@RequestMapping("/valid")
	@ResponseBody
	public Map<String, String> valid(@RequestParam("name") String name, @RequestParam("param") String value) {
		//response.setContentType("application/json;charset=UTF-8");//防止数据传递乱码
		Map<String, String> reuslt = Maps.newHashMap();
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		if (employeeService.exsistValue(company.getId(), name, value)) {
			reuslt.put("status", "n");
			if(name.equals("accno")){
				reuslt.put("info", "员工编号已存在,请更换");
			}else{
				reuslt.put("info", "用户名已存在请更换");
			}	
		} else {
			reuslt.put("status", "y");
			reuslt.put("info", "通过");
		}
		return reuslt;
	}


	//判断用户名
	@RequestMapping("/checkName")
	@ResponseBody
	public Map<String, String> check(@RequestParam("name") String name, @RequestParam("param") String value) {
		//response.setContentType("application/json;charset=UTF-8");//防止数据传递乱码
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		//通过id，username查company查是否和超级管理员重复
		log.info("员工用户名验证name:{},value:{},companyid:{}", name, value, company.getId());
		Map<String, String> reuslt = Maps.newHashMap();
		try {
			if (employeeService.exsistValue(company.getId(), "username", value) || companyService.exsistValueName(company.getId(), "username", value)) {
				reuslt.put("status", "n");
				/*String encode = URLEncoder.encode("用户名已存在,请更换", "UTF-8");
				reuslt.put("info", encode);*/
				reuslt.put("info", "用户名已存在,请更换");
			} else {
				reuslt.put("status", "y");
				reuslt.put("info", "通过");
			}

		} catch (Exception e) {
			e.printStackTrace();
		}
		return reuslt;
	}


	@SuppressWarnings({"rawtypes", "unchecked"})
	@RequestMapping("/download")
	public ResponseEntity download() throws IOException {
		String dfileName = "员工导入模板.xls";
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
		headers.setContentDispositionFormData("attachment", new String(dfileName.getBytes("utf-8"), "ISO8859-1"));
		String path = this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath() + "download";
		File file = new File(path + File.separator + dfileName);
		return new ResponseEntity(FileUtils.readFileToByteArray(file), headers, HttpStatus.CREATED);
	}


	/**
	 * 得到公司下的员工级别
	 *
	 * @param cid
	 * @return
	 */
	public Map<String, String> getLevel(Long cid) {
		Map<String, String> params = Maps.newHashMap();
		List<DataZidianValue> list = zidianKeyService.getzidianValueBYzidianKey(cid, "stafflevels");
		for (DataZidianValue dataZidianValue : list) {
			params.put(String.valueOf(dataZidianValue.getValue()), dataZidianValue.getName());
		}
		return params;
	}

	/**
	 * 得到公司下的所有角色
	 *
	 * @param cid
	 * @return
	 */
	public Map<String, String> getRoles(Long cid) {
		Map<String, String> params = Maps.newHashMap();
		List<CrmRole> list = roleService.findRolesByCid(cid);
		for (CrmRole role : list) {
			params.put(String.valueOf(role.getId()), role.getName());
		}
		return params;
	}

	@RequestMapping("/editStatus/{id}/{companyid}/{kaitong}")
	public String editStatus(@PathVariable("id") Long id, @PathVariable("companyid") Long companyid, @PathVariable("kaitong") Integer kaitong) {
		CrmEmployee crmEmployee = employeeService.getById(companyid, id);
		crmEmployee.setKaitong(kaitong);
		try {
			employeeService.saveOrUpdate(crmEmployee);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "redirect:/crm/employee";
	}

	//跳转到员工职级
	@RequestMapping("/toEmplevel")
	public String toAddEmpLevel(HttpServletRequest request) {
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		List<DataZidianValue> list = zidianKeyService.getzidianValueBYzidianKey(company.getId(), "stafflevels");
		setAttr("Emplevel", list);
		return "/crm/employee-addLevel";//跳转到员工添加职级的列表页面
	}


	@RequestMapping("/toAdd/{zidianId}")
	public String toAddEmpLevePage(@PathVariable("zidianId") Long zidianId) {
		setAttr("zidianid", zidianId);
		return "/crm/employee-level-add";
	}

	//保存新增的员工职级
	@RequestMapping("/addEmplevel")
	@ResponseBody
	public AuvgoResult addEmplevel(DataZidianValue zidianValue) {
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		if (StringUtils.isBlank(zidianValue.getName()) || StringUtils.isBlank(zidianValue.getValue()) || null == zidianValue.getSort() || null == zidianValue.getZidianid()) {
			return AuvgoResult.build(ErrorCode.WRONG_PARAMS, ErrorCode.getMsg(ErrorCode.WRONG_PARAMS));
		}
		try {
			zidianValue.setCompanyid(company.getId());
			Integer exis = zidianKeyService.getExistDataValue(company.getId(), zidianValue.getZidianid(), Integer.valueOf(zidianValue.getValue()));
			if (null == zidianValue.getId()) {//保存
				if (exis > 0) {
					return AuvgoResult.build(300, "该条员工职级已存在!");
				}
			} else {
				DataZidianValue dataZidianValue = zidianValueService.getById(zidianValue.getId());
				if (exis > 0 && !dataZidianValue.getValue().equals(zidianValue.getValue())) {
					return AuvgoResult.build(300, "该条员工职级已存在!");
				}
			}

			zidianValue.setValue(Integer.valueOf(zidianValue.getValue()).toString());//如果字符串前面带00,去掉前面0

			zidianKeyService.saveOrUpdateValue(zidianValue);
			return AuvgoResult.build(ErrorCode.SUCCESS, ErrorCode.getMsg(ErrorCode.SUCCESS));
		} catch (Exception e) {
			e.printStackTrace();
			return AuvgoResult.build(ErrorCode.ERROR_NONE, ErrorCode.getMsg(ErrorCode.ERROR_NONE));
		}
	}


	//员工等级编辑
	@RequestMapping("/editEmplevel/{zidianId}")
	public String editEmplevel(@PathVariable("zidianId") Long zidianId) {
		DataZidianValue zidianValue = zidianKeyService.getZidianValueById(zidianId);
		setAttr("zidianid", zidianValue.getZidianid());
		setAttr("zidianValue", zidianValue);
		return "/crm/employee-level-add";//字典添加页
	}


	//删除员工等级
	@RequestMapping("/remove/{zidianId}")
	@ResponseBody
	public AuvgoResult deleteEmplevel(@PathVariable("zidianId") Long zidianId) {
		if (null == zidianId) {
			return AuvgoResult.build(ErrorCode.WRONG_PARAMS, ErrorCode.getMsg(ErrorCode.WRONG_PARAMS));
		}
		try {
			zidianKeyService.deletezidianValueById(zidianId);
			return AuvgoResult.build(ErrorCode.SUCCESS, ErrorCode.getMsg(ErrorCode.SUCCESS));
		} catch (Exception e) {
			e.printStackTrace();
			return AuvgoResult.build(ErrorCode.ERROR_NONE, ErrorCode.getMsg(ErrorCode.ERROR_NONE));
		}
	}

}
