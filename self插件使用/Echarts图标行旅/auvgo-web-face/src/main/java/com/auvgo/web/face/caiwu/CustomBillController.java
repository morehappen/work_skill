package com.auvgo.web.face.caiwu;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.auvgo.caiwu.contant.CaiwuCommonContant;
import com.auvgo.caiwu.dto.CaiwuFields;
import com.auvgo.caiwu.entity.CaiwuLocalAllRecode;
import com.auvgo.caiwu.query.LocalAllRecodeQuery;
import com.auvgo.common.page.Page;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.finance.api.provider.ICaiwuCustomBillProvider;
import com.auvgo.finance.api.provider.ICaiwuLocalAllRecodeProvider;
import com.google.common.collect.Lists;

@Controller
@RequestMapping("/caiwu/bill")
public class CustomBillController extends CaiwuBaseController {
	@Autowired
	ICaiwuLocalAllRecodeProvider caiwuLocalAllRecodeProvider;
	@Autowired
	ICaiwuCustomBillProvider caiwuCustomBillProvider;

	@RequestMapping("/total")
	public String total(LocalAllRecodeQuery query) {
		try {
			// 默认查询一年
			query.setStartDate(new DateTime().withMonthOfYear(1).withDayOfYear(1).toString("yyyy-MM-dd"));
			query.setEndDate(new DateTime().toString("yyyy-MM-dd"));
			query.setQueryType("chupiao");
			query.setDateType("M");
			query.setCompanyCode(getCompany().getBianhao());
			Map<String, Object> resultMap = caiwuCustomBillProvider.getCustomerTotalForFinanceHome(query);
			setAttr("result", resultMap);
			setAttr("query", query);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "/caiwu/bill/bill-total-list";
	}

	/**
	 * 流水订单列表
	 * 
	 * @param pageNum
	 * @param pageSize
	 * @param recode
	 * @return
	 */
	@RequestMapping("/list")
	public String list(@RequestParam(defaultValue = "1") Integer pageNum, @RequestParam(defaultValue = "30") Integer pageSize, LocalAllRecodeQuery recode) {
		Page<CaiwuLocalAllRecode> page = new Page<>(pageNum, pageSize);
		try {
			recode.setCompanyCode(getCompany().getBianhao());
			if (StringUtils.isBlank(recode.getStartDate())) {
				recode.setStartDate(new DateTime().minusMonths(1).toString("yyyy-MM-dd"));
			}
			if (StringUtils.isBlank(recode.getEndDate())) {
				recode.setEndDate(new DateTime().toString("yyyy-MM-dd"));
			}
			recode.setQueryType("chupiao");
			page = caiwuLocalAllRecodeProvider.findPage(page, recode);
			setAttr("page", page);
			setAttr("caiwuCommonContant", new CaiwuCommonContant());
			setAttr("recode", recode);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "/caiwu/bill/bill-liushui-list";
	}

	@RequestMapping("/check")
	@ResponseBody
	public AuvgoResult check(String khcheckids) {
		if (StringUtils.isBlank(khcheckids)) {
			return AuvgoResult.build(300, "请选择需要进行核对的账单");
		}
		String[] busid = StringUtils.removeEnd(khcheckids, "-").split("-");
		if (null == busid || busid.length == 0) {
			return AuvgoResult.build(300, "请选择需要进行核对的账单");
		}
		try {
			List<Long> idList = Lists.newArrayList();
			for (String s : busid) {
				idList.add(Long.parseLong(s));
			}
			caiwuLocalAllRecodeProvider.batchUpdateCustomCheckStatus(idList, CaiwuCommonContant.CW_CHECK_STATUS_SUCCESS);
			return AuvgoResult.build(200, "提交成功");
		} catch (Exception e) {
			log.error("客户提交核对异常{}", e);
			return AuvgoResult.build(500, "提交出现异常，请联系系统管理员");
		}
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	@RequestMapping("/download/{type}")
	public ResponseEntity download(LocalAllRecodeQuery local, @PathVariable("type") String type, HttpServletRequest request) {
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
		try {
			request.setCharacterEncoding("utf-8");
			if (StringUtils.isBlank(type)) {
				return new ResponseEntity(AuvgoResult.build(300, "非法操作"), HttpStatus.OK);
			}
			String filename = null;
			if (type.equalsIgnoreCase("daijie")) {
				local.setCkStatus(CaiwuCommonContant.CW_CHECK_STATUS_SUCCESS);
				filename = "账单明细";
			} else if (type.equalsIgnoreCase("qiankuan")) {
				local.setBalStatus(CaiwuCommonContant.CW_JIESUAN_STATUS_WAIT);
				filename = "欠款明细";
			} else if (type.equalsIgnoreCase("liushui")) {
				filename = "流水明细";
			} else if (type.equalsIgnoreCase("yijie")) {
				filename = "已结明细";
				local.setBalStatus(CaiwuCommonContant.CW_JIESUAN_STATUS_SUCCESS);
			}
			// 校验参数
			local.setCompanyCode(getCompany().getBianhao());
			String fileName = local.getStartDate() + "-" + local.getEndDate() + local.getCompanyCode() + filename + ".xls";
			headers.setContentDispositionFormData("attachment", new String(fileName.getBytes("utf-8"), "ISO8859-1"));
			List<CaiwuLocalAllRecode> dataList = caiwuLocalAllRecodeProvider.findBy(local);
			List<CaiwuFields> titleList = getCustomExportTitle(getCompany().getServerNo(), local.getCompanyCode());
			HSSFWorkbook wb = new HSSFWorkbook();
			ByteArrayOutputStream os = new ByteArrayOutputStream();
			buildWorkBook(wb, titleList, dataList);
			wb.write(os);
			byte[] content = os.toByteArray();
			return new ResponseEntity<byte[]>(content, headers, HttpStatus.CREATED);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

}
