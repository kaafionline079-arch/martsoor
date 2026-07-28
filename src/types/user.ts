export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  memberSince: string;
  address: {
    line1: string;
    city: string;
    country: string;
  };
};
