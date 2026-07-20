import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, Subscription, interval } from 'rxjs';
import { switchMap, tap, catchError, retryWhen, delayWhen, takeUntil, shareReplay } from 'rxjs/operators';

export interface RealtimeEvent {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private readonly eventsSubject = new Subject<RealtimeEvent>();
  private readonly connectionStateSubject = new Subject<string>();
  private readonly apiUrl = 'http://localhost:3000/events';
  private streamSubscription?: Subscription;
  private readonly stopStream$ = new Subject<void>();

  events$: Observable<RealtimeEvent> = this.eventsSubject.asObservable().pipe(shareReplay(1));
  connectionState$: Observable<string> = this.connectionStateSubject.asObservable().pipe(shareReplay(1));

  constructor(private http: HttpClient) {}

  connect() {
    if (this.streamSubscription) {
      return;
    }

    this.connectionStateSubject.next('connecting');

    this.streamSubscription = interval(4000)
      .pipe(
        takeUntil(this.stopStream$),
        switchMap(() => this.http.get<RealtimeEvent[]>(this.apiUrl)),
        retryWhen(errors => errors.pipe(delayWhen(() => interval(1500)))),
        catchError(() => {
          this.connectionStateSubject.next('offline');
          return [] as RealtimeEvent[];
        }),
        tap(events => {
          const streamEvents = Array.isArray(events) ? events : [events];
          if (streamEvents.length) {
            const latest = streamEvents[streamEvents.length - 1];
            this.eventsSubject.next(latest);
            this.connectionStateSubject.next('connected');
          }
        })
      )
      .subscribe();
  }

  disconnect() {
    this.stopStream$.next();
    this.stopStream$.complete();
    this.streamSubscription?.unsubscribe();
    this.streamSubscription = undefined;
    this.connectionStateSubject.next('disconnected');
  }

  addActivity(message: string, type: RealtimeEvent['type'] = 'info') {
    const payload = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };

    this.http.post<RealtimeEvent>(this.apiUrl, payload).subscribe();
  }
}
