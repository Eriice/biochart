import { Component, Input, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import * as moment from 'moment';
import { 批次试验结果 } from 'src/app/model/批次试验结果';
import { 保留小数 } from 'src/app/工具/公式';
import { 即刻法结果 } from 'src/app/枚举/即刻法结果';

interface 图表数据 extends 批次试验结果  {
  序号: number
}

@Component({
  selector: 'app-with-framework',
  templateUrl: './with-framework.component.html',
  styleUrls: ['./with-framework.component.scss']
})
export class WithFrameworkComponent implements OnInit {
  constructor(
  ) { }

  private _数据: 图表数据[]
  @Input() set data(value: 图表数据[]) {
    this._数据 = value
    // 更新图表
    this.updateEchart()
  }

  public statistic
  @Input() set calc(val) {
    this.statistic = val
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
      { yAxis: 平均值 + 3 * 标准差, label: { formatter: '+3s' }, lineStyle: { color: '#bb2122', width: 1, type: 'solid' } },
      { yAxis: 平均值 - 3 * 标准差, label: { formatter: '-3s' }, lineStyle: { color: '#bb2122', width: 1, type: 'solid' } },
      { yAxis: 平均值 + 2 * 标准差, label: { formatter: '+2s' }, lineStyle: { color: '#0a33a5', width: 1, type: 'solid' } },
      { yAxis: 平均值 - 2 * 标准差, label: { formatter: '-2s' }, lineStyle: { color: '#0a33a5', width: 1, type: 'solid' } },
      { yAxis: 平均值 + 标准差, label: { formatter: '+1s' }, lineStyle: { color: '#e0e6f1', width: 1, type: 'solid' } },
      { yAxis: 平均值 - 标准差, label: { formatter: '-1s' }, lineStyle: { color: '#e0e6f1', width: 1, type: 'solid' } },
      { yAxis: 平均值, label: { formatter: 'X' }, lineStyle: { color: '#222', width: 1, type: 'solid' } },
    ]

    this.设置失控选项()
    
    if (this.图表实例) {
      this.图表实例.setOption(this.options, true)
    }
  }
  @Input() isLoading: boolean

  设置失控选项() {
    if (this.isShowOutofControlData) {
      // 设置失控点标记
      let 失控 = this._数据.filter(v => v.结果 === 即刻法结果.失控).map(v => {
        return {
          name: '失控',
          value: '',
          xAxis: v.序号 - 1,
          yAxis: v['测量值/阴性值'],
          symbol: 'image://data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0nMTInIGhlaWdodD0nMTInIHZpZXdCb3g9JzAgMCA0OCA0OCcgZmlsbD0nbm9uZScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48Y2lyY2xlIGN4PScyNCcgY3k9JzI0JyByPSc1JyBzdHJva2U9JyNmMDQwNDAnIHN0cm9rZS13aWR0aD0nMicvPjwvc3ZnPg=='
        }
      })
      this.options.series[0].markPoint.data = 失控
    } else {
      this.options.series[0].markPoint.data = []
    }
  }


  图表实例: any;
  onChartInit(e: any) {
    this.图表实例 = e;
  }
  // 图表选项
  public options: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let 当前点 = params[0].data['原始值']
        let html = ""
        let 序号 = 当前点['序号']
        let 创建时间 = moment(当前点['创建时间']).format('YYYY-MM-DD kk:mm')
        let 操作人 = 当前点['操作人']
        let 测量值比阴性值 = 保留小数(当前点['测量值/阴性值'], 3)
        let 结果 = 当前点['结果']
        
        html = `序号：${序号}<br>创建时间：${创建时间}<br>操作人：${操作人}<br>测量值/阴性值：${测量值比阴性值}<br>结果：${结果}`
        return html
      }      
    },
    grid: {
      left: '10%',
      right: '5%',
      bottom: '10%'
    },
    // x轴，通过数据合并创建
    xAxis: {
      data: [],
      type: 'category',
      boundaryGap: true,
      axisTick: {
        alignWithLabel: true
      },
      axisLine: {
        onZero: false
      }
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
        smooth: false,
        markLine: {
          animation: false,
          symbolSize: 0
        },
        markPoint: {
          data: []
        }
      }
    ]
  }

  public updateOptions: EChartsOption
  ngOnInit(): void {
  }

  // 是否显示失控数据
  public isShowOutofControlData: boolean = true
  updateEchart() {
    const chartData = this._数据.filter(v => {
      // 不显示失控，而结果为失控
      if (!this.isShowOutofControlData && v.结果 === 即刻法结果.失控) return false
      return true
    })

    this.options.series[0].markPoint.data
    this.options.xAxis['data'] = chartData.map(v => v.序号)
    this.options.series[0].data = chartData.map(v => {
      return {
        value: v['测量值/阴性值'],
        原始值: v
      }
    })

    this.设置失控选项()

    if (this.图表实例) {
      this.图表实例.setOption(this.options, true)
    }
  }
}
