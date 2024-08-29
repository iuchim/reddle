import { ErrorMessage } from '@hookform/error-message'
import { zodResolver } from '@hookform/resolvers/zod'
import { forwardRef, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { useGame } from './hooks'
import { type InputFormSchemaType, inputFormSchema } from './schema'
import type { Msg } from './types'

function App() {
  const g = useGame()
  const inProgress = g.gameStatus === 'InProgress'

  const handleGiveUpClick = () => {
    g.giveup()
  }
  const handleNewGameClick = () => {
    g.newGame()
  }
  const handleAnswerClick = (userAnswer: string) => {
    g.answer(userAnswer)
  }

  return (
    <div className="h-dvh w-full bg-gray-100">
      <div className="m-auto flex h-dvh w-full max-w-[50rem] flex-col bg-white shadow">
        <div>
          <Header
            inProgress={inProgress}
            onGiveUpClick={handleGiveUpClick}
            onNewGameClick={handleNewGameClick}
          />
        </div>
        <div className="relative size-full flex-grow">
          <div className="absolute size-full overflow-auto">
            <MessageList messages={g.messages} />
          </div>
        </div>
        <div>
          <InputForm
            inProgress={inProgress}
            onNewGameClick={handleNewGameClick}
            onAnswerClick={handleAnswerClick}
          />
        </div>
        <div>
          <Rule />
        </div>
      </div>
    </div>
  )
}

export default App

type HeaderProps = React.ComponentPropsWithoutRef<'div'> & {
  inProgress?: boolean
  onGiveUpClick?: () => void
  onNewGameClick?: () => void
}

function Header(props: HeaderProps) {
  const {
    children: _children,
    className,
    inProgress,
    onGiveUpClick,
    onNewGameClick,
    ...rest
  } = props
  return (
    <div className="flex flex-row items-baseline justify-between p-8 pb-0">
      <h1 className={twMerge('m-0 p-0 text-4xl text-red-500 leading-none', className)} {...rest}>
        REddle
      </h1>
      {inProgress ? (
        <GiveUpButton onClick={() => onGiveUpClick?.()} />
      ) : (
        <NewGameButton onClick={() => onNewGameClick?.()} />
      )}
    </div>
  )
}

function Rule() {
  return (
    <div className="bg-gray-500 p-8 text-gray-50">
      <h3 className="mb-4 font-bold">あそびかた</h3>
      <p>正規表現を利用して隠された5文字の英単語を当ててください</p>
      <p>プレイヤーが正規表現を入力すると、英単語とマッチするかどうかが返却されます</p>
      <p>回答する場合は英単語をそのまま入力してください</p>
    </div>
  )
}

type MessageListProps = React.ComponentPropsWithoutRef<'div'> & {
  messages?: Msg[]
}

function MessageList(props: MessageListProps) {
  const { children: _children, className, messages, ...rest } = props
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    messages
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  return (
    <div className={twMerge('flex flex-col gap-2 p-8 pb-0', className)} {...rest}>
      {messages?.map((msg, no) => (
        <MessageListItem key={msg.id} no={no} msg={msg} />
      ))}
      <div ref={ref} />
    </div>
  )
}

type MessageListItemProps = React.ComponentPropsWithoutRef<'div'> & {
  no: number
  msg?: Msg
}
function MessageListItem(props: MessageListItemProps) {
  const { children: _children, className, no, msg, ...rest } = props
  if (msg == null) return
  let item: React.ReactNode = <div />
  if (msg.type === 'start') {
    item = <p className="text-blue-700">ゲームを開始します</p>
  } else if (msg.type === 'correct') {
    item = <p className="text-red-600">正解です</p>
  } else if (msg.type === 'giveup') {
    item = <p className="text-red-800">挑戦失敗。正解は「{msg.target}」でした</p>
  } else if (msg.type === 'answer') {
    item = (
      <p className="text-gray-800">
        {msg.answer}
        <span className="ml-8 text-yellow-600">=&gt; {msg.result ? 'true' : 'false'}</span>
      </p>
    )
  }
  return (
    <div className={twMerge('flex items-baseline gap-4', className)} {...rest}>
      <div className="w-8 text-gray-400">#{no}:</div>
      <div className="flex-1">{item}</div>
    </div>
  )
}

type InputFormProps = React.ComponentPropsWithoutRef<'form'> & {
  inProgress?: boolean
  onNewGameClick?: () => void
  onAnswerClick?: (userAnswer: string) => void
}

function InputForm(props: InputFormProps) {
  const {
    children: _children,
    className,
    inProgress,
    onNewGameClick,
    onAnswerClick,
    ...rest
  } = props

  const {
    register,
    handleSubmit: handleSubmitWrap,
    formState: { errors },
    reset,
    clearErrors,
  } = useForm<InputFormSchemaType>({
    resolver: zodResolver(inputFormSchema),
    criteriaMode: 'all',
  })

  const handleSubmit = handleSubmitWrap((data) => {
    onAnswerClick?.(data.answer)
    reset()
  })
  useEffect(() => {
    inProgress
    reset()
    clearErrors()
  }, [inProgress, reset, clearErrors])
  return (
    <div className={twMerge('p-8 pt-2', className)}>
      <div className="h-6 text-red-500">
        <ErrorMessage errors={errors} name="answer" />
      </div>
      <form className="flex flex-col gap-4 pt-0 md:flex-row" onSubmit={handleSubmit} {...rest}>
        <input
          id="answer"
          type="text"
          className={twMerge(
            'h-12 flex-grow rounded-md border border-gray-600 px-4 font-mono text-xl',
            'disabled:border-gray-400 disabled:bg-gray-200 disabled:text-gray-400',
          )}
          disabled={!inProgress}
          autoComplete="off"
          {...register('answer')}
        />
        {inProgress ? (
          <AnswerButton type="submit" className="block w-full md:w-auto" />
        ) : (
          <NewGameButton className="block w-full md:w-auto" onClick={() => onNewGameClick?.()} />
        )}
      </form>
    </div>
  )
}

type ButtonProps = React.ComponentPropsWithoutRef<'button'>

const GiveUpButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { children: _children, className, ...rest } = props
  return (
    <button
      type="button"
      className={twMerge(
        'w-32 rounded-md bg-red-600 px-4 py-2 text-white text-xl hover:bg-red-700 active:bg-red-800',
        'transition-colors duration-200',
        className,
      )}
      {...rest}
      ref={ref}
    >
      GiveUp
    </button>
  )
})

const NewGameButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { children: _children, className, ...rest } = props
  return (
    <button
      type="button"
      className={twMerge(
        'w-32 rounded-md bg-blue-600 px-4 py-2 text-white text-xl hover:bg-blue-700 active:bg-blue-800',
        'transition-colors duration-200',
        className,
      )}
      {...rest}
      ref={ref}
    >
      NewGame
    </button>
  )
})

const AnswerButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { children: _children, className, ...rest } = props
  return (
    <button
      type="button"
      className={twMerge(
        'w-32 rounded-md bg-cyan-600 px-4 py-2 text-white text-xl hover:bg-cyan-700 active:bg-cyan-800',
        'transition-colors duration-200',
        className,
      )}
      {...rest}
      ref={ref}
    >
      Answer
    </button>
  )
})
