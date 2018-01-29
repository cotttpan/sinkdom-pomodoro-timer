import { Observable } from 'rxjs/Observable'
import { timer } from 'rxjs/observable/timer'
import { map, filter, withLatestFrom, switchMap, takeUntil } from 'rxjs/operators'
import { select, EventSource } from 'flux-helpers'
import TIMER from '@/action/timer'

export const intervalStartEpic = (ev: EventSource, state$: Observable<AppState>) => {
    return select(ev, TIMER.START).pipe(
        withLatestFrom(state$, (_, s) => s),
        filter(s => !s.timer.isWorking && !s.timer.isPausing),
        map(() => TIMER.INTERVAL_START(Date.now())),
    )
}

export const intervalEndEpic = (ev: EventSource) => {
    return select(ev, [TIMER.SKIP, TIMER.TIMEUP]).pipe(
        map(() => TIMER.INTERVAL_END(Date.now())),
    )
}

export const tickEpic = (ev: EventSource, _: Observable<AppState>) => {
    const stop$ = select(ev, [TIMER.PAUSE, TIMER.SKIP, TIMER.TIMEUP])
    return select(ev, [TIMER.INTERVAL_START, TIMER.RESUME]).pipe(
        switchMap(() => timer(100, 1000).pipe(takeUntil(stop$))),
        map(() => TIMER.TICK(Date.now())),
    )
}

export const timeupEpic = (ev: EventSource, state$: Observable<AppState>) => {
    return select(ev, TIMER.TICK).pipe(
        withLatestFrom(state$, (_, s) => s.timer),
        filter(state => state.left < 1000),
        map(() => TIMER.TIMEUP(Date.now())),
    )
}