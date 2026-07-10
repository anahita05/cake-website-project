import { FaMoneyCheck } from "react-icons/fa";
import { GiMoneyStack } from "react-icons/gi";
import { TbWorldDollar } from "react-icons/tb";

import { useForm } from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

const deliverySchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .max(50),

  phone: z
    .string()
    .regex(
      /^09\d{9}$/,
      "Phone number is invalid"
    ),

  address: z
    .string()
    .trim()
    .min(5, "Address is required")
    .max(200),

  city: z
    .string()
    .trim()
    .min(2, "City is required")
    .max(50),

  notes: z
    .string()
    .max(500)
    .optional(),

  payment: z.enum([
    "cash",
    "card",
    "online",
  ]),
});

type DeliveryFormData =
  z.infer<typeof deliverySchema>;

interface FieldProps {
  label: string;
  placeholder: string;
  error?: string;
  registration: any;
  type?: string;
}

const Field = ({
  label,
  placeholder,
  error,
  registration,
  type = "text",
}: FieldProps) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        {...registration}
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
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DeliveryFormData>({
    resolver: zodResolver(
      deliverySchema
    ),

    defaultValues: {
      fullName: "",
      phone: "",
      address: "",
      city: "",
      notes: "",
      payment: "cash",
    },
  });

  const payment = watch("payment");

  const onSubmit = (
    data: DeliveryFormData
  ) => {
    console.log(data);

    alert(
      "Order submitted successfully!"
    );
  };

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit
      )}
      className="bg-white rounded-3xl shadow-md p-6"
    >
      <h2 className="font-serif font-bold text-[#B83232] text-xl mb-5">
        Delivery Details
      </h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Full Name"
          placeholder="e.g. Sara Smith"
          error={
            errors.fullName?.message
          }
          registration={register(
            "fullName"
          )}
        />

        <Field
          label="Phone Number"
          placeholder="e.g. 09121234567"
          type="tel"
          error={
            errors.phone?.message
          }
          registration={register(
            "phone"
          )}
        />

        <div className="sm:col-span-2">
          <Field
            label="Street Address"
            placeholder="e.g. 12 Bakery Lane"
            error={
              errors.address?.message
            }
            registration={register(
              "address"
            )}
          />
        </div>

        <Field
          label="City"
          placeholder="e.g. Tehran"
          error={
            errors.city?.message
          }
          registration={register(
            "city"
          )}
        />

        <div />

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Order Notes
          </label>

          <textarea
            rows={3}
            maxLength={500}
            {...register("notes")}
            placeholder="Special instructions..."
            className="w-full border border-red-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#B83232]"
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
              label:
                "Cash on Delivery",
              icon: (
                <GiMoneyStack />
              ),
            },
            {
              value: "card" as const,
              label:
                "Card on Delivery",
              icon: (
                <FaMoneyCheck />
              ),
            },
            {
              value:
                "online" as const,
              label:
                "Online Payment",
              icon: (
                <TbWorldDollar />
              ),
            },
          ].map(
            ({
              value,
              label,
              icon,
            }) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setValue(
                    "payment",
                    value
                  )
                }
                className={`px-5 py-2.5 rounded-full text-sm font-semibold border-2 flex items-center gap-2 ${
                  payment === value
                    ? "bg-[#B83232] text-white border-[#B83232]"
                    : "bg-white text-gray-600 border-red-100"
                }`}
              >
                {icon}
                {label}
              </button>
            )
          )}
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 w-full bg-[#B83232] text-white font-bold py-4 rounded-full hover:bg-[#922727]"
      >
        Place Order
      </button>
    </form>
  );
};

export default DeliveryDetails;