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
import {
  UI_LABEL_AMOUNT_IDR,
  UI_LABEL_CATEGORY,
  UI_LABEL_DATE,
  UI_LABEL_DESCRIPTION_OPTIONAL,
  UI_LABEL_DESCRIPTION_PLACEHOLDER,
  UI_LABEL_INBOX_MESSAGE,
  UI_LABEL_INBOX_MESSAGE_PLACEHOLDER,
} from "@/config/ui-labels";
import type { TransactionType } from "@/types/transaction";

export function getDefaultCategoryForType(type: TransactionType): string {
  const match = TRANSACTION_CATEGORIES.find((category) =>
    type === "income"
      ? isIncomeCategory(category.id as TransactionCategoryId)
      : !isIncomeCategory(category.id as TransactionCategoryId),
  );

  return match?.id ?? "other";
}

export function resolveCategoryForEntry(
  type: TransactionType,
  category: string,
): string {
  if (isIncomeCategory(category as TransactionCategoryId)) {
    return type === "income" ? category : getDefaultCategoryForType(type);
  }

  return type === "expense" ? category : getDefaultCategoryForType(type);
}

interface JournalEntryFormFieldsProps {
  type: TransactionType;
  category: string;
  occurredAtText: string;
  amountDefault?: string;
  descriptionDefault?: string;
  rawInputDefault?: string;
  showRawInput?: boolean;
  onTypeChange: (type: TransactionType) => void;
  onCategoryChange: (category: string) => void;
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
            label={UI_LABEL_AMOUNT_IDR}
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

          <FormDialogField label={UI_LABEL_DATE} htmlFor="journal-date" gridItem>
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
          label={UI_LABEL_DESCRIPTION_OPTIONAL}
          htmlFor="journal-description"
        >
          <Input
            id="journal-description"
            name="description"
            defaultValue={descriptionDefault}
            className={FORM_FIELD_INPUT}
            placeholder={UI_LABEL_DESCRIPTION_PLACEHOLDER}
          />
        </FormDialogField>

        <FormDialogField label={UI_LABEL_CATEGORY} htmlFor="journal-category">
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
          <FormDialogField label={UI_LABEL_INBOX_MESSAGE} htmlFor="journal-raw-input">
            <Textarea
              id="journal-raw-input"
              name="rawInput"
              rows={3}
              defaultValue={rawInputDefault}
              placeholder={UI_LABEL_INBOX_MESSAGE_PLACEHOLDER}
              className={FORM_NOTE}
            />
          </FormDialogField>
        </div>
      ) : null}
    </>
  );
}
