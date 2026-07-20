import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class EmailAvailabilityValidator {
  validateEmailAvailability(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      const value = (control.value || '').toString().trim();

      if (!value) {
        return of(null);
      }

      return new Observable<{ [key: string]: any } | null>(observer => {
        const timer = setTimeout(() => {
          const isTaken = /@example\.com$/i.test(value) && !value.includes('new');
          observer.next(isTaken ? { emailTaken: true } : null);
          observer.complete();
        }, 450);

        return () => clearTimeout(timer);
      }).pipe(
        debounceTime(100),
        distinctUntilChanged(),
        map(result => result)
      );
    };
  }
}
