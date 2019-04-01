package com.auvgo.web.face.caiwu;

import java.io.ByteArrayOutputStream;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.auvgo.caiwu.contant.CaiwuCommonContant;
import com.auvgo.caiwu.dto.CaiwuFields;
import com.auvgo.caiwu.entity.CaiwuJiesuan;
import com.auvgo.caiwu.entity.CaiwuLocalAllRecode;
import com.auvgo.caiwu.query.LocalAllRecodeQuery;
import com.auvgo.common.page.Page;
import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.finance.api.provider.ICaiwuJiesuanProvider;
import com.auvgo.finance.api.provider.ICaiwuLocalAllRecodeProvider;
import com.google.common.collect.Lists;

@Controller
@RequestMapping("/caiwu/jiesuan")
public class CaiwuJiesuanController extends CaiwuBaseController {
	@Autowired
	ICaiwuLocalAllRecodeProvider caiwuLocalAllRecodeProvider;
	@Autowired
	ICaiwuJiesuanProvider caiwuJiesuanProvider;

	/**
	 * 待结算列表 daijie 欠款列表qiankuan
	 * 
	 * @param pageNum
	 * @param pageSize
	 * @param recode
	 * @return
	 */
	@RequestMapping("/list/{type}")
	public String list(@RequestParam(defaultValue = "1") Integer pageNum, @RequestParam(defaultValue = "30") Integer pageSize, @PathVariable("type") String type,
			LocalAllRecodeQuery recode) {
		Page<CaiwuLocalAllRecode> page = new Page<>(pageNum, pageSize);
		try {
			if ("daijie".equalsIgnoreCase(type)) {
				recode.setCkStatus(CaiwuCommonContant.CW_CHECK_STATUS_SUCCESS);
				recode.setBalStatus(CaiwuCommonContant.CW_JIESUAN_STATUS_WAIT);
			} else {
				recode.setBalStatus(CaiwuCommonContant.CW_JIESUAN_STATUS_WAIT);
			}
			recode.setCompanyCode(getCompany().getBianhao());
			page = caiwuLocalAllRecodeProvider.findPage(page, recode);
			setAttr("page", page);
			setAttr("caiwuCommonContant", new CaiwuCommonContant());
			setAttr("recode", recode);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "/caiwu/bill/bill-daijiesuan-list";
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	@RequestMapping("/download/{jiesuanNo}")
	public ResponseEntity download(@PathVariable("jiesuanNo") String jiesuanNo, HttpServletRequest request) {
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
		try {
			request.setCharacterEncoding("utf-8");
			if (StringUtils.isBlank(jiesuanNo)) {
				return new ResponseEntity(AuvgoResult.build(300, "非法操作"), HttpStatus.OK);
			}
			String filename = "结算单明细";
			CaiwuJiesuan jiesuan = caiwuJiesuanProvider.findByJiesuanNo(jiesuanNo);
			// 校验参数
			String fileName = jiesuan.getCompanyCode() + jiesuanNo + filename + ".xls";
			headers.setContentDispositionFormData("attachment", new String(fileName.getBytes("utf-8"), "ISO8859-1"));
			List<Long> idsList = Lists.newArrayList();
			for (Long id : jiesuan.getJiesuanIdsSet()) {
				idsList.add(id);
			}
			List<CaiwuLocalAllRecode> dataList = caiwuLocalAllRecodeProvider.findByIds(idsList);
			List<CaiwuFields> titleList = getCustomExportTitle(getCompany().getServerNo(), jiesuan.getCompanyCode());
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
