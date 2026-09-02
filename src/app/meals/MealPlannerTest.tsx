"use client";

import { useState } from "react";
import { saveMealPlan } from "./planner/actions";

export default function MealPlannerTest() {
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(false);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Meal Planning Form</h1>

      <form action={saveMealPlan} className="space-y-6">
        {/* Text Inputs */}
        <div>
          <label className="block font-medium">Meal Plan Name</label>
          <input
            name="planName"
            type="text"
            className="border p-2 w-full rounded"
            placeholder="Weekly High-Protein Plan"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Primary Ingredient</label>
          <input
            name="primaryIngredient"
            type="text"
            className="border p-2 w-full rounded"
            placeholder="Chicken, Tofu, Salmon..."
          />
        </div>

        {/* Date Field */}
        <div>
          <label className="block font-medium">Start Date</label>
          <input
            name="startDate"
            type="date"
            className="border p-2 w-full rounded"
            required
          />
        </div>

        {/* Select Dropdown */}
        <div>
          <label className="block font-medium">Meal Frequency</label>
          <select
            name="mealFrequency"
            className="border p-2 w-full rounded"
            defaultValue="3"
          >
            <option value="2">2 meals/day</option>
            <option value="3">3 meals/day</option>
            <option value="4">4 meals/day</option>
          </select>
        </div>

        {/* Checkbox */}
        <div className="flex items-center gap-2">
          <input
            name="vegetarian"
            type="checkbox"
            checked={isVegetarian}
            onChange={() => setIsVegetarian(!isVegetarian)}
          />
          <label className="font-medium">Vegetarian Only</label>
        </div>

        {/* Toggle (styled checkbox) */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Auto‑Generate Grocery List</span>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="autoGenerate"
              checked={autoGenerate}
              onChange={() => setAutoGenerate(!autoGenerate)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-all"></div>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Meal Plan
        </button>
      </form>
    </div>
  );
}
