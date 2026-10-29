import CartDrawer from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";
import ScrollProgress from "@/components/shared/ScrollProgress";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <CartProvider>
      <ScrollProgress />
      <Navbar />
      {children}
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
