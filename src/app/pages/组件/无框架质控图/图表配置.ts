export const 图表配置 = {
  tooltip: {
    trigger: 'axis'
  },
  grid: {
    left: '5%',
    right: '15%',
    bottom: '10%'
  },
  // x轴，通过数据合并创建
  xAxis: {
    // data: 数据.map((v) => {
    //   return moment(v.创建时间).format('YYYY-MM-DD kk:mm:ss')
    // })
  },
  // y轴
  yAxis: [
    {
      type: 'value',
      name: '数值',

      min: 0,
      max: 1,
      position: 'left',
      axisLabel: {
        formatter: '{value}'
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
  // 图例
  // visualMap: {
  //   top: 50,
  //   right: 10,
  //   pieces: [
  //     {
  //       gt: 0,
  //       lte: 0.3,
  //       color: '#FBDB0F',
  //       label: '小于0.3'
  //     },
  //     {
  //       gt: 0.3,
  //       lte: 0.6,
  //       color: '#93CE07',
  //       label: '大于0.3且小于0.6'
  //     },
  //     {
  //       gt: 0.6,
  //       color: '#FD0100',
  //       label: '大于0.6'
  //     }
  //   ]
  // },
  series: {
    name: '试验数据',
    type: 'line',
    // data: 数据.map((v) => {
    //   return v.测量值
    // }),
    markLine: {
      silent: true,
      lineStyle: {
        color: '#333'
      },
      data: [
        { type: 'average', name: 'Avg' },
        {
          yAxis: 0.3
        },
        {
          yAxis: 0.6
        }
      ]
    }
  }
}