import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Calculator,
  Calendar,
  Car,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  CircleDollarSign,
  Coins,
  CreditCard,
  Ellipsis,
  EllipsisVertical,
  Filter,
  Inbox,
  Infinity,
  LayoutGrid,
  Monitor,
  Moon,
  Notebook,
  PanelLeft,
  Pencil,
  Plus,
  Receipt,
  RotateCw,
  Settings,
  ShoppingBag,
  Sparkles,
  Sun,
  Table,
  Trash2,
  Undo2,
  Upload,
  UtensilsCrossed,
  Wallet,
  X,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import { forwardRef } from "react";

import { LUCIDE_FILLED_PROPS } from "@/config/icons";

function createFilledIcon(Base: LucideIcon, displayName: string) {
  const FilledIcon = forwardRef<SVGSVGElement, LucideProps>(
    function FilledIcon(props, ref) {
      return <Base ref={ref} {...LUCIDE_FILLED_PROPS} {...props} />;
    },
  );

  FilledIcon.displayName = displayName;
  return FilledIcon;
}

export type { LucideIcon as Icon, LucideProps as IconProps };

export const ArrowDownIcon = createFilledIcon(ArrowDown, "ArrowDownIcon");
export const ArrowLeftIcon = createFilledIcon(ArrowLeft, "ArrowLeftIcon");
export const ArrowUpIcon = createFilledIcon(ArrowUp, "ArrowUpIcon");
export const ArrowClockwiseIcon = createFilledIcon(RotateCw, "ArrowClockwiseIcon");
export const ArrowUUpLeftIcon = createFilledIcon(Undo2, "ArrowUUpLeftIcon");
export const CalculatorIcon = createFilledIcon(Calculator, "CalculatorIcon");
export const CalendarBlankIcon = createFilledIcon(Calendar, "CalendarBlankIcon");
export const CarIcon = createFilledIcon(Car, "CarIcon");
export const CaretDownIcon = createFilledIcon(ChevronDown, "CaretDownIcon");
export const CaretLeftIcon = createFilledIcon(ChevronLeft, "CaretLeftIcon");
export const CaretRightIcon = createFilledIcon(ChevronRight, "CaretRightIcon");
export const CaretUpIcon = createFilledIcon(ChevronUp, "CaretUpIcon");
export const CheckIcon = createFilledIcon(Check, "CheckIcon");
export const CheckCircleIcon = createFilledIcon(CircleCheck, "CheckCircleIcon");
export const CoinsIcon = createFilledIcon(Coins, "CoinsIcon");
export const CreditCardIcon = createFilledIcon(CreditCard, "CreditCardIcon");
export const CurrencyCircleDollarIcon = createFilledIcon(
  CircleDollarSign,
  "CurrencyCircleDollarIcon",
);
export const DesktopIcon = createFilledIcon(Monitor, "DesktopIcon");
export const DotsThreeIcon = createFilledIcon(Ellipsis, "DotsThreeIcon");
export const DotsThreeVerticalIcon = createFilledIcon(
  EllipsisVertical,
  "DotsThreeVerticalIcon",
);
export const ForkKnifeIcon = createFilledIcon(UtensilsCrossed, "ForkKnifeIcon");
export const FunnelIcon = createFilledIcon(Filter, "FunnelIcon");
export const GearSixIcon = createFilledIcon(Settings, "GearSixIcon");
export const InfinityIcon = createFilledIcon(Infinity, "InfinityIcon");
export const MoonIcon = createFilledIcon(Moon, "MoonIcon");
export const NotebookIcon = createFilledIcon(Notebook, "NotebookIcon");
export const PencilSimpleIcon = createFilledIcon(Pencil, "PencilSimpleIcon");
export const PlusIcon = createFilledIcon(Plus, "PlusIcon");
export const ReceiptIcon = createFilledIcon(Receipt, "ReceiptIcon");
export const ShoppingBagIcon = createFilledIcon(ShoppingBag, "ShoppingBagIcon");
export const SidebarIcon = createFilledIcon(PanelLeft, "SidebarIcon");
export const SparkleIcon = createFilledIcon(Sparkles, "SparkleIcon");
export const SquaresFourIcon = createFilledIcon(LayoutGrid, "SquaresFourIcon");
export const SunIcon = createFilledIcon(Sun, "SunIcon");
export const TableIcon = createFilledIcon(Table, "TableIcon");
export const TrashIcon = createFilledIcon(Trash2, "TrashIcon");
export const TrayIcon = createFilledIcon(Inbox, "TrayIcon");
export const UploadSimpleIcon = createFilledIcon(Upload, "UploadSimpleIcon");
export const WalletIcon = createFilledIcon(Wallet, "WalletIcon");
export const XIcon = createFilledIcon(X, "XIcon");
