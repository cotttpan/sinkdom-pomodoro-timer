import { Observable } from 'rxjs/Observable'
import { div, h1, input, form, button, span } from '@cotto/sinkdom'
import TIMER_ACTION from '@/action/timer'

export interface Props {
    title$: Observable<string>
    isEditing$: Observable<boolean>
    time: { min$: Observable<string>, sec$: Observable<string> }
    isWorking$: Observable<boolean>
}

export default function TimerView(props: Props) {
    return (
        div({ class: 'timer' }, [
            /* timer title */
            div({}, [
                Observable.merge(
                    props.isEditing$.filter(x => x === false).mapTo(
                        h1({ dblclick: TIMER_ACTION.TITLE_SELECT_FOR_EIDT }, props.title$),
                    ),
                    props.isEditing$.filter(x => x === true).mapTo(
                        form({ on: { submit: TIMER_ACTION.TIELE_SUBSMIT } }, [
                            input({
                                type: 'text',
                                placeholder: 'Enter task name...',
                                autofocus: true,
                                on: { input: TIMER_ACTION.TITLE_INPUT },
                                value: props.title$,
                            }),
                        ]),
                    ),
                ),
            ]),
            /* timer time */
            // TODO: SVG UI
            div({}, [
                span(props.time.min$),
                span(' : '),
                span(props.time.sec$),
            ]),

            /* timer operation buttons */
            div([
                div({ class: 'btn-group' }, [
                    button({ class: 'btn', type: 'button', on: { click: TIMER_ACTION.START } }, 'start'),
                    button({ class: 'btn', type: 'button', on: { click: TIMER_ACTION.PAUSE } }, 'pause'),
                    button({ class: 'btn', type: 'button', on: { click: TIMER_ACTION.RESUME } }, 'resume'),
                    button({ class: 'btn', type: 'button', on: { click: TIMER_ACTION.SKIP } }, 'skip'),
                ]),
            ]),
        ])
    )
}