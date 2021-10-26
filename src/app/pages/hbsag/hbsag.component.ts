import { Component, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import { MysqlService } from '../mysql.service';
import * as moment from 'moment';

interface 试验批次 {
  platename: string
  savetime: Date
  reportid: string
  comkindname: string
  comkindcat: string
  comappratus: string
  comcheckdoctor: string
  comtempera: string
  comhumidity: string
  commethod: string
  comwavelen: string
  odnumber: number
}

interface 组合 {
  comkindcat: string
  c_id: string
}

@Component({
  selector: 'app-hbsag',
  templateUrl: './hbsag.component.html',
  styleUrls: ['./hbsag.component.scss']
})
export class HbsagComponent implements OnInit {
  // 日期范围
  public date = null;

  // 组合选择
  public multipleValue = ['a10', 'c12'];
  public listOfOption = []

  public listOfData: 试验批次[]

  // 图表选项
  public options: EChartsOption
  public updateOptions: EChartsOption

  constructor(
    private readonly MysqlService: MysqlService
  ) { }

  ngOnInit(): void {

    this.options = {
      title: {
        text: '试验数据',
        left: '1%'
      },
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '5%',
        right: '15%',
        bottom: '10%'
      },
      xAxis: {
        data: []
      },
      yAxis: {},
      toolbox: {
        right: 10,
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          restore: {},
          saveAsImage: {}
        }
      },
      dataZoom: [
        {
          startValue: '2020-10-01'
        },
        {
          type: 'inside'
        }
      ],
      visualMap: {
        top: 50,
        right: 10,
        pieces: [
          {
            gt: 0,
            lte: 0.3,
            color: '#FBDB0F',
            label: '小于0.3'
          },
          {
            gt: 0.3,
            lte: 0.6,
            color: '#93CE07',
            label: '大于0.3且小于0.6'
          },
          {
            gt: 0.6,
            color: '#AA069F',
            label: '大于0.6'
          }
        ],
        outOfRange: {
          color: '#999'
        }
      },
      series: {
        name: '试验数据',
        type: 'line',
        data: [],
        markLine: {
          silent: true,
          lineStyle: {
            color: '#333'
          },
          data: [
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
    this.获取数据();

    this.更新组合([]);
  }

  更新组合(起止日期: Date[]): void {
    console.log("起止日期", 起止日期)
    let children: Array<{ label: string; value: string }> = [];
    let 查询子语句 = ""
    if (起止日期.length == 2) {
      查询子语句 = `(批次表.savetime between FROM_UNIXTIME(${Math.round(起止日期[0].getTime() / 1000)}) and FROM_UNIXTIME(${Math.round(起止日期[1].getTime() / 1000)})) and`
    }

    let 查询字符串 = `select 批次表.comkindcat, 记录表.c_id from vsscanplate as 批次表 join vsscanrecord as 记录表 on (批次表.platename=记录表.platename) where ${查询子语句} (记录表.c_id like '%qc%')
            group by 批次表.comkindcat, 记录表.c_id`

    this.MysqlService.查询(查询字符串).then((res: 组合[]) => {
      children = res.map((v) => {
        return { label: v.c_id + v.comkindcat, value: v.c_id + v.comkindcat }
      })
      this.listOfOption = children;
    })
  }

  获取数据(): void {

    let 查询字符串 = `select * from vsscanplate as 批次表 join vsscanrecord as 记录表 on (批次表.platename=记录表.platename) WHERE (批次表.savetime between '2021-01-01' and '2021-12-31') and (记录表.c_id like '%qc%') order by 批次表.savetime`
    this.MysqlService.查询(查询字符串).then((res: 试验批次[]) => {
      this.listOfData = res

      this.updateOptions = {
        xAxis: {
          data: this.listOfData.map((v) => {
            return moment(v.savetime).format('YYYY-MM-DD kk:mm:ss')
          })
        },
        series: {
          name: '试验数据',
          type: 'line',
          data: this.listOfData.map((v) => {
            return v.odnumber
          }),
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
    })
  }

  onDateChange(result: Date[]): void {
    this.更新组合(result)
  }
}
