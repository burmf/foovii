export type MenuCategory = {
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
};

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  tags?: string[];
  image?: string;
};

export type StoreConfig = {
  slug: string;
  displayName: string;
  address: string;
  heroImage?: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  categories: MenuCategory[];
};
