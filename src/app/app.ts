import { Component } from '@angular/core';
import { ItemManagerComponent } from './components/item-manager/item-manager';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ItemManagerComponent],
  template: `<app-item-manager></app-item-manager>`
})
export class AppComponent {}