import { of } from 'rxjs/observable/of'
import { map, mapTo, pluck, filter, debounceTime, tap } from 'rxjs/operators'
import { select, EventSource } from 'flux-helpers'
import TIMER_ACTION from '@/action/timer'
import { isString } from '@cotto/utils.ts'
import { State as S, DEFAULT_TIMER_CONFIG, INTERVAL_TYPE } from './common'

export const initialStateReducer = (_: EventSource) => {
    return of((__: S): S => ({
        title: '',
        isTitleEditing: false,
        end: 0,
        left: 0,
        isWorking: false,
        config: DEFAULT_TIMER_CONFIG,
        achievementCount: 0,
        currentIntervalType: null,
    }))
}

export const onTitleSelectReducer = (ev: EventSource) => {
    return select(ev, TIMER_ACTION.TITLE_SELECT_FOR_EIDT).pipe(
        mapTo((s: S): S => ({ ...s, isTitleEditing: true })),
    )
}

export const onTitleInputReducer = (ev: EventSource) => {
    return select(ev, TIMER_ACTION.TITLE_INPUT).pipe(
        debounceTime(50),
        pluck('payload', 'target', 'value'),
        filter(isString),
        map(title => (s: S): S => ({ ...s, title, isTitleEditing: true })),
    )
}

export const onTitleSubsmitReducer = (ev: EventSource) => {
    return select(ev, TIMER_ACTION.TIELE_SUBSMIT).pipe(
        tap(action => action.payload.preventDefault()),
        mapTo((s: S): S => ({ ...s, isTitleEditing: false })),
    )
}

export const onStartReducer = (ev: EventSource) => {
    const patch = (payload: { type: INTERVAL_TYPE; timestamp: number }) => (state: S): S => {
        const type = payload.type
        const interval = state.config[type]
        const end = payload.timestamp + interval
        return { ...state, end, left: interval, isWorking: true, currentIntervalType: type }
    }
    return select(ev, TIMER_ACTION.INTERVAL_START).pipe(
        map(x => x.payload),
        map(patch),
    )
}

export const onTickReducer = (ev: EventSource) => {
    const patch = (now: number) => (state: S): S => {
        const left = Math.max(0, state.end - now)
        return { ...state, left, isWorking: true }
    }
    return select(ev, TIMER_ACTION.TICK).pipe(
        map(action => action.payload),
        map(patch),
    )
}

export const onPauseReducer = (ev: EventSource) => {
    return select(ev, TIMER_ACTION.PAUSE).pipe(
        mapTo((state: S): S => ({ ...state, isWorking: false })),
    )
}

export const onResumeReducer = (ev: EventSource) => {
    const patch = (now: number) => (state: S): S => {
        const end = now + state.left
        const left = Math.max(0, end - now)
        return { ...state, end, left, isWorking: true }
    }
    return select(ev, TIMER_ACTION.RESUME).pipe(
        map(Date.now),
        map(patch),
    )
}

export const onSkipReducer = (ev: EventSource) => {
    const patch = (state: S): S => ({ ...state, left: 0, isWorking: false, currentIntervalType: null })
    return select(ev, TIMER_ACTION.SKIP).pipe(
        mapTo(patch),
    )
}

export const onTimeUpReducer = (ev: EventSource) => {
    const patch = (state: S): S => ({
        ...state,
        left: 0,
        isWorking: false,
        achievementCount: state.achievementCount + 1,
        currentIntervalType: null,
    })
    return select(ev, TIMER_ACTION.INTERVAL_END).pipe(
        mapTo(patch),
    )
}

