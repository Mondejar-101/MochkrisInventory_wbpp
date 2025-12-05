import React, { useState } from "react";
import { useSystem } from "../context/SystemContext";
import { FilePlus, ClipboardList, CheckCircle, Clock } from "lucide-react";

export default function RequisitionForm() {
  const { createRequisition, requisitions } = useSystem();
  const [item, setItem] = useState("");
  const [qty, setQty] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    createRequisition(item, qty);
    setItem("");
    setQty("");

    // cleaner toast-style alert
    window.alert("✔ Requisition Form Submitted Successfully!");
  };

  return (
    <div className="space-y-10 animate-fadeIn">

      {/* -------------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------------- */}
      <div className="flex items-center gap-3">
        <FilePlus size={28} className="text-indigo-600" />
        <h2 className="text-xl font-bold text-slate-800">
          Create Material Requisition (RF)
        </h2>
      </div>

      {/* -------------------------------------- */}
      {/* FORM */}
      {/* -------------------------------------- */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-sm border border-slate-200 rounded-xl p-6 space-y-4 card-hover"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-slate-600">
              Material / Item Name
            </label>
            <input
              type="text"
              placeholder="e.g., Upholstery Fabric"
              className="mt-1 border border-slate-300 w-full rounded-lg p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600">
              Quantity Needed
            </label>
            <input
              type="number"
              min="1"
              placeholder="Qty"
              className="mt-1 border border-slate-300 w-full rounded-lg p-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition flex justify-center items-center gap-2"
        >
          <ClipboardList size={18} />
          Submit Requisition Form
        </button>
      </form>

      {/* -------------------------------------- */}
      {/* USER REQUESTS LIST */}
      {/* -------------------------------------- */}
      <div>
        <h3 className="text-lg font-bold text-slate-700 mb-3">
          My Requisition Requests
        </h3>

        {/* TABLE */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-600 text-xs uppercase tracking-wide">
                <th className="p-3 text-left">Item</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Last Update</th>
              </tr>
            </thead>

            <tbody>
              {requisitions.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-slate-400">
                    No requests submitted yet.
                  </td>
                </tr>
              )}

              {requisitions.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-slate-200 hover:bg-slate-50 transition"
                >
                  <td className="p-3 font-medium text-slate-700">
                    {r.item}{" "}
                    <span className="text-slate-400 text-xs">(x{r.qty})</span>
                  </td>

                  {/* STATUS CHIP */}
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold 
                      ${
                        r.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : r.status.includes("VP")
                          ? "bg-blue-100 text-blue-700"
                          : r.status.includes("CUSTODIAN")
                          ? "bg-amber-100 text-amber-700"
                          : r.status.includes("PURCHASING")
                          ? "bg-orange-100 text-orange-700"
                          : "bg-slate-200 text-slate-700"
                      }
                    `}
                    >
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </td>

                  {/* HISTORY */}
                  <td className="p-3 text-slate-500 text-xs flex items-center gap-1">
                    <Clock size={14} className="text-slate-400" />
                    {r.history[r.history.length - 1]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
