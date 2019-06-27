'use strict';

Vue.prototype.$ = $;
Vue.prototype.getUrlParam = function(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURI(r[2]);
    return null;
};
var app = new Vue({
    el: '#app',
    data: function data() {
        return {
            showif: false,
            positionX: 0,
            positionY: 0,
            innerHeight: 0,
            innerWidth: 0,
        };
    },

    watch: {},
    filters: {
        time_obj_string: function time_obj_string(value) {
            return moment(value).format('YYYY-MM-DD');
        }
    },
    methods: {

        /* 阻止移动端屏幕默认滑动 */
        default (e) {
            let divv = document.getElementById('page1mask')
            divv.addEventListener(
                'touchmove',
                function(e) {
                    e.preventDefault()
                }, { passive: false }
            )
        },

        getThisNode() {
            let odiv = document.getElementById('circlebox')
            odiv.style.left = `${this.positionX - 20}px`
            odiv.style.top = `${this.positionY - 20}px`
        },
        down(e) {
            this.showif = true
            this.default()
            this.innerHeight = e.view.innerHeight
            this.innerWidth = e.view.innerWidth
            this.positionX = e.changedTouches[0].pageX
            this.positionY = e.changedTouches[0].pageY
        },
        move(e) {
            this.getThisNode()
            this.default()
            this.positionX = e.changedTouches[0].pageX
            this.positionY = e.changedTouches[0].pageY
            this.getThisNode()
            debugger
            if (this.positionX <= 20) {
                this.positionX = 20
            } else if (this.positionX >= this.innerWidth - 20) {
                this.positionX = this.innerWidth - 20
            } else {
                this.positionX = this.positionX
            }
            debugger
            if (this.positionY <= 20) {
                this.positionY = 20
            } else if (this.positionY >= this.innerHeight - 40) {
                this.positionY = this.innerHeight - 20
            } else {
                this.positionY = this.positionY
            }
        },
        end(e) {
            this.showif = false
        }
    },
    mounted: function mounted() {
        var this_ = this;
    }
});