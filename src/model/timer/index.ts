import { values } from '@cotto/utils.ts'
import { Observable } from 'rxjs/Observable'
import { merge } from 'rxjs/observable/merge'
import { map } from 'rxjs/operators'
import { EventSource, Reducer } from 'flux-helpers'
import { State } from './common'
import * as _epics from './epic'
import * as _reducers from './reducer'

export * from './common'

export function timer(ev: EventSource, state$: Observable<AppState>) {
    const apply = <T>(fn: (ev: EventSource, state$: Observable<AppState>) => T) => fn(ev, state$)
    const mapReucer = map((fn: Reducer<State>) => (state: AppState) => ({ ...state, timer: fn(state.timer) }))
    const epics$ = values(_epics).map(apply)
    const reducers$ = values(_reducers).map(apply)
    const ACTION$ = merge(...epics$)
    const REDUCER$ = merge(...reducers$).pipe(mapReucer)
    return { ACTION$, REDUCER$ }
}
