import {
  Baby,
  Banknote,
  Beer,
  BookOpen,
  Briefcase,
  Building2,
  Bus,
  Car,
  Coffee,
  CreditCard,
  Dumbbell,
  Ellipsis,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  HandCoins,
  Heart,
  House,
  Landmark,
  Laptop,
  Music,
  PawPrint,
  PiggyBank,
  Pill,
  Plane,
  Receipt,
  RotateCcw,
  Scissors,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Stethoscope,
  Tag,
  Ticket,
  TrendingUp,
  Utensils,
  Wallet,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Colores e íconos que se pueden elegir para una categoría. La base de datos guarda solo la clave.
// Este módulo no toca Prisma para poder usarse en Client Components.

export const CATEGORY_NAME_MAX_LENGTH = 24;

export interface CategoryPalette {
  label: string;
  /** Color del ícono y del texto sobre `tint`. */
  color: string;
  /** Fondo suave del ícono / chip. */
  tint: string;
  /** Color más brillante para gráficas de dona y barras. */
  chartColor: string;
}

export const CATEGORY_PALETTES = {
  orange: { label: "Naranja", color: "#C25E14", tint: "#FCEBDD", chartColor: "#E07A2E" },
  ochre: { label: "Ocre", color: "#9A7410", tint: "#F8EFD3", chartColor: "#D4A72C" },
  pink: { label: "Rosa", color: "#B03A6E", tint: "#F8E3EC", chartColor: "#C2477D" },
  purple: { label: "Morado", color: "#7444C0", tint: "#EEE6FA", chartColor: "#8E5BD6" },
  blue: { label: "Azul", color: "#2F5FC4", tint: "#E2EAFB", chartColor: "#3B6FD8" },
  cyan: { label: "Azul petróleo", color: "#0B6A86", tint: "#DDF0F6", chartColor: "#0B6A86" },
  teal: { label: "Turquesa", color: "#1E7F73", tint: "#DDF2EF", chartColor: "#2A9D8F" },
  slate: { label: "Pizarra", color: "#5B6472", tint: "#ECEEF1", chartColor: "#5B6472" },
  gray: { label: "Gris", color: "#5B6472", tint: "#ECEEF1", chartColor: "#9AA0AA" },
} satisfies Record<string, CategoryPalette>;

export type CategoryPaletteKey = keyof typeof CATEGORY_PALETTES;

export const CATEGORY_ICONS = {
  "shopping-cart": { icon: ShoppingCart, label: "Carrito" },
  "shopping-bag": { icon: ShoppingBag, label: "Bolsa" },
  utensils: { icon: Utensils, label: "Cubiertos" },
  coffee: { icon: Coffee, label: "Café" },
  beer: { icon: Beer, label: "Bebidas" },
  house: { icon: House, label: "Casa" },
  building: { icon: Building2, label: "Edificio" },
  zap: { icon: Zap, label: "Luz" },
  wifi: { icon: Wifi, label: "Internet" },
  smartphone: { icon: Smartphone, label: "Celular" },
  car: { icon: Car, label: "Auto" },
  fuel: { icon: Fuel, label: "Gasolina" },
  bus: { icon: Bus, label: "Transporte público" },
  plane: { icon: Plane, label: "Viajes" },
  heart: { icon: Heart, label: "Corazón" },
  pill: { icon: Pill, label: "Medicinas" },
  stethoscope: { icon: Stethoscope, label: "Doctor" },
  dumbbell: { icon: Dumbbell, label: "Gimnasio" },
  ticket: { icon: Ticket, label: "Boleto" },
  music: { icon: Music, label: "Música" },
  gamepad: { icon: Gamepad2, label: "Videojuegos" },
  "book-open": { icon: BookOpen, label: "Libros" },
  "graduation-cap": { icon: GraduationCap, label: "Educación" },
  shirt: { icon: Shirt, label: "Ropa" },
  scissors: { icon: Scissors, label: "Cuidado personal" },
  gift: { icon: Gift, label: "Regalos" },
  baby: { icon: Baby, label: "Bebé" },
  "paw-print": { icon: PawPrint, label: "Mascotas" },
  wrench: { icon: Wrench, label: "Reparaciones" },
  receipt: { icon: Receipt, label: "Recibo" },
  "credit-card": { icon: CreditCard, label: "Tarjeta" },
  landmark: { icon: Landmark, label: "Banco" },
  banknote: { icon: Banknote, label: "Billete" },
  laptop: { icon: Laptop, label: "Laptop" },
  briefcase: { icon: Briefcase, label: "Trabajo" },
  tag: { icon: Tag, label: "Etiqueta" },
  "rotate-ccw": { icon: RotateCcw, label: "Reembolso" },
  "hand-coins": { icon: HandCoins, label: "Préstamo" },
  "piggy-bank": { icon: PiggyBank, label: "Ahorro" },
  wallet: { icon: Wallet, label: "Cartera" },
  "trending-up": { icon: TrendingUp, label: "Inversiones" },
  ellipsis: { icon: Ellipsis, label: "Otro" },
} satisfies Record<string, { icon: LucideIcon; label: string }>;

export type CategoryIconKey = keyof typeof CATEGORY_ICONS;

export function isCategoryPaletteKey(value: unknown): value is CategoryPaletteKey {
  return typeof value === "string" && Object.hasOwn(CATEGORY_PALETTES, value);
}

export function isCategoryIconKey(value: unknown): value is CategoryIconKey {
  return typeof value === "string" && Object.hasOwn(CATEGORY_ICONS, value);
}
