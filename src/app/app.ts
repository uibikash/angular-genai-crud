import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { fadeTransition } from './animations/page.animation';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<div @fadeTransition><router-outlet></router-outlet></div>`,
  animations: [fadeTransition]
})
export class AppComponent {}