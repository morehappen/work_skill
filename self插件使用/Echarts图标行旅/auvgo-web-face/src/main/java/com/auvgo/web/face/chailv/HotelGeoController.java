package com.auvgo.web.face.chailv;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.auvgo.core.entity.ProConf;
import com.auvgo.core.string.StringUtils;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.JsonMapper;
import com.auvgo.crm.api.CrmProductSetService;
import com.auvgo.crm.entity.CrmCompany;
import com.auvgo.crm.entity.CrmProductSet;
import com.auvgo.hotel.api.ws.inside.IAuvgoHotelGeoTierAutoWSService;
import com.auvgo.hotel.api.ws.inside.IAuvgoHotelGeoTierWSService;
import com.auvgo.hotel.api.ws.inside.IAuvgoHotelGeoWSService;
import com.auvgo.hotel.orm.bim.entity.Geo;
import com.auvgo.hotel.orm.bim.entity.GeoTierAuto;
import com.auvgo.web.face.BaseController;
import com.fasterxml.jackson.databind.JavaType;

/**
 * 酒店城市
 * 
 * @author liucongcong
 *
 */
@Controller
@RequestMapping("/chailv/hotel/geo")
public class HotelGeoController extends BaseController {
	private static final Logger LOG = LogManager.getLogger(HotelGeoController.class);
	private static JsonMapper json = JsonMapper.nonNullMapper();

	private IAuvgoHotelGeoWSService auvgoHotelGeoWSService;
	private IAuvgoHotelGeoTierWSService auvgoHotelGeoTierWSService;
	private IAuvgoHotelGeoTierAutoWSService auvgoHotelGeoTierAutoWSService;
	private CrmProductSetService productSetService;

	/**
	 * 客户酒店城市
	 * 
	 * @return
	 */
	@RequestMapping("/list")
	public ModelAndView list() {
		Map<String, Object> map = new HashMap<String, Object>();
		CrmCompany company = getCompany();
		map.put("cid", company.getId());
		String viewUrl = "/crm/policy/hotel-geo-tier";// 页面路径
		try {
			// 公司产品设置
			CrmProductSet productSet = productSetService.getByCid(company.getId());
			String cityLiveType = "1";// 1系统默认，2客户自定义
			if (productSet != null && StringUtils.isNotBlank(productSet.getProconfvalue())) {
				JavaType javaType = json.contructCollectionType(List.class, ProConf.class);
				List<ProConf> proConf = json.fromJson(productSet.getProconfvalue(), javaType);
				if (proConf != null && !proConf.isEmpty()) {
					for (ProConf p : proConf) {
						if ("citylevel".equals(p.getName())) {
							cityLiveType = p.getValue();
						}
					}
				}
			}
			if ("2".equals(cityLiveType)) {
				viewUrl = "/crm/policy/hotel_geo_tier_auto";// 页面路径
				List<GeoTierAuto> list = auvgoHotelGeoTierAutoWSService.findByCusno(company.getBianhao());
				map.put("model", list);
			} else {
				String tree = auvgoHotelGeoWSService.findCustomTier(company.getBianhao());
				map.put("tree", tree);
			}
		} catch (Exception e) {
			LOG.error("list is fail", e);
		}
		return new ModelAndView(viewUrl, map);
	}

	/**
	 * 修改客户自定义城市级别
	 * 
	 * @param module
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/update/{module}", method = RequestMethod.POST)
	public @ResponseBody AuvgoResult update(@PathVariable("module") String module, HttpServletRequest request) {
		try {
			CrmCompany company = getCompany();
			if ("parent".equals(module)) {
				String geoId = request.getParameter("geoId");
				String parent = request.getParameter("parent");
				auvgoHotelGeoTierWSService.update(geoId, Integer.valueOf(parent), company.getBianhao());
			} else {
				String level = request.getParameter("level");
				String name = request.getParameter("name");
				auvgoHotelGeoTierWSService.updateAlias(name, Integer.valueOf(level), company.getBianhao());
			}
		} catch (Exception e) {
			LOG.error("update is fail", e);
			return AuvgoResult.build(300, "修改失败");
		}
		return AuvgoResult.ok();
	}

	/**
	 * 保存、添加客户自定义城市级别
	 * 
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/reset", method = RequestMethod.POST)
	public @ResponseBody AuvgoResult reset(HttpServletRequest request) {
		try {
			CrmCompany company = getCompany();
			auvgoHotelGeoTierWSService.reset(company.getBianhao());
		} catch (Exception e) {
			LOG.error("reset is fail", e);
			return AuvgoResult.build(300, "修改失败");
		}
		return AuvgoResult.ok();
	}

	// =============== 自定义城市级别
	/**
	 * 新增或修改城市级别
	 * 
	 * @param customerNo
	 *            客户编号
	 * @param id
	 *            主键id
	 * @return
	 */
	@RequestMapping("/input/geotierauto/{id}")
	public ModelAndView inputGeoTierAuto(@PathVariable("id") Long id) {
		Map<String, Object> map = new HashMap<String, Object>();
		CrmCompany company = getCompany();
		map.put("customerNo", company.getBianhao());
		try {
			GeoTierAuto geoTierAuto = null;
			if (id != null && id != 0) {
				geoTierAuto = auvgoHotelGeoTierAutoWSService.findByPk(id);
			}
			map.put("model", geoTierAuto);
		} catch (Exception e) {
			LOG.error("inputGeoTierAuto fail", e);
		}
		return new ModelAndView("/crm/policy/hotel_geo_tier_auto_input", map);
	}

	/**
	 * 保存和修改城市级别
	 * 
	 * @param geoTierAuto
	 * @return
	 */
	@RequestMapping(value = "/save/update/geotierauto", method = RequestMethod.POST)
	public @ResponseBody AuvgoResult saveOrUpdateGeoTierAuto(GeoTierAuto geoTierAuto) {
		AuvgoResult result = null;
		try {
			String customerNo = geoTierAuto.getCustomerNo();
			if (StringUtils.isBlank(customerNo)) {
				return AuvgoResult.build(300, "客户编号为空");
			}
			if (geoTierAuto.getId() == null) {
				if (geoTierAutoExist(geoTierAuto.getLevel(), customerNo)) {
					return AuvgoResult.build(300, "当前城市级别已经存在");
				} else {
					// 新增
					auvgoHotelGeoTierAutoWSService.save(geoTierAuto);
				}
			} else {
				GeoTierAuto tierAuto = auvgoHotelGeoTierAutoWSService.findByPk(geoTierAuto.getId());
				if (null != geoTierAuto.getLevel() && !geoTierAuto.getLevel().equals(tierAuto.getLevel())) {
					if (geoTierAutoExist(geoTierAuto.getLevel(), customerNo)) {
						return AuvgoResult.build(300, "当前城市级别已经存在");
					} else {
						// 修改城市级别
						auvgoHotelGeoTierAutoWSService.updateLevel(tierAuto.getLevel(), geoTierAuto.getLevel(), customerNo);
					}
				}
				if (StringUtils.isNotBlank(geoTierAuto.getAlias()) && !geoTierAuto.getAlias().equals(tierAuto.getAlias())) {
					// 修改城市级别名称
					auvgoHotelGeoTierAutoWSService.updateLevelName(tierAuto.getLevel(), geoTierAuto.getAlias(), customerNo);
				}
			}
			result = AuvgoResult.ok();
		} catch (Exception e) {
			LOG.error("saveOrUpdateGeoTierAuto fail", e);
			result = AuvgoResult.build(300, e.getMessage());
		}
		return result;
	}

	// 判断当前级别是否存在 true-存在 false-不存在
	public boolean geoTierAutoExist(Integer level, String customerNo) throws Exception {
		GeoTierAuto g = new GeoTierAuto();
		g.setLevel(level);
		g.setCustomerNo(customerNo);
		List<GeoTierAuto> list = auvgoHotelGeoTierAutoWSService.findBy(g);
		if (list != null && !list.isEmpty()) {
			return true;
		}
		return false;
	}

	/**
	 * 删除城市级别
	 * 
	 * @param customerNo
	 *            客户编号
	 * @param level
	 *            城市级别
	 * @return
	 */
	@RequestMapping(value = "/delete/geotierauto/{level}", method = RequestMethod.POST)
	public @ResponseBody AuvgoResult deleteGeoTierAuto(@PathVariable("level") Integer level) {
		AuvgoResult result = null;
		try {
			CrmCompany company = getCompany();
			boolean remove = auvgoHotelGeoTierAutoWSService.removeByLevel(level, company.getBianhao());
			if (remove) {
				result = AuvgoResult.build(300, "删除失败");
			} else {
				result = AuvgoResult.ok();
			}
		} catch (Exception e) {
			LOG.error("deleteGeoTierAuto fail", e);
			result = AuvgoResult.build(300, e.getMessage());
		}
		return result;
	}

	/**
	 * 查询城市数据
	 * 
	 * @param customerNo
	 * @param level
	 * @return
	 */
	@RequestMapping(value = "/city/list/{level}")
	public ModelAndView cityList(@PathVariable("level") Integer level) {
		Map<String, Object> map = new HashMap<String, Object>();
		CrmCompany company = getCompany();
		map.put("level", level);
		map.put("customerNo", company.getBianhao());
		try {
			GeoTierAuto gta = new GeoTierAuto();
			gta.setLevel(level);
			gta.setCustomerNo(company.getBianhao());
			// 当前已经选中的城市
			List<GeoTierAuto> gtaList = auvgoHotelGeoTierAutoWSService.findBy(gta);
			map.put("model", gtaList.get(0));
			List<String> selCityCode = null;
			// 已经选中的城市
			StringBuffer cityCodes = new StringBuffer();
			if (gtaList != null && !gtaList.isEmpty()) {
				selCityCode = new ArrayList<String>(gtaList.size());
				for (GeoTierAuto g : gtaList) {
					if (StringUtils.isNotBlank(g.getCityCode())) {
						selCityCode.add(g.getCityCode());
						if (cityCodes.length() > 0) {
							cityCodes.append("/");
						}
						cityCodes.append(g.getCityCode());
					}
				}
			}
			String geoJson = auvgoHotelGeoTierAutoWSService.findProvinceGeo(level, company.getBianhao(), selCityCode);
			map.put("geoJson", geoJson);
			map.put("cityCodes", cityCodes.toString());
		} catch (Exception e) {
			LOG.error("cityList fail", e);
		}
		return new ModelAndView("/crm/policy/hotel_geo_tier_auto_city", map);
	}

	/**
	 * 保存选中的城市
	 * 
	 * @param level
	 *            已经选中的城市级别
	 * @param customerNo
	 *            客户编号
	 * @param cityCodes
	 *            已经选中的城市code 多个用/号分隔
	 * @param alias
	 *            级别名称
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/save/city")
	public @ResponseBody AuvgoResult saveCity(String customerNo, Integer level, String cityCodes, String alias) {
		AuvgoResult result = null;
		try {
			List<Geo> geos = auvgoHotelGeoWSService.findByTierAuto(customerNo, level, cityCodes);
			if (geos != null && !geos.isEmpty()) {
				StringBuffer msg = new StringBuffer();
				for (Geo geo : geos) {
					if (msg.length() > 0) {
						msg.append("，");
					}
					msg.append(geo.getNameCn());
				}
				result = AuvgoResult.build(300, msg.toString() + "已经维护");
			} else {
				String saveResult = auvgoHotelGeoTierAutoWSService.saveGeoTierAuto(level, customerNo, cityCodes, alias);
				if ("SUCCESS".equals(saveResult)) {
					result = AuvgoResult.ok();
				} else {
					result = AuvgoResult.build(300, saveResult);
				}
			}
		} catch (Exception e) {
			LOG.error("saveCity fail", e);
			result = AuvgoResult.build(300, e.getMessage());
		}
		return result;
	}

	@Autowired(required = false)
	public void setAuvgoHotelGeoWSService(IAuvgoHotelGeoWSService auvgoHotelGeoWSService) {
		this.auvgoHotelGeoWSService = auvgoHotelGeoWSService;
	}

	@Autowired(required = false)
	public void setAuvgoHotelGeoTierWSService(IAuvgoHotelGeoTierWSService auvgoHotelGeoTierWSService) {
		this.auvgoHotelGeoTierWSService = auvgoHotelGeoTierWSService;
	}

	@Autowired(required = false)
	public void setAuvgoHotelGeoTierAutoWSService(IAuvgoHotelGeoTierAutoWSService auvgoHotelGeoTierAutoWSService) {
		this.auvgoHotelGeoTierAutoWSService = auvgoHotelGeoTierAutoWSService;
	}

	@Autowired(required = false)
	public void setProductSetService(CrmProductSetService productSetService) {
		this.productSetService = productSetService;
	}

}
