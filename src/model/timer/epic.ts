import { Observable } from 'rxjs/Observable'
import { timer } from 'rxjs/observable/timer'
import { map, filter, withLatestFrom, shareReplay, concatMap, takeUntil } from 'rxjs/operators'
import { select, EventSource } from 'flux-helpers'
import TIMER_ACTION from '@/action/timer'
import { mapNextInterval, isTimeUp } from './common'

export const intrvalStartEpic = (ev: EventSource, state$: Observable<AppState>) => {
    return select(ev, TIMER_ACTION.START).pipe(
        mapNextInterval(state$),
        map(x => TIMER_ACTION.INTERVAL_START(x)),
        shareReplay(1),
    )
}

export const tickEpic = (ev: EventSource, _: Observable<AppState>) => {
    const stop$ = select(ev, [TIMER_ACTION.PAUSE, TIMER_ACTION.SKIP, TIMER_ACTION.INTERVAL_END])
    const runTimer = () => timer(0, 333).pipe(takeUntil(stop$))
    const tickAction = () => TIMER_ACTION.TICK(Date.now())

    return select(ev, [TIMER_ACTION.START, TIMER_ACTION.RESUME]).pipe(
        concatMap(runTimer),
        map(tickAction),
        shareReplay(1),
    )
}

export const intervalEndEpic = (ev: EventSource, state$: Observable<AppState>) => {
    const endAction = () => TIMER_ACTION.INTERVAL_END(null)

    return select(ev, TIMER_ACTION.TICK).pipe(
        withLatestFrom(state$, (_, s) => s.timer),
        filter(isTimeUp),
        map(endAction),
        shareReplay(1),
    )
}

