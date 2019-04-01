package com.auvgo.web.face.caiwu.tongji;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import com.auvgo.web.face.BaseController;

@Controller
@RequestMapping("/tongji")
public class AirCompanyController extends BaseController {

	@RequestMapping("/{pageName}")
	public String topage(@PathVariable("pageName") String pageName) {
		return "/caiwu/tongji/" + pageName;
	}

}
