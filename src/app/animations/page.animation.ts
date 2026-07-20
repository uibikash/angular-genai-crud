import { animate, style, transition, trigger } from '@angular/animations';

export const fadeTransition = trigger('fadeTransition', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(8px)' }),
    animate('220ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('180ms ease-in', style({ opacity: 0, transform: 'translateY(8px)' }))
  ])
]);
