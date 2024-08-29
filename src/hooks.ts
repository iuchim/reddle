import { useAtom, useAtomValue } from 'jotai'
import {
  answerAtom,
  gameStatusAtom,
  giveUpAtom,
  messagesAtom,
  newGameAtom,
  targetWordAtom,
} from './atoms'

export function useGame() {
  const gameStatus = useAtomValue(gameStatusAtom)
  const messages = useAtomValue(messagesAtom)
  const targetWord = useAtomValue(targetWordAtom)
  const [, newGame] = useAtom(newGameAtom)
  const [, answer] = useAtom(answerAtom)
  const [, giveup] = useAtom(giveUpAtom)
  return {
    gameStatus,
    messages,
    targetWord,
    newGame,
    answer,
    giveup,
  }
}
