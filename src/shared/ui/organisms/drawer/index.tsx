'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useComposedRefs } from '@radix-ui/react-compose-refs';
import { XIcon } from 'lucide-react';

import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DialogPortalTargetRefContext,
} from '@/shared/ui/organisms/dialog';
import { cn } from '@/shared/utils/cn';

const Drawer = Dialog;
const DrawerTrigger = DialogTrigger;
const DrawerClose = DialogClose;
const DrawerHeader = DialogHeader;
const DrawerFooter = DialogFooter;
const DrawerTitle = DialogTitle;
const DrawerDescription = DialogDescription;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentProps<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
  }
>(({ className, children, showCloseButton = true, ...props }, forwardedRef) => {
  const portalTargetRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(forwardedRef, portalTargetRef);

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={composedRef}
        data-slot="drawer-content"
        className={cn(
          'bg-card/50 backdrop-blur-sm fixed inset-y-0 right-0 z-50 flex h-dvh w-full max-w-md flex-col gap-4 border-l border-white/10 p-6 shadow-2xl outline-none data-[state=closed]:animate-[drawer-out_180ms_ease-in] data-[state=open]:animate-[drawer-in_220ms_ease-out] sm:max-w-lg',
          className,
        )}
        {...props}>
        <DialogPortalTargetRefContext.Provider value={portalTargetRef}>
          {children}
        </DialogPortalTargetRefContext.Provider>
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="drawer-close"
            className="ring-offset-background focus:ring-ring absolute top-2 right-2 inline-flex size-9 items-center justify-center rounded-md border border-transparent bg-transparent text-zinc-200 opacity-70 transition-opacity hover:border-white/10 hover:bg-white/5 hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer">
            <XIcon className="" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DrawerContent.displayName = 'DrawerContent';

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
};
