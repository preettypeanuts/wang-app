import { MobileBackButton } from "@/components/shared/mobile-back-button";
import {
  CHAT_MOBILE_HEADER,
  CHAT_MOBILE_HEADER_INSET,
} from "@/config/chat-layout";

export function ChatHeader() {
  return (
    <div className={CHAT_MOBILE_HEADER}>
      <div className={CHAT_MOBILE_HEADER_INSET}>
        <MobileBackButton />
      </div>
    </div>
  );
}
