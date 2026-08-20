import React, { useState } from 'react';
import { X, Send, Mail } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <div className="bg-bnb-card rounded-xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] border border-bnb-hairline-dark w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-bnb-hairline-dark flex items-center justify-between bg-bnb-elevated">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-bnb-primary text-bnb-ink">
              <Mail className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-base font-bold text-bnb-body">
              Dispatch Incident Advisory Alert
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-bnb-muted hover:text-bnb-body hover:bg-bnb-canvas-dark rounded-md transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-bnb-body mb-1.5">
              Recipient Range / Beat Officer Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bnb-elevated border border-bnb-hairline-dark rounded-md p-2.5 text-bnb-body focus:outline-none focus:border-bnb-primary focus:ring-2 focus:ring-bnb-primary/20"
              placeholder="officer@forest.gov.in"
            />
          </div>

          <div className="bg-bnb-canvas-dark border border-bnb-hairline-dark rounded-lg p-3 text-[11px] space-y-1">
            <div className="font-semibold text-bnb-body">Alert Payload Preview:</div>
            <div className="text-bnb-muted">Incident Reference: <strong className="text-bnb-body font-mono">#{incident.id}</strong></div>
            <div className="text-bnb-muted">Affected Area: <strong className="text-bnb-body font-mono">{incident.area_hectares} ha</strong></div>
            <div className="text-bnb-muted">NDVI Delta: <strong className="font-mono text-bnb-trading-down">{incident.ndvi_change}</strong></div>
            <div className="text-bnb-muted">Centroid: <strong className="font-mono text-bnb-body">{incident.centroid_lat.toFixed(4)}°, {incident.centroid_lng.toFixed(4)}°</strong></div>
          </div>

          <div>
            <label className="block font-semibold text-bnb-body mb-1.5">
              Custom Field Instructions
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-bnb-elevated border border-bnb-hairline-dark rounded-md p-2.5 text-bnb-body focus:outline-none focus:border-bnb-primary focus:ring-2 focus:ring-bnb-primary/20"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2.5 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSendingEmail}
              className="btn-primary text-xs py-2.5 px-5"
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