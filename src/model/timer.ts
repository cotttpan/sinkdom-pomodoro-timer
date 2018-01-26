import { Observable } from 'rxjs/Observable'
import { select, Dispatcher } from 'flux-helpers'
import TIMER_ACTION from '@/action/timer'
import pad from '@/utils/pad'

//
// ─── TYPES ──────────────────────────────────────────────────────────────────────
//
declare global {
    interface AppState {
        timer: State
    }
}

type S = State
interface State {
    title: string
    isTitleEditing: boolean
    left: number
    end: number
    isWorking: boolean
    config: TimerConfig
    achievementCount: number
    currentIntervalType: INTERVAL_TYPE | null
}

export enum INTERVAL_TYPE {
    WORK_INTERVAL = 'WORK_INTERVAL',
    SHORT_BREAK_INTERVAL = 'SHORT_BREAK_INTERVAL',
    LONG_BREAK_INTERVAL = 'LONG_BREAK_INTERVAL',
}


export type TimerConfig = {[P in INTERVAL_TYPE]: number} & {
    LONG_BREAK_AFTER: number,
}
//
// ─── CONSTANTS ──────────────────────────────────────────────────────────────────
//
export const DEFAULT_TIMER_CONFIG: TimerConfig = {
    WORK_INTERVAL: 25 * 60 * 1000,
    SHORT_BREAK_INTERVAL: 5 * 60 * 1000,
    LONG_BREAK_INTERVAL: 15 * 60 * 1000,
    LONG_BREAK_AFTER: 4,
}

//
// ─── REACTION ───────────────────────────────────────────────────────────────────
//
export function reaction(ev: Dispatcher, state$: Observable<AppState>) {
    const intervalStart$ = select(ev, TIMER_ACTION.START)
        .let(mapNextInterval(state$))
        .map(x => TIMER_ACTION.INTERVAL_START(x))
        .shareReplay(1)

    const stop$ = select(ev, TIMER_ACTION.PAUSE, TIMER_ACTION.SKIP)

    const tick$ = select(ev, TIMER_ACTION.START, TIMER_ACTION.RESUME, TIMER_ACTION.INTERVAL_END)
        .concatMap(() => Observable.timer(0, 333).takeUntil(stop$))
        .map(() => TIMER_ACTION.TICK(Date.now()))
        .shareReplay(1)

    const intervalEnd$ = select(ev, TIMER_ACTION.TICK)
        .withLatestFrom(state$, (_, s) => s.timer)
        .filter(isTimeUp)
        .map(() => TIMER_ACTION.INTERVAL_END(null))

    return {
        ACTION$: Observable.merge(intervalStart$, tick$, intervalEnd$),
    }
}

//
// ─── REDUCER ────────────────────────────────────────────────────────────────────
//
export function reducer(ev: Dispatcher, _: Observable<AppState>) {
    const onInit = Observable.of((__: S): S => {
        const title = ''
        const isTitleEditing = false
        const end = 0
        const left = 0
        const isWorking = false
        const config = DEFAULT_TIMER_CONFIG
        const achievementCount = 0
        const currentIntervalType = null
        return { title, isTitleEditing, end, left, isWorking, config, achievementCount, currentIntervalType }
    })

    //
    // ─── TITLE ──────────────────────────────────────────────────────────────────────
    //
    const onTitleSelect$ = select(ev, TIMER_ACTION.TITLE_SELECT_FOR_EIDT)
        .mapTo((state: S): S => ({ ...state, isTitleEditing: true }))

    const onTitleInput$ = select(ev, TIMER_ACTION.TITLE_INPUT)
        .debounceTime(200)
        .pluck<any, string>('target', 'value')
        .map(title => (state: S): S => ({ ...state, title, isTitleEditing: true }))

    const onTitleSubmit$ = select(ev, TIMER_ACTION.TIELE_SUBSMIT)
        .mapTo((state: S): S => ({ ...state, isTitleEditing: false }))

    //
    // ─── TIMER ──────────────────────────────────────────────────────────────────────
    //
    const onStart$ = select(ev, TIMER_ACTION.INTERVAL_START)
        .map(x => x.payload)
        .map(payload => (state: S): S => {
            const interval = state.config[payload.type]
            const end = payload.timestamp + interval
            const left = interval
            const isWorking = false
            const currentIntervalType = payload.type || null
            return { ...state, end, left, isWorking, currentIntervalType }
        })

    const onTick$ = select(ev, TIMER_ACTION.TICK)
        .map(x => x.payload)
        .map(now => (state: S): S => ({ ...state, left: Math.max(state.end - now, 0), isWorking: false }))

    const onPause$ = select(ev, TIMER_ACTION.PAUSE)
        .mapTo((state: S): S => ({ ...state, isWorking: false }))

    const onResume$ = select(ev, TIMER_ACTION.RESUME)
        .map(Date.now)
        .map(now => (state: S): S => {
            const end = now + state.left
            return { ...state, end, left: Math.max(end - now, 0), isWorking: false }
        })

    const onSkip$ = select(ev, TIMER_ACTION.SKIP)
        .mapTo((state: S): S => ({ ...state, left: 0, isWorking: false, currentIntervalType: null }))

    const onTimeUp$ = select(ev, TIMER_ACTION.INTERVAL_END)
        .mapTo((state: S): S => ({
            ...state,
            left: 0,
            isWorking: false,
            achievementCount: state.achievementCount + 1,
            currentIntervalType: null,
        }))

    return {
        REDUCER$: Observable.merge(
            onInit,
            onTitleInput$,
            onTitleSelect$,
            onTitleSubmit$,
            onStart$,
            onTick$,
            onPause$,
            onResume$,
            onSkip$,
            onTimeUp$,
        ).map(fn => (s: AppState) => ({ ...s, timer: fn(s.timer) })),
    }
}

export function model(ev: Dispatcher, state$: Observable<AppState>) {
    return {
        ...reducer(ev, state$),
        ...reaction(ev, state$),
    }
}

//
// ─── SELECTOR ───────────────────────────────────────────────────────────────────
//
export function isTimerWorking(state: S) {
    return state.isWorking
}

export function isTimeUp(state: S) {
    return state.left < 1000
}

const padZero = (n: number) => pad(Math.max(n, 0), '0', 2)

export function toDisplayTime(left$: Observable<number>) {
    const hour$ = left$.map(left => Math.floor(left / 1000 / 60 / 60) % 60).map(padZero)
    const min$ = left$.map(left => Math.floor(left / 1000 / 60) % 60).map(padZero)
    const sec$ = left$.map(left => Math.floor(left / 1000) % 60).map(padZero)
    return { hour$, min$, sec$ }
}

//
// ─── HELPER ─────────────────────────────────────────────────────────────────────
//
export function calcNextInterval(state: S) {
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

export function mapNextInterval(state$: Observable<AppState>) {
    return (action$: Observable<any>) => action$
        .withLatestFrom(state$, (_, s) => s.timer)
        .map(calcNextInterval)
        .map(type => ({ type, timestamp: Date.now() }))
}
