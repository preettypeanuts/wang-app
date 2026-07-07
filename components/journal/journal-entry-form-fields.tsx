import { JournalCategoryCombobox } from "@/components/journal/journal-category-combobox";
import { JournalEntryTypeToggle } from "@/components/journal/journal-entry-type-toggle";
import { AmountTextInput } from "@/components/shared/amount-text-input";
import { FormDatePicker } from "@/components/shared/form-date-picker";
import { FormDialogField } from "@/components/shared/form-dialog-field";
import { Input } from "@/components/ui/input";
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
  FORM_GROUP,
  FORM_NOTE,
} from "@/config/form-dialog";
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
  function handleTypeChange(nextType: TransactionType) {
    onTypeChange(nextType);
    onCategoryChange(resolveCategoryForEntry(nextType, category));
  }

  return (
    <>
      <div className={FORM_GROUP}>
        <JournalEntryTypeToggle value={type} onChange={handleTypeChange} />

        <div className={FORM_FIELD_GRID_ROW}>
          <FormDialogField
            label="Nominal (Rp)"
            htmlFor="journal-amount"
            gridItem
          >
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

        <FormDialogField
          label="Deskripsi (opsional)"
          htmlFor="journal-description"
        >
          <Input
            id="journal-description"
            name="description"
            defaultValue={descriptionDefault}
            className={FORM_FIELD_INPUT}
            placeholder="Belanja harian, gaji, dll."
          />
        </FormDialogField>

        <FormDialogField label="Kategori" htmlFor="journal-category">
          <JournalCategoryCombobox
            id="journal-category"
            type={type}
            value={category}
            onChange={onCategoryChange}
          />
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
