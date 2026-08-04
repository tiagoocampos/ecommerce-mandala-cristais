import * as React from "react";
import { TriangleAlert } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

export type ConfirmDeleteProps = {
  trigger: React.ReactNode;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  disabled?: boolean;
};

export function ConfirmDelete({
  trigger,
  title,
  description,
  onConfirm,
  confirmText = "Remover",
  cancelText = "Cancelar",
  disabled,
}: ConfirmDeleteProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-md border-mc-violet-950/10 rounded-2xl bg-mc-sand-50 shadow-2xl">
        <AlertDialogHeader className="items-center text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <TriangleAlert className="h-8 w-8 text-red-600" />
          </div>

          <AlertDialogTitle className="font-display text-2xl text-mc-violet-950">
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-sm leading-6 text-mc-ink/70 max-w-sm">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6 flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <AlertDialogCancel
            disabled={disabled}
            className="
              w-full sm:w-auto
              rounded-lg
              border-mc-violet-950/15
              bg-white
              text-mc-violet-950
              hover:bg-mc-blush-100
              transition-colors
            "
          >
            {cancelText}
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={disabled}
            onClick={onConfirm}
            className="
              w-full sm:w-auto
              rounded-lg
              bg-red-600
              text-white
              hover:bg-red-700
              transition-colors
            "
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}