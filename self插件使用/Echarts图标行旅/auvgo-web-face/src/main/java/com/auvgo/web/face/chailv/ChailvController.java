package com.auvgo.web.face.chailv;

import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.auvgo.core.entity.ProConf;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.IsNumberUtils;
import com.auvgo.core.utils.JsonMapper;
import com.auvgo.core.utils.JsonUtils;
import com.auvgo.crm.api.CrmCompanyService;
import com.auvgo.crm.api.CrmPolicyAirContentService;
import com.auvgo.crm.api.CrmPolicyHotelService;
import com.auvgo.crm.api.CrmPolicyService;
import com.auvgo.crm.api.CrmPolicyTrainService;
import com.auvgo.crm.api.CrmProductSetService;
import com.auvgo.crm.entity.CrmCompany;
import com.auvgo.crm.entity.CrmEmployee;
import com.auvgo.crm.entity.CrmPolicyAir;
import com.auvgo.crm.entity.CrmPolicyAirContent;
import com.auvgo.crm.entity.CrmPolicyHotel;
import com.auvgo.crm.entity.CrmPolicyTrain;
import com.auvgo.crm.entity.CrmProductSet;
import com.auvgo.data.api.DataZidianKeyService;
import com.auvgo.data.entity.DataZidianValue;
import com.auvgo.hotel.api.ws.inside.IAuvgoHotelGeoTierAutoWSService;
import com.auvgo.hotel.api.ws.inside.IAuvgoHotelGeoWSService;
import com.auvgo.hotel.orm.bim.entity.GeoTierAuto;
import com.auvgo.sys.api.SysOperationNoteService;
import com.auvgo.sys.entity.SysOperationNote;
import com.auvgo.web.face.BaseController;
import com.fasterxml.jackson.databind.JavaType;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

@Controller
@RequestMapping("/crm/chailv")
public class ChailvController extends BaseController {
	private static JsonMapper json = JsonMapper.nonNullMapper();
	@Autowired
	private CrmPolicyService policyService;
	@Autowired
	private DataZidianKeyService zidianKeyService;
	@Autowired
	private CrmPolicyTrainService policyTrainService;
	@Autowired
	private CrmCompanyService crmCompanyService;
	@Autowired
	private CrmPolicyHotelService crmPolicyHotelService;
	@Autowired
	private CrmPolicyAirContentService airContentService;
	@Autowired
	private SysOperationNoteService sysOperationNoteService;
	@Autowired(required = false)
	private IAuvgoHotelGeoWSService auvgoHotelGeoWSService;
	@Autowired
	private CrmProductSetService productService;
	@Autowired(required = false)
	private IAuvgoHotelGeoTierAutoWSService auvgoHotelGeoTierAutoWSService;

	/**
	 * @param cid
	 *            为crm_company 中的id
	 * @return
	 */
	@RequestMapping("/")
	public String toPage(Model model) {
		CrmCompany company = getCompany();
		if (null == company) {
			setAttr("msg", "请您重新登录！");
			return "redirect:/login";
		}
		Long cid = company.getId();
		company = policyService.getCompany(cid);
		setSessionAttr("company", company);
		setAttr("cid", cid);
		showCityLevel(cid, model);
		// 国内酒店差旅政策
		List<CrmPolicyHotel> policyHotelList = crmPolicyHotelService.getPolicyHotelListByCid(cid);
		model.addAttribute("policyHotelList", policyHotelList);
		// 国内火车票差旅政策
		CrmPolicyTrain train = new CrmPolicyTrain();
		train.setCompanyid(cid);
		List<CrmPolicyTrain> policyTrain = policyTrainService.findListBy(train);
		model.addAttribute("policyTrain", policyTrain);
		// 获得字典表城市等级
		getCityLevel(cid, model);
		// 获得字典员工等级
		getStaff(cid, model);
		// 国内机票差旅政策
		List<CrmPolicyAirContent> airlist = airContentService.getAirPolicyListByCid(cid);
		for (CrmPolicyAirContent crmPolicyAirContent : airlist) {
			List<CrmPolicyAir> policyair = (List<CrmPolicyAir>) JsonUtils.jsonToList(crmPolicyAirContent.getChailvcontent(), CrmPolicyAir.class);
			crmPolicyAirContent.setPolicyAir(policyair);
			crmPolicyAirContent.setChailvcontent("");
		}
		setAttr("crmPolicyairlist", airlist);
		return "/crm/policy/policy-by-rank";
	}

	@RequestMapping("/policyset/{qiyong}/{standard}")
	@ResponseBody
	public AuvgoResult updateTripStandard(@PathVariable("qiyong") String qiyongchailv, @PathVariable("standard") String chailvbiaozhun) {
		try {
			CrmCompany company = getCompany();
			if (null == company) {
				return AuvgoResult.build(300, "请您重新登录!");
			}
			Long cid = company.getId();
			policyService.updateTripStandard(cid, chailvbiaozhun, qiyongchailv);
			company = policyService.getCompany(cid);
			setSessionAttr("company", company);
			return AuvgoResult.build(200, "保存成功!");
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "保存失败!");
	}

	/**
	 * 国内机票 编辑差旅
	 * 
	 * @param id
	 * @param cid
	 * @param model
	 * @return
	 */
	@RequestMapping("/guonei/{cid}/{id}")
	public String toEditInlandPage(@PathVariable("id") Long id, @PathVariable("cid") Long cid, Model model) {
		CrmCompany company = crmCompanyService.getById(cid);
		if (null == company) {
			setAttr("msg", "请您重新登录！");
			return "redirect:/login";
		}
		CrmPolicyAirContent policyaircontent = airContentService.getById(id);
		model.addAttribute("company1", company);
		showAllStaff(cid, model);
		List<CrmPolicyAir> airlist = JsonUtils.jsonToList(policyaircontent.getChailvcontent(), CrmPolicyAir.class);
		policyaircontent.setPolicyAir(airlist);
		policyaircontent.setChailvcontent(null);
		model.addAttribute("crmPolicyAir", policyaircontent);
		return "/crm/policy/edit-air-policy";
	}

	/**
	 * 保存国内机票差旅政策
	 * 
	 * @param policy
	 * @return
	 */
	@RequestMapping("/guoneisave")
	@ResponseBody
	public AuvgoResult inlandStandarSave(String id, Long companyid, Long startlevel, Long endlevel, int chailvSize, HttpServletRequest request) {
		CrmCompany company = getCompany();
		CrmEmployee user = getUser();
		if (null == company) {
			return AuvgoResult.build(300, "请您重新登录!");
		}
		if ("level".equals(company.getChailvbiaozhun())) {
			if (startlevel == null || endlevel == null) {
				return AuvgoResult.build(300, "请填写员工职级");
			}
			Integer exist = airContentService.getExistAirPolicy(startlevel, endlevel, companyid);
			if (StringUtils.isNotBlank(id)) {// 编辑
				CrmPolicyAirContent airContent = airContentService.getById(Long.parseLong(id));
				if (exist > 0 && !(airContent.getStartlevel().longValue() == startlevel.longValue() && (airContent.getEndlevel().longValue() == endlevel.longValue()))) {
					return AuvgoResult.build(300, "该条标准已经存在,请选择其他员工等级!");
				}
			} else {
				if (exist > 0) {
					return AuvgoResult.build(300, "该条标准已经存在,请选择其他员工等级!");
				}
			}
			// 获取按员工等级获取的差旅政策
			AuvgoResult airChailv = getAirChailv(chailvSize, request);
			if (airChailv.getStatus() != 200) {
				return airChailv;
			}
			saveNewAirPolicy(id, airChailv, company, startlevel, endlevel);
		} else {// 公司统一配置
			if(StringUtils.isBlank(id)){//保存
				Integer exist = airContentService.getExistAirPolicyBycid(companyid);
				if (exist > 0 ) {
					return AuvgoResult.build(300, "该条标准已经存在!");
				}
			}
			AuvgoResult airChailv = getAirChailv(chailvSize, request);
			if (airChailv.getStatus() != 200) {
				return airChailv;
			}
			saveNewAirPolicy(id, airChailv, company, startlevel, endlevel);
		}

		SysOperationNote sysOperationNote = new SysOperationNote(user.getId(), user.getName(), user.getDeptname(), new Date(), "保存机票差旅政策", company.getId(), company.getSimpname(),
				"添加国内机票差旅政策");
		sysOperationNoteService.saveOrUpdate(sysOperationNote);
		return AuvgoResult.build(200, "保存成功");
	}

	private void saveNewAirPolicy(String id, AuvgoResult airChailv, CrmCompany company, Long startlevel, Long endlevel) {
		CrmPolicyAirContent aircontent = new CrmPolicyAirContent();
		if (StringUtils.isNotBlank(id)) {
			aircontent.setId(Long.parseLong(id));
		}
		aircontent.setCompanyid(company.getId());
		if ("level".equals(company.getChailvbiaozhun())) {
			aircontent.setStartlevel(startlevel);
			aircontent.setEndlevel(endlevel);
		} else {
			aircontent.setStartlevel(null);
			aircontent.setEndlevel(null);
		}
		aircontent.setType(company.getChailvbiaozhun());
		aircontent.setChailvcontent(String.valueOf(airChailv.getData()));
		aircontent.setCreatetime(new Date());
		airContentService.saveOrUpdate(aircontent);
	}

	@SuppressWarnings("unchecked")
	private AuvgoResult getAirChailv(int chailvSize, HttpServletRequest request) {
		List<CrmPolicyAir> list = Lists.newArrayList();
		for (int i = 0; i < chailvSize; i++) {
			CrmPolicyAir policyair = new CrmPolicyAir();
			String startmile = request.getParameter("startmile_" + i);
			String endmile = request.getParameter("endmile_" + i);
			if (StringUtils.isBlank(startmile) || StringUtils.isBlank(endmile)) {
				return AuvgoResult.build(300, "里程数不能为空");
			}
			if (startmile.equals(endmile)) {
				return AuvgoResult.build(300, "开始里程和结束里程相同,请重新选择里程范围");
			}
			policyair.setStartmile(Integer.valueOf(startmile));
			policyair.setEndmile(Integer.valueOf(endmile));
			String allowfly = request.getParameter("allowfly_" + i);
			if ("0".equals(allowfly)) {// 说明不允许乘坐飞机
				policyair.setAllowfly(0);
				String controller0 = request.getParameter("controller_" + i + "_" + 0);
				if ("0".equals(controller0)) {// 表示不允许预定
					policyair.setAllowc(controller0);
					list.add(policyair);
					continue;// 进行下一个里程差旅政策取值
				} else {
					policyair.setAllowc(controller0);
				}
			} else {
				policyair.setAllowfly(1);
				policyair.setAllowc("1");
			}
			String cabinlimit0 = request.getParameter("cabinlimit_" + i);
			if (StringUtils.isBlank(cabinlimit0)) {
				policyair.setCabinlimit(0);// 没有舱位折扣限制
				String controller1 = request.getParameter("controller_" + i + "_" + 1);
				if (StringUtils.isBlank(controller1)) {
					return AuvgoResult.build(300, "请选择舱位的管控方式");
				}

				policyair.setCabc(controller1);
			} else {// 有舱位折扣限制
				policyair.setCabinlimit(Integer.valueOf(cabinlimit0));
				String controller1 = request.getParameter("controller_" + i + "_" + 1);// 编辑时修改管控方式
				if (StringUtils.isBlank(controller1)) {
					return AuvgoResult.build(300, "请选择舱位的管控方式");
				}
				String cabinzhekou0 = request.getParameter("cabinzhekou_" + i);
				if (StringUtils.isBlank(cabinzhekou0)) {
					return AuvgoResult.build(300, "请选择折扣价格");
				}
				policyair.setCabc(controller1);
				policyair.setCabinzhekou(Integer.valueOf(cabinzhekou0));
				// policyair.setCabc("1");
			}
			String flightlimit = request.getParameter("flightlimit_" + i);
			String flightlowtype = request.getParameter("flightlowtype_" + i);
			String flighthour = request.getParameter("flighthour_" + i);
			String isfilterStop = request.getParameter("isfilterStop_" + i);
			if (StringUtils.isNotBlank(flightlimit)) {// 说明有最低价限制
				if (StringUtils.isNotBlank(flightlowtype)) {
					if(StringUtils.isEmpty(isfilterStop)){
						isfilterStop="0";
					}
					policyair.setIsfilterStop(Integer.valueOf(isfilterStop));
					policyair.setFlightlimit(Integer.valueOf(flightlimit));
					policyair.setFlightlowtype(Integer.valueOf(flightlowtype));
					if ("2".equals(flightlowtype)) {// 设置了前后几小时最低价
						if (StringUtils.isNotBlank(flighthour) && IsNumberUtils.isNumeric(flighthour)) {
							policyair.setFlighthour(Integer.valueOf(flighthour));
						} else {
							return AuvgoResult.build(300, "请输入前后N小时的数字");
						}
					}
				}
			}
			String controller2 = request.getParameter("controller_" + i + "_" + 2);
			policyair.setLowc(controller2);
			// 获取前后N天数据
			String allowbefore = request.getParameter("allowbefore_" + i);
			if (StringUtils.isNotBlank(allowbefore)) {
				String beforeday = request.getParameter("beforeday_" + i);
				if (StringUtils.isBlank(beforeday)) {
					return AuvgoResult.build(300, "请输入预定的天数");
				}
				policyair.setAllowbefore(Integer.valueOf(allowbefore));
				if (IsNumberUtils.isNumeric(beforeday)) {
					policyair.setBeforeday(Integer.valueOf(beforeday));
				} else {
					return AuvgoResult.build(300, "请输入前后N天的数字值");
				}
			}
			String controller3 = request.getParameter("controller_" + i + "_" + 3);
			policyair.setBrec(controller3);
			list.add(policyair);
		}

		Map<String, Object> maps = compareLicheng(list);
		Boolean flag = (Boolean) maps.get("status");
		list = (List<CrmPolicyAir>) maps.get("list");
		if (!flag) {
			return AuvgoResult.build(300, "里程存在交叉行为,请重新选择");
		}
		if (list.size() > 6) {
			return AuvgoResult.build(300, "里程数量不能超过6条配置");
		}
		return AuvgoResult.build(200, "success", JsonUtils.objectToJson(list));

	}

	// 比较是否存在里程交叉问题
	public Map<String, Object> compareLicheng(List<CrmPolicyAir> list2) {
		Map<String, Object> maps = Maps.newHashMap();
		List<CrmPolicyAir> list = getListSortAndDistinct(list2);
		if (list.size() > 1) {
			for (int i = 1; i < list.size(); i++) {
				CrmPolicyAir crmPolicyAir1 = list.get(i - 1);
				CrmPolicyAir crmPolicyAir2 = list.get(i);
				if (crmPolicyAir1.getEndmile() >= crmPolicyAir1.getStartmile() && crmPolicyAir2.getStartmile() >= crmPolicyAir1.getEndmile()
						&& crmPolicyAir2.getEndmile() >= crmPolicyAir2.getStartmile()) {
					continue;
				} else {
					maps.put("status", false);
					return maps;
				}
			}
		} else {
			CrmPolicyAir crmPolicyAir = list.get(0);
			Integer startmile = crmPolicyAir.getStartmile();
			Integer endmile = crmPolicyAir.getEndmile();
			if (startmile > endmile) {
				maps.put("status", false);
				return maps;
			}
		}
		maps.put("status", true);
		maps.put("list", list);
		return maps;
	}

	// 给集合排序和去重
	public List<CrmPolicyAir> getListSortAndDistinct(List<CrmPolicyAir> list) {
		List<CrmPolicyAir> list1 = Lists.newArrayList();
		// 先转换成map,把里程相同的去掉
		Map<String, CrmPolicyAir> map = Maps.newHashMap();
		for (CrmPolicyAir crmPolicyAir : list) {
			map.put(crmPolicyAir.getStartmile() + crmPolicyAir.getEndmile() + "", crmPolicyAir);
		}
		for (Map.Entry<String, CrmPolicyAir> entry : map.entrySet()) {
			list1.add(entry.getValue());
		}
		Collections.sort(list1, new Comparator<CrmPolicyAir>() {
			public int compare(CrmPolicyAir o1, CrmPolicyAir o2) {
				// 进行升序排列
				if (o1.getStartmile() > o2.getStartmile()) {
					return 1;
				}
				if (o1.getStartmile() == o2.getStartmile()) {
					return 0;
				}
				return -1;
			}
		});

		return list1;
	}

	/**
	 * 国内机票 添加差旅
	 * 
	 * @param model
	 * @return
	 */
	@RequestMapping("/guonei")
	public String toAddPage(Model model) {
		CrmCompany company = getCompany();
		if (null == company) {
			setAttr("msg", "请您重新登录！");
			return "redirect:/login";
		}

		Long cid = company.getId();
		setAttr("cid", cid);
		showAllStaff(cid, model);
		return "/crm/policy/add-air-policy";
	}

	/**
	 * 国内机票 删除差旅
	 * 
	 * @param id
	 * @param cid
	 * @return
	 */
	@RequestMapping("/gnremove/{cid}/{id}")
	@ResponseBody
	public AuvgoResult removeInlandStandar(@PathVariable("id") Long id, @PathVariable("cid") Long cid) {
		try {
			airContentService.deleteById(id);
			CrmCompany company = crmCompanyService.getById(cid);
			CrmEmployee user = getUser();
			SysOperationNote sysOperationNote = new SysOperationNote(user.getId(), user.getName(), user.getDeptname(), new Date(), "根据id删除机票的差旅政策", company.getId(),
					company.getSimpname(), "删除差旅政策");
			sysOperationNoteService.saveOrUpdate(sysOperationNote);
			return AuvgoResult.ok();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "删除失败!");
	}

	// 获取城市等级名称
	public void getCityLevel(Long cid, Model model) {
		// 通过字典接口获取 城市等级信息封装进map
		List<DataZidianValue> citylist = zidianKeyService.getzidianValueBYzidianKey(cid, "jdcityfenlei");
		Map<String, String> cityparam = Maps.newHashMap();
		for (DataZidianValue dataZidianValue : citylist) {
			cityparam.put(String.valueOf(dataZidianValue.getId()), dataZidianValue.getName());
		}
		model.addAttribute("cityparam", cityparam);
	}

	// 获取员工字典信息
	public void getStaff(Long cid, Model model) {
		// 通过字典接口获取 员工信息封装进map
		Map<String, String> params = Maps.newHashMap();
		List<DataZidianValue> list = zidianKeyService.getzidianValueBYzidianKey(cid, "stafflevels");
		for (DataZidianValue dataZidianValue : list) {
			params.put(String.valueOf(dataZidianValue.getValue()), dataZidianValue.getName());
		}
		model.addAttribute("param", params);
	}

	// 给页面返回车座位类型.
	@ModelAttribute("seatmap")
	public Map<String, String> showTrainSeat() {
		Map<String, String> seatmap = Maps.newHashMap();
		seatmap.put("9", "商务座");
		seatmap.put("P", "特等座");
		seatmap.put("M", "一等座");
		seatmap.put("O", "二等座");
		seatmap.put("6", "高级软卧");
		seatmap.put("4", "软卧");
		seatmap.put("3", "硬卧");
		seatmap.put("2", "软座");
		seatmap.put("1", "硬座");
		seatmap.put("F", "动卧");
		return seatmap;
	}

	public void showCityLevel(Long cid, Model model) {
		// 拿到员工字典表信息
		// 拿到 该公司 staff 的所有信息集合
		List<DataZidianValue> jdcitylevelList = zidianKeyService.getzidianValueBYzidianKey(cid, "jdcityfenlei");
		model.addAttribute("jdcity", jdcitylevelList);
	}

	public void showAllStaff(Long cid, Model model) {
		// 拿到员工字典表信息
		// 拿到 该公司 staff 的所有信息集合
		List<DataZidianValue> staffList = zidianKeyService.getzidianValueBYzidianKey(cid, "stafflevels");
		model.addAttribute("AllStaff", staffList);
	}

	/**
	 * 国内酒店 添加差旅
	 * 
	 * @param model
	 * @return
	 */
	@RequestMapping("/hotel")
	public String toAddHotelPage(Model model) {
		try {
			CrmCompany company = getCompany();
			if (null == company) {
				setAttr("msg", "请您重新登录！");
				return "redirect:/login";
			}
			Long cid = company.getId();
			showCityLevel(cid, model);
			showAllStaff(cid, model);
			model.addAttribute("cid", cid);
			String cityLevelConfig = companyCityLevelConfig(cid);
			model.addAttribute("cityLevelConfig", cityLevelConfig);
			if("2".equals(cityLevelConfig)){
				List<GeoTierAuto> geoTierAuto = auvgoHotelGeoTierAutoWSService.findByCusno(company.getBianhao());
				model.addAttribute("geoTierAuto", geoTierAuto);
			}else{
				Map<Integer, String> tierName = auvgoHotelGeoWSService.findCustomTierName(company.getBianhao());
				model.addAttribute("tierName", tierName);
			}
		} catch (Exception e) {
			log.error("toAddHotelPage is fail", e);
		}
		return "/crm/policy/add-hotel-policy";
	}

	@RequestMapping("/saveHotel")
	@ResponseBody
	public AuvgoResult saveHotelPolicy(Long companyid, Long citySize, Integer startlevel, String id, Integer endlevel, HttpServletRequest request) {
		CrmCompany company = getCompany();
		if (null == company) {
			return AuvgoResult.build(300, "请您重新登录!");
		}
		if (StringUtils.isBlank(request.getParameter("price1"))) {
			return AuvgoResult.build(300, "请您填写城市价格！");
		}
		if (StringUtils.isNotBlank(id)) {// 编辑
			CrmPolicyHotel crmPolicyHotel = crmPolicyHotelService.getById(Long.valueOf(id));
			if ("level".equals(company.getChailvbiaozhun())) {
				// 判断该条员工等级差旅是否存在
				Integer exist = crmPolicyHotelService.getExistHotelPolicy(startlevel, endlevel, companyid);
				if (exist > 0 && !(crmPolicyHotel.getStartlevel() == startlevel && crmPolicyHotel.getEndlevel() == endlevel)) {
					return AuvgoResult.build(300, "该条标准已经存在,请选择其他员工等级!");
				}
			}
		} else {// 保存
			if ("level".equals(company.getChailvbiaozhun())) {
				// 判断该条员工等级差旅是否存在
				Integer exist = crmPolicyHotelService.getExistHotelPolicy(startlevel, endlevel, companyid);
				if (exist > 0) {
					return AuvgoResult.build(300, "该条标准已经存在,请选择其他员工等级!");
				}
			} else {
				// 判断该条差旅是否存在
				Integer exist = crmPolicyHotelService.getExistHotelPolicy(companyid);
				if (exist > 0) {
					return AuvgoResult.build(300, "该条标准已经存在!");
				}
			}
		}

		try {
			StringBuffer jdcitylevel = new StringBuffer();// 存储城市等级id
			StringBuffer controller = new StringBuffer();// 存储管控方式
			StringBuffer prices = new StringBuffer();// 存储不同城市价格
			StringBuffer cityNames = new StringBuffer();// 存储不同城市价格
			for (int i = 1; i <= citySize; i++) {// 遍历拼接
				String price = request.getParameter("price" + i);
				if (null == price || "".equals(price) || Double.parseDouble(price) <= 0) {
					return AuvgoResult.build(300, "价格不能为空或者为非法数据!");
				}
				String cityid = request.getParameter("cityId" + i);
				String cityLevelName = request.getParameter("cityName" + i);
				String oneLine_city = request.getParameter("oneLine_city" + i);
				jdcitylevel.append(cityid + "/");
				controller.append(oneLine_city + "/");
				prices.append(price + "/");
				cityNames.append(cityLevelName + "/");
			}
			CrmPolicyHotel policyHotel = new CrmPolicyHotel();
			if (StringUtils.isNotBlank(id)) {
				policyHotel.setId(Long.valueOf(id));
			}
			policyHotel.setCompanyid(companyid);
			policyHotel.setStartlevel(startlevel);
			policyHotel.setEndlevel(endlevel);
			policyHotel.setControllertype(controller.toString());
			policyHotel.setPrice(prices.toString());
			policyHotel.setJdcitylevelid(jdcitylevel.toString());
			policyHotel.setCitylevelname(cityNames.toString());
			crmPolicyHotelService.savePolicyHotel(policyHotel);
			return AuvgoResult.ok();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "保存失败!!");
	}

	/**
	 * 国内酒店 编辑差旅政策
	 * 
	 * @param id
	 * @param model
	 * @return
	 */
	@RequestMapping("/editHotelCity/{id}")
	public String editPolicyHotel(@PathVariable("id") Long id, Model model) {
		try {
			CrmCompany company = getCompany();
			if (null == company) {
				setAttr("msg", "请您重新登录！");
				return "redirect:/login";
			}
			Long cid = company.getId();

			showCityLevel(cid, model);
			showAllStaff(cid, model);
			// 获得字典表城市等级
			getCityLevel(cid, model);
			// 获得字典员工等级
			getStaff(cid, model);
			model.addAttribute("cid", cid);
			CrmPolicyHotel policyHotel = crmPolicyHotelService.getPolicyHotelById(id);
			model.addAttribute("policyHotel", policyHotel);
			
			String cityLevelConfig = companyCityLevelConfig(cid);
			model.addAttribute("cityLevelConfig", cityLevelConfig);
			if("2".equals(cityLevelConfig)){
				List<GeoTierAuto> geoTierAuto = auvgoHotelGeoTierAutoWSService.findByCusno(company.getBianhao());
				model.addAttribute("geoTierAuto", geoTierAuto);
			}else{
				Map<Integer, String> tierName = auvgoHotelGeoWSService.findCustomTierName(company.getBianhao());
				model.addAttribute("tierName", tierName);
			}
		} catch (Exception e) {
			log.error("editPolicyHotel is fail", e);
		}
		return "/crm/policy/edit-hotel-policy";
	}
	
	/**
	 * 查询公司设置城市级别
	 * 
	 * @param cid
	 * @return
	 */
	private String companyCityLevelConfig(Long cid) {
		// 公司产品设置
		CrmProductSet productSet = productService.getByCid(cid);
		String cityLevelConfig = "1";// 1系统默认，2客户自定义
		if (productSet != null && StringUtils.isNotBlank(productSet.getProconfvalue())) {
			JavaType javaType = json.contructCollectionType(List.class, ProConf.class);
			List<ProConf> proConf = json.fromJson(productSet.getProconfvalue(), javaType);
			if (proConf != null && !proConf.isEmpty()) {
				for (ProConf p : proConf) {
					if ("citylevel".equals(p.getName())) {
						cityLevelConfig = p.getValue();
					}
				}
			}
		}
		return cityLevelConfig;
	}

	/**
	 * 国内酒店 删除差旅政策
	 * 
	 * @param id
	 * @return
	 */
	@RequestMapping("/deleteHotelCity/{id}")
	@ResponseBody
	public AuvgoResult deletePolicyHotel(@PathVariable("id") Long id) {
		try {
			crmPolicyHotelService.deleteHotelPolicy(id);
			return AuvgoResult.ok();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "删除失败!!");
	}

	/**
	 * 火车票 添加差旅政策
	 * 
	 * @param model
	 * @return
	 */
	@RequestMapping("/train")
	public String toTrainPage(Model model) {
		CrmCompany company = getCompany();
		if (null == company) {
			setAttr("msg", "请您重新登录！");
			return "redirect:/login";
		}
		Long cid = company.getId();
		showAllStaff(cid, model);
		return "/crm/policy/add-train-policy";
	}

	/**
	 * 保存 火车票差旅政策
	 * 
	 * @param companyid
	 * @param startlevel
	 * @param endlevel
	 * @param request
	 * @return
	 */
	@RequestMapping("/saveTrain")
	@ResponseBody
	public AuvgoResult saveTrainPolicys(Integer startlevel, Integer endlevel, HttpServletRequest request) {
		CrmCompany company = getCompany();
		if (null == company) {
			return AuvgoResult.build(300, "请您重新登录！");
		}
		Long companyid = company.getId();
		String id = request.getParameter("id");
		if (StringUtils.isNotBlank(id)) {// 编辑
			CrmPolicyTrain crmPolicyTrain = policyTrainService.getById(Long.valueOf(id));
			if ("level".equals(company.getChailvbiaozhun())) {
				// 判断该条员工等级差旅是否存在
				Integer exist = policyTrainService.getExistTrainPolicy(startlevel, endlevel, companyid);
				if (exist > 0 && !(crmPolicyTrain.getStartlevel() == startlevel && crmPolicyTrain.getEndlevel() == endlevel)) {
					return AuvgoResult.build(300, "该条标准已经存在,请选择其他员工等级!");
				}
			}
		} else {// 保存
			if ("level".equals(company.getChailvbiaozhun())) {
				// 判断该条员工等级差旅是否存在
				Integer exist = policyTrainService.getExistTrainPolicy(startlevel, endlevel, companyid);
				if (exist > 0) {
					return AuvgoResult.build(300, "该条标准已经存在,请选择其他员工等级!");
				}
			} else {
				// 判断该条差旅是否存在
				Integer exist = policyTrainService.getExistTrainPolicy(companyid);
				if (exist > 0) {
					return AuvgoResult.build(300, "该条标准已经存在!");
				}
			}
		}

		try {
			saveTrainPolicy(companyid, startlevel, endlevel, request);
			return AuvgoResult.ok();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "火车票差旅政策保存失败!");
	}

	/**
	 * 删除 火车票 差旅政策
	 * 
	 * @param id
	 * @return
	 */
	@RequestMapping("/deleteTrainPolicy/{id}")
	@ResponseBody
	public AuvgoResult deleteTrainPolicy(@PathVariable("id") Long id) {
		try {
			policyTrainService.deleteById(id);
			return AuvgoResult.ok();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "删除失败!");
	}

	/**
	 * 编辑 火车票差旅政策
	 * 
	 * @param id
	 * @param model
	 * @return
	 */
	@RequestMapping("/editTrain/{id}")
	public String editTrainPolilcy(@PathVariable("id") Long id, Model model) {
		CrmCompany company = getCompany();
		if (null == company) {
			setAttr("msg", "请您重新登录！");
			return "redirect:/login";
		}
		Long cid = company.getId();

		CrmPolicyTrain policyTrain = policyTrainService.getById(id);
		showAllStaff(cid, model);
		model.addAttribute("policyTrain", policyTrain);
		return "/crm/policy/add-train-policy";
	}

	// 封装获取添加火车票政策的方法
	public void saveTrainPolicy(Long companyid, Integer startlevel, Integer endlevel, HttpServletRequest request) {
		StringBuffer gaotie = new StringBuffer();
		StringBuffer donche = new StringBuffer();
		StringBuffer pukuai = new StringBuffer();
		StringBuffer contro = new StringBuffer();
		for (int i = 1; i <= 7; i++) {
			if (StringUtils.isNotBlank(request.getParameter("g_" + i))) {
				gaotie.append(request.getParameter("g_" + i) + "/");
			}
			if (StringUtils.isNotBlank(request.getParameter("p_" + i))) {
				pukuai.append(request.getParameter("p_" + i) + "/");
			}
			if (StringUtils.isNotBlank(request.getParameter("d_" + i))) {
				donche.append(request.getParameter("d_" + i) + "/");
			}
		}
		CrmPolicyTrain crmPolicyTrain = new CrmPolicyTrain();
		if (StringUtils.isNotBlank(request.getParameter("id"))) {
			crmPolicyTrain.setId(Long.valueOf(request.getParameter("id")));
		}
		contro.append(request.getParameter("g_gkfs") + "/");
		contro.append(request.getParameter("d_gkfs") + "/");
		contro.append(request.getParameter("p_gkfs") + "/");
		crmPolicyTrain.setCompanyid(companyid);
		crmPolicyTrain.setStartlevel(startlevel);
		crmPolicyTrain.setEndlevel(endlevel);
		crmPolicyTrain.setGaotie(gaotie.toString());
		crmPolicyTrain.setDonche(donche.toString());
		crmPolicyTrain.setPukuai(pukuai.toString());
		crmPolicyTrain.setControltype(contro.toString());
		policyTrainService.saveOrUpdate(crmPolicyTrain);
	}
}
