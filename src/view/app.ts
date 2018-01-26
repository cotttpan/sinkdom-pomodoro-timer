import { Observable } from 'rxjs/Observable'
import { toDisplayTime } from '@/model/timer'
import { div } from '@cotto/sinkdom'
import CountDownTimer from './timer'

export default function App(state$: Observable<AppState>) {
    const timer$ = state$.map(s => s.timer).shareReplay(1)
    /* CountDownTimerProps */
    const title$ = timer$.map(x => x.title).shareReplay(1)
    const isEditing$ = timer$.map(x => x.isTitleEditing).shareReplay(1)
    const time = toDisplayTime(timer$.map(x => x.left))
    const isWorking$ = timer$.map(x => x.isWorking).shareReplay(1)

    return div([
        CountDownTimer({ title$, isEditing$, time, isWorking$ }),
    ])
}