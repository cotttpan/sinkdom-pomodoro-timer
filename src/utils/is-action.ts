import { Action } from 'flux-helpers'

export default function isAction(value: any | Action): value is Action {
    return value != null && 'type' in value
}