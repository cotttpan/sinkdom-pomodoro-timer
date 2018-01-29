import { Observable } from 'rxjs/Observable'
import { debounceTime, distinctUntilChanged, observeOn } from 'rxjs/operators'
import { subscribeOn } from 'rxjs/operators/subscribeOn' // https://github.com/ReactiveX/rxjs/issues/2900
import { animationFrame } from 'rxjs/scheduler/animationFrame'
import { mount } from '@cotto/sinkdom'
import { flux, isAction } from 'flux-helpers'

//
// ─── MODEL ──────────────────────────────────────────────────────────────────────
//
import timer from '@/model/timer'
import timerTitle from '@/model/timer-title'
import logger from '@/model/devtools/devtools'

const models = [timer, timerTitle, logger]
const store = flux(models, { wildcard: true })

//
// ─── VIEW ───────────────────────────────────────────────────────────────────────
//
import App from '@/view/app'
const view = App(store.state$.pipe(debounceTime(1)))

//
// ─── RENDER ─────────────────────────────────────────────────────────────────────
//
/* mount options */
const handleEventWith = (listener: (ev: Event) => any) => (ev: Event) => {
    const action = listener(ev)
    isAction(action) && store.dispatch(action)
    return action
}
const proxy = (next$: Observable<any>) => next$.pipe(
    distinctUntilChanged(),
    observeOn(animationFrame),
    subscribeOn(animationFrame),
)

/* mount */
mount(view, document.body, { handleEventWith, proxy })
