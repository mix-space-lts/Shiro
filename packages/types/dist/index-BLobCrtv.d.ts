import { createPortal } from 'react-dom'
import * as react0 from 'react'
import {
  DetailedHTMLProps,
  FC,
  InputHTMLAttributes,
  PropsWithChildren,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react'
import { HTMLMotionProps } from 'motion/react'

//#region ../../apps/web/src/components/ui/button/MotionButton.d.ts
declare const MotionButtonBase: {
  ({ ref, children, ...rest }: HTMLMotionProps<'button'>): react0.JSX.Element
  displayName: string
}
//#endregion
//#region ../../apps/web/src/components/ui/button/StyledButton.d.ts
type NativeButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string
}
type SharedProps = {
  variant?: 'primary' | 'secondary'
  className?: string
  isLoading?: boolean
}
type ButtonProps = SharedProps & NativeButtonProps
declare const StyledButton: FC<ButtonProps>
//#endregion
//#region ../../apps/web/src/components/ui/input/Input.d.ts
declare const Input: {
  ({
    ref,
    className,
    ...props
  }: DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >): react0.JSX.Element
  displayName: string
}
//#endregion
//#region ../../apps/web/src/components/ui/input/TextArea.d.ts
declare const TextArea: {
  ({
    ref,
    ...props
  }: DetailedHTMLProps<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  > &
    PropsWithChildren<{
      wrapperClassName?: string
      onCmdEnter?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
      rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'default'
      bordered?: boolean
    }>): react0.JSX.Element
  displayName: string
}
//#endregion
//#region ../../apps/web/src/components/ui/modal/stacked/types.d.ts
interface ModalProps {
  title: ReactNode
  CustomModalComponent?: FC<PropsWithChildren>
  content: FC<ModalContentPropsInternal>
  clickOutsideToDismiss?: boolean
  modalClassName?: string
  modalContainerClassName?: string
  max?: boolean
  wrapper?: FC
  overlay?: boolean
}
//#endregion
//#region ../../apps/web/src/components/ui/modal/stacked/context.d.ts
type ModalContentPropsInternal = {
  dismiss: () => void
}
//#endregion
//#region ../../apps/web/src/components/ui/modal/stacked/provider.d.ts
interface ModalStackOptions {
  wrapper?: FC
}
declare const useModalStack$1: (options?: ModalStackOptions) => {
  dismiss(id: string): void
  dismissTop(): void
  dismissAll(): void
  present: (
    props: ModalProps & {
      id?: string
    },
  ) => () => void
}
//#endregion
//#region index.d.ts
declare const GlobalComponentMap: {
  Button: typeof StyledButton
  MotionButtonBase: typeof MotionButtonBase
  Input: typeof Input
  TextArea: typeof TextArea
}
type GlobalComponents = typeof GlobalComponentMap
declare const getGlobalComponent: (
  name: keyof GlobalComponents,
) => GlobalComponents[keyof GlobalComponents]
declare const useModalStack: typeof useModalStack$1
declare const dangerouslyCreatePortal: typeof createPortal
//#endregion
export { dangerouslyCreatePortal, getGlobalComponent, useModalStack }
//# sourceMappingURL=index-BLobCrtv.d.ts.map
