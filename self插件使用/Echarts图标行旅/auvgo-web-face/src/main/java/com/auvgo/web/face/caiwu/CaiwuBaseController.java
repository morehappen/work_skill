package com.auvgo.web.face.caiwu;

import java.util.Date;
import java.util.List;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.CellType;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;

import com.auvgo.caiwu.dto.CaiwuFields;
import com.auvgo.caiwu.entity.CaiwuExportTemplate;
import com.auvgo.caiwu.entity.CaiwuLocalAllRecode;
import com.auvgo.core.utils.JsonUtils;
import com.auvgo.finance.api.provider.ICaiwuExportTemplateProvider;
import com.auvgo.web.face.BaseController;
import com.auvgo.web.util.ExcelUtils;
import com.google.common.collect.Lists;

public abstract class CaiwuBaseController extends BaseController {
	@Autowired
	ICaiwuExportTemplateProvider caiwuExportTemplateProvider;

	protected void buildWorkBook(HSSFWorkbook wb, List<CaiwuFields> titleList, List<CaiwuLocalAllRecode> list) {
		HSSFSheet sheet = wb.createSheet("sheet1");
		HSSFCellStyle titleTopStyle = ExcelUtils.getColumnTopStyle(wb);// 获取列头样式对象
		HSSFCellStyle cellStyle = ExcelUtils.getCellStyle(wb); // 单元格样式对象
		HSSFRow row = sheet.createRow(0);
		try {
			HSSFCell cell0 = row.createCell(0);
			cell0.setCellValue("序号");// 设置内容
			cell0.setCellStyle(titleTopStyle);
			// 设置标题
			int index = 1;
			for (CaiwuFields t : titleList) {
				HSSFCell cell = row.createCell(index);
				cell.setCellValue(t.getValue());// 设置内容
				cell.setCellStyle(titleTopStyle);
				titleTopStyle.setWrapText(true);
				sheet.setColumnWidth(index, (t.getValue().getBytes().length + 1) * 256);
				index++;
			}
			// 设置数据内容
			int down = 1;
			if (null != list && list.size() > 0) {
				for (CaiwuLocalAllRecode re : list) {
					HSSFRow row1 = sheet.createRow((int) down);
					HSSFCell cell_0 = row1.createCell(0);
					cell_0.setCellValue(down);
					cell_0.setCellStyle(cellStyle);
					int col = 1;
					for (CaiwuFields t : titleList) {
						Object value = ExcelUtils.invokeGet(re, t.getName());
						HSSFCell cell = row1.createCell(col);
						cell.setCellStyle(cellStyle);
						String returnType = ExcelUtils.getGetMethod(re.getClass(), t.getName()).getReturnType().getSimpleName();
						if ("Date".equalsIgnoreCase(returnType)) {
							Date valueDate = (Date) value;
							cell.setCellValue(new DateTime(valueDate).toString("yyyy-MM-dd HH:mm:ss"));
							cell.setCellType(CellType.STRING);
						} else if (Lists.newArrayList("BigDecimal", "Double", "Integer", "Long").contains(returnType)) {
							cell.setCellValue(Double.parseDouble(null == value ? "0" : value.toString()));
							cell.setCellType(CellType.NUMERIC);
						} else {
							cell.setCellValue(null == value ? "" : value.toString());
							cell.setCellType(CellType.STRING);
						}
						col++;
					}
					down++;
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	protected List<CaiwuFields> getCustomExportTitle(String serverNo, String companyCode) {
		try {
			CaiwuExportTemplate temp = new CaiwuExportTemplate();
			temp.setCompanyCode(companyCode);
			if ("FXS_ADMIN".equalsIgnoreCase(serverNo)) {
				temp = caiwuExportTemplateProvider.getCommonDefaultTemplate("fenxiao_temp");
			} else {
				List<CaiwuExportTemplate> result = caiwuExportTemplateProvider.findBy(temp);
				if (null == result || result.size() == 0) {
					temp = caiwuExportTemplateProvider.getCommonDefaultTemplate("custom_temp");
				} else {
					temp = result.get(0);
				}
			}
			if (null != temp) {
				return JsonUtils.jsonToListIgno(temp.getTemFields(), CaiwuFields.class);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
}
