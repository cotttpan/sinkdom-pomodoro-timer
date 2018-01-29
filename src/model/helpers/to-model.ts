import { Observable } from 'rxjs/Observable'
import { merge } from 'rxjs/observable/merge'
import { map } from 'rxjs/operators'
import { EventSource, Model, Action, Reducer as ReduceFn } from 'flux-helpers'

interface Reducer<T, K extends keyof T> {
    (ev: EventSource, state$: Observable<T>): Observable<(s: T[K]) => T[K]>
}
interface Epic<T> {
    (ev: EventSource, state$: Observable<T>): Observable<Action>
}

export default function toModel<T, K extends keyof T>(
    scope: K,
    src: { reducers?: Reducer<T, K>[], epics?: Epic<T>[] },
): Model<T> {
    const reducers = src.reducers || []
    const epics = src.epics || []
    const toReducer = (fn: ReduceFn<T[K]>) => (state: T): T => ({ ...state as any, [scope]: fn(state[scope]) })

    return function model(ev: EventSource, state$: Observable<T>) {
        const boundReducers = reducers.map(fn => fn(ev, state$))
        const boundEpics = epics.map(fn => fn(ev, state$))
        return {
            REDUCER$: reducers.length >= 1 ? merge(...boundReducers).pipe(map(toReducer)) : undefined,
            ACTION$: epics.length >= 1 ? merge(...boundEpics) : undefined,
        }
    }
}
