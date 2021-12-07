import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { 质控框架, 阴性计算方式 } from 'src/app/database/localdb.service';
import { 试验组合 } from 'src/app/model/试验组合';
import { 组合状态枚举 } from 'src/app/枚举/组合状态枚举';
import { 质控规则枚举, 质控规则模式枚举 } from 'src/app/枚举/质控规则';
import { FrameworkDataService } from '../服务/框架数据服务.service';
import { CombinationService } from '../服务/组合服务';

enum 编辑状态枚举 {
  新增 = '新增',
  修改 = '修改'
}

interface 页面数据 {
  regularMode: 质控规则模式枚举
  regular: 质控规则枚举
  regularArray: 质控规则枚举[]
  negativeCalc: 阴性计算方式
  // 试剂阴性值
  nagativeValue: number
  // 试剂系数
  nagativeConst: number
}

@Component({
  selector: 'app-framework-config',
  templateUrl: './framework-config.component.html',
  styleUrls: ['./framework-config.component.scss']
})
export class FrameworkConfigComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private readonly 组合服务: CombinationService,
    private readonly 框架数据服务: FrameworkDataService
  ) { }

  ngOnInit(): void {
    this.订阅当前组合通知()
  }

  // 规则模式列表
  public regularModeList = Object.entries(质控规则模式枚举).filter((val) => isNaN(Number(val[0])))
  // 规则组
  public strategyGroup = this.框架数据服务.策略列表
  public enumRegularMode = 质控规则模式枚举
  public enumNagativeMethod = Object.entries(阴性计算方式).filter((val) => isNaN(Number(val[0])))
  public regularMap = this.框架数据服务.质控规则键值对

  private _组合: 试验组合 = null
  private _框架: 质控框架 = null
  private _数据: 页面数据 = null
  订阅当前组合通知() {
    this.组合服务.当前试验组合$.subscribe(([试验组合, 框架]) => {
      this._组合 = 试验组合
      this._框架 = 框架
      let 数据: 页面数据
      if (框架 === null) {
        数据 = {
          regularMode: 质控规则模式枚举.单规则,
          regular: 质控规则枚举['13s'],
          regularArray: [质控规则枚举['13s']],
          negativeCalc: 阴性计算方式.系数相乘,
          nagativeValue: 0.05,
          nagativeConst: 2.1
        }
      } else {
        数据 = {
          regularMode: 框架.质控规则模式,
          regular: 框架.质控规则模式 === 质控规则模式枚举.单规则 ? 框架.质控规则[0] : null,
          regularArray: 框架.质控规则模式 === 质控规则模式枚举.复合规则 ? 框架.质控规则 : [],
          negativeCalc: 框架.阴性计算方式,
          nagativeValue: 框架.试剂阴性值,
          nagativeConst: 框架.试剂系数
        }
      }
      this._数据 = 数据
      this.初始化表单(数据)
    })
  }

  // 模版表单
  pageForm: FormGroup
  get nagativeMethodString(): string {
    const 阴性方法: 阴性计算方式 = this.pageForm.get('negativeCalc').value
    const 阴性阀值 = this.pageForm.get('nagativeValue').value
    const 阴性常量 = this.pageForm.get('nagativeConst').value
    if (阴性方法 === 阴性计算方式.系数相乘) {
      return `当 nc <= ${阴性阀值}，co = ${阴性常量} * ${阴性阀值} 
       当 nc > ${阴性阀值}，co = ${阴性常量} * nc`
    } else if (阴性方法 === 阴性计算方式.系数相加) {
      return `当 nc <= ${阴性阀值}，co = ${阴性常量} + ${阴性阀值} 
       当 nc > ${阴性阀值}，co = ${阴性常量} + nc`
    } else {
      return `co = ${阴性常量} + nc`
    }
  }

  // 当前页面状态
  private _editMode: 编辑状态枚举 = 编辑状态枚举.新增
  @Input() set editMode(val: 编辑状态枚举) {
    this._editMode = val
    if (this._数据) {
      this.初始化表单(this._数据)
    }
  }
  get editMode() {
    return this._editMode
  }

  private 初始化表单(数据: 页面数据) {
    const fb = this.fb
    let 规则列表 = fb.array([])
    this.strategyGroup.forEach(列表 => {
      let 当前组规则: 质控规则枚举 = null
      数据.regularArray.forEach(选中规则 => {
        if (列表.includes(选中规则)) {
          当前组规则 = 选中规则
        }
      })
      规则列表.push(new FormControl(当前组规则))
    })

    this.pageForm = fb.group({
      regularMode: [数据.regularMode, [Validators.required]],
      regular: [数据.regular, [Validators.required]],
      regularArray: 规则列表,
      // 阴性计算方法
      negativeCalc: [数据.negativeCalc, [Validators.required]],
      // 试剂阴性值
      nagativeValue: [数据.nagativeValue, [Validators.required]],
      // 试剂系数
      nagativeConst: [数据.nagativeConst, [Validators.required]]
    })
    const 是否修改 = this.editMode == 编辑状态枚举.修改
    if (是否修改) {
      for (var control in this.pageForm.controls) {
        this.pageForm.controls[control].disable();
      }
    }
  }

  submitForm() {
    this.创建质控框架配置()
  }

  reset() {
    let 数据: 页面数据 = {
      regularMode: 质控规则模式枚举.单规则,
      regular: 质控规则枚举['13s'],
      regularArray: [质控规则枚举['13s']],
      negativeCalc: 阴性计算方式.系数相乘,
      nagativeValue: 0.05,
      nagativeConst: 2.1
    }
    this.初始化表单(数据)
  }

  async 创建质控框架配置() {
    let { regularMode: 质控规则模式, regular: 质控规则, regularArray: 质控规则列表, negativeCalc: 阴性计算方式, nagativeValue: 试剂阴性值, nagativeConst: 试剂系数 } = this.pageForm.value
    if (质控规则模式 === 质控规则模式枚举.单规则) {
      质控规则 = [质控规则]
    } else if (质控规则模式 === 质控规则模式枚举.复合规则) {
      质控规则 = 质控规则列表
    }
    let 框架配置: 质控框架 = {
      创建时间: new Date(),
      阴性计算方式,
      试剂阴性值,
      试剂系数,
      框架状态: 组合状态枚举.已配置框架,
      试剂批号: this._组合.试剂批号,
      样品批号: this._组合.样品批号,
      质控规则模式,
      质控规则
    }

    await this.框架数据服务.创建质控框架(框架配置)
    await this.组合服务.更新当前试验组合(this._组合)
  }
}
