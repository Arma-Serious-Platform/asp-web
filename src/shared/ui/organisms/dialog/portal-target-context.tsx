'use client';

import * as React from 'react';

/** Ref to the open `DialogContent` node so portaled popovers can mount inside it (wheel scroll works with dialog scroll lock). */
export const DialogPortalTargetRefContext = React.createContext<React.RefObject<Element | null> | null>(null);

export function useDialogPortalTargetRef() {
  return React.useContext(DialogPortalTargetRefContext);
}
