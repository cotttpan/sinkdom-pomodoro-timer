import { Observable } from 'rxjs/Observable'
import { concat } from 'rxjs/observable/concat'
import { take, debounceTime, distinctUntilChanged, observeOn } from 'rxjs/operators'
import { animationFrame } from 'rxjs/scheduler/animationFrame'
import { mount } from '@cotto/sinkdom'
import { flux, isAction } from 'flux-helpers'
import App from '@/view/app'
import { requestNotificationPermission } from '@/utils/notification'

/* models */
import timer from '@/model/timer'
import timerTitle from '@/model/timer-title'
import logger from '@/model/devtools/devtools'

/* store */
const models = [timer, timerTitle, logger]
const store = flux(models, { wildcard: true })
const state$ = concat(
    store.state$.pipe(take(1)), // 最初の1回は同期的に取得する
    store.state$.pipe(debounceTime(1)), // それ以降は同期的更新通知を1つにまとめるためにdebounceする
)

/* mount options */
const handleEventWith = (listener: (ev: Event) => any) => (ev: Event) => {
    const action = listener(ev)
    isAction(action) && store.dispatch(action)
    return action
}
const proxy = (next$: Observable<any>) => next$.pipe(
    distinctUntilChanged(),
    observeOn(animationFrame),
)

/* mount */
mount(App(state$), document.body, { handleEventWith, proxy })

/* notification */
requestNotificationPermission()