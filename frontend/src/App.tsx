
import { Routes, Route } from "react-router-dom";
import AdminResourceCataloguePage from "./pages/AdminResourceCataloguePage.tsx";

import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminResourceCataloguePage />} />
      <Route path="/admin/resources" element={<AdminResourceCataloguePage />} />
      <Route path="*" element={<div style={{ padding: '20px' }}>404 Not Found - Check Routing</div>} />
    </Routes>
  );

}