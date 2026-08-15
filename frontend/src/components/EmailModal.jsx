import React, { useState } from 'react';
import { X, Send, Mail, CheckCircle2 } from 'lucide-react';

export default function EmailModal({
  isOpen,
  onClose,
  incident,
  onSendEmail,
  isSendingEmail
}) {
  if (!isOpen || !incident) return null;

  const [email, setEmail] = useState('division.forest.officer@forest.gov.in');
  const [notes, setNotes] = useState(
    `Immediate ground verification requested for flagged zone at coordinates (${incident.centroid_lat.toFixed(4)}, ${incident.centroid_lng.toFixed(4)}). Estimated area: ${incident.area_hectares} ha.`
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    onSendEmail({
      incidentId: incident.id,
      email,
      notes
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="bg-white rounded-3xl shadow-2xl border border-black/10 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e0e0e0] flex items-center justify-between bg-[#fafafc]">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#0066cc]" />
            <h2 className="text-base font-semibold text-[#1d1d1f]">
              Dispatch Incident Advisory Alert
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7a7a7a] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-full transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#1d1d1f] mb-1">
              Recipient Range / Beat Officer Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#f5f5f7] border border-[#e0e0e0] rounded-xl p-2.5 text-[#1d1d1f] focus:outline-none focus:border-[#0066cc]"
              placeholder="officer@forest.gov.in"
            />
          </div>

          <div className="bg-[#fafafc] border border-[#e0e0e0] rounded-xl p-3 text-[11px] space-y-1">
            <div className="font-semibold text-[#333333]">Alert Payload Preview:</div>
            <div className="text-[#7a7a7a]">Incident Reference: <strong>#{incident.id}</strong></div>
            <div className="text-[#7a7a7a]">Flagged Loss Area: <strong>{incident.area_hectares} ha</strong></div>
            <div className="text-[#7a7a7a]">NDVI Delta: <strong className="text-[#b30000]">{incident.ndvi_change}</strong></div>
            <div className="text-[#7a7a7a]">Centroid: <strong>{incident.centroid_lat.toFixed(4)}°, {incident.centroid_lng.toFixed(4)}°</strong></div>
          </div>

          <div>
            <label className="block font-semibold text-[#1d1d1f] mb-1">
              Custom Field Instructions
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#f5f5f7] border border-[#e0e0e0] rounded-xl p-2.5 text-[#1d1d1f] focus:outline-none focus:border-[#0066cc]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-apple-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSendingEmail}
              className="btn-apple-primary text-xs py-2 px-5"
            >
              <Send className="w-3.5 h-3.5" />
              {isSendingEmail ? "Dispatching..." : "Send Alert"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
