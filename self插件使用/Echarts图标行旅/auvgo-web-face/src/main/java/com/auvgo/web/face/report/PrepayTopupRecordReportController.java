package com.auvgo.web.face.report;

import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ResourceBundle;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.auvgo.business.report.PoiUtils;
import com.auvgo.pay.api.IPrepayTopupRecordWSService;
import com.auvgo.pay.dto.req.PrepayRechargeQueryReq;
import com.auvgo.pay.orm.order.entity.PrepayTopupRecord;
import com.auvgo.web.face.BaseController;

/**
 * 预付款充值记录下载
 * 
 * @author liucongcong
 *
 */
@Controller
@RequestMapping("/report/topup/tecord")
public class PrepayTopupRecordReportController extends BaseController {

	private IPrepayTopupRecordWSService prepayTopupRecordWSService;

	@RequestMapping("/download")
	@ResponseBody
	public void download(HttpServletRequest request, HttpServletResponse response, PrepayRechargeQueryReq model) {
		try {
			// 读取报表字段
			ResourceBundle resource = ResourceBundle.getBundle("report/prepaytopuptecord");
			if (resource != null) {
				Enumeration<String> keys = resource.getKeys();
				Map<String, String> titleMap = new HashMap<String, String>();
				while (keys.hasMoreElements()) {
					String key = keys.nextElement();
					titleMap.put(key, new String(resource.getString(key).getBytes("ISO-8859-1"), "UTF-8"));
				}
				List<String> columnSet = new ArrayList<String>();
				columnSet.add("serialNo");
				columnSet.add("tradeType");
				columnSet.add("tradeAmount");
				columnSet.add("surplusAmount");
				columnSet.add("remark");
				columnSet.add("createTime");
				model.setCustomerNo(getCompany().getBianhao());
				List<Map<String, Object>> dataSource = createDataSource(model);
				String filename = "预付款充值记录.xls";// 默认名字
				response.setContentType("octets/stream");
				response.addHeader("Content-Disposition", "attachment;filename=" + URLEncoder.encode(filename, "UTF-8"));
				OutputStream out = response.getOutputStream();
				PoiUtils.exportExcel("预付款充值记录", columnSet, titleMap, dataSource, out, "yyyy-MM-dd HH:mm:ss");
			} else {
				log.error("读取预付款充值记录配置失败");
				response.setHeader("Content-type", "textml;charset=UTF-8");
				response.setCharacterEncoding("UTF-8");
				response.getWriter().write("读取预付款充值记录配置失败");
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
	private List<Map<String, Object>> createDataSource(PrepayRechargeQueryReq model) throws Exception {
		List<PrepayTopupRecord> list = prepayTopupRecordWSService.findBySelModel(model);
		if (list != null && !list.isEmpty()) {
			// 组装报表数据
			List<Map<String, Object>> dataSource = new ArrayList<Map<String, Object>>();
			int i = 1;
			for (PrepayTopupRecord p : list) {
				Map<String, Object> mm = new HashMap<String, Object>();
				mm.put("serialNo", i);
				mm.put("tradeType", p.getTradeType());
				mm.put("tradeAmount", p.getTradeAmount());
				mm.put("surplusAmount", p.getSurplusAmount());
				mm.put("remark", p.getRemark());
				mm.put("createTime", p.getCreateTime());
				dataSource.add(mm);
				i++;
			}
			return dataSource;
		} else {
			throw new Exception("查询数据为空");
		}
	}

	@Autowired(required = false)
	public void setPrepayTopupRecordWSService(IPrepayTopupRecordWSService prepayTopupRecordWSService) {
		this.prepayTopupRecordWSService = prepayTopupRecordWSService;
	}
}
