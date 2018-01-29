import { values } from '@cotto/utils.ts'
import { toModel } from '../helpers/to-model'
import * as epics from './epic'
import * as reducers from './reducer'

export * from './common'

export const timer = toModel('timer', {
    reducers: values(reducers),
    epics: values(epics),
})
