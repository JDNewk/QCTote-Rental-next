"use client";

import { ChangeEvent, FormEvent, useState } from "react";

const FREE_AREAS = [
  "Davenport, IA",
  "Bettendorf, IA",
  "Rock Island, IL",
  "Moline, IL",
  "East Moline, IL",
  "Silvis, IL",
  "Milan, IL",
  "Geneseo, IL",
  "Coal Valley, IL",
  "Colona, IL",
  "Port Byron, IL",
  "LeClaire, IA",
];

const FEE_AREAS = [
  "Muscatine, IA",
  "Clinton, IA",
  "Eldridge, IA",
  "DeWitt, IA",
  "Orion, IL",
];

export default function ReservePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    deliveryArea: "",
    pickupArea: "",
    totePackage: "20-totes",
    extraDolly: false,
    agree: false,
    paymentAuthorization: false,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const fieldValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : value;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: fieldValue,
    }));
  };

  const deliveryFee = FEE_AREAS.includes(form.deliveryArea) ? 15 : 0;
  const pickupFee = FEE_AREAS.includes(form.pickupArea) ? 15 : 0;
  const serviceAreaFee = deliveryFee + pickupFee;
  const packagePrice =
    form.totePackage === "20-totes"
      ? 99
      : form.totePackage === "40-totes"
        ? 169
        : 219;
  const dollyFee = form.extraDolly ? 10 : 0;
  const extensionRate =
  form.totePackage === "20-totes"
  ? 40
  : form.totePackage === "40-totes"
  ? 70
  : form.totePackage === "60-totes"
  ? 100
  : 0;
  const totalBeforeTax = packagePrice + serviceAreaFee + dollyFee;
  const locationsSelected =
    form.deliveryArea !== "" && form.pickupArea !== "";

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(
      `Reservation submitted! Service-area fee: $${serviceAreaFee}. Backend integration coming next.`
    );
  };

  const renderAreaOptions = (leg: "delivery" | "pickup") => (
    <>
      <optgroup label={`Free ${leg}`}>
        {FREE_AREAS.map((area) => (
          <option key={`${leg}-${area}`} value={area}>
            {area}
          </option>
        ))}
      </optgroup>

      <optgroup label={`$15 ${leg} fee`}>
        {FEE_AREAS.map((area) => (
          <option key={`${leg}-${area}`} value={area}>
            {area}
          </option>
        ))}
      </optgroup>
    </>
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="mb-6 text-center text-3xl font-bold">
        Reserve Your Totes
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl bg-white p-6 shadow-sm"
      >
        <div>
          <label htmlFor="name" className="mb-2 block font-medium">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block font-medium">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            name="phone"
            required
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>

        <div>
          <label htmlFor="address" className="mb-2 block font-medium">
            Delivery Address
          </label>
          <input
            id="address"
            type="text"
            name="address"
            required
            value={form.address}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h2 className="mb-1 text-lg font-semibold">
            Delivery and Pickup Area
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            Select both towns to see whether a service-area fee applies.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="deliveryArea"
                className="mb-2 block font-medium"
              >
                Delivery Town
              </label>
              <select
                id="deliveryArea"
                name="deliveryArea"
                required
                value={form.deliveryArea}
                onChange={handleChange}
                className="w-full rounded-lg border bg-white px-4 py-2"
              >
                <option value="">Select delivery town</option>
                {renderAreaOptions("delivery")}
              </select>
            </div>

            <div>
              <label
                htmlFor="pickupArea"
                className="mb-2 block font-medium"
              >
                Pickup Town
              </label>
              <select
                id="pickupArea"
                name="pickupArea"
                required
                value={form.pickupArea}
                onChange={handleChange}
                className="w-full rounded-lg border bg-white px-4 py-2"
              >
                <option value="">Select pickup town</option>
                {renderAreaOptions("pickup")}
              </select>
            </div>
          </div>

          {!locationsSelected && (
            <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
              Select the delivery and pickup towns to calculate your fee.
            </p>
          )}

          {locationsSelected && serviceAreaFee === 0 && (
            <div
              className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800"
              aria-live="polite"
            >
              <p className="font-semibold">Free delivery and pickup</p>
              <p className="text-sm">
                Both locations are within our free service area.
              </p>
            </div>
          )}

          {locationsSelected && serviceAreaFee > 0 && (
            <div
              className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-yellow-900"
              aria-live="polite"
            >
              <p className="font-semibold">
                Service-area fee: ${serviceAreaFee}
              </p>
              <ul className="mt-1 list-disc pl-5 text-sm">
                {deliveryFee > 0 && (
                  <li>Delivery outside the free zone: $15</li>
                )}
                {pickupFee > 0 && (
                  <li>Pickup outside the free zone: $15</li>
                )}
              </ul>
            </div>
          )}

          <p className="mt-3 text-sm text-gray-600">
            Not seeing your town? Contact us before reserving. We may still
            be able to serve your location.
          </p>
        </div>

        <div>
          <label
            htmlFor="totePackage"
            className="mb-2 block font-medium"
          >
            Tote Package
          </label>
          <select
            id="totePackage"
            name="totePackage"
            value={form.totePackage}
            onChange={handleChange}
            className="w-full rounded-lg border bg-white px-4 py-2"
          >
            <option value="20-totes">20 Totes - $99 | $40/week extension</option>
            <option value="40-totes">40 Totes - $169 | $70/week extension</option>
            <option value="60-totes">60 Totes - $219 | $100/week extension</option>
          </select>
          <p className="mt-1 text-sm text-gray-600">
            All tote packages include a 2-week rental.
          </p>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="extraDolly"
            checked={form.extraDolly}
            onChange={handleChange}
          />
          <span>Extra Dolly ($10)</span>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="agree"
            required
            checked={form.agree}
            onChange={handleChange}
            className="mt-1"
          />
          <span>
            I agree to the{" "}
            <a
              href="/agreement"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              rental agreement
            </a>
          </span>
        </label>
        <label className="flex items-start gap-3">

 <input

 type="checkbox"

 name="paymentAuthorization"

 required

 checked={form.paymentAuthorization}

 onChange={handleChange}

 className="mt-1"

 />

 <span className="font-semibold">

I authorize QC Tote Rental to securely save my payment method through Stripe. If I request an extension of my rental, I authorize QC Tote Rental to charge this payment method ${extensionRate} for each additional rental week.
 </span>

</label>

        <div className="space-y-2 rounded-lg bg-gray-100 p-4">
          <div className="flex items-center justify-between">
            <span>Tote package</span>
            <span>${packagePrice}</span>
          </div>

          {form.extraDolly && (
            <div className="flex items-center justify-between">
              <span>Extra Dolly</span>
              <span>$10</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span>Service-area fee</span>
            <span>
              {locationsSelected ? `$${serviceAreaFee}` : "Select towns"}
            </span>
          </div>

          <div className="flex items-center justify-between border-t pt-2 text-lg font-bold">
            <span>Total before tax</span>
            <span>{locationsSelected ? `$${totalBeforeTax}` : "--"}</span>
          </div>

          <p className="text-sm text-gray-600">
            Local sales tax will be calculated and added to your invoice.
          </p>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Submit Reservation
        </button>
      </form>
    </div>
  );
}
