import { CHAT_MESSAGE_SCROLL_ANIMATION_MS } from "@/config/chat-message-enter";

/** Ease-out scroll that tracks growing message list during enter animations. */
export function scrollMessageListToBottom(
  element: HTMLElement,
  durationMs = CHAT_MESSAGE_SCROLL_ANIMATION_MS,
): void {
  const targetTop = Math.max(
    0,
    element.scrollHeight - element.clientHeight,
  );
  const startTop = element.scrollTop;
  const distance = targetTop - startTop;

  if (Math.abs(distance) < 1) {
    element.scrollTop = targetTop;
    return;
  }

  const start = performance.now();

  function step(now: number) {
    const progress = Math.min((now - start) / durationMs, 1);
    const eased = 1 - (1 - progress) ** 3;
    element.scrollTop = startTop + distance * eased;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}
