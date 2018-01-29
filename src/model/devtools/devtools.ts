import { EventSource, select } from 'flux-helpers'
import { Observable } from 'rxjs/Observable'
import { concat } from 'rxjs/observable/concat'
import { first, withLatestFrom, tap, mapTo } from 'rxjs/operators'

export default function logger(ev: EventSource, state$: Observable<any>) {
    const withDevTools = (
        process.env.NODE_ENV === 'development'
        && typeof window !== 'undefined'
        && (window as any).__REDUX_DEVTOOLS_EXTENSION__
    )
    if (!withDevTools) { return {} }

    const devtools = withDevTools.connect()

    const init$ = state$.pipe(
        first(),
        tap(state => devtools.init(state)),
        mapTo(null),
    )

    const send$ = select(ev, '*').pipe(
        withLatestFrom(state$),
        tap(([action, state]) => devtools.send(action, state)),
        mapTo(null),
    )

    return { ACTION$: concat(init$, send$) }
}