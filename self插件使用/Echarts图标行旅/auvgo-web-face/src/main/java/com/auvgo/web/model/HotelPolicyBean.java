package com.auvgo.web.model;

/**
 * Created by lc on 2017/2/22
 */

public class HotelPolicyBean {

    /**
     * price : 100
     * policy : {"id":56,"companyid":35,"startlevel":1,"endlevel":1,"jdcitylevelid":"182/183/184/206/","citylevelname":"一线城市/二线城市/三线城市/四线城市/","price":"0/300/200/100/","controllertype":"0/1/1/0/"}
     * controller : 0
     * cityname : 四线城市
     */

    private String price;
    private PolicyBean policy;
    private String controller;
    private String cityname;

    public String getPrice() {
        return price;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public PolicyBean getPolicy() {
        return policy;
    }

    public void setPolicy(PolicyBean policy) {
        this.policy = policy;
    }

    public String getController() {
        return controller;
    }

    public void setController(String controller) {
        this.controller = controller;
    }

    public String getCityname() {
        return cityname;
    }

    public void setCityname(String cityname) {
        this.cityname = cityname;
    }

    public static class PolicyBean {
        /**
         * id : 56
         * companyid : 35
         * startlevel : 1
         * endlevel : 1
         * jdcitylevelid : 182/183/184/206/
         * citylevelname : 一线城市/二线城市/三线城市/四线城市/
         * price : 0/300/200/100/
         * controllertype : 0/1/1/0/
         */

        private int id;
        private int companyid;
        private int startlevel;
        private int endlevel;
        private String jdcitylevelid;
        private String citylevelname;
        private String price;
        private String controllertype;

        public int getId() {
            return id;
        }

        public void setId(int id) {
            this.id = id;
        }

        public int getCompanyid() {
            return companyid;
        }

        public void setCompanyid(int companyid) {
            this.companyid = companyid;
        }

        public int getStartlevel() {
            return startlevel;
        }

        public void setStartlevel(int startlevel) {
            this.startlevel = startlevel;
        }

        public int getEndlevel() {
            return endlevel;
        }

        public void setEndlevel(int endlevel) {
            this.endlevel = endlevel;
        }

        public String getJdcitylevelid() {
            return jdcitylevelid;
        }

        public void setJdcitylevelid(String jdcitylevelid) {
            this.jdcitylevelid = jdcitylevelid;
        }

        public String getCitylevelname() {
            return citylevelname;
        }

        public void setCitylevelname(String citylevelname) {
            this.citylevelname = citylevelname;
        }

        public String getPrice() {
            return price;
        }

        public void setPrice(String price) {
            this.price = price;
        }

        public String getControllertype() {
            return controllertype;
        }

        public void setControllertype(String controllertype) {
            this.controllertype = controllertype;
        }
    }
}
