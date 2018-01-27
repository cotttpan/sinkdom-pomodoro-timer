import { Observable } from 'rxjs/Observable'
import { map, shareReplay } from 'rxjs/operators'
import { toDisplayTime } from '@/model/timer/index'
import { div } from '@cotto/sinkdom'
import CountDownTimer from './timer'

export default function App(state$: Observable<AppState>) {
    const timer$ = state$.pipe(map(s => s.timer), shareReplay(1))
    const title$ = timer$.pipe(map(timer => timer.title), shareReplay(1))
    const isEditing$ = timer$.pipe(map(timer => timer.isTitleEditing), shareReplay(1))
    const time = toDisplayTime(timer$.pipe(map(timer => timer.left), shareReplay(1)))
    const isWorking$ = timer$.pipe(map(timer => timer.isWorking), shareReplay(1))

    return div([
        CountDownTimer({ title$, isEditing$, time, isWorking$ }),
    ])
}