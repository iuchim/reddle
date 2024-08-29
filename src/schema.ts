import { z } from 'zod'

export const inputFormSchema = z.object({
  answer: z.preprocess(
    trim,
    z.string({ required_error: '回答を入力してください' }).refine(
      (arg) => {
        try {
          new RegExp(arg)
          return true
        } catch (_err) {
          return false
        }
      },
      { message: 'パターンが不正です' },
    ),
  ),
})
export type InputFormSchemaType = z.infer<typeof inputFormSchema>

function trim(arg: unknown, _ctx: z.RefinementCtx) {
  if (arg == null) return undefined
  if (typeof arg !== 'string') return arg
  const newArg = arg.trim()
  if (newArg === '') return undefined
  return newArg
}
