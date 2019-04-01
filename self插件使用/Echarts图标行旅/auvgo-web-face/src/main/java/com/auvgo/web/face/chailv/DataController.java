package com.auvgo.web.face.chailv;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.JsonUtils;
import com.auvgo.crm.api.CrmPolicyHotelCityService;
import com.auvgo.crm.entity.CrmCompany;
import com.auvgo.crm.entity.CrmPolicyHotelCity;
import com.auvgo.data.api.DataZidianKeyService;
import com.auvgo.data.entity.DataZidianKey;
import com.auvgo.data.entity.DataZidianValue;
import com.auvgo.hotel.api.HotelDataSearchService;
import com.auvgo.hotel.entity.HotelGeoCity;
import com.auvgo.web.face.BaseController;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

@Controller
@RequestMapping("/crm/data")
public class DataController extends BaseController {

	@Autowired
	private DataZidianKeyService zidianKeyService;
	@Autowired
	private HotelDataSearchService dataSearchService;
	@Autowired
	private CrmPolicyHotelCityService policyHotelCityService;

	@RequestMapping("/")
	public String toDataPage(Model model) {

		CrmCompany company = getCompany();
		if (null == company) {
			setAttr("msg", "请您重新登录！");
			return "redirect:/login";
		}
		Long cid = company.getId();

		String zidianTree = zidianKeyService.findList("1");
		model.addAttribute("zidiantree", zidianTree);
		model.addAttribute("cid", cid);
		return "/crm/data";
	}

	@RequestMapping("/tovaluelist/{treeid}")
	public String toEditTree(@PathVariable("treeid") Long zid, Model model) {
		toEditTreeAjax(zid, model);
		if (zid == 2){
			model.addAttribute("flag", "policy");
			return "/crm/policy/ctiy-rank";
		}
		return "/crm/data-manage/data-manage";
	}

	@RequestMapping("/air/{zid}")
	public String goAirTuiPiao(@PathVariable("zid") Long zid, Model model) {
		toEditTreeAjax(zid, model);
		return "/crm/data-manage/air-refund";
	}

	@RequestMapping("/train/{zid}")
	public String goTrainPiao(@PathVariable("zid") Long zid, Model model) {
		toEditTreeAjax(zid, model);
		return "/crm/data-manage/train-wb";
	}

	@RequestMapping("/hotel/{zid}")
	public String goHotelWb(@PathVariable("zid") Long zid, Model model) {
		toEditTreeAjax(zid, model);
		return "/crm/data-manage/hotel-wb";
	}

	@RequestMapping("/emp")
	public String goEmployeeLevel() {
		CrmCompany company = (CrmCompany) getSessionAttr("company");
		List<DataZidianValue> list = zidianKeyService
				.getzidianValueBYzidianKey(company.getId(), "stafflevels");
		setAttr("Emplevel", list);
		return "/crm/data-manage/employee-level";
	}

	@RequestMapping("/city/{zid}")
	public String goCityRank(@PathVariable("zid") Long zid, Model model) {
		model.addAttribute("flag", "data");
		toEditTreeAjax(zid, model);
		return "/crm/data-manage/city-rank";
	}

	private void toEditTreeAjax(Long zid, Model model) {
		try {
			CrmCompany company = getCompany();
			if (null == company)
				return;
			Long cid = company.getId();
			List<DataZidianValue> list = zidianKeyService.findzdValueListBy(
					cid, zid);
			model.addAttribute("valuelist", list);
			model.addAttribute("zid", zid);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@RequestMapping("/add/{zid}")
	public String toAddPage(@PathVariable("zid") Long zid, Model model) {
		model.addAttribute("zidianid", zid);
		if (zid == 3) {// 机票违背原因
			return "/crm/data-manage/policy-air-add-wb";
		} else if (zid == 4) {// 酒店背原因
			return "/crm/data-manage/policy-hotel-add-wb";
		} else if (zid == 5) {// 火车票违背原因
			return "/crm/data-manage/policy-train-add-wb";
		} else if (zid == 6) {// 机票退票原因
			return "/crm/data-manage/policy-air-add-tp";
		} else if (zid == 2) {// 酒店所在城市分类
			return "/crm/policy/city-rank-add";
		} else {
			return null;
		}
	}

	@RequestMapping("/edit/{zid}/{id}")
	public String toEditPage(@PathVariable("zid") Long zid,
			@PathVariable("id") Long id, Model model) {
		DataZidianValue zidianValue = zidianKeyService.getZidianValueById(id);
		model.addAttribute("zidian", zidianValue);
		model.addAttribute("zidianid", zid);
		if (zid == 3) {// 机票违背原因
			return "/crm/data-manage/policy-air-add-wb";
		} else if (zid == 4) {// 酒店背原因
			return "/crm/data-manage/policy-hotel-add-wb";
		} else if (zid == 5) {// 火车票违背原因
			return "/crm/data-manage/policy-train-add-wb";
		} else if (zid == 6) {// 机票退票原因
			return "/crm/data-manage/policy-air-add-tp";
		} else if (zid == 2) {// 酒店所在城市分类
			return "/crm/policy/city-rank-add";
		} else {
			return null;
		}
	}

	@RequestMapping("/save")
	@ResponseBody
	public AuvgoResult save(DataZidianValue zidianValue, Model model) {
		try {
			if (null == zidianValue
					|| StringUtils.isBlank(zidianValue.getName())
			// || StringUtils.isBlank(zidianValue.getValue())
			// || null == zidianValue.getSort()
			) {

				return AuvgoResult.build(300, "请您正确输入！");
			}

			zidianKeyService.saveOrUpdateValue(zidianValue);
			DataZidianKey dataZidianKey = zidianKeyService.getById(zidianValue
					.getZidianid());
			return AuvgoResult.build(200, "保存成功", dataZidianKey.getName());
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "保存失败");

	}

	@RequestMapping("/remove/{vid}")
	@ResponseBody
	public AuvgoResult delete(@PathVariable("vid") Long vid) {
		try {
			zidianKeyService.deletezidianValueById(vid);
			return AuvgoResult.ok();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(300, "删除失败!!");
	}

	/**
	 * 跳转到企业设置城市的页面 把企业已经设置的城市带到页面
	 * 
	 * @param cid
	 * @param model
	 * @return
	 */
	@RequestMapping("/design/citylevel/{bandId}/{name}/{flag}")
	public String designCityLevel(@PathVariable("bandId") Long bandId,
			@PathVariable("name") String name,@PathVariable("flag") String flag, Model model) {
		CrmPolicyHotelCity hotelCity = new CrmPolicyHotelCity();
		CrmCompany company = getCompany();
		if (null == company) {
			setAttr("msg", "请您重新登录！");
			return "redirect:/login";
		}
		Long cid = company.getId();
		hotelCity.setCompanyid(cid);
		hotelCity.setHotelid(bandId);
		model.addAttribute("bandId", bandId);
		List<CrmPolicyHotelCity> list = policyHotelCityService
				.findListBy(hotelCity);
		if (null != list && list.size() > 0) {
			List<HotelGeoCity> pidList = Lists.newArrayList();
			for (CrmPolicyHotelCity Hotelcity : list) {
				HotelGeoCity allcity = new HotelGeoCity();
				allcity.setCityCode(Hotelcity.getCityid());
				allcity.setCityName(Hotelcity.getCityName());
				pidList.add(allcity);
			}
			model.addAttribute("citychooseList", pidList);
		}
		model.addAttribute("name", name);
		if(flag.equals("data"))
			return "/crm/data-manage/set-cityrank";
		return "/crm/policy/set-city";
	}

	// 查询省份下面的城市
	@RequestMapping("/getCityList/{proId}/{bandId}")
	@ResponseBody
	public AuvgoResult getCity(@PathVariable("proId") String proId,
			@PathVariable("bandId") Long bandId) {
		CrmCompany company = getCompany();
		if (null == company) {
			return AuvgoResult.build(300, "请您重新登录!");
		}
		Long cid = company.getId();
		List<HotelGeoCity> alllist = dataSearchService.getAllCity(proId);

		Map<String, String> maps = Maps.newHashMap();
		// 过滤掉已经勾选的城市
		// 查询出该公司已经包含的带城市等级的
		CrmPolicyHotelCity hotelCity = new CrmPolicyHotelCity();
		hotelCity.setCompanyid(cid);
		hotelCity.setHotelid(bandId);
		List<CrmPolicyHotelCity> list = policyHotelCityService
				.findListBy(hotelCity);
		if (null != list && list.size() > 0) {
			List<HotelGeoCity> cityList = Lists.newArrayList();// 保存已经选中的城市
			for (CrmPolicyHotelCity Hotelcity : list) {
				HotelGeoCity allcity = new HotelGeoCity();
				allcity.setCityCode((Hotelcity.getCityid()));
				allcity.setCityName(Hotelcity.getCityName());
				cityList.add(allcity);
			}

			List<HotelGeoCity> newCityList = getChoseCity(cid, alllist);
			/*
			 * List<HotelGeoCity> newCityList = Lists.newArrayList();//未勾选的 //
			 * 进行包含过滤,删选出未勾选的城市 for (HotelGeoCity dataAllcity : alllist) { if
			 * (!exsistCityIds.contains(Long.valueOf(dataAllcity.getId()))) {
			 * newCityList.add(dataAllcity); } }
			 */
			maps.put("oldcity", JsonUtils.objectToJson(cityList));// 已经选中的城市
			maps.put("newcity", JsonUtils.objectToJson(newCityList));
		} else {
			List<HotelGeoCity> cityList = Lists.newArrayList();
			List<HotelGeoCity> choseCity = getChoseCity(cid, alllist);
			maps.put("oldcity", JsonUtils.objectToJson(cityList));
			maps.put("newcity", JsonUtils.objectToJson(choseCity));
		}
		return AuvgoResult.ok(maps);
	}

	public List<HotelGeoCity> getChoseCity(Long cid, List<HotelGeoCity> alllist) {

		Set<String> exsistCityIds = Sets.newHashSet();// 已选中的城市id
		// 查询所有酒店
		CrmPolicyHotelCity AllhotelCity = new CrmPolicyHotelCity();
		AllhotelCity.setCompanyid(cid);
		List<CrmPolicyHotelCity> AllList = policyHotelCityService
				.findListBy(AllhotelCity);

		List<HotelGeoCity> newCityList = Lists.newArrayList();// 未勾选的
		for (CrmPolicyHotelCity crmPolicyHotelCity : AllList) {
			HotelGeoCity geo = new HotelGeoCity();
			geo.setCityCode((crmPolicyHotelCity.getCityid()));
			geo.setCityName(crmPolicyHotelCity.getCityName());
			exsistCityIds.add(crmPolicyHotelCity.getCityid());
		}
		// 进行包含过滤,删选出未勾选的城市
		for (HotelGeoCity dataAllcity : alllist) {
			if (!exsistCityIds.contains(dataAllcity.getCityCode())) {
				newCityList.add(dataAllcity);
			}
		}
		return newCityList;
	}

	@RequestMapping("/seachCityList/{cname}/{bandId}")
	@ResponseBody
	public AuvgoResult searchCity(@PathVariable("cname") String cname,
			@PathVariable("bandId") Long bandId) {
		CrmPolicyHotelCity hotelCity = new CrmPolicyHotelCity();
		CrmCompany company = getCompany();
		if (null == company) {
			return AuvgoResult.build(300, "请您重新登录!");
		}
		Long cid = company.getId();
		hotelCity.setCompanyid(cid);
		hotelCity.setHotelid(bandId);
		List<CrmPolicyHotelCity> list = policyHotelCityService
				.findListBy(hotelCity);
		List<HotelGeoCity> cityByName = dataSearchService.getCityByName(cname);
		Set<String> chooseCityid = Sets.newHashSet();
		for (HotelGeoCity hotelGeoCity : cityByName) {
			chooseCityid.add(hotelGeoCity.getCityCode());
		}

		if (null != list && list.size() > 0 && null != cityByName) {
			for (int i = 0; i < list.size(); i++) {
				if (chooseCityid.contains(list.get(i).getCityid())) {
					for (int y = 0; y < cityByName.size(); y++) {
						if (cityByName.get(y).getCityCode()
								.equals(list.get(i).getCityid())) {
							cityByName.remove(cityByName.get(y));
						}
					}
				}
			}
		}

		return AuvgoResult.ok(JsonUtils.objectToJson(cityByName));
	}

	@RequestMapping("/saveCityList")
	@ResponseBody
	public AuvgoResult saveCity(Long levelid, String cityid) throws Exception {
		CrmCompany company = getCompany();
		if (null == company) {
			return AuvgoResult.build(300, "请您重新登录!");
		}
		Long cid = company.getId();
		String[] cityids = StringUtils.removeEnd(cityid, "-").split("-");
		List<CrmPolicyHotelCity> list = Lists.newArrayList();
		List<HotelGeoCity> cityList = dataSearchService
				.getCityListByCityCode(cityids);
		for (HotelGeoCity city : cityList) {
			CrmPolicyHotelCity hotel = new CrmPolicyHotelCity();
			hotel.setCityid(city.getCityCode());
			hotel.setCityName(city.getCityName());
			hotel.setCompanyid(cid);
			hotel.setHotelid(levelid);
			list.add(hotel);
		}
		policyHotelCityService.saveListCitiy(cid, levelid, list);
		return AuvgoResult.ok("保存成功");

	}

}
