import { useState } from "react";
import { FaMoneyCheck } from "react-icons/fa";
import { GiMoneyStack } from "react-icons/gi";
import { TbWorldDollar } from "react-icons/tb";

interface FormData {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  payment: "cash" | "card" | "online";
}

interface FieldProps {
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  type?: string;
  maxLength?: number;
}

const Field = ({
  label,
  placeholder,
  value,
  error,
  onChange,
  type = "text",
  maxLength,
}: FieldProps) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>

      <input
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
          error
            ? "border-red-500"
            : "border-red-100 focus:border-[#B83232]"
        }`}
      />

      {error && (
        <p className="text-red-500 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

const DeliveryDetails = () => {
  const [form, setForm] = useState<FormData>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
    payment: "cash",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    field: keyof FormData,
    value: string
  ) => {
    let sanitizedValue = value;

    switch (field) {
      case "phone":
        sanitizedValue = value.replace(/\D/g, "");
        break;

      case "fullName":
        sanitizedValue = value.replace(
          /[^a-zA-Zآ-ی\s]/g,
          ""
        );
        break;

      case "city":
        sanitizedValue = value.replace(
          /[^a-zA-Zآ-ی\s]/g,
          ""
        );
        break;
    }

    setForm((prev) => ({
      ...prev,
      [field]: sanitizedValue,
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!/^09\d{9}$/.test(form.phone)) {
      newErrors.phone = "Phone number is invalid";
    }

    if (!form.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!form.city.trim()) {
      newErrors.city = "City is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    const isValid = validate();

    if (!isValid) return;

    const cleanedData = {
      ...form,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      notes: form.notes.trim(),
    };

    console.log("Submitting order:", cleanedData);

    alert("Order submitted successfully!");
  };

  return (
    <div className="bg-white rounded-3xl shadow-md p-6">
      <h2 className="font-serif font-bold text-[#B83232] text-xl mb-5">
        Delivery Details
      </h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Full Name"
          placeholder="e.g. Sara Smith"
          value={form.fullName}
          error={errors.fullName}
          onChange={(v) => handleChange("fullName", v)}
          maxLength={50}
        />

        <Field
          label="Phone Number"
          placeholder="e.g. 09121234567"
          value={form.phone}
          error={errors.phone}
          onChange={(v) => handleChange("phone", v)}
          type="tel"
          maxLength={11}
        />

        <div className="sm:col-span-2">
          <Field
            label="Street Address"
            placeholder="e.g. 12 Bakery Lane, Apt 3"
            value={form.address}
            error={errors.address}
            onChange={(v) => handleChange("address", v)}
            maxLength={200}
          />
        </div>

        <Field
          label="City"
          placeholder="e.g. Tehran"
          value={form.city}
          error={errors.city}
          onChange={(v) => handleChange("city", v)}
          maxLength={50}
        />

        <div />

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Order Notes{" "}
            <span className="text-gray-400 font-normal">
              (optional)
            </span>
          </label>

          <textarea
            rows={3}
            value={form.notes}
            maxLength={500}
            onChange={(e) =>
              handleChange("notes", e.target.value)
            }
            placeholder="Any special instructions? e.g. no nuts, extra frosting..."
            className="w-full border border-red-100 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#B83232] transition-colors resize-none placeholder:text-gray-300"
          />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Payment Method
        </p>

        <div className="flex flex-wrap gap-3">
          {[
            {
              value: "cash" as const,
              label: "Cash on Delivery",
              icon: <GiMoneyStack className="text-lg" />,
            },
            {
              value: "card" as const,
              label: "Card on Delivery",
              icon: <FaMoneyCheck className="text-lg" />,
            },
            {
              value: "online" as const,
              label: "Online Payment",
              icon: <TbWorldDollar className="text-lg" />,
            },
          ].map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  payment: value,
                }))
              }
              className={`px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-all flex items-center gap-2 ${
                form.payment === value
                  ? "bg-[#B83232] text-white border-[#B83232] shadow-md"
                  : "bg-white text-gray-600 border-red-100 hover:border-[#B83232]"
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="mt-6 w-full bg-[#B83232] text-white font-bold py-4 rounded-full hover:bg-[#922727] transition-all"
      >
        Place Order
      </button>
    </div>
  );
};

export default DeliveryDetails;