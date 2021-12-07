import { Component, Input, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import * as moment from 'moment';
import { 批次试验结果 } from 'src/app/model/批次试验结果';
import { 即刻法结果 } from 'src/app/枚举/即刻法结果';

@Component({
  selector: 'app-with-framework',
  templateUrl: './with-framework.component.html',
  styleUrls: ['./with-framework.component.scss']
})
export class WithFrameworkComponent implements OnInit {
  constructor(
  ) { }

  private _数据: 批次试验结果[]
  @Input() set data(value: 批次试验结果[]) {
    this._数据 = value
    // 更新图表
    this.updateEchart()
  }

  // 平均值
  @Input() set calc(val: { 平均值: number, 标准差: number }) {
    let { 平均值, 标准差 } = val

    let min = (平均值 - 标准差 * 4)
    let max = (平均值 + 标准差 * 4)

    let 间隔 = 标准差
    this.options.yAxis[0].min = min
    this.options.yAxis[0].max = max
    this.options.yAxis[0].interval = 间隔
    this.options.yAxis[0].axisLabel = {
      show: true,
      formatter: (val: number) => {
        return val.toFixed(3)
      }
    }
    this.options.series[0].markLine.data = [
      { yAxis: 平均值 + 3 * 标准差, label: { formatter: '+3s' }, lineStyle: { color: '#e0e6f1', width: 1, type: 'solid' } },
      { yAxis: 平均值 - 3 * 标准差, label: { formatter: '-3s' }, lineStyle: { color: '#e0e6f1', width: 1, type: 'solid' } },
      { yAxis: 平均值 + 2 * 标准差, label: { formatter: '+2s' }, lineStyle: { color: '#e0e6f1', width: 1, type: 'solid' } },
      { yAxis: 平均值 - 2 * 标准差, label: { formatter: '-2s' }, lineStyle: { color: '#e0e6f1', width: 1, type: 'solid' } },
      { yAxis: 平均值 + 标准差, label: { formatter: '+1s' }, lineStyle: { color: '#e0e6f1', width: 1, type: 'solid' } },
      { yAxis: 平均值 - 标准差, label: { formatter: '-1s' }, lineStyle: { color: '#e0e6f1', width: 1, type: 'solid' } },
      { yAxis: 平均值, label: { formatter: 'X' }, lineStyle: { color: '#222', width: 1, type: 'solid' } },
    ]

    // 设置失控点标记
    let 失控 = this._数据.filter(v => v.结果 === 即刻法结果.失控).map(v => {
      return {
        name: '失控',
        value: '失控',
        xAxis: v.创建时间,
        yAxis: v['测量值/阴性值']
      }
    })
    this.options.series[0].markPoint.data = 失控

    if (this.图表实例) {
      this.图表实例.setOption(this.options, true)
    }
  }
  @Input() isLoading: boolean

  图表实例: any;
  onChartInit(e: any) {
    this.图表实例 = e;
  }
  // 图表选项
  public options: EChartsOption = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '10%',
      right: '5%',
      bottom: '10%'
    },
    // x轴，通过数据合并创建
    xAxis: {
      data: []
    },
    // y轴
    yAxis: [
      {
        type: 'value',
        name: '数值',
        position: 'left',
        splitNumber: 8,
        splitLine: {
          show: true,
          // 强制显示所有标签
          interval: 0
        }
      }
    ],
    // 工具条
    toolbox: {
      right: 10,
      feature: {
        saveAsImage: {}
      }
    },
    series: [
      {
        data: [],
        type: 'line',
        smooth: true,
        markLine: {
          animation: false,
          symbolSize: 0
        },
        markPoint: {}
      }
    ]
  }

  public updateOptions: EChartsOption
  ngOnInit(): void {
  }

  public isShowOutofControlData: boolean = true
  updateEchart() {
    const chartData = this._数据.filter(v => {
      // 不显示失控，而结果为失控
      if (!this.isShowOutofControlData && v.结果 === 即刻法结果.失控) return false
      return true
    })

    this.options.xAxis = {
      data: chartData.map(v => moment(v.创建时间).format('YYYY-MM-DD kk:mm'))
    }
    this.options.series[0].data = chartData.map(v => v['测量值/阴性值'])
    if (this.图表实例) {
      this.图表实例.setOption(this.options, true)
    }
  }
}
