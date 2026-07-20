import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusLabel',
  standalone: true,
  pure: true
})
export class StatusPipe implements PipeTransform {
  transform(value: boolean): string {
    return value ? 'Active' : 'Inactive';
  }
}
