import { Observable } from 'rxjs/Observable'
import { merge } from 'rxjs/observable/merge'
import { zip } from 'rxjs/observable/zip'
import { map, filter, shareReplay, distinctUntilChanged, startWith } from 'rxjs/operators'
import { isEmpty, isFalsy, isTruthy } from '@cotto/utils.ts'
import { div, h1, input, form, button, span } from '@cotto/sinkdom'
import TIMER_ACTION from '@/action/timer'

export interface Props {
    title$: Observable<string>
    isEditing$: Observable<boolean>
    time: { min$: Observable<string>, sec$: Observable<string> }
    isWorking$: Observable<boolean>
    isPausing$: Observable<boolean>
}

const focus = (el: HTMLInputElement) => el.focus()

const isEmpty_ = map(isEmpty)
const isFalsy_ = filter(isFalsy)
const isTruthy_ = filter(isTruthy)
const canDisplay = (bool$: Observable<boolean>) => bool$.pipe(map(cond => cond ? 'inline' : 'none'))

const or = (a: boolean, b: boolean) => a || b

export default function TimerView(props: Props) {
    const isTitleEmpty$ = props.title$.pipe(isEmpty_, shareReplay(1))
    const isEditing$ = props.isEditing$
    const shuoldShowTitleForm$ = zip(isTitleEmpty$, isEditing$, or).pipe(startWith(true), distinctUntilChanged(), shareReplay(1))
    const canBtnShowing = zip(props.isWorking$, props.isPausing$).pipe(shareReplay(1))
    const canStartBtnShowing = canBtnShowing.pipe(map(([a, b]) => !a && !b), canDisplay)
    const canPauseBtnShowing = canBtnShowing.pipe(map(([a, b]) => a && !b), canDisplay)
    const canResumeBtnShowing = canBtnShowing.pipe(map(([a, b]) => !a && b), canDisplay)

    return (
        div({ class: 'timer' }, [
            /* timer title */
            div([
                merge(
                    shuoldShowTitleForm$.pipe(isTruthy_, map(_ =>
                        div([
                            form({ key: 'form', on: { submit: TIMER_ACTION.TIELE_SUBSMIT } }, [
                                input({
                                    type: 'text',
                                    placeholder: 'Enter task name...',
                                    autofocus: true,
                                    on: { input: TIMER_ACTION.TITLE_INPUT, blur: TIMER_ACTION.TIELE_SUBSMIT },
                                    value: props.title$,
                                    hook: { insert: focus },
                                }),
                            ]),
                        ]),
                    )),
                    shuoldShowTitleForm$.pipe(isFalsy_, map(_ =>
                        div([
                            h1({ key: 'heading', on: { dblclick: TIMER_ACTION.TITLE_SELECT_FOR_EIDT } }, [
                                props.title$,
                            ]),
                        ]),
                    )),
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
                    button({
                        class: 'btn', type: 'button',
                        on: { click: TIMER_ACTION.START },
                        style: { display: canStartBtnShowing },
                    }, 'start'),
                    button({
                        class: 'btn', type: 'button',
                        on: { click: TIMER_ACTION.PAUSE },
                        style: { display: canPauseBtnShowing },
                    }, 'pause'),
                    button({
                        class: 'btn', type: 'button',
                        on: { click: TIMER_ACTION.RESUME },
                        style: { display: canResumeBtnShowing },
                    }, 'resume'),
                    button({
                        class: 'btn', type: 'button',
                        on: { click: TIMER_ACTION.SKIP },
                    }, 'skip'),
                ]),
            ]),
        ])
    )
}