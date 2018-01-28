import { Observable } from 'rxjs/Observable'
import { map, shareReplay } from 'rxjs/operators'
import { toDisplayTime } from '@/model/timer/index'
import { div } from '@cotto/sinkdom'
import CountDownTimer from './timer'

export default function App(state$: Observable<AppState>) {
    const title$ = state$.pipe(map(s => s.timer.title), shareReplay(1))
    const isEditing$ = state$.pipe(map(s => s.timer.isTitleEditing), shareReplay(1))
    const time = toDisplayTime(state$.pipe(map(s => s.timer.left), shareReplay(1)))
    const isWorking$ = state$.pipe(map(s => s.timer.isWorking), shareReplay(1))

    return div([
        CountDownTimer({ title$, isEditing$, time, isWorking$ }),
    ])
}