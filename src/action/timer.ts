import { createActionFactory } from 'flux-helpers'
import { INTERVAL_TYPE } from '@/model/timer'

interface Actions {
    TITLE_INPUT: Event
    TIELE_SUBSMIT: Event
    TITLE_SELECT_FOR_EIDT: Event
    START: Event
    PAUSE: Event
    RESUME: Event
    SKIP: Event
    INTERVAL_START: { type: INTERVAL_TYPE, timestamp: number }
    INTERVAL_END: any
    TICK: number
}

export default createActionFactory<Actions>('TIMER/')