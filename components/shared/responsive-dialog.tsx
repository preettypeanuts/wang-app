"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  FORM_DIALOG_BODY,
  FORM_DIALOG_CONTENT,
  FORM_DIALOG_CONTENT_WIDE,
  FORM_DIALOG_FOOTER,
  FORM_DIALOG_HEADER,
  FORM_DIALOG_SURFACE,
} from "@/config/form-dialog";
import {
  MOBILE_BOTTOM_DRAWER_POPUP,
  MOBILE_BOTTOM_DRAWER_POPUP_TALL,
} from "@/config/mobile-layout";
import { useDrawerScrollLock } from "@/hooks/use-drawer-scroll-lock";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { cn } from "@/lib/utils";

/** Bottom sheet shell — layout in globals.css `.mobile-bottom-drawer-popup`. */
const RESPONSIVE_DIALOG_DRAWER_SHELL = cn(
  FORM_DIALOG_SURFACE,
  MOBILE_BOTTOM_DRAWER_POPUP,
  MOBILE_BOTTOM_DRAWER_POPUP_TALL,
  "flex flex-col gap-0 overflow-hidden border-0 p-0",
);

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible name — mirror visible title in ResponsiveDialogHeader. */
  title: string;
  children: ReactNode;
  /** Use wide form modal width on desktop (`FORM_DIALOG_CONTENT_WIDE`). */
  wide?: boolean;
  className?: string;
}

export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  children,
  wide = false,
  className,
}: ResponsiveDialogProps) {
  const isMobile = useIsMobileViewport();

  useDrawerScrollLock(isMobile && open);

  const desktopContentClassName = cn(
    wide ? FORM_DIALOG_CONTENT_WIDE : FORM_DIALOG_CONTENT,
    className,
  );

  if (isMobile) {
    return (
      <Drawer onOpenChange={onOpenChange} open={open} showSwipeHandle>
        <DrawerContent className={cn(RESPONSIVE_DIALOG_DRAWER_SHELL, className)}>
          <DrawerTitle className="sr-only">{title}</DrawerTitle>
          {children}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className={desktopContentClassName}>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
}

interface ResponsiveDialogSectionProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveDialogHeader({
  children,
  className,
}: ResponsiveDialogSectionProps) {
  return (
    <div
      data-slot="responsive-dialog-header"
      className={cn(FORM_DIALOG_HEADER, className)}
    >
      {children}
    </div>
  );
}

export function ResponsiveDialogBody({
  children,
  className,
}: ResponsiveDialogSectionProps) {
  return (
    <div
      data-slot="responsive-dialog-body"
      className={cn(FORM_DIALOG_BODY, "min-h-0 flex-1", className)}
    >
      {children}
    </div>
  );
}

export function ResponsiveDialogFooter({
  children,
  className,
}: ResponsiveDialogSectionProps) {
  return (
    <div
      data-slot="responsive-dialog-footer"
      className={cn(FORM_DIALOG_FOOTER, className)}
    >
      {children}
    </div>
  );
}
