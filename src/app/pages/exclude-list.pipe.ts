import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'excludeList'
})
export class ExcludeListPipe implements PipeTransform {
  transform(list: string[], ...排除列表: string[]): string[] {
    console.log("排除列表", 排除列表)
    let filterlist = list.filter(v => {
      // 只要有一个匹配上就舍弃
      return !排除列表.some(str => {
        return v.toLowerCase().search(str) !== -1
      })
  })
  return filterlist
  }

}
