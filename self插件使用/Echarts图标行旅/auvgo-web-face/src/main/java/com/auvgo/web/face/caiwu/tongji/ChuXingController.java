package com.auvgo.web.face.caiwu.tongji;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import com.auvgo.caiwu.query.StatisCommonQuery;
import com.auvgo.core.utils.JsonUtils;
import com.auvgo.finance.api.provider.analysis.IChuXingAnalysisProvider;
import com.auvgo.web.face.BaseController;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

@Controller
@RequestMapping("/tongji")
public class ChuXingController extends BaseController {

	@Autowired
	IChuXingAnalysisProvider chuXingAnalysisProvider;

	/**
	 * 航空公司分析
	 * 
	 * @param query
	 * @return
	 */
	@RequestMapping("/aircompany")
	public String analysisAirCompany(StatisCommonQuery query) {
		try {
			query.setCompanycode(getCompany().getBianhao());
			query.setTop(null == query.getTop() ? 10 : query.getTop());
			List<Map<String, Object>> list = chuXingAnalysisProvider.airCompanyTongJi(query);
			setAttr("list", list);
			setAttr("query", query);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "/caiwu/tongji/analysis_aircompany";
	}

	/**
	 * 航班时刻分析
	 * 
	 * @param query
	 * @return
	 */
	@RequestMapping("/flighttime")
	public String analysisFlightTime(StatisCommonQuery query) {
		try {
			query.setCompanycode(getCompany().getBianhao());
			query.setTop(null == query.getTop() ? 10 : query.getTop());
			List<Map<String, Object>> list = chuXingAnalysisProvider.flightTimeTongji(query);
			setAttr("list", list);
			setAttr("query", query);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "/caiwu/tongji/analysis_airtime";
	}

	/**
	 * 火车时刻分析
	 * 
	 * @param query
	 * @return
	 */
	@RequestMapping("/traintime")
	public String analysisTrainTime(StatisCommonQuery query) {
		try {
			query.setCompanycode(getCompany().getBianhao());
			query.setTop(null == query.getTop() ? 10 : query.getTop());
			List<Map<String, Object>> list = chuXingAnalysisProvider.trainTimeTongji(query);
			setAttr("list", list);
			setAttr("query", query);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "/caiwu/tongji/analysis_traintime";
	}

	/**
	 * 热门酒店
	 * 
	 * @param query
	 * @return
	 */
	@RequestMapping("/hothotel")
	public String analysisHotHotel(StatisCommonQuery query) {
		return null;
	}

	/**
	 * 里程分析
	 * 
	 * @param query
	 * @return
	 */
	@RequestMapping("/mileage")
	public String analysisMileage(StatisCommonQuery query) {
		try {
			query.setCompanycode(getCompany().getBianhao());
			List<Map<String, Object>> result = chuXingAnalysisProvider.mileagePercentTongji(query);
			List<Map<String, Object>> alllist = chuXingAnalysisProvider.mileageTopByDeptTongji(query);
			query.setTop(10);
			List<Map<String, Object>> topEmpList = chuXingAnalysisProvider.mileageTopByEmpTongji(query);
			double totalMileage = 0d;
			for (Map<String, Object> re : alllist) {
				if (null != re.get("mileage")) {
					totalMileage += Double.parseDouble(re.get("mileage").toString());
				}
			}
			setAttr("totalMileage", totalMileage);
			setAttr("toplist", alllist.subList(0, alllist.size() < 5 ? alllist.size() : 5));
			Object[] title = new Object[result.size()];
			int i = 0;
			List<Map<String, Object>> barList = Lists.newArrayList();
			for (Map<String, Object> re : result) {
				title[i] = re.get("discgroup");
				Map<String, Object> map = Maps.newHashMap();
				map.put("name", re.get("discgroup"));
				map.put("value", re.get("num"));
				barList.add(map);
				i++;
			}
			System.out.println(JsonUtils.objectToJson(result));
			setAttr("title", JsonUtils.objectToJson(title, true));
			setAttr("data", JsonUtils.objectToJson(barList, true));
			setAttr("topEmpList", topEmpList);
			setAttr("query", query);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "/caiwu/tongji/analysis_mileage";
	}

	/**
	 * 目的地分析
	 * 
	 * @param query
	 * @return
	 */
	@RequestMapping("/destination/{type}")
	public String analysisMudidi(@PathVariable("type") String type, StatisCommonQuery query) {
		try {
			query.setCompanycode(getCompany().getBianhao());
			List<Map<String, Object>> list = chuXingAnalysisProvider.airMudidiTongji(query);
			if (null == list || list.size() == 0) {
				setAttr("toplist", JsonUtils.objectToJson(list.subList(0, list.size() > 10 ? list.size() : 10)));
			} else {
				setAttr("toplist",Lists.newArrayList());
			}
			setAttr("list", list);
			setAttr("query", query);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "/caiwu/tongji/analysis_destination";
	}

	/**
	 * 次数和时长
	 * 
	 * @param query
	 * @return
	 */
	@RequestMapping("/durationtime")
	public String analysisNumTimes(StatisCommonQuery query) {
		try {
			query.setCompanycode(getCompany().getBianhao());
			query.setTop(null == query.getTop() ? 10 : query.getTop());
			List<Map<String, Object>> list = chuXingAnalysisProvider.timesPricePerTongji(query);
			setAttr("list", list);
			setAttr("query", query);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "/caiwu/tongji/analysis_duration_time";
	}

}
