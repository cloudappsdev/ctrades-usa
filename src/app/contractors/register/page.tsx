"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveContractor } from "./actions";
import {
  CONTRACTOR_TYPES,
  TRADE_CATEGORIES,
  emptyContractorFormState,
} from "./options";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/src/components/ui/combobox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/src/components/ui/field";
import { Input } from "@/src/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Textarea } from "@/src/components/ui/textarea";

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Saving..." : "Save My Information"}
    </Button>
  );
}

function TradeCategoryField({ error }: { error?: string }) {
  const [value, onValueChange] = useState("");
  const trimmed = value.trim();
  const isKnown = TRADE_CATEGORIES.some(
    (trade) => trade === trimmed.toLowerCase(),
  );

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="tradeCategory">Trade Category</FieldLabel>

      {/* The combobox is a rich widget; this carries the value into FormData. */}
      <input type="hidden" name="tradeCategory" value={trimmed} />

      <Combobox
        items={TRADE_CATEGORIES}
        inputValue={value}
        onInputValueChange={(next) => onValueChange(next)}
        onValueChange={(next) => {
          if (typeof next === "string") onValueChange(next);
        }}
      >
        <ComboboxInput
          id="tradeCategory"
          placeholder="Search trades, or type your own..."
          aria-invalid={!!error}
          showClear
        />
        <ComboboxContent>
          <ComboboxEmpty>
            {trimmed
              ? `No match — "${trimmed}" will be saved as typed.`
              : "No matching trade."}
          </ComboboxEmpty>
          <ComboboxList>
            {(trade: string) => (
              <ComboboxItem key={trade} value={trade}>
                {titleCase(trade)}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      <FieldDescription>
        {trimmed && !isKnown
          ? "Not in our list — we'll save it exactly as you typed it."
          : "Pick from the list, or type a trade we haven't listed."}
      </FieldDescription>
      <FieldError>{error}</FieldError>
    </Field>
  );
}

export default function ContractorRegisterPage() {
  const [state, formAction] = useActionState(
    saveContractor,
    emptyContractorFormState,
  );

  return (
    <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Contractor Registration</CardTitle>
          <CardDescription>
            Tell us about your trade so homeowners in your area can find you.
          </CardDescription>
        </CardHeader>

        {state.message && (
          <div
            aria-live="polite"
            className={`mx-4 mb-6 rounded-md p-3 text-sm sm:mx-6 ${
              state.ok
                ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {state.message}
          </div>
        )}

        {/* Remounting on a new savedId clears every field after a successful save. */}
        <form key={state.savedId ?? "new"} action={formAction}>
          <CardContent>
            <FieldGroup className="gap-6 sm:gap-7">
              <Field data-invalid={!!state.errors.cName}>
                <FieldLabel htmlFor="cName">
                  Business or Individual Name
                </FieldLabel>
                <Input
                  id="cName"
                  name="cName"
                  maxLength={120}
                  placeholder="Smith Plumbing LLC"
                  aria-invalid={!!state.errors.cName}
                  required
                />
                <FieldError>{state.errors.cName}</FieldError>
              </Field>

              <FieldSet data-invalid={!!state.errors.contractorType}>
                <FieldLegend variant="label">I am registering as</FieldLegend>
                <RadioGroup
                  name="contractorType"
                  required
                  className="sm:grid-cols-2"
                >
                  {CONTRACTOR_TYPES.map((type) => (
                    <FieldLabel key={type.value} htmlFor={type.value}>
                      <Field orientation="horizontal">
                        <RadioGroupItem id={type.value} value={type.value} />
                        <span>{type.label}</span>
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
                <FieldError>{state.errors.contractorType}</FieldError>
              </FieldSet>

              <TradeCategoryField error={state.errors.tradeCategory} />

              <div className="grid gap-6 sm:grid-cols-2 sm:gap-7">
                <Field data-invalid={!!state.errors.metroArea}>
                  <FieldLabel htmlFor="metroArea">Metro Area</FieldLabel>
                  <Input
                    id="metroArea"
                    name="metroArea"
                    maxLength={80}
                    placeholder="Greater Phoenix"
                    aria-invalid={!!state.errors.metroArea}
                  />
                  <FieldError>{state.errors.metroArea}</FieldError>
                </Field>

                <Field data-invalid={!!state.errors.city}>
                  <FieldLabel htmlFor="city">City</FieldLabel>
                  <Input
                    id="city"
                    name="city"
                    maxLength={80}
                    placeholder="Scottsdale"
                    aria-invalid={!!state.errors.city}
                  />
                  <FieldError>{state.errors.city}</FieldError>
                </Field>
              </div>

              <Field data-invalid={!!state.errors.about}>
                <FieldLabel htmlFor="about">About</FieldLabel>
                <Textarea
                  id="about"
                  name="about"
                  rows={4}
                  maxLength={2000}
                  placeholder="Family-run shop, licensed and bonded since 2004..."
                  aria-invalid={!!state.errors.about}
                />
                <FieldDescription>
                  A short introduction homeowners will see on your profile.
                </FieldDescription>
                <FieldError>{state.errors.about}</FieldError>
              </Field>

              <Field data-invalid={!!state.errors.services}>
                <FieldLabel htmlFor="services">Services Offered</FieldLabel>
                <Textarea
                  id="services"
                  name="services"
                  rows={4}
                  maxLength={2000}
                  placeholder="Repipes, water heater install, drain cleaning, leak detection"
                  aria-invalid={!!state.errors.services}
                />
                <FieldError>{state.errors.services}</FieldError>
              </Field>
            </FieldGroup>
          </CardContent>

          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
