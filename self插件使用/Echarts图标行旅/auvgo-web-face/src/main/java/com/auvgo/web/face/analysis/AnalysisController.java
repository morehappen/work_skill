package com.auvgo.web.face.analysis;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.auvgo.web.face.BaseController;

@RequestMapping("/analysis")
@Controller
public class AnalysisController extends BaseController {

	@RequestMapping("")
	public String index() {
		
		return "/analysis/analysis-index";
	}

}
