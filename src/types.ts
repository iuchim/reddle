export type GameStatus = 'NotStarted' | 'InProgress' | 'Completed'

export type Msg = MsgStart | MsgCorrect | MsgGiveUp | MsgAnswer

export type MsgStart = {
  type: 'start'
  id?: string
}

export type MsgCorrect = {
  type: 'correct'
  id?: string
}

export type MsgGiveUp = {
  type: 'giveup'
  id?: string
  target: string
}

export type MsgAnswer = {
  type: 'answer'
  id?: string
  answer: string
  result: boolean
}
