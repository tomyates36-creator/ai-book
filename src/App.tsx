import { BrowserRouter, Route, Routes } from "react-router-dom";
import { StoreProvider } from "@/lib/store";
import Landing from "@/pages/Landing";
import Create from "@/pages/Create";
import Preview from "@/pages/Preview";
import Checkout from "@/pages/Checkout";
import Book from "@/pages/Book";
import Privacy from "@/pages/Privacy";

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/create" element={<Create />} />
          <Route path="/choose" element={<Create />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/book" element={<Book />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
