//
// ─── TYPES ──────────────────────────────────────────────────────────────────────
//
declare global {
    interface AppState {
        timerTitle: State
    }
}

export interface State {
    content: string
    isEditing: boolean
}