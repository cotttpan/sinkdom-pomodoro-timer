import { Observable } from 'rxjs/Observable'
import { async } from 'rxjs/scheduler/async'
import { mount } from '@cotto/sinkdom'
import { flux } from 'flux-helpers'
import isAction from '@/utils/is-action'
import { model as Timer } from '@/model/timer'
import App from '@/view/app'

/* boot flux */
const models = [Timer]
const store = flux(models, { wildcard: true })
const tree = App(store.state$)

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
mount(tree, document.body, { handleEventWith, proxy })
