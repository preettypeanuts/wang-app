"use client";

import {
  sfArrowClockwise,
  sfArrowDown,
  sfArrowLeft,
  sfArrowUp,
  sfArrowUturnLeft,
  sfBagFill,
  sfBellFill,
  sfBanknoteFill,
  sfBookFill,
  sfBubbleLeftAndBubbleRightFill,
  sfCalendar,
  sfCarFill,
  sfCartFill,
  sfCheckmark,
  sfCheckmarkCircleFill,
  sfCloudBoltFill,
  sfCloudRainFill,
  sfChartBarFill,
  sfChevronDown,
  sfChevronLeft,
  sfChevronRight,
  sfChevronUp,
  sfCreditcardFill,
  sfDesktopcomputer,
  sfDollarsignCircleFill,
  sfEllipsis,
  sfExclamationmarkTriangleFill,
  sfEyeFill,
  sfEyeSlashFill,
  sfCupAndSaucerFill,
  sfGearshapeFill,
  sfHeartFill,
  sfInfinity,
  sfLine3Horizontal,
  sfLine3HorizontalDecrease,
  sfMoonFill,
  sfPencil,
  sfPersonCircleFill,
  sfPlus,
  sfReceiptFill,
  sfSidebarLeft,
  sfShieldFill,
  sfSparkles,
  sfSquareAndArrowUpFill,
  sfSquareGrid2x2Fill,
  sfSum,
  sfSunMaxFill,
  sfTablecellsFill,
  sfTrashFill,
  sfWalletBifoldFill,
  sfXmark,
  sfXmarkCircleFill,
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
export const BellIcon = createSFIcon(sfBellFill, "BellIcon");
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
export const ChartBarIcon = createSFIcon(sfChartBarFill, "ChartBarIcon");
export const ChatIcon = createSFIcon(
  sfBubbleLeftAndBubbleRightFill,
  "ChatIcon",
);
export const CheckIcon = createSFIcon(sfCheckmark, "CheckIcon");
export const CheckCircleIcon = createSFIcon(
  sfCheckmarkCircleFill,
  "CheckCircleIcon",
);
export const CloudBoltIcon = createSFIcon(sfCloudBoltFill, "CloudBoltIcon");
export const CloudRainIcon = createSFIcon(sfCloudRainFill, "CloudRainIcon");
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
export const EyeIcon = createSFIcon(sfEyeFill, "EyeIcon");
export const EyeSlashIcon = createSFIcon(sfEyeSlashFill, "EyeSlashIcon");
export const ExclamationTriangleIcon = createSFIcon(
  sfExclamationmarkTriangleFill,
  "ExclamationTriangleIcon",
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
export const HeartIcon = createSFIcon(sfHeartFill, "HeartIcon");
export const ListIcon = createSFIcon(sfLine3Horizontal, "ListIcon");
export const InfinityIcon = createSFIcon(sfInfinity, "InfinityIcon");
export const MoonIcon = createSFIcon(sfMoonFill, "MoonIcon");
export const NotebookIcon = createSFIcon(sfBookFill, "NotebookIcon");
export const PencilSimpleIcon = createSFIcon(sfPencil, "PencilSimpleIcon");
export const PlusIcon = createSFIcon(sfPlus, "PlusIcon");
export const ReceiptIcon = createSFIcon(sfReceiptFill, "ReceiptIcon");
export const ShieldIcon = createSFIcon(sfShieldFill, "ShieldIcon");
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
export const UploadSimpleIcon = createSFIcon(
  sfSquareAndArrowUpFill,
  "UploadSimpleIcon",
);
export const UserCircleIcon = createSFIcon(
  sfPersonCircleFill,
  "UserCircleIcon",
);
export const WalletIcon = createSFIcon(sfWalletBifoldFill, "WalletIcon");
export const XCircleIcon = createSFIcon(sfXmarkCircleFill, "XCircleIcon");
export const XIcon = createSFIcon(sfXmark, "XIcon");

/** Filled SF Symbols for mobile bottom nav (iOS liquid glass). */
export const MobileNavOverviewIcon = createSFIcon(
  sfSquareGrid2x2Fill,
  "MobileNavOverviewIcon",
);
export const MobileNavInboxIcon = createSFIcon(
  sfBubbleLeftAndBubbleRightFill,
  "MobileNavInboxIcon",
);
export const MobileNavJournalIcon = createSFIcon(
  sfBookFill,
  "MobileNavJournalIcon",
);
export const MobileNavPayPlanIcon = createSFIcon(
  sfCalendar,
  "MobileNavPayPlanIcon",
);
export const MobileNavWishIcon = createSFIcon(sfHeartFill, "MobileNavWishIcon");
export const MobileNavMenuIcon = createSFIcon(
  sfLine3Horizontal,
  "MobileNavMenuIcon",
);
