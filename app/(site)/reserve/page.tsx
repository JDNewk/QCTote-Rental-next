"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";

const FREE_AREAS = [
  "Bettendorf, IA",
  "Coal Valley, IL",
  "Colona, IL",
  "Davenport, IA",
  "East Moline, IL",
  "Geneseo, IL",
  "LeClaire, IA",
  "Milan, IL",
  "Moline, IL",
  "Port Byron, IL",
  "Rock Island, IL",
  "Silvis, IL",
];

const FEE_AREAS = [
  "Clinton, IA",
  "DeWitt, IA",
  "Eldridge, IA",
  "Muscatine, IA",
  "Orion, IL",
];

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-lime-500 focus:ring-4 focus:ring-lime-400/20";

const checkboxClass =
  "mt-1 h-5 w-5 shrink-0 accent-lime-500";

export default function ReservePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    deliveryArea: "",
    pickupArea: "",
    deliveryDate: "",
    pickupDate: "",
    totePackage: "20-totes",
    extraDolly: false,
    agree: false,
    paymentAuthorization: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const fieldValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : value;

    setForm((currentForm) => {
      if (name === "deliveryDate" && typeof fieldValue === "string") {
        if (!fieldValue) {
          return {
            ...currentForm,
            deliveryDate: "",
            pickupDate: "",
          };
        }

        const [year, month, day] = fieldValue.split("-").map(Number);
        const pickupDate = new Date(Date.UTC(year, month - 1, day));
        pickupDate.setUTCDate(pickupDate.getUTCDate() + 14);

        return {
          ...currentForm,
          deliveryDate: fieldValue,
          pickupDate: pickupDate.toISOString().slice(0, 10),
        };
      }

      return {
        ...currentForm,
        [name]: fieldValue,
      };
    });
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");
    setSubmitError("");

    try {
      const response = await fetch("/api/reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to submit the reservation.");
      }

      setSubmitMessage(
        "Your reservation request was received. QC Tote Rental will contact you to confirm availability and provide an invoice."
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        deliveryArea: "",
        pickupArea: "",
        deliveryDate: "",
        pickupDate: "",
        totePackage: "20-totes",
        extraDolly: false,
        agree: false,
        paymentAuthorization: false,
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to submit the reservation. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
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
    <main className="bg-slate-50 text-slate-950">
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-14 text-center md:py-16">
          <p className="font-bold uppercase tracking-[0.2em] text-lime-400">
            Start Your Reservation
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Reserve Your Moving Totes
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Choose your dates, service locations, and tote package. We will
            confirm availability before your reservation is finalized.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <form
            onSubmit={handleSubmit}
            className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <section>
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 font-black text-slate-950">
                  1
                </span>
                <div>
                  <h2 className="text-xl font-black">Contact Information</h2>
                  <p className="text-sm text-slate-600">
                    Tell us where to reach you and deliver the totes.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block font-semibold">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block font-semibold">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-2 block font-semibold">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    required
                    autoComplete="tel"
                    value={form.phone}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="address" className="mb-2 block font-semibold">
                    Delivery Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    name="address"
                    required
                    autoComplete="street-address"
                    value={form.address}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <section className="border-t border-slate-200 pt-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 font-black text-slate-950">
                  2
                </span>
                <div>
                  <h2 className="text-xl font-black">Requested Rental Dates</h2>
                  <p className="text-sm text-slate-600">
                    Pickup defaults to 14 days after delivery and can be adjusted.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="deliveryDate"
                    className="mb-2 block font-semibold"
                  >
                    Requested Delivery Date
                  </label>
                  <input
                    id="deliveryDate"
                    type="date"
                    name="deliveryDate"
                    required
                    value={form.deliveryDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="pickupDate"
                    className="mb-2 block font-semibold"
                  >
                    Requested Pickup Date
                  </label>
                  <input
                    id="pickupDate"
                    type="date"
                    name="pickupDate"
                    required
                    min={form.deliveryDate || undefined}
                    value={form.pickupDate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <section className="border-t border-slate-200 pt-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 font-black text-slate-950">
                  3
                </span>
                <div>
                  <h2 className="text-xl font-black">Delivery & Pickup Area</h2>
                  <p className="text-sm text-slate-600">
                    Select both towns to calculate the service-area fee.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="deliveryArea"
                    className="mb-2 block font-semibold"
                  >
                    Delivery Town
                  </label>
                  <select
                    id="deliveryArea"
                    name="deliveryArea"
                    required
                    value={form.deliveryArea}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select delivery town</option>
                    {renderAreaOptions("delivery")}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="pickupArea"
                    className="mb-2 block font-semibold"
                  >
                    Pickup Town
                  </label>
                  <select
                    id="pickupArea"
                    name="pickupArea"
                    required
                    value={form.pickupArea}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select pickup town</option>
                    {renderAreaOptions("pickup")}
                  </select>
                </div>
              </div>

              {!locationsSelected && (
                <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  Select the delivery and pickup towns to calculate your fee.
                </p>
              )}

              {locationsSelected && serviceAreaFee === 0 && (
                <div
                  className="mt-5 rounded-xl border border-lime-300 bg-lime-50 p-4 text-slate-900"
                  aria-live="polite"
                >
                  <p className="font-bold">Free delivery and pickup</p>
                  <p className="mt-1 text-sm">
                    Both locations are within our free service area.
                  </p>
                </div>
              )}

              {locationsSelected && serviceAreaFee > 0 && (
                <div
                  className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950"
                  aria-live="polite"
                >
                  <p className="font-bold">
                    Service-area fee: ${serviceAreaFee}
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                    {deliveryFee > 0 && (
                      <li>Delivery outside the free zone: $15</li>
                    )}
                    {pickupFee > 0 && (
                      <li>Pickup outside the free zone: $15</li>
                    )}
                  </ul>
                </div>
              )}

              <p className="mt-4 text-sm text-slate-600">
                Not seeing your town? Contact us before reserving. We may still
                be able to serve your location.
              </p>
            </section>

            <section className="border-t border-slate-200 pt-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 font-black text-slate-950">
                  4
                </span>
                <div>
                  <h2 className="text-xl font-black">Choose Your Package</h2>
                  <p className="text-sm text-slate-600">
                    Every package includes a two-week rental.
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="totePackage"
                  className="mb-2 block font-semibold"
                >
                  Tote Package
                </label>
                <select
                  id="totePackage"
                  name="totePackage"
                  value={form.totePackage}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="20-totes">
                    20 Totes - $99 | $40/week extension
                  </option>
                  <option value="40-totes">
                    40 Totes - $169 | $70/week extension
                  </option>
                  <option value="60-totes">
                    60 Totes - $219 | $100/week extension
                  </option>
                </select>
                <p className="mt-2 text-sm font-semibold text-lime-700">
                  Additional rental weeks: ${extensionRate}/week
                </p>
              </div>

              <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-lime-400">
                <input
                  type="checkbox"
                  name="extraDolly"
                  checked={form.extraDolly}
                  onChange={handleChange}
                  className="h-5 w-5 accent-lime-500"
                />
                <span>
                  <span className="font-bold">Add an extra dolly</span>
                  <span className="ml-2 text-slate-600">$10</span>
                </span>
              </label>
            </section>

            <section className="border-t border-slate-200 pt-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 font-black text-slate-950">
                  5
                </span>
                <div>
                  <h2 className="text-xl font-black">Agreement & Authorization</h2>
                  <p className="text-sm text-slate-600">
                    Review and accept both items before submitting.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-lime-400">
                  <input
                    type="checkbox"
                    name="agree"
                    required
                    checked={form.agree}
                    onChange={handleChange}
                    className={checkboxClass}
                  />
                  <span>
                    I agree to the{" "}
                    <Link
                      href="/agreement"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-lime-700 underline decoration-2 underline-offset-2"
                    >
                      rental agreement
                    </Link>
                    .
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-lime-400">
                  <input
                    type="checkbox"
                    name="paymentAuthorization"
                    required
                    checked={form.paymentAuthorization}
                    onChange={handleChange}
                    className={checkboxClass}
                  />
                  <span className="font-semibold leading-7">
                    I authorize QC Tote Rental to securely save my payment
                    method through Stripe. If I request an extension of my
                    rental, I authorize QC Tote Rental to charge this payment
                    method ${extensionRate} for each additional rental week.
                  </span>
                </label>
              </div>
            </section>

            {submitMessage && (
              <div
                className="rounded-xl border border-lime-300 bg-lime-50 p-4 font-medium text-slate-900"
                role="status"
              >
                {submitMessage}
              </div>
            )}

            {submitError && (
              <div
                className="rounded-xl border border-red-300 bg-red-50 p-4 font-medium text-red-900"
                role="alert"
              >
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-lime-400 px-6 py-4 text-lg font-black text-slate-950 shadow-sm transition hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-lime-400/30 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              {isSubmitting
                ? "Submitting Reservation..."
                : "Submit Reservation Request"}
            </button>

            <p className="text-center text-sm text-slate-500">
              Submitting this form requests a reservation. Availability must be
              confirmed by QC Tote Rental.
            </p>
          </form>

          <aside className="lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl">
              <div className="border-b border-slate-800 p-6">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-lime-400">
                  Reservation Summary
                </p>
                <h2 className="mt-2 text-2xl font-black">Estimated Total</h2>
              </div>

              <div className="space-y-4 p-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-300">Tote package</span>
                  <span className="font-bold">${packagePrice}</span>
                </div>

                {form.extraDolly && (
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-300">Extra dolly</span>
                    <span className="font-bold">$10</span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-300">Service-area fee</span>
                  <span className="text-right font-bold">
                    {locationsSelected ? `$${serviceAreaFee}` : "Select towns"}
                  </span>
                </div>

                <div className="border-t border-slate-700 pt-4">
                  <div className="flex items-end justify-between gap-4">
                    <span className="font-bold">Total before tax</span>
                    <span className="text-3xl font-black text-lime-400">
                      {locationsSelected ? `$${totalBeforeTax}` : "--"}
                    </span>
                  </div>
                </div>

                <p className="text-sm leading-6 text-slate-400">
                  Local sales tax will be calculated and added to your invoice.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-black">What happens next?</h3>
              <ol className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
                <li className="flex gap-3">
                  <span className="font-black text-lime-600">1.</span>
                  We review your requested dates and package.
                </li>
                <li className="flex gap-3">
                  <span className="font-black text-lime-600">2.</span>
                  We contact you to confirm availability.
                </li>
                <li className="flex gap-3">
                  <span className="font-black text-lime-600">3.</span>
                  We provide your invoice and final reservation details.
                </li>
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
