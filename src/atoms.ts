import { atom } from 'jotai'
import { nanoid } from 'nanoid'
import type { GameStatus, Msg } from './types'
import { WORDS } from './words'

const baseGameStatusAtom = atom<GameStatus>('NotStarted')
export const gameStatusAtom = atom((get) => get(baseGameStatusAtom))

const baseTargetWordAtom = atom('')
export const targetWordAtom = atom((get) => get(baseTargetWordAtom))

const baseMessagesAtom = atom<Msg[]>([])
export const messagesAtom = atom((get) => get(baseMessagesAtom))
export const clearMessagesAtom = atom(null, (_get, set) => {
  set(baseMessagesAtom, [])
})
export const addMessagesAtom = atom(null, (_get, set, msg: Msg) => {
  msg.id ??= nanoid()
  set(baseMessagesAtom, (log) => [...log, msg])
})

export const newGameAtom = atom(null, (_get, set) => {
  set(baseGameStatusAtom, 'InProgress')
  set(baseTargetWordAtom, WORDS[Math.trunc(WORDS.length * Math.random())])
  set(clearMessagesAtom)
  set(addMessagesAtom, { type: 'start' })
})

export const answerAtom = atom(null, (get, set, userAnswer: string) => {
  if (get(gameStatusAtom) !== 'InProgress') return
  const targetWord = get(targetWordAtom)
  const normalizedAnswer = userAnswer.trim().toLowerCase()
  if (/^[a-z]{5}$/.test(normalizedAnswer)) {
    const result = normalizedAnswer === targetWord
    set(addMessagesAtom, {
      type: 'answer',
      answer: userAnswer,
      result,
    })
    if (result) {
      set(addMessagesAtom, { type: 'correct' })
      set(baseGameStatusAtom, 'Completed')
    }
    return
  }
  const re = new RegExp(userAnswer, 'i')
  set(addMessagesAtom, {
    type: 'answer',
    answer: userAnswer,
    result: re.test(targetWord),
  })
})

export const giveUpAtom = atom(null, (get, set) => {
  set(addMessagesAtom, { type: 'giveup', target: get(targetWordAtom) })
  set(baseGameStatusAtom, 'Completed')
})
