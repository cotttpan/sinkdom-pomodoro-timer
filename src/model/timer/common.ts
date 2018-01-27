import { Observable } from 'rxjs/Observable'
import { map, withLatestFrom } from 'rxjs/operators'
import pad from '@/utils/pad'

//
// ─── TYPES ──────────────────────────────────────────────────────────────────────
//
declare global {
    interface AppState {
        timer: State
    }
}

export interface State {
    title: string
    isTitleEditing: boolean
    left: number
    end: number
    isWorking: boolean
    config: TimerConfig
    achievementCount: number
    currentIntervalType: INTERVAL_TYPE | null
}

export type TimerConfig = {[P in INTERVAL_TYPE]: number} & {
    LONG_BREAK_AFTER: number,
}

//
// ─── CONSTANTS ──────────────────────────────────────────────────────────────────
//
export enum INTERVAL_TYPE {
    WORK_INTERVAL = 'WORK_INTERVAL',
    SHORT_BREAK_INTERVAL = 'SHORT_BREAK_INTERVAL',
    LONG_BREAK_INTERVAL = 'LONG_BREAK_INTERVAL',
}

export const DEFAULT_TIMER_CONFIG: TimerConfig = {
    WORK_INTERVAL: 25 * 60 * 1000,
    SHORT_BREAK_INTERVAL: 5 * 60 * 1000,
    LONG_BREAK_INTERVAL: 15 * 60 * 1000,
    LONG_BREAK_AFTER: 4,
}
//
// ─── SELECTOR ───────────────────────────────────────────────────────────────────
//
export const isTimerWorking = (state: State) => state.isWorking

export const isTimeUp = (state: State) => state.left < 1000


//
// ─── HELPER / UTILS ─────────────────────────────────────────────────────────────────────
//
export const toDisplayTime = (left$: Observable<number>) => {
    const mapPadZero = map((n: number) => pad(Math.max(n, 0), '0', 2))
    const hour$ = left$.pipe(map(left => Math.floor(left / 1000 / 60 / 60) % 60), mapPadZero)
    const min$ = left$.pipe(map(left => Math.floor(left / 1000 / 60) % 60), mapPadZero)
    const sec$ = left$.pipe(map(left => Math.floor(left / 1000) % 60), mapPadZero)
    return { hour$, min$, sec$ }
}

export const calcNextInterval = (state: State) => {
    const type = state.currentIntervalType
    const count = state.achievementCount
    const config = state.config.LONG_BREAK_AFTER

    if (type !== INTERVAL_TYPE.WORK_INTERVAL) {
        return INTERVAL_TYPE.WORK_INTERVAL
    } else if (count !== 0 && count % config === 0) {
        return INTERVAL_TYPE.LONG_BREAK_INTERVAL
    } else {
        return INTERVAL_TYPE.SHORT_BREAK_INTERVAL
    }
}

export const mapNextInterval = (state$: Observable<AppState>) => (action$: Observable<any>) => {
    return action$.pipe(
        withLatestFrom(state$, (_, s) => s.timer),
        map(calcNextInterval),
        map(type => ({ type, timestamp: Date.now() })),
    )
}
