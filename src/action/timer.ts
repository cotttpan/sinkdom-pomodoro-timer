import { createActionFactory } from 'flux-helpers'

interface Actions {
    /* from client */
    TITLE_INPUT: Event
    TIELE_SUBSMIT: Event
    TITLE_SELECT_FOR_EIDT: Event
    START: any
    PAUSE: any
    RESUME: any
    SKIP: any
    /* from epic */
    TICK: number
    TIMEUP: number
    INTERVAL_START: number
    INTERVAL_END: number
}

export default createActionFactory<Actions>('TIMER/')