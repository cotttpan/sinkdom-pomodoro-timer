import { Observable } from 'rxjs/Observable'
import { of } from 'rxjs/observable/of'
import { mapTo, pluck, map, filter, debounceTime, tap } from 'rxjs/operators'
import { EventSource, select } from 'flux-helpers'
import { isString } from '@cotto/utils.ts'
import { State as S } from './common'
import TIMER from '@/action/timer'

export const initialState = (_: EventSource, __: Observable<AppState>) => {
    return of((_s: S): S => ({
        content: '',
        isEditing: false,
    }))
}

export const onTitleSelect = (ev: EventSource) => {
    return select(ev, TIMER.TITLE_SELECT_FOR_EIDT).pipe(
        mapTo((s: S): S => ({ ...s, isEditing: true })),
    )
}

export const onTitleInput = (ev: EventSource) => {
    return select(ev, TIMER.TITLE_INPUT).pipe(
        debounceTime(50),
        pluck('payload', 'target', 'value'),
        filter(isString),
        map(content => (s: S): S => ({ ...s, content, isEditing: true })),
    )
}

export const onTitleSubsmit = (ev: EventSource) => {
    return select(ev, TIMER.TIELE_SUBSMIT).pipe(
        tap(action => action.payload.preventDefault()),
        mapTo((s: S): S => ({ ...s, isEditing: false })),
    )
}
