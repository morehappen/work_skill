$(function () {
    var dom = document.getElementById("bill-echarts");
    var myChart = echarts.init(dom);
    var app = {};
    option = null;
    var department=['2016/03','2016/03','2016/03','2016/03','2016/03','2016/03','2016/03','2016/03','2016/03','2016/03','2016/03','2016/03'];
    var ticket=['机票'];
    option = {
        color: ['#D44A9F'],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line'
            }
        },
        legend: {
            data:ticket
        },
        calculable: true,
        xAxis : [
            {
                type : 'category',
                data : department
            }
        ],
        yAxis : [
            {
                type : 'value',
                axisLabel: {
                    show: true,
                    interval: 'auto',
                    formatter: '{value}'
                },
                show: true
            }
        ],
        series : [
            {
                name:'',
                type:'bar',
                barWidth:40,
                data:[20000,2000, 7110, 2132, 2516,1000,7989,20000,2000, 7220, 2322, 256]
            }
        ]
    };
    ;
    if (option && typeof option === "object") {
        myChart.setOption(option, true);
    }
})