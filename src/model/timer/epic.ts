import { Observable } from 'rxjs/Observable'
import { timer } from 'rxjs/observable/timer'
import { fromEvent } from 'rxjs/observable/fromEvent'
import { map, filter, withLatestFrom, switchMap, takeUntil, take, tap, mapTo } from 'rxjs/operators'
import { select, EventSource } from 'flux-helpers'
import TIMER from '@/action/timer'
import { INTERVAL_TYPE } from '@/model/timer'

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


/**
 * timeup時にnotificationを発行する
 * notification clickから次のintervalをstartさせたいがAPIの都合上、
 * browserにforcsしてしまうため、next startの発行はしないでいる。
 *
 * TODO: testのためにNotificationAPIを外部APIとして実装してをDIする
 */
export const notificationEpic = (ev: EventSource, state$: Observable<AppState>, api = Notification) => {
    const toDisplayText = (type: INTERVAL_TYPE) => {
        const text = type.toLowerCase().replace(/_|interval/g, ' ')
        if (text.includes('break')) {
            return `Time to take a ${text}`
        } else {
            return `Time to ${text}`
        }
    }

    const sendNotification = (type: INTERVAL_TYPE) => {
        return new api(`Pomodoro timer`, { body: toDisplayText(type) })
    }

    const closeNotification = (notification: Notification) => {
        return fromEvent<NotificationEvent>(notification, 'click').pipe(
            tap(() => notification.close()),
            takeUntil(select(ev, [TIMER.SKIP, TIMER.START]).pipe(take(1))),
        )
    }

    return select(ev, TIMER.TIMEUP).pipe(
        switchMap(() => select(ev, TIMER.INTERVAL_END).pipe(take(1))),
        withLatestFrom(state$, (_, s) => s.timer.currentIntervalType!),
        map(sendNotification),
        switchMap(closeNotification),
        mapTo(null),
    )
}