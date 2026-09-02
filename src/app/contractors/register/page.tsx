"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { saveContractor } from "./actions";
import {
  CONTRACTOR_TYPES,
  TRADE_CATEGORIES,
  emptyContractorFormState,
} from "./options";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm text-red-600 mt-1" role="alert">
      {message}
    </p>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save My Information"}
    </button>
  );
}

export default function ContractorRegisterPage() {
  const [state, formAction] = useActionState(
    saveContractor,
    emptyContractorFormState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Contractor Registration</h1>
      <p className="text-sm text-gray-600 mb-4">
        Tell us about your trade so homeowners in your area can find you.
      </p>

      {state.message && (
        <p
          aria-live="polite"
          className={`mb-4 p-3 rounded text-sm ${
            state.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </p>
      )}

      <form ref={formRef} action={formAction} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="cName" className="block font-medium">
            Business or Individual Name
          </label>
          <input
            id="cName"
            name="cName"
            type="text"
            maxLength={120}
            className="border p-2 w-full rounded"
            placeholder="Smith Plumbing LLC"
            required
          />
          <FieldError message={state.errors.cName} />
        </div>

        {/* Contractor type */}
        <fieldset>
          <legend className="font-medium">I am registering as</legend>
          <div className="flex gap-6 mt-2">
            {CONTRACTOR_TYPES.map((type) => (
              <label key={type.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="contractorType"
                  value={type.value}
                  required
                />
                <span>{type.label}</span>
              </label>
            ))}
          </div>
          <FieldError message={state.errors.contractorType} />
        </fieldset>

        {/* Trade category */}
        <div>
          <label htmlFor="tradeCategory" className="block font-medium">
            Trade Category
          </label>
          <select
            id="tradeCategory"
            name="tradeCategory"
            className="border p-2 w-full rounded"
            defaultValue=""
            required
          >
            <option value="" disabled>
              Select a trade...
            </option>
            {TRADE_CATEGORIES.map((trade) => (
              <option key={trade} value={trade}>
                {trade.charAt(0).toUpperCase() + trade.slice(1)}
              </option>
            ))}
          </select>
          <FieldError message={state.errors.tradeCategory} />
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="metroArea" className="block font-medium">
              Metro Area
            </label>
            <input
              id="metroArea"
              name="metroArea"
              type="text"
              maxLength={80}
              className="border p-2 w-full rounded"
              placeholder="Greater Phoenix"
            />
            <FieldError message={state.errors.metroArea} />
          </div>

          <div>
            <label htmlFor="city" className="block font-medium">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              maxLength={80}
              className="border p-2 w-full rounded"
              placeholder="Scottsdale"
            />
            <FieldError message={state.errors.city} />
          </div>
        </div>

        {/* About */}
        <div>
          <label htmlFor="about" className="block font-medium">
            About
          </label>
          <textarea
            id="about"
            name="about"
            rows={4}
            maxLength={2000}
            className="border p-2 w-full rounded"
            placeholder="Family-run shop, licensed and bonded since 2004..."
          />
          <FieldError message={state.errors.about} />
        </div>

        {/* Services */}
        <div>
          <label htmlFor="services" className="block font-medium">
            Services Offered
          </label>
          <textarea
            id="services"
            name="services"
            rows={4}
            maxLength={2000}
            className="border p-2 w-full rounded"
            placeholder="Repipes, water heater install, drain cleaning, leak detection"
          />
          <FieldError message={state.errors.services} />
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
