import {
  INBOX_MOBILE_BOTTOM_BLUR,
  INBOX_MOBILE_TOP_BLUR,
} from "@/config/inbox-mobile";
import { cn } from "@/lib/utils";

interface InboxMobileEdgeBlurProps {
  showTopBlur?: boolean;
}

export function InboxMobileEdgeBlur({
  showTopBlur = false,
}: InboxMobileEdgeBlurProps) {
  return (
    <>
      <div
        aria-hidden
        className={cn(INBOX_MOBILE_TOP_BLUR, showTopBlur && "opacity-100")}
      />
      <div aria-hidden className={INBOX_MOBILE_BOTTOM_BLUR} />
    </>
  );
}
