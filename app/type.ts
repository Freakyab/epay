export type ProductType = {
  _id: string;
  title: string;
  slug: string;
  price: number;
  description: string;
  category: string;
  image: string;
  discountPercentage: number;
  tags: string[];
  brand: string;
  weight: number;
  rating: {
    rate: number;
    count: number;
  };
  reviews: {
    rating: number;
    comment: string;
    date: Date;
    reviewerName: string;
    reviewerEmail: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type User = {
  error: any;
  message: any;
  username: string,
  email: string,
  password: string,
  _id: string,
  picture?: string,
}

export type CartProps = {
  product: ProductType;
  quantity: number;
  selected: boolean;
};

export type AddressType = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  userId: string;
  _id: string;
};

export type OrderProps = {
  products: ProductType[];
  transactionDetails: {
    _id: string;
    price: number;
    transactionId: string;
    uid: string;
    status: string;
    products: [{ productId: string; quantity: number }];
    createdAt : Date;
  };
  addressDetails: AddressType;
};