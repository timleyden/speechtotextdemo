import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'sortBy'
})
export class SortByPipe implements PipeTransform {

  transform(value: any[], order = '', column: string = ''): any[] {
    if (!value || order === '' || !order) { return value; } // no array
    if (!column || column === '') { return this.orderBy(value,value.keys[0],order); } // sort 1d array
    if (value.length <= 1) { return value; } // array with only one item
    return this.orderBy(value, column, order);
  }
  private orderBy(value: any[], column, order:string) {

    const isAsc:boolean = (order === 'asc');
    value.sort((v1, v2) => {
      if (v1[column] > v2[column]) {
        if(isAsc){
          return -1
        }else{
          return 1
        }
      } else if (v1[column] < v2[column]) {
        if(isAsc){
          return 1
        }else{
          return -1
        }
      } else {
        return 0;
      }
    });
    return value;

  }

}

