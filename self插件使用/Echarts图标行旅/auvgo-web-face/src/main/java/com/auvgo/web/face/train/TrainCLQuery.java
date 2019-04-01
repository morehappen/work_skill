package com.auvgo.web.face.train;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.auvgo.core.utils.AuvgoResult;
import com.auvgo.core.utils.DateUtils;
import com.auvgo.core.utils.JsonMapper;
import com.auvgo.core.utils.JsonUtils;
import com.auvgo.data.api.DataTrainCityService;
import com.auvgo.data.entity.DataTrainCity;
import com.auvgo.train.api.TrainOrderService;
import com.auvgo.train.entity.TrainOrder;
import com.auvgo.train.entity.TrainOrderRoute;
import com.auvgo.traincl.api.dto.entity.CLResult;
import com.auvgo.traincl.api.dto.entity.station.StopStation;
import com.auvgo.traincl.api.ws.CLTrainQueryService;
import com.auvgo.web.contant.ErrorCode;
import com.auvgo.web.face.BaseController;
import com.auvgo.web.model.TrainQueryModel;
import com.google.common.collect.Maps;

import net.sf.json.JSONObject;

/**
 * @author realxxs
 * 下午1:22:26
 * 2017年12月27日
 */
@Controller
@RequestMapping("/train/clquery")
public class TrainCLQuery extends BaseController {
	private static JsonMapper jsonMapper = JsonMapper.nonNullMapper();
	@Autowired
	private CLTrainQueryService  clTrainQueryService;
	@Autowired
	private TrainOrderService orderService;
	@Autowired
	private DataTrainCityService dataTrainCityService;
	
	@RequestMapping("")
	public String query(TrainQueryModel query){
		log.info("TrainQuery:{} ", JsonUtils.objectToJson(query));
		setSessionAttr("train_query_con", query);// 保存查询条件
		return "/train/train-query-list";
	}
	
	/**
	 * 
	 * 查询余票信息
	 *
	 * @param param 
	 * 			查询参数
	 * @return
	 */
	@RequestMapping("/list")
	@ResponseBody
	public AuvgoResult queryTrain(TrainQueryModel param) {
		try {
			log.info("/train/query-->request {}", jsonMapper.toJson(param));
			if(StringUtils.isBlank(param.getFrom()) || StringUtils.isBlank(param.getArrive()) || StringUtils.isBlank(param.getStartDate()))
				return AuvgoResult.build(ErrorCode.WRONG_PARAMS,ErrorCode.getMsg(ErrorCode.WRONG_PARAMS));
			String trainDate = param.getStartDate().replaceAll("-","");
			
			// 改签时间判断
			if (StringUtils.isNotBlank(param.getOrderno())) {
				TrainOrder order = orderService.getOrderByorderNo(param.getOrderno());
				TrainOrderRoute route = order.getRoute();
				Date fromDate = DateUtils.parseDate(route.getTravelTime()+" "+route.getFromTime(),"yyyy-MM-dd HH:mm");
				int hour = DateUtils.hourBetween(new Date(), fromDate);
				int daysBetween = DateUtils.daysBetween(new Date(), DateUtils.parseDate(param.getStartDate(), "yyyy-MM-dd"));
				if (hour > 48 && daysBetween >= 30) {
					return AuvgoResult.build(300, "只能改签,当前时间30天以内的火车票,请您重新选择改签日期!");
				}else if (hour < 48 && (daysBetween < 0 || daysBetween >2)) {
					return AuvgoResult.build(300, "只能改签,当前时间到改签之前车次发车时间,请您重新选择改签日期!");
				}
			}
			
			CLResult query = clTrainQueryService.query(param.getFrom(), param.getArrive(),trainDate);
			if("100".equals(query.getMsgCode())){
				setSessionAttr("train_query_con", param);// 保存查询条件
				setSessionAttr("trainList", query);//查询结果保存到session中
				log.info("/train/query/list-->response {}", jsonMapper.toJson(query));
				return AuvgoResult.build(ErrorCode.SUCCESS, String.valueOf(getBooKFlag()),JsonUtils.objectToJson(query));
			}else{
				return AuvgoResult.build(ErrorCode.ERROR, query.getMsgInfo(),JsonUtils.objectToJson(query));
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(ErrorCode.ERROR,"查询繁忙，请您重新查询！");
	}

	private int getBooKFlag() {
		Calendar cal = Calendar.getInstance();
		return cal.get(Calendar.HOUR_OF_DAY) >= 23 || cal.get(Calendar.HOUR_OF_DAY) <= 6 ? 0 : 1;
	}
	
	
	/**
	 * 
	 * 查询经停站点
	 * 
	 * @param querydate 出发日期
	 * @param fromcode  出发城市code
	 * @param tocode    到达车市code
	 * @param train_no  列车内部编码( 查询结果里有 )
	 * @return
	 */
	@RequestMapping("/stopover/{querydate}/{fromcode}/{tocode}/{train_no}")
	@ResponseBody
	public AuvgoResult queryStopover(@PathVariable("querydate") String querydate, @PathVariable("fromcode") String fromcode,
			@PathVariable("tocode") String tocode, @PathVariable("train_no") String train_no) {
		try {
			Map<String,Object> map = Maps.newHashMap();
			map.put("querydate", querydate);
			map.put("fromcode", fromcode);
			map.put("tocode", tocode);
			map.put("train_no", train_no);
			log.info("/stopover-->request {}", jsonMapper.toJson(map));
			String date = querydate.replaceAll("-", "");
			StopStation stopStation = clTrainQueryService.trainStopStation(fromcode, tocode, train_no, date);
			if("100".equals(stopStation.getMsgCode())){
			log.info("/stopover-->reponse{}", stopStation);
				return AuvgoResult.build(200, jsonMapper.toJson(stopStation));
			}else{
				return AuvgoResult.build(300, stopStation.getMsgInfo());
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return AuvgoResult.build(ErrorCode.ERROR, "查询失败!");
	}
	/**
	 * 火车票 获取差旅政策 输入参数{"level":1/2/3}
	 * 
	 * @param level
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/updateTrainCity")
	@ResponseBody
	public AuvgoResult updateTrainCity(HttpServletRequest request) {
		try {
			String sendCLTX =clTrainQueryService.trainStationList();
			//String fave = HttpConections.sendRequest("https://kyfw.12306.cn/otn/resources/js/framework/favorite_name.js",RequstMode.GET, null);//热门城市
	      	String fave ="@bji|北京|BJP|0@sha|上海|SHH|1@tji|天津|TJP|2@cqi|重庆|CQW|3@csh|长沙|CSQ|4@cch|长春|CCT|5@cdu|成都|CDW|6@fzh|福州|FZS|7@gzh|广州|GZQ|8@gya|贵阳|GIW|9@hht|呼和浩特|HHC|10@heb|哈尔滨|HBB|11@hfe|合肥|HFH|12@hzh|杭州|HZH|13@hko|海口|VUQ|14@jna|济南|JNK|15@kmi|昆明|KMM|16@lsa|拉萨|LSO|17@lzh|兰州|LZJ|18@nni|南宁|NNZ|19@nji|南京|NJH|20@nch|南昌|NCG|21@sya|沈阳|SYT|22@sjz|石家庄|SJP|23@tyu|太原|TYV|24@wlq|乌鲁木齐南|WMR|25@wha|武汉|WHN|26@xni|西宁|XNO|27@xan|西安|XAY|28@ych|银川|YIJ|29@zzh|郑州|ZZF|30@szh|深圳|SZQ|shenzhen|sz|31@xme|厦门|XMS|xiamen|xm|32";//热门城市
	      	if(StringUtils.isEmpty(sendCLTX)){
	      		return AuvgoResult.build(ErrorCode.ERROR, "同程数据获取失败，更新火车票城市库失败！");
	      	}else if(StringUtils.isEmpty(fave)){
	      		return AuvgoResult.build(ErrorCode.ERROR, "12306热门城市获取失败，更新火车票城市库失败！");
	      	}else{
				JSONObject jsonObject =JSONObject .fromObject(sendCLTX);//将String转为JSON数据
				String msgCode = jsonObject.getString("msgCode");//获取key为"msgCode"的值。
	            if("100".equals(msgCode)){
	            	String stationInfo = jsonObject.getString("stations");//获取key为"stations"的值。
	            	JSONObject stations =JSONObject .fromObject(stationInfo);
	            	Iterator<String> male_Iterator = stations.keys();
	    			//更新城市库
	    			List<DataTrainCity> list = new ArrayList<DataTrainCity>();
	    		
	            	while(male_Iterator.hasNext()){
	            		DataTrainCity train =new DataTrainCity();
		            	// 获得key 
		            	String name = male_Iterator.next(); //车站名
		            	String value = stations.getString(name); //车站信息
		            	JSONObject station =JSONObject .fromObject(value);
		            	String pinyin=station.getString("stationCode");
		            	String match=station.getString("match");
		            	String siteCode=station.getString("siteCode");
		            	train.setCzname(name);
		            	train.setCzcode(siteCode);
		            	train.setPinyin(pinyin);
		            	train.setStatus(0);
		            	train.setCzsimplename(match);
		            	train.setCreatetime(new Date());
		            	list.add(train);
	            	}
	            	//清空城市库
	    			dataTrainCityService.deleteAll();
	            	dataTrainCityService.saveBatch(list);
	            	//更新12306热门城市
	        		fave=fave.substring(fave.indexOf("'")+1,fave.lastIndexOf("'"));
	        		String[] citys = fave.split("@");
	        		if(citys!=null&&citys.length>0){
	        			List<DataTrainCity> citylist=new ArrayList<>();
	        			for(String str:citys){
	        			 if(StringUtils.isNotEmpty(str)){
	        				 String[] cityinfo = str.split("\\|");
	        				 String name=cityinfo[1];
	        				 DataTrainCity city = dataTrainCityService.getByCzname(name);
	        				 city.setStatus(1);
	        				 citylist.add(city);
	        			 }
	        			}
	        			dataTrainCityService.batchSaveOrUpdate(citylist);
	        		}
	            }	
			}
			return AuvgoResult.build(ErrorCode.SUCCESS, ErrorCode.getMsg(ErrorCode.SUCCESS),null);
		} catch (Exception e) {
			e.printStackTrace();
			log.error("/train/query/updateTrainCity error-->,Exception:{}",e);
			return AuvgoResult.build(ErrorCode.ERROR, "更新火车票城市库失败！");
		}
	}
}
