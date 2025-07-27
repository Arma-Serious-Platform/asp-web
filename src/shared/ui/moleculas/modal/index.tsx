import * as RadixDialog from "@radix-ui/react-dialog"
import { FC, PropsWithChildren, ReactNode } from "react"
import { Button } from "../../atoms/button.tsx";
import classNames from "classnames";
import { XIcon } from "lucide-react";

const Dialog: FC<PropsWithChildren<{
  title?: ReactNode;
  description?: ReactNode;
  open?: boolean
  defaultOpen?: boolean
  className?: string;
  trigger?: ReactNode;
  confirmText?: string
  cancelText?: string;
  isConfirmDisabled?: boolean;
  isCancelDisabled?: boolean;
  showCloseIcon?: boolean;
  showCancelButton?: boolean;
  onOpenChange?: (open: boolean) => void
  onCancel?: () => void
  onConfirm?: () => void
}>> = ({
  children,
  title,
  description,
  trigger,
  open,
  defaultOpen,
  className,
  confirmText = 'Підтвердити',
  cancelText = 'Скасувати',
  isConfirmDisabled,
  isCancelDisabled,
  showCloseIcon = true,
  showCancelButton = true,
  onOpenChange,
  onCancel,
  onConfirm
}) => {
    return (
      <RadixDialog.Root open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen}>
        {trigger && <RadixDialog.Trigger asChild>
          {trigger}
        </RadixDialog.Trigger>}
        <RadixDialog.Portal>
          <RadixDialog.Overlay className="fixed inset-0 bg-neutral-500/20 backdrop-blur-sm z-20" />
          <RadixDialog.DialogContent className={classNames("fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card p-6 rounded-lg shadow-xl w-full max-w-lg z-20", className)}>
            {(title || description || showCloseIcon) && <div className="flex justify-between gap-2">
              <div className="flex flex-col gap-2 mb-5">
                {title && <RadixDialog.Title className="font-semibold text-foreground">{title}</RadixDialog.Title>}
                {description && <RadixDialog.Description className="text-sm text-muted-foreground mb-2">{description}</RadixDialog.Description>}
              </div>
              {showCloseIcon && onCancel && <XIcon className="w-4 h-4 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer" onClick={onCancel} />}
              {showCloseIcon && !onCancel &&
                <RadixDialog.Close asChild>
                  <XIcon className="w-4 h-4 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer" />
                </RadixDialog.Close>}
            </div>}
            {children}
            {(onConfirm || onCancel) && <div className="flex items-center justify-between gap-2 w-full">
              {showCancelButton && onCancel &&
                <Button variant="outline" onClick={onCancel} disabled={isCancelDisabled}>{cancelText}</Button>
              }
              {showCancelButton && !onCancel && onConfirm &&
                <RadixDialog.Close asChild>
                  <Button variant="outline" onClick={onCancel} disabled={isCancelDisabled}>{cancelText}</Button>
                </RadixDialog.Close>}

              {onConfirm && <Button className="ml-auto" onClick={onConfirm} disabled={isConfirmDisabled}>{confirmText}</Button>}
            </div>}
          </RadixDialog.DialogContent>
        </RadixDialog.Portal>
      </RadixDialog.Root>
    )
  }

export { Dialog }
