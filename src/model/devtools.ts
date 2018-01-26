import { Dispatcher, select } from 'flux-helpers'
import { Observable } from 'rxjs/Observable'


export function logger(ev: Dispatcher, state$: Observable<any>) {
    const withDevTools = (
        process.env.NODE_ENV === 'development'
        && typeof window !== 'undefined'
        && (window as any).__REDUX_DEVTOOLS_EXTENSION__
    )
    if (!withDevTools) { return {} }

    const devtools = withDevTools.connect()

    const init$ = state$.first()
        .do(state => devtools.init(state))
        .mapTo(null)

    const send$ = select(ev, '*').withLatestFrom(state$)
        .do(([action, state]) => devtools.send(action, state))
        .mapTo(null)

    return {
        ACTION$: init$.concat(send$),
    }
}