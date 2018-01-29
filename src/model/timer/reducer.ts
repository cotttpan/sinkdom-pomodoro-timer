import { of } from 'rxjs/observable/of'
import { map, mapTo, pluck, filter, debounceTime, tap } from 'rxjs/operators'
import { select, EventSource } from 'flux-helpers'
import { isString } from '@cotto/utils.ts'
import { State as S, DEFAULT_TIMER_CONFIG, calcNextInterval } from './common'
import TIMER from '@/action/timer'

export const initialStateReducer = (_: EventSource) => {
    return of((__: S): S => ({
        title: '',
        isTitleEditing: false,
        end: 0,
        left: DEFAULT_TIMER_CONFIG.WORK_INTERVAL,
        isWorking: false,
        config: DEFAULT_TIMER_CONFIG,
        achievementCount: 0,
        currentIntervalType: null,
    }))
}

//
// ─── TITLE ──────────────────────────────────────────────────────────────────────
//
export const onTitleSelect = (ev: EventSource) => {
    return select(ev, TIMER.TITLE_SELECT_FOR_EIDT).pipe(
        mapTo((s: S): S => ({ ...s, isTitleEditing: true })),
    )
}

export const onTitleInput = (ev: EventSource) => {
    return select(ev, TIMER.TITLE_INPUT).pipe(
        debounceTime(50),
        pluck('payload', 'target', 'value'),
        filter(isString),
        map(title => (s: S): S => ({ ...s, title, isTitleEditing: true })),
    )
}

export const onTitleSubsmit = (ev: EventSource) => {
    return select(ev, TIMER.TIELE_SUBSMIT).pipe(
        tap(action => action.payload.preventDefault()),
        mapTo((s: S): S => ({ ...s, isTitleEditing: false })),
    )
}

//
// ─── TIMER ──────────────────────────────────────────────────────────────────────
//

/**
 * timerを初期化する
 * intervalEnd時にも初期化するため、currentIntervalTypeはnullの場合のみ更新する
 */
export const onIntervalStart = (ev: EventSource) => {
    const patch = (now: number) => (state: S): S => {
        const type = state.currentIntervalType || calcNextInterval(state)
        const interval = state.config[type]
        const end = now + interval
        return { ...state, end, left: interval, isWorking: true, currentIntervalType: type }
    }
    return select(ev, TIMER.INTERVAL_START).pipe(
        map(action => patch(action.payload)),
    )
}
/**
 * timerを初期化処理
 * 次のinterval typeで初期化処理をする
 */
export const onIntervalEnd = (ev: EventSource) => {
    const patch = (now: number) => (state: S): S => {
        const type = calcNextInterval(state)
        const interval = state.config[type]
        const end = now + interval
        return { ...state, end, left: interval, isWorking: false, currentIntervalType: type }
    }
    return select(ev, TIMER.INTERVAL_END).pipe(
        map(aciton => patch(aciton.payload)),
    )
}

export const onTick = (ev: EventSource) => {
    const patch = (now: number) => (state: S): S => {
        const left = Math.max(0, state.end - now)
        return { ...state, left, isWorking: true }
    }
    return select(ev, TIMER.TICK).pipe(
        map(action => patch(action.payload)),
    )
}

export const onResume = (ev: EventSource) => {
    const patch = (now: number) => (state: S): S => {
        const end = now + state.left
        const left = Math.max(0, end - now)
        return { ...state, end, left, isWorking: true }
    }
    return select(ev, TIMER.RESUME).pipe(
        map(() => patch(Date.now())),
    )
}

export const onTimeUp = (ev: EventSource) => {
    return select(ev, TIMER.TIMEUP).pipe(
        mapTo((state: S): S => {
            const count = state.achievementCount + 1
            return { ...state, isWorking: false, achievementCount: count }
        }),
    )
}

