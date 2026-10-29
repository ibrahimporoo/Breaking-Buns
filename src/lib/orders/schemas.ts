import { z } from "zod";
import { MAX_LINES, MAX_QUANTITY } from "@/lib/cart";
import { PAYMENT_METHODS } from "@/lib/orders/status";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters`)
    .optional()
    .transform((value) => value || undefined);

export const placeOrderSchema = z
  .object({
    items: z
      .array(
        z.object({
          itemId: z.uuid(),
          quantity: z.number().int().min(1).max(MAX_QUANTITY),
        }),
      )
      .min(1, "Your cart is empty")
      .max(MAX_LINES),
    name: z.string().trim().min(2, "Enter your name").max(80),
    email: z
      .email("Enter a valid email address")
      .max(120)
      .transform((value) => value.toLowerCase()),
    phone: z
      .string()
      .trim()
      .min(7, "Enter a phone number we can call")
      .max(30)
      .regex(/^[+()\d\s.-]+$/, "Enter a valid phone number"),
    fulfillment: z.enum(["delivery", "pickup"]),
    addressLine: optionalText(160),
    city: optionalText(80),
    postalCode: optionalText(20),
    deliveryNotes: optionalText(200),
    orderNotes: optionalText(300),
    paymentMethod: z.enum(PAYMENT_METHODS),
    expectedTotalCents: z.number().int().min(0),
    website: z.string().max(0).optional(),
  })
  .superRefine((value, context) => {
    if (value.fulfillment !== "delivery") return;

    const required = [
      ["addressLine", "Enter your street address"],
      ["city", "Enter your city"],
      ["postalCode", "Enter your postal code"],
    ] as const;

    for (const [field, message] of required) {
      if (!value[field]) {
        context.addIssue({ code: "custom", path: [field], message });
      }
    }
  });

export type PlaceOrderInput = z.input<typeof placeOrderSchema>;
export type PlaceOrderData = z.output<typeof placeOrderSchema>;

export const trackingTokenSchema = z.string().min(16).max(128);
