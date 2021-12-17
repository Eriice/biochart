import { Pipe, PipeTransform } from '@angular/core'; //引入PipeTransform是为了继承transform方法

@Pipe({ name: 'filterList' })
export class FilterListPipe implements PipeTransform {
    transform(list: string[], filterString: string): string[] {
      let filterlist = list.filter(v => {
        return v.toLowerCase().search(filterString) !== -1
    })
    console.log("filterlist", filterlist)
    return filterlist
    }
}