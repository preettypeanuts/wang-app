"use client";

import {
  sfAirplane,
  sfArrowClockwise,
  sfArrowDown,
  sfArrowLeft,
  sfArrowLeftArrowRight,
  sfArrowUp,
  sfArrowUturnLeft,
  sfBagFill,
  sfBasketFill,
  sfBellFill,
  sfBanknoteFill,
  sfBicycle,
  sfBirthdayCakeFill,
  sfBitcoinsignCircleFill,
  sfBoltFill,
  sfBookFill,
  sfBriefcaseFill,
  sfBubbleLeftAndBubbleRightFill,
  sfBuilding2Fill,
  sfBusFill,
  sfCalendar,
  sfCameraFill,
  sfCarFill,
  sfCartFill,
  sfChartLineUptrendXyaxis,
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
  sfDropFill,
  sfDumbbellFill,
  sfEllipsis,
  sfExclamationmarkTriangleFill,
  sfEyeFill,
  sfEyeSlashFill,
  sfCupAndSaucerFill,
  sfFigure2AndChildHoldinghands,
  sfFilmFill,
  sfFuelpumpFill,
  sfGamecontrollerFill,
  sfGearshapeFill,
  sfGiftFill,
  sfGlobeAmericasFill,
  sfGraduationcapFill,
  sfHeartFill,
  sfHouseFill,
  sfInfinity,
  sfIphone,
  sfLaptopcomputer,
  sfLeafFill,
  sfLine3Horizontal,
  sfLine3HorizontalDecrease,
  sfMagnifyingglass,
  sfMoonFill,
  sfMusicNote,
  sfPaintbrushFill,
  sfPartyPopperFill,
  sfPawprintFill,
  sfPencil,
  sfPercent,
  sfPersonCircleFill,
  sfPillsFill,
  sfPlus,
  sfReceiptFill,
  sfScissors,
  sfShippingboxFill,
  sfSidebarLeft,
  sfShieldFill,
  sfSofaFill,
  sfSparkles,
  sfSquareAndArrowUpFill,
  sfSquareGrid2x2Fill,
  sfStarFill,
  sfStorefrontFill,
  sfSum,
  sfSunMaxFill,
  sfTablecellsFill,
  sfTagFill,
  sfTakeoutbagAndCupAndStrawFill,
  sfTicketFill,
  sfTramFill,
  sfTrashFill,
  sfTrophyFill,
  sfTshirtFill,
  sfTvFill,
  sfWalletBifoldFill,
  sfWifi,
  sfWineglassFill,
  sfWrenchAdjustableFill,
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
export const ArrowsLeftRightIcon = createSFIcon(
  sfArrowLeftArrowRight,
  "ArrowsLeftRightIcon",
);
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
export const MagnifyingGlassIcon = createSFIcon(
  sfMagnifyingglass,
  "MagnifyingGlassIcon",
);
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

/** Extra SF Symbols available as user category icons. */
export const AirplaneIcon = createSFIcon(sfAirplane, "AirplaneIcon");
export const BasketIcon = createSFIcon(sfBasketFill, "BasketIcon");
export const BicycleIcon = createSFIcon(sfBicycle, "BicycleIcon");
export const BirthdayCakeIcon = createSFIcon(
  sfBirthdayCakeFill,
  "BirthdayCakeIcon",
);
export const BitcoinIcon = createSFIcon(
  sfBitcoinsignCircleFill,
  "BitcoinIcon",
);
export const BoltIcon = createSFIcon(sfBoltFill, "BoltIcon");
export const BriefcaseIcon = createSFIcon(sfBriefcaseFill, "BriefcaseIcon");
export const BuildingIcon = createSFIcon(sfBuilding2Fill, "BuildingIcon");
export const BusIcon = createSFIcon(sfBusFill, "BusIcon");
export const CameraIcon = createSFIcon(sfCameraFill, "CameraIcon");
export const CartIcon = createSFIcon(sfCartFill, "CartIcon");
export const ChartUptrendIcon = createSFIcon(
  sfChartLineUptrendXyaxis,
  "ChartUptrendIcon",
);
export const DropIcon = createSFIcon(sfDropFill, "DropIcon");
export const DumbbellIcon = createSFIcon(sfDumbbellFill, "DumbbellIcon");
export const FamilyIcon = createSFIcon(
  sfFigure2AndChildHoldinghands,
  "FamilyIcon",
);
export const FilmIcon = createSFIcon(sfFilmFill, "FilmIcon");
export const FuelPumpIcon = createSFIcon(sfFuelpumpFill, "FuelPumpIcon");
export const GameControllerIcon = createSFIcon(
  sfGamecontrollerFill,
  "GameControllerIcon",
);
export const GiftIcon = createSFIcon(sfGiftFill, "GiftIcon");
export const GlobeIcon = createSFIcon(sfGlobeAmericasFill, "GlobeIcon");
export const GraduationCapIcon = createSFIcon(
  sfGraduationcapFill,
  "GraduationCapIcon",
);
export const HouseIcon = createSFIcon(sfHouseFill, "HouseIcon");
export const LaptopIcon = createSFIcon(sfLaptopcomputer, "LaptopIcon");
export const LeafIcon = createSFIcon(sfLeafFill, "LeafIcon");
export const MusicNoteIcon = createSFIcon(sfMusicNote, "MusicNoteIcon");
export const PaintbrushIcon = createSFIcon(sfPaintbrushFill, "PaintbrushIcon");
export const PartyPopperIcon = createSFIcon(sfPartyPopperFill, "PartyPopperIcon");
export const PawPrintIcon = createSFIcon(sfPawprintFill, "PawPrintIcon");
export const PercentIcon = createSFIcon(sfPercent, "PercentIcon");
export const PillsIcon = createSFIcon(sfPillsFill, "PillsIcon");
export const ScissorsIcon = createSFIcon(sfScissors, "ScissorsIcon");
export const ShippingBoxIcon = createSFIcon(
  sfShippingboxFill,
  "ShippingBoxIcon",
);
export const SmartphoneIcon = createSFIcon(sfIphone, "SmartphoneIcon");
export const SofaIcon = createSFIcon(sfSofaFill, "SofaIcon");
export const StarIcon = createSFIcon(sfStarFill, "StarIcon");
export const StorefrontIcon = createSFIcon(sfStorefrontFill, "StorefrontIcon");
export const TagIcon = createSFIcon(sfTagFill, "TagIcon");
export const TakeoutBagIcon = createSFIcon(
  sfTakeoutbagAndCupAndStrawFill,
  "TakeoutBagIcon",
);
export const TicketIcon = createSFIcon(sfTicketFill, "TicketIcon");
export const TrainIcon = createSFIcon(sfTramFill, "TrainIcon");
export const TrophyIcon = createSFIcon(sfTrophyFill, "TrophyIcon");
export const TshirtIcon = createSFIcon(sfTshirtFill, "TshirtIcon");
export const TvIcon = createSFIcon(sfTvFill, "TvIcon");
export const WifiIcon = createSFIcon(sfWifi, "WifiIcon");
export const WineGlassIcon = createSFIcon(sfWineglassFill, "WineGlassIcon");
export const WrenchIcon = createSFIcon(sfWrenchAdjustableFill, "WrenchIcon");

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
