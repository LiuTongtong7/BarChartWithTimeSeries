/**
 * Created by liutongtong on 2018/12/15 20:51
 */

/************************************* Paint Module *************************************/

// 图表的尺寸
const chart_container = $("#chart");
const margin = {top: 40, right: 80, bottom: 40, left: 60};
const width = chart_container.width() - margin.left - margin.right;
chart_container.height(chart_container.width() / 2.5);
const height = chart_container.height() - margin.top - margin.bottom;

// 初始化图表
const chart = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// 定义横纵轴和比例尺
const x = d3.scaleLinear()
    .range([0, width]);
const xAxis = d3.axisTop()
    .scale(x)
    .tickSize(3);

const yTicks = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
const y = d3.scaleBand()
    .domain(yTicks)
    .rangeRound([0, height])
    .padding(.1);
const yAxis = d3.axisLeft()
    .scale(y)
    .tickSize(3)
    .tickSizeOuter(0);

const grid = d3.axisTop()
    .scale(x)
    .tickSize(-height)
    .tickFormat("");

chart.append("g")
    .attr("class", "x axis");

chart.append("g")
    .attr("class", "y axis");

chart.append("g")
    .attr("class", "grid");

// 绘制时间信息
chart.append("text")
    .attr("class", "notation")
    .attr("x", width)
    .attr("y", height)
    .text('0000');

// 定义颜色盘
const colormap = [
    "#3366cc", "#dc3912", "#ff9900", "#109618", "#990099",
    "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395",
    "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300",
    "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac",
];
const names = [
    "United States", "China", "Japan", "Germany", "United Kingdom",
    "India", "France", "Brazil", "Italy", "Canada",
    "Russian Federation", "Korea, Rep.", "Australia", "Spain", "Mexico",
    "Netherlands", "Argentina", "Sweden",
];
let name2color = {};
for (let i = 0; i < names.length; i++) {
    name2color[names[i]] = d3.color(colormap[i]);
    // name2color[names[i]] = d3.color(colormap[i]).darker();
}
// name2color['China'] = d3.color(colormap[1]);

// 定义过渡时间
const duration = 1000;

// 定义重绘函数
const drawChart = function (duration=1000) {
    let currentData = data[currentTime];

    // 设置横纵轴和比例尺
    const maxValue = d3.max(currentData, function (d) { return d.value; });
    x.domain([0, maxValue]);

    // 绘制横纵轴和辅助线
    chart.select(".grid")
        .transition()
        .duration(duration)
        .call(grid);

    chart.select(".x.axis")
        .transition()
        .duration(duration)
        .call(xAxis);

    chart.select(".y.axis")
        .transition()
        .duration(duration)
        .call(yAxis);

    // 绘制柱形和文字的辅助函数
    const getY = function (rank) {
        if (rank < yTicks.length) {
            return y(yTicks[rank]);
        } else {
            return height;
        }
    };
    const getOpacity = function (rank) {
        return rank < yTicks.length ? 1 : 0;
    };

    // 柱形及文字
    let bars = chart.selectAll(".bar")
        .data(currentData);

    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("fill", function (d) { return name2color[d.name]; })
        .attr("x", 0)
        .attr("y", height)
        .attr("height", y.bandwidth())
        .attr("width", 0)
        .attr("opacity", 0)
        .merge(bars)
        .transition()
        .duration(duration)
        .ease(d3.easeLinear)
        .attr("y", function (d) { return getY(d.rank); })
        .attr("width", function (d) { return x(d.value); })
        .attr("opacity", function (d) { return getOpacity(d.rank); });

    // bars.exit()
    //     .transition()
    //     .duration(duration)
    //     .attr("y", height)
    //     .attr("width", 0)
    //     .attr("opacity", 0)
    //     .remove();

    let innerLabels = chart.selectAll(".inner.label")
        .data(currentData);

    innerLabels.enter()
        .append("text")
        .attr("class", "label inner")
        .attr("x", -5)
        .attr("y", height)
        .attr("dy", "5")
        .attr("opacity", 0)
        .merge(innerLabels)
        .transition()
        .duration(duration)
        .ease(d3.easeLinear)
        .attr("y", function (d) { return getY(d.rank) + y.bandwidth() / 2;})
        .attr("x", function (d) { return x(d.value) - 5; })
        .attr("opacity", function (d) { return getOpacity(d.rank); })
        .text(function (d) { return d.name; });

    // innerLabels.exit()
    //     .transition()
    //     .duration(duration)
    //     .attr("y", height)
    //     .attr("x", -5)
    //     .attr("opacity", 0)
    //     .remove();

    let outerLabels = chart.selectAll(".outer.label")
        .data(currentData);

    outerLabels.enter()
        .append("text")
        .attr("class", "label outer")
        .attr("x", -5)
        .attr("y", height)
        .attr("dy", "6")
        .attr("opacity", 0)
        .merge(outerLabels)
        .transition()
        .duration(duration)
        .ease(d3.easeLinear)
        .attr("y", function (d) { return getY(d.rank) + y.bandwidth() / 2;})
        .attr("x", function (d) { return x(d.value) + 5; })
        .attr("opacity", function (d) { return getOpacity(d.rank); })
        .tween("text", function(d) {
            let that = d3.select(this);
            let i = d3.interpolateNumber(that.text().replace(/,/g, ""), d.value);
            return function(t) { that.text(d3.format(",d")(i(t))); };
        });

    // outerLabels.exit()
    //     .transition()
    //     .duration(duration)
    //     .attr("y", height)
    //     .attr("x", -5)
    //     .attr("opacity", 0)
    //     .remove();

    // 时间信息
    chart.select(".notation")
        .transition()
        .duration(duration)
        .ease(d3.easeLinear)
        .text(currentTime);
};

/************************************* Data Module *************************************/
// 全局数据变量
let data = {};
let minTime = 0, maxTime = 0;
let currentTime = 0, previousTime = 0;

// 数据处理
const processData = function (d) {
    for (let i = 0; i < d.length; i++) {
        let time = d[i]['time'];
        delete d[i]['time'];

        let names = Object.keys(d[i]);
        names.sort(function (a, b) { return d[i][b] - d[i][a]; });
        let name2rank = {};
        for (let j = 0; j < names.length; j++) {
            name2rank[names[j]] = j;
        }

        data[time] = [];
        for (let name in d[i]) {
            data[time].push({name: name, value: parseInt(d[i][name] / 1e8), rank: name2rank[name]});
        }
    }
};

d3.csv('data/top_country_gdp.csv').then(function (d) {
    processData(d);
    minTime = d3.min(Object.keys(data).map(d => parseInt(d)));
    maxTime = d3.max(Object.keys(data).map(d => parseInt(d)));
    currentTime = minTime;
    previousTime = minTime;
    drawChart(0);
    updateButtons();
});

/************************************* Control Module *************************************/
const updateButtons = function () {
    if (currentTime > minTime) {
        $('#prev-button').removeClass('disabled');
    } else {
        $('#prev-button').addClass('disabled');
    }
    if (currentTime < maxTime) {
        $('#next-button').removeClass('disabled');
        $('#play-button').removeClass('disabled');
    } else {
        $('#next-button').addClass('disabled');
        $('#play-button').addClass('disabled');
    }
    $('#reset-button').removeClass('disabled');
};

const disableButtons = function () {
    $('#prev-button').addClass('disabled');
    $('#next-button').addClass('disabled');
    $('#reset-button').addClass('disabled');
};

$('#reset-button').click(function () {
    previousTime = currentTime;
    currentTime = minTime;
    drawChart();
    updateButtons();
});

$('#prev-button').click(function () {
    previousTime = currentTime;
    currentTime -= 1;
    drawChart();
    updateButtons();
});

$('#next-button').click(function () {
    previousTime = currentTime;
    currentTime += 1;
    drawChart();
    updateButtons();
});

let isPlaying = false;
let timer = null;
$('#play-button').click(function () {
    if (!isPlaying) {
        isPlaying = true;
        disableButtons();
        $('#play-button span').removeClass('glyphicon-play').addClass('glyphicon-pause');

        const repeat = function () {
            if (currentTime < maxTime) {
                previousTime = currentTime;
                currentTime += 1;
                drawChart();
                timer = setTimeout(repeat, duration);
            } else {
                timer = null;
                $('#play-button span').removeClass('glyphicon-pause').addClass('glyphicon-play');
                updateButtons();
                isPlaying = false;
            }
        };
        setTimeout(repeat, 0);
    } else {
        clearTimeout(timer);
        timer = null;
        $('#play-button span').removeClass('glyphicon-pause').addClass('glyphicon-play');
        updateButtons();
        isPlaying = false;
    }
});
