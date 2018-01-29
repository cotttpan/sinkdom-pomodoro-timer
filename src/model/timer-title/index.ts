import toModel from '../helpers/to-model'
import { values } from '@cotto/utils.ts'
import * as reducers from './reducers'

export default toModel('timerTitle', {
    reducers: values(reducers),
})