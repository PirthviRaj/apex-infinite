export type CheckoutResult = {
  personal: {
    fullName: string;
    phone: string;
    email: string;
  };
  address?: {
    line1: string;
    line2: string;
    city: string;
    zip: string;
    notes: string;
  };
  payment: {
    method: "card" | "apexpay" | "cash";
    cardLast4?: string;
  };
};
