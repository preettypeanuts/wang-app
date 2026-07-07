import Image from "next/image";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  IOS_NOTIFICATION_ALERT,
  IOS_NOTIFICATION_ALERT_BODY,
  IOS_NOTIFICATION_ALERT_ICON,
  IOS_NOTIFICATION_ALERT_INNER,
  IOS_NOTIFICATION_ALERT_TITLE,
  NOTIFICATION_PUSH_ICON,
} from "@/config/notifications";
import { cn } from "@/lib/utils";
import type { AppNotificationRecord } from "@/types/notification";

interface IosNotificationAlertProps {
  notification: AppNotificationRecord;
  onDismiss?: () => void;
  onOpen?: () => void;
  className?: string;
}

export function IosNotificationAlert({
  notification,
  onDismiss,
  onOpen,
  className,
}: IosNotificationAlertProps) {
  return (
    <Alert
      className={cn(IOS_NOTIFICATION_ALERT, className)}
      onClick={onOpen}
      role="status"
    >
      <div className={IOS_NOTIFICATION_ALERT_INNER}>
        <Image
          alt=""
          className={IOS_NOTIFICATION_ALERT_ICON}
          height={40}
          src={NOTIFICATION_PUSH_ICON}
          width={40}
        />
        <div className="min-w-0 flex-1">
          <AlertTitle className={IOS_NOTIFICATION_ALERT_TITLE}>
            {notification.title}
          </AlertTitle>
          <AlertDescription className={IOS_NOTIFICATION_ALERT_BODY}>
            {notification.body}
          </AlertDescription>
        </div>
        {onDismiss ? (
          <button
            type="button"
            aria-label="Tutup notifikasi"
            className="shrink-0 rounded-full px-2 py-1 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            onClick={(event) => {
              event.stopPropagation();
              onDismiss();
            }}
          >
            Tutup
          </button>
        ) : null}
      </div>
    </Alert>
  );
}
