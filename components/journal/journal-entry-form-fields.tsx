import { AmountTextInput } from "@/components/shared/amount-text-input";
import { FormDatePicker } from "@/components/shared/form-date-picker";
import { FormDialogField } from "@/components/shared/form-dialog-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  isIncomeCategory,
  TRANSACTION_CATEGORIES,
  type TransactionCategoryId,
} from "@/config/categories";
import {
  FORM_FIELD_DATE,
  FORM_FIELD_GRID_ROW,
  FORM_FIELD_INPUT,
  FORM_FIELD_SELECT,
  FORM_GROUP,
  FORM_NOTE,
  FORM_SEGMENT,
  FORM_SEGMENT_ACTIVE,
  FORM_SEGMENT_INACTIVE,
  FORM_SEGMENTED,
} from "@/config/form-dialog";
import {
  PLANNER_SELECT_CONTENT,
  PLANNER_SELECT_ITEM,
  PLANNER_SELECT_TRIGGER,
} from "@/config/planner-manage";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/types/transaction";

export function getDefaultCategoryForType(
  type: TransactionType,
): TransactionCategoryId {
  const match = TRANSACTION_CATEGORIES.find((category) =>
    type === "income"
      ? isIncomeCategory(category.id as TransactionCategoryId)
      : !isIncomeCategory(category.id as TransactionCategoryId),
  );

  return (match?.id ?? "other") as TransactionCategoryId;
}

export function resolveCategoryForEntry(
  type: TransactionType,
  category: string,
): TransactionCategoryId {
  const normalized = category as TransactionCategoryId;
  const isIncome = isIncomeCategory(normalized);

  if ((type === "income" && isIncome) || (type === "expense" && !isIncome)) {
    return normalized;
  }

  return getDefaultCategoryForType(type);
}

interface JournalEntryFormFieldsProps {
  type: TransactionType;
  category: TransactionCategoryId;
  occurredAtText: string;
  amountDefault?: string;
  descriptionDefault?: string;
  rawInputDefault?: string;
  showRawInput?: boolean;
  onTypeChange: (type: TransactionType) => void;
  onCategoryChange: (category: TransactionCategoryId) => void;
  onOccurredAtTextChange: (value: string) => void;
}

export function JournalEntryFormFields({
  type,
  category,
  occurredAtText,
  amountDefault = "",
  descriptionDefault = "",
  rawInputDefault = "",
  showRawInput = false,
  onTypeChange,
  onCategoryChange,
  onOccurredAtTextChange,
}: JournalEntryFormFieldsProps) {
  const categoryOptions = TRANSACTION_CATEGORIES.filter((item) =>
    type === "income"
      ? isIncomeCategory(item.id as TransactionCategoryId)
      : !isIncomeCategory(item.id as TransactionCategoryId),
  );

  function handleTypeChange(nextType: TransactionType) {
    onTypeChange(nextType);
    onCategoryChange(resolveCategoryForEntry(nextType, category));
  }

  return (
    <>
      <div className={FORM_GROUP}>
        <fieldset className="border-0 px-4 py-3">
          <legend className="sr-only">Jenis transaksi</legend>
          <div className={FORM_SEGMENTED}>
            <button
              type="button"
              aria-pressed={type === "expense"}
              onClick={() => handleTypeChange("expense")}
              className={cn(
                FORM_SEGMENT,
                type === "expense"
                  ? FORM_SEGMENT_ACTIVE
                  : FORM_SEGMENT_INACTIVE,
              )}
            >
              Keluar
            </button>
            <button
              type="button"
              aria-pressed={type === "income"}
              onClick={() => handleTypeChange("income")}
              className={cn(
                FORM_SEGMENT,
                type === "income"
                  ? FORM_SEGMENT_ACTIVE
                  : FORM_SEGMENT_INACTIVE,
              )}
            >
              Masuk
            </button>
          </div>
        </fieldset>

        <div className={FORM_FIELD_GRID_ROW}>
          <FormDialogField label="Nominal (Rp)" htmlFor="journal-amount" gridItem>
            <AmountTextInput
              id="journal-amount"
              name="amount"
              required
              defaultValue={amountDefault}
              className={FORM_FIELD_INPUT}
              placeholder="0"
            />
          </FormDialogField>

          <FormDialogField label="Tanggal" htmlFor="journal-date" gridItem>
            <FormDatePicker
              id="journal-date"
              name="occurredAt"
              value={occurredAtText}
              onChange={onOccurredAtTextChange}
              className={FORM_FIELD_DATE}
            />
          </FormDialogField>
        </div>

        <FormDialogField label="Deskripsi" htmlFor="journal-description">
          <Input
            id="journal-description"
            name="description"
            required
            defaultValue={descriptionDefault}
            className={FORM_FIELD_INPUT}
            placeholder="Belanja harian, gaji, dll."
          />
        </FormDialogField>

        <FormDialogField label="Kategori" htmlFor="journal-category">
          <Select
            value={category}
            onValueChange={(value) => {
              if (value) {
                onCategoryChange(value as TransactionCategoryId);
              }
            }}
          >
            <SelectTrigger
              id="journal-category"
              className={cn(FORM_FIELD_SELECT, PLANNER_SELECT_TRIGGER)}
            >
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent className={PLANNER_SELECT_CONTENT}>
              {categoryOptions.map((item) => (
                <SelectItem
                  key={item.id}
                  value={item.id}
                  className={PLANNER_SELECT_ITEM}
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormDialogField>
      </div>

      {showRawInput ? (
        <div className={FORM_GROUP}>
          <FormDialogField label="Pesan inbox" htmlFor="journal-raw-input">
            <Textarea
              id="journal-raw-input"
              name="rawInput"
              rows={3}
              defaultValue={rawInputDefault}
              placeholder="Pesan asli dari inbox"
              className={FORM_NOTE}
            />
          </FormDialogField>
        </div>
      ) : null}
    </>
  );
}
