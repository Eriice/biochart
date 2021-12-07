import { Component, Input, OnInit } from '@angular/core';

import { EChartsOption } from 'echarts';
import * as moment from 'moment';
import { 批次试验数据 } from 'src/app/model/批次试验数据';

@Component({
  selector: 'app-without-framework',
  templateUrl: './without-framework.component.html',
  styleUrls: ['./without-framework.component.scss']
})
export class WithoutFrameworkComponent implements OnInit {
  constructor(
  ) { }

  图表实例: any;
  onChartInit(e: any) {
    this.图表实例 = e;
  }

  @Input() set data(value: 批次试验数据[]) {
    if (value === null) return
    this.options.xAxis = {
      data: value.map(v => moment(v.创建时间).format('YYYY-MM-DD kk:mm'))
    }
    this.options.series[0].data = value.map(v => v['测量值/阴性值'])
    if (this.图表实例) {
      this.图表实例.setOption(this.options, true)
    }
  }

  @Input() isLoading: boolean

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
        }
      }
    ]
  }

  public updateOptions: EChartsOption
  ngOnInit(): void {
  }

}
