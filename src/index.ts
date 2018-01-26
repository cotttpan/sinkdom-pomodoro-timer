import { Observable } from 'rxjs/Observable'
import { async } from 'rxjs/scheduler/async'
import { mount } from '@cotto/sinkdom'
import { flux } from 'flux-helpers'
import isAction from '@/utils/is-action'
import { model as timer } from '@/model/timer'
import { logger } from '@/model/devtools'
import App from '@/view/app'

/* boot flux */
const models = [timer, logger]
const store = flux(models, { wildcard: true })
const view = App(store.state$.debounceTime(1))

/* mount options */
const handleEventWith = (listener: (ev: Event) => any) => (ev: Event) => {
    const action = listener(ev)
    isAction(action) && store.dispatch(action)
    return action
}
const proxy = (next$: Observable<any>) => next$
    .distinctUntilChanged()
    .observeOn(async)
    .subscribeOn(async)

/* mount */
mount(view, document.body, { handleEventWith, proxy })
