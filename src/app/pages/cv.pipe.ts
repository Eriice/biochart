import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cv'
})
export class CvPipe implements PipeTransform {

  transform(value: number) {
    return (value * 100).toFixed(2) + '%'
  }
}
