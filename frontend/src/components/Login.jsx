import React, { useState } from 'react';
import { Trees, Lock } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === 'admin@aranya.gov.in' && password === 'admin') {
      onLogin();
    } else {
      setError('Invalid official credentials. Access denied.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-bnb-canvas-dark text-bnb-body font-sans select-none">
      <div className="w-full max-w-md bg-bnb-card border border-bnb-hairline-dark rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.35)] p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-bnb-primary text-bnb-ink shadow-[0_4px_14px_rgba(252,213,53,0.25)] mb-4">
            <Trees className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold font-display tracking-wide text-bnb-on-dark mb-1">ARANYA</h1>
          <p className="text-xs text-bnb-muted text-center max-w-[250px] leading-relaxed">
            Automated Remote-sensing Analytics for Nature and Yield Assessment
          </p>
        </div>

        <div className="mb-6 bg-bnb-elevated border border-bnb-hairline-dark p-3.5 rounded-xl text-xs text-bnb-muted-strong flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-bnb-primary flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Official access only. Please authenticate using your government-issued credentials to access the monitoring dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-bnb-body mb-1.5">Official Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@aranya.gov.in"
              className="w-full bg-bnb-elevated border border-bnb-hairline-dark rounded-xl px-4 py-3 text-sm text-bnb-on-dark placeholder-bnb-muted focus:outline-none focus:border-bnb-primary focus:ring-1 focus:ring-bnb-primary transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-bnb-body mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-bnb-elevated border border-bnb-hairline-dark rounded-xl px-4 py-3 text-sm text-bnb-on-dark placeholder-bnb-muted focus:outline-none focus:border-bnb-primary focus:ring-1 focus:ring-bnb-primary transition-all"
              required
            />
          </div>

          {error && (
            <div className="text-xs text-bnb-trading-down font-medium pt-1">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full btn-primary btn-primary-pill py-3.5 text-sm font-bold tracking-wide mt-2 shadow-[0_4px_14px_rgba(252,213,53,0.25)]"
          >
            Authenticate
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-bnb-hairline-dark">
          <p className="text-[10px] text-bnb-muted">
            Demo Credentials:<br/>
            Email: <strong className="text-bnb-body">admin@aranya.gov.in</strong> | Password: <strong className="text-bnb-body">admin</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
