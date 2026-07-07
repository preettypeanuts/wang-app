export const MOBILE_TOP_BLUR_SCROLL_THRESHOLD = 4;

export type MobileTopBlurScrollAnchor = "top" | "bottom";

/** True when the scroll surface has moved away from its rest position. */
export function isMobileTopBlurActive(
  element: HTMLElement,
  anchor: MobileTopBlurScrollAnchor = "top",
): boolean {
  if (anchor === "top") {
    return element.scrollTop > MOBILE_TOP_BLUR_SCROLL_THRESHOLD;
  }

  const distanceFromBottom =
    element.scrollHeight - element.scrollTop - element.clientHeight;

  return distanceFromBottom > MOBILE_TOP_BLUR_SCROLL_THRESHOLD;
}
