package com.auvgo.web.face.order;

import com.auvgo.air.api.AirOrderService;
import com.auvgo.core.contant.AirStatusContant;
import com.auvgo.core.contant.AuvStatusContant;
import com.auvgo.core.contant.BaseStatusContant;
import com.auvgo.core.query.QueryFilter;
import com.auvgo.web.face.BaseController;
import com.github.pagehelper.PageInfo;
import com.google.common.collect.Maps;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;


@Controller
@RequestMapping("/myChailv/airOrder")
public class AirOrderQueryController extends BaseController {
	@Autowired
	private AirOrderService airOrderService;

	@RequestMapping("/query")
	public String toPage(@RequestParam(defaultValue = "1") Integer pageNum, Integer pageSize, HttpServletRequest request) {

		QueryFilter filter = new QueryFilter();
		Map<String, Object> maps = Maps.newConcurrentMap();
		if (!isParentCompany()) {
			maps.put("server_no", getCompany().getServerNo());
		}
		PageInfo<Map<String, Object>> page = airOrderService.findPageBy(pageNum, 10, filter.buildSql(request),maps);

		List<Map<String, Object>> list = page.getList();
		Map<String, String> bzMap = Maps.newHashMap();
		for (Map<String, Object> map : list) {
			String orderno = map.get("orderno").toString();
			Integer s = airOrderService.getRemarkListByOrderno(orderno);
			if (s > 0) {
				bzMap.put(orderno, "1");
			} else {
				bzMap.put(orderno, "0");
			}
		}
		setAttr("bzFlag", bzMap);
		setAttr("page", page);
		setAttr("statusUtil", new AuvStatusContant());
		setAttr("airUtils", new AirStatusContant());
		setAttr("airApprove", new BaseStatusContant());

		// 用于数据回显
		String dateType = (String) request.getParameter("dateType");
		if (!(null == dateType || "".equals(dateType))) {
			setAttr("dateType", dateType);
			if ("createtime".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_orders_createtime"));
				setAttr("LTE_date", getAttr("q_LTE_orders_createtime"));
			} else if ("deptdate".equals(dateType)) {
				setAttr("GTE_date", getAttr("q_GTE_routes_deptdate"));
				setAttr("LTE_date", getAttr("q_LTE_routes_deptdate"));
			}
		}
		return "/crm/my-chailv/air-order";
	}
}
