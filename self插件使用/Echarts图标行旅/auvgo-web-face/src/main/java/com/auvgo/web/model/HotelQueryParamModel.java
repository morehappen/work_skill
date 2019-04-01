package com.auvgo.web.model;

import java.io.Serializable;

import com.auvgo.hotel.model.hotel.ListPagerRequest;

public class HotelQueryParamModel extends ListPagerRequest implements Serializable{

	/**
	 * 
	 */
	private static final long serialVersionUID = 4795351085635626352L;

	/**
	 * 每页条数
	 */
	private Integer pageSize;
	
	/**
	 * 城市名称
	 */
	private String cityName;

	public Integer getPageSize() {
		return pageSize;
	}

	public void setPageSize(Integer pageSize) {
		this.pageSize = pageSize;
	}

	public String getCityName() {
		return cityName;
	}

	public void setCityName(String cityName) {
		this.cityName = cityName;
	}

	
	
	
	
}
