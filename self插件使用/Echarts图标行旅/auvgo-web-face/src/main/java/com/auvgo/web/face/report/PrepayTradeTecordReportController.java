package com.auvgo.web.face.report;

import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.auvgo.business.report.PoiUtils;
import com.auvgo.business.report.PropertiesUtil;
import com.auvgo.constants.common.Business;
import com.auvgo.pay.api.IPrepayTradeRecordWSService;
import com.auvgo.pay.dto.req.PrepayTradeQueryReq;
import com.auvgo.pay.orm.order.entity.PrepayTradeRecord;
import com.auvgo.web.face.BaseController;

/**
 * 交易流水下载
 * 
 * @author liucongcong
 *
 */
@Controller
@RequestMapping("/report/trade/tecord")
public class PrepayTradeTecordReportController extends BaseController {

	private IPrepayTradeRecordWSService prepayTradeRecordWSService;

	@RequestMapping("/download")
	@ResponseBody
	public void download(HttpServletRequest request, HttpServletResponse response, PrepayTradeQueryReq model) {
		try {

			// 读取报表字段
			Properties resource = PropertiesUtil.loadProperties("report/prepaytopuptecord.properties");
			if (resource != null) {
				Set<Object> keySet = resource.keySet();
				// 标题
				Map<String, String> titleMap = new LinkedHashMap<String, String>();
				if (keySet != null && !keySet.isEmpty()) {
					for (Object keyObj : keySet) {
						String key = (String) keyObj;
						titleMap.put(key, resource.getProperty(key));
					}
					List<Map<String, Object>> dataSource = createDataSource(model);
					String filename = "预付款流水记录.xls";// 默认名字
					response.setContentType("octets/stream");
					response.addHeader("Content-Disposition", "attachment;filename=" + URLEncoder.encode(filename, "UTF-8"));
					OutputStream out = response.getOutputStream();
					PoiUtils.exportExcel("预付款流水记录", titleMap, dataSource, out, "yyyy-MM-dd HH:mm:ss");
				} else {
					log.error("读取预付款流水记录配置为空");
					response.setHeader("Content-type", "textml;charset=UTF-8");
					response.setCharacterEncoding("UTF-8");
					response.getWriter().write("读取预付款流水记录配置为空");
				}
			}
		} catch (Exception e) {
			log.error("download is fail", e);
			response.setHeader("Content-type", "textml;charset=UTF-8");
			response.setCharacterEncoding("UTF-8");
			try {
				response.getWriter().write(e.getMessage());
			} catch (IOException e1) {
				log.error("response is fail", e1);
			}
		}
	}

	/**
	 * 处理数据
	 * 
	 * @return
	 * @throws Exception
	 */
	private List<Map<String, Object>> createDataSource(PrepayTradeQueryReq model) throws Exception {
		List<PrepayTradeRecord> list = prepayTradeRecordWSService.findBySelModel(model);
		if (list != null && !list.isEmpty()) {
			// 组装报表数据
			List<Map<String, Object>> dataSource = new ArrayList<Map<String, Object>>();
			int i = 1;
			for (PrepayTradeRecord p : list) {
				Map<String, Object> mm = new HashMap<String, Object>();
				mm.put("serialNo", i);
				mm.put("tradeType", p.getTradeType());
				mm.put("tradeAmount", p.getTradeAmount());
				mm.put("surplusAmount", p.getSurplusAmount());
				mm.put("remark", p.getRemark());
				mm.put("createTime", p.getCreateTime());
				String remark = p.getRemark();
				if (Business.air.toString().equals(p.getBusinessType())) {
					Map<String, String> remarkMap = analysisRemark(remark);
					mm.put("orderPNR", remarkMap.get("PNR")); // PNR
					mm.put("orderTicketNo", remarkMap.get("ticketNo")); // 票号
					mm.put("orderTravel", remarkMap.get("route")); // 行程
				}
				dataSource.add(mm);
				i++;
			}
			return dataSource;
		} else {
			throw new Exception("查询数据为空");
		}
	}

	// 解析备注
	private Map<String, String> analysisRemark(String remark) {
		Map<String, String> map = new HashMap<String, String>();
		if (StringUtils.isNotBlank(remark)) {
			String[] keyValue = remark.split("，");
			if (keyValue != null && keyValue.length > 0) {
				for (String s : keyValue) {
					String[] kv = s.split("：");
					if (kv != null && kv.length == 2) {
						String v = kv[1];
						if ("出行人".equals(kv[0])) {
							String[] ps = v.split("、");
							if (ps != null && ps.length > 0) {
								StringBuffer ticketNos = new StringBuffer();
								for (String p : ps) {
									String[] pv = p.split("-");
									if (pv != null && pv.length == 2) {
										if (ticketNos.length() > 0) {
											ticketNos.append(" / ");
										}
										ticketNos.append(pv[1]);
									}
								}
								map.put("ticketNo", ticketNos.toString());
							}
						} else {
							map.put(transitionRemakKey(kv[0]), v);
						}
					}
				}
			}
		}
		return map;
	}

	// 转换key
	private String transitionRemakKey(String name) {
		String keyName = "";
		if (StringUtils.isNotBlank(name)) {
			switch (name) {
			case "PNR":
				keyName = "PNR";
				break;
			case "航班号":
				keyName = "flightNo";
				break;
			case "行程":
				keyName = "route";
				break;
			case "出行人":
				keyName = "passenger";
				break;
			default:
				keyName = name;
				break;
			}
		}
		return keyName;
	}

	@Autowired(required = false)
	public void setPrepayTradeRecordWSService(IPrepayTradeRecordWSService prepayTradeRecordWSService) {
		this.prepayTradeRecordWSService = prepayTradeRecordWSService;
	}

}
