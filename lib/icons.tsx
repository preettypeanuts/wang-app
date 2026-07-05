"use client";

import {
  sfArrowClockwise,
  sfArrowDown,
  sfArrowLeft,
  sfArrowUp,
  sfArrowUturnLeft,
  sfBagFill,
  sfBanknoteFill,
  sfBookFill,
  sfCalendar,
  sfCarFill,
  sfCartFill,
  sfCheckmark,
  sfCheckmarkCircleFill,
  sfChevronDown,
  sfChevronLeft,
  sfChevronRight,
  sfChevronUp,
  sfCreditcardFill,
  sfDesktopcomputer,
  sfDollarsignCircleFill,
  sfEllipsis,
  sfCupAndSaucerFill,
  sfGearshapeFill,
  sfInfinity,
  sfLine3HorizontalDecrease,
  sfMoonFill,
  sfPencil,
  sfPlus,
  sfReceiptFill,
  sfSidebarLeft,
  sfSparkles,
  sfSquareAndArrowUpFill,
  sfSquareGrid2x2Fill,
  sfSum,
  sfSunMaxFill,
  sfTablecellsFill,
  sfTrashFill,
  sfTrayFill,
  sfWalletBifoldFill,
  sfXmark,
} from "@bradleyhodges/sfsymbols";
import { SFIcon } from "@bradleyhodges/sfsymbols-react";
import type { IconDefinition } from "@bradleyhodges/sfsymbols-types";
import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { SF_ICON_SIZE } from "@/config/icons";
import { cn } from "@/lib/utils";

export type IconProps = Omit<
  ComponentPropsWithoutRef<typeof SFIcon>,
  "icon"
> & {
  className?: string;
};

export type Icon = React.ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
>;

function createSFIcon(symbol: IconDefinition, displayName: string): Icon {
  const IconComponent = forwardRef<SVGSVGElement, IconProps>(
    function IconComponent({ className, size, ...props }, ref) {
      return (
        <SFIcon
          ref={ref}
          icon={symbol}
          size={size ?? SF_ICON_SIZE}
          className={cn("shrink-0", className)}
          {...props}
        />
      );
    },
  );

  IconComponent.displayName = displayName;
  return IconComponent;
}

export const ArrowDownIcon = createSFIcon(sfArrowDown, "ArrowDownIcon");
export const ArrowLeftIcon = createSFIcon(sfArrowLeft, "ArrowLeftIcon");
export const ArrowUpIcon = createSFIcon(sfArrowUp, "ArrowUpIcon");
export const ArrowClockwiseIcon = createSFIcon(
  sfArrowClockwise,
  "ArrowClockwiseIcon",
);
export const ArrowUUpLeftIcon = createSFIcon(
  sfArrowUturnLeft,
  "ArrowUUpLeftIcon",
);
export const CalculatorIcon = createSFIcon(sfSum, "CalculatorIcon");
export const CalendarBlankIcon = createSFIcon(sfCalendar, "CalendarBlankIcon");
export const CarIcon = createSFIcon(sfCarFill, "CarIcon");
export const CaretDownIcon = createSFIcon(sfChevronDown, "CaretDownIcon");
export const CaretLeftIcon = createSFIcon(sfChevronLeft, "CaretLeftIcon");
export const CaretRightIcon = createSFIcon(sfChevronRight, "CaretRightIcon");
export const CaretUpIcon = createSFIcon(sfChevronUp, "CaretUpIcon");
export const CheckIcon = createSFIcon(sfCheckmark, "CheckIcon");
export const CheckCircleIcon = createSFIcon(
  sfCheckmarkCircleFill,
  "CheckCircleIcon",
);
export const CoinsIcon = createSFIcon(sfDollarsignCircleFill, "CoinsIcon");
export const CreditCardIcon = createSFIcon(sfCreditcardFill, "CreditCardIcon");
export const CurrencyCircleDollarIcon = createSFIcon(
  sfBanknoteFill,
  "CurrencyCircleDollarIcon",
);
export const DesktopIcon = createSFIcon(sfDesktopcomputer, "DesktopIcon");
export const DotsThreeIcon = createSFIcon(sfEllipsis, "DotsThreeIcon");
export const DotsThreeVerticalIcon = createSFIcon(
  sfEllipsis,
  "DotsThreeVerticalIcon",
);
export const ForkKnifeIcon = createSFIcon(
  sfCupAndSaucerFill,
  "ForkKnifeIcon",
);
export const FunnelIcon = createSFIcon(
  sfLine3HorizontalDecrease,
  "FunnelIcon",
);
export const GearSixIcon = createSFIcon(sfGearshapeFill, "GearSixIcon");
export const InfinityIcon = createSFIcon(sfInfinity, "InfinityIcon");
export const MoonIcon = createSFIcon(sfMoonFill, "MoonIcon");
export const NotebookIcon = createSFIcon(sfBookFill, "NotebookIcon");
export const PencilSimpleIcon = createSFIcon(sfPencil, "PencilSimpleIcon");
export const PlusIcon = createSFIcon(sfPlus, "PlusIcon");
export const ReceiptIcon = createSFIcon(sfReceiptFill, "ReceiptIcon");
export const ShoppingBagIcon = createSFIcon(sfBagFill, "ShoppingBagIcon");
export const SidebarIcon = createSFIcon(sfSidebarLeft, "SidebarIcon");
export const SparkleIcon = createSFIcon(sfSparkles, "SparkleIcon");
export const SquaresFourIcon = createSFIcon(
  sfSquareGrid2x2Fill,
  "SquaresFourIcon",
);
export const SunIcon = createSFIcon(sfSunMaxFill, "SunIcon");
export const TableIcon = createSFIcon(sfTablecellsFill, "TableIcon");
export const TrashIcon = createSFIcon(sfTrashFill, "TrashIcon");
export const TrayIcon = createSFIcon(sfTrayFill, "TrayIcon");
export const UploadSimpleIcon = createSFIcon(
  sfSquareAndArrowUpFill,
  "UploadSimpleIcon",
);
export const WalletIcon = createSFIcon(sfWalletBifoldFill, "WalletIcon");
export const XIcon = createSFIcon(sfXmark, "XIcon");
