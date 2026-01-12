import HeadphoneScroll from "@/components/HeadphoneScroll";
import ProductDetails from "@/components/ProductDetails";

export default function Home() {
  return (
    <main className="bg-[#050505] min-h-screen">
      <HeadphoneScroll />
      <ProductDetails />
      
      {/* Footer / Additional Content could go here */}
      <footer className="py-12 text-center text-white/20 text-sm border-t border-white/5">
        <p>Real X Concept. Not a real product.</p>
      </footer>
    </main>
  );
}
