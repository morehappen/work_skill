package com.auvgo.web.face.caiwu;

import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.auvgo.caiwu.contant.CaiwuCommonContant;
import com.auvgo.caiwu.entity.CaiwuJiesuan;
import com.auvgo.caiwu.entity.CaiwuLocalAllRecode;
import com.auvgo.caiwu.query.CaiwuJiesuanQuery;
import com.auvgo.common.page.Page;
import com.auvgo.finance.api.provider.ICaiwuJiesuanProvider;
import com.auvgo.finance.api.provider.ICaiwuLocalAllRecodeProvider;
import com.auvgo.web.face.BaseController;
import com.google.common.collect.Lists;

@Controller
@RequestMapping("/caiwu/jiesuan")
public class CaiwuFuKuanController extends BaseController {
	@Autowired
	ICaiwuLocalAllRecodeProvider caiwuLocalAllRecodeProvider;
	@Autowired
	ICaiwuJiesuanProvider caiwuJiesuanProvider;

	/**
	 * 付款列表
	 * 
	 * @param pageNum
	 * @param pageSize
	 * @param type
	 *            0待付款 1已付款
	 * @param jiesuanQuery
	 * @return
	 */
	@RequestMapping("/paylist/{type}")
	public String paylist(@RequestParam(defaultValue = "1") Integer pageNum, @RequestParam(defaultValue = "30") Integer pageSize, @PathVariable("type") int type,
			CaiwuJiesuanQuery jiesuanQuery) {
		Page<CaiwuJiesuan> page = new Page<>(pageNum, pageSize);
		try {
			jiesuanQuery.setCompanyCode(getCompany().getBianhao());
			if (type == 0) {
				jiesuanQuery.setKhBalStatus(CaiwuCommonContant.CW_JIESUAN_STATUS_WAIT);
			} else {
				jiesuanQuery.setKhBalStatus(CaiwuCommonContant.CW_JIESUAN_STATUS_SUCCESS);
			}
			page = caiwuJiesuanProvider.findPage(page, jiesuanQuery);
			setAttr("page", page);
			setAttr("caiwuCommonContant", new CaiwuCommonContant());
			setAttr("recode", jiesuanQuery);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "/caiwu/bill/bill-pay-list";
	}

	@RequestMapping("/detail/{jiesuanno}")
	public String detail(@PathVariable("jiesuanno") String jiesuanNo, @RequestParam(defaultValue = "1") Integer pageNum, @RequestParam(defaultValue = "30") Integer pageSize,
			HttpServletRequest request) {
		try {
			CaiwuJiesuan jiesuan = caiwuJiesuanProvider.findByJiesuanNo(jiesuanNo);
			List<Long> idsList = Lists.newArrayList();
			for (Long id : jiesuan.getJiesuanIdsSet()) {
				idsList.add(id);
			}
			Page<CaiwuLocalAllRecode> page = new Page<>(pageNum, pageSize);
			page = caiwuLocalAllRecodeProvider.findPageByIds(page, idsList);
			request.setAttribute("jiesuan", jiesuan);
			request.setAttribute("page", page);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "/caiwu/bill/bill-paylist-detail";
	}
 
}
