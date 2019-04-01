package com.auvgo.web.util;

import java.lang.reflect.Method;
import java.text.SimpleDateFormat;

import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFFont;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.VerticalAlignment;

/**
 * 
 * Excel 工具类
 */
public class ExcelUtils {
	/**
	 * 执行get方法
	 * 
	 * @param o
	 *            执行对象
	 * @param fieldName
	 *            属性
	 */
	public static Object invokeGet(Object o, String fieldName) {
		Method method = getGetMethod(o.getClass(), fieldName);
		try {
			return method.invoke(o, new Object[0]);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	/**
	 * java反射bean的get方法
	 * 
	 * @param objectClass
	 * @param fieldName
	 * @return
	 */
	public static Method getGetMethod(Class<?> objectClass, String fieldName) {
		StringBuffer sb = new StringBuffer();
		sb.append("get");
		sb.append(fieldName.substring(0, 1).toUpperCase());
		sb.append(fieldName.substring(1));
		try {
			return objectClass.getMethod(sb.toString());
		} catch (Exception e) {
		}
		return null;
	}

	/*
	 * 列头单元格样式
	 */
	public static HSSFCellStyle getColumnTopStyle(HSSFWorkbook workbook) {
		HSSFFont font = workbook.createFont();
		font.setFontHeightInPoints((short) 11);
		font.setBold(true);
		font.setFontName("微软雅黑");
		font.setColor(IndexedColors.WHITE.getIndex());
		HSSFCellStyle style = workbook.createCellStyle();
		style.setAlignment(HorizontalAlignment.CENTER);
		style.setFont(font);
		style.setVerticalAlignment(VerticalAlignment.CENTER);
		style.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
		style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
		return style;
	}

	/*
	 * 列数据信息单元格样式
	 */
	public static HSSFCellStyle getCellStyle(HSSFWorkbook workbook) {
		HSSFFont font = workbook.createFont();
		font.setFontHeightInPoints((short) 9);
		font.setFontName("微软雅黑");
		HSSFCellStyle style = workbook.createCellStyle();
		style.setFont(font);
		style.setBorderBottom(BorderStyle.THIN);
		style.setBorderLeft(BorderStyle.THIN);
		style.setBorderRight(BorderStyle.THIN);
		style.setBorderTop(BorderStyle.THIN);
		style.setBottomBorderColor(IndexedColors.BLACK.getIndex());
		return style;
	}

	// 未处理公式
	@SuppressWarnings("deprecation")
	public static String getCellValue(Cell cell) {
		if (cell == null) {
			return "";
		}
		switch (cell.getCellType()) {
		case Cell.CELL_TYPE_STRING:
			return cell.getRichStringCellValue().getString().trim();
		case Cell.CELL_TYPE_NUMERIC:
			if (DateUtil.isCellDateFormatted(cell)) {
				SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");// 非线程安全
				return sdf.format(cell.getDateCellValue());
			} else {
				return String.valueOf(cell.getNumericCellValue());
			}
		case Cell.CELL_TYPE_BOOLEAN:
			return String.valueOf(cell.getBooleanCellValue());
		case Cell.CELL_TYPE_FORMULA:
			return cell.getCellFormula();
		default:
			return "";
		}
	}

	// 处理公式
	@SuppressWarnings("deprecation")
	public static String getCellValueFormula(Cell cell, FormulaEvaluator formulaEvaluator) {
		if (cell == null || formulaEvaluator == null) {
			return null;
		}

		if (cell.getCellType() == Cell.CELL_TYPE_FORMULA) {
			return String.valueOf(formulaEvaluator.evaluate(cell).getNumberValue());
		}
		return getCellValue(cell);
	}

}