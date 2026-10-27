import { useState, useCallback } from 'react';
import { generateTestcasesDocument } from './services/apiService.js';

// ——— Form Validation ———
function validateForm(data) {
  const errors = {};
  if (!data.updates.trim()) {
    errors.updates = 'Daily Raw Details are required.';
  } else if (data.updates.trim().length < 10) {
    errors.updates = 'Please provide at least 10 characters.';
  }
  if (!data.reportCode.trim()) {
    errors.reportCode = 'Report Code is required.';
  }
  if (!data.ticketNumber.trim()) {
    errors.ticketNumber = 'Ticket Number is required.';
  }
  return errors;
}

const INITIAL_FORM = {
  updates: '',
  reportCode: '',
  certifiedBy: '',
  ticketNumber: '',
};

const STEPS = [
  { id: 'processing', label: 'Parsing ticket details & scope...' },
  { id: 'ai', label: 'Generating OneStream Cube View checklist...' },
  { id: 'document', label: 'Assembling Test Case Review Document...' },
];

export default function App() {
  const [view, setView] = useState('form'); // 'form' | 'loading' | 'success'
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);
  const [docInfo, setDocInfo] = useState(null); // { blob, filename }

  // ——— Field change handler ———
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const errs = validateForm({ ...form, [name]: value });
      setFieldErrors((prev) => ({ ...prev, [name]: errs[name] }));
    }
  }, [form, touched]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validateForm(form);
    setFieldErrors((prev) => ({ ...prev, [name]: errs[name] }));
  }, [form]);

  // ——— Submit ———
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const allTouched = Object.keys(INITIAL_FORM).reduce((a, k) => ({ ...a, [k]: true }), {});
    setTouched(allTouched);
    const errs = validateForm(form);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setView('loading');
    setLoadingStep(0);

    const stepTimers = [
      setTimeout(() => setLoadingStep(1), 1200),
      setTimeout(() => setLoadingStep(2), 3800),
    ];

    try {
      const result = await generateTestcasesDocument(form, (msg) => {
        console.log('[OneStream Progress]', msg);
      });

      stepTimers.forEach(clearTimeout);
      setDocInfo(result);
      setView('success');
    } catch (err) {
      stepTimers.forEach(clearTimeout);
      let message = 'An unexpected error occurred while generating the document.';

      if (err.response) {
        if (err.response.data instanceof Blob) {
          try {
            const text = await err.response.data.text();
            const parsed = JSON.parse(text);
            message = parsed.error || message;
          } catch (_) {}
        } else {
          message = err.response.data?.error || message;
        }
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        message = 'Request timed out. The AI service is currently busy. Please retry.';
      } else if (err.message) {
        message = err.message;
      }

      setError(message);
      setView('form');
    }
  };

  // ——— Download ———
  const handleDownload = useCallback(() => {
    if (!docInfo) return;
    const url = URL.createObjectURL(docInfo.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = docInfo.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, [docInfo]);

  // ——— Reset ———
  const handleReset = useCallback(() => {
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setTouched({});
    setError(null);
    setDocInfo(null);
    setView('form');
    setLoadingStep(0);
  }, []);

  return (
    <div className="os-app">
      {/* Top Navigation Bar with OneStream Logo */}
      <header className="os-header">
        <div className="os-header-inner">
          <div className="os-logo-lockup">
            <div className="os-cube-badge" title="OneStream Software">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" fill="#002D62"/>
                <path d="M12 2L21 7L12 12L3 7L12 2Z" fill="#00A3E0"/>
                <path d="M12 12L21 7V17L12 22V12Z" fill="#0072CE"/>
                <path d="M12 12L3 7V17L12 22V12Z" fill="#002D62" fillOpacity="0.85"/>
              </svg>
            </div>
            <div className="os-header-titles">
              <div className="os-header-title">
                OneStream <span style={{ color: 'var(--os-blue)', fontWeight: 500 }}>| Task Review Studio</span>
              </div>
              <div className="os-header-subtitle">
                Automated Test Case & Release Document Generator
              </div>
            </div>
          </div>
          <div className="os-pill-tag">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00875A', display: 'inline-block' }}></span>
            OneStream XF Ready
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="os-container">
        {view === 'form' && (
          <div className="os-card">
            <div className="os-card-body">
              <div className="os-card-hero">
                <div className="os-hero-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0072CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <h1 className="os-card-title">Daily Document Generator</h1>
                <p className="os-card-desc">
                  Paste your OneStream ticket updates below to generate the formatted Cube View Testcase Review Document.
                </p>
                <div className="os-tags-row">
                  <span className="os-tag">Cube View</span>
                  <span className="os-tag">Flash Reports</span>
                  <span className="os-tag">Parameters</span>
                  <span className="os-tag">Books</span>
                  <span className="os-tag">Dashboard</span>
                </div>
              </div>

              {error && (
                <div className="os-alert">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Field 1: Daily Raw Details */}
                <div className="os-form-group">
                  <label htmlFor="updates" className="os-label">
                    <span className="os-label-left">
                      <span className="os-label-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </span>
                      Daily Raw Details <span className="os-required">*</span>
                    </span>
                  </label>
                  <textarea
                    id="updates"
                    name="updates"
                    rows={4}
                    className={`os-textarea ${fieldErrors.updates ? 'error' : ''}`}
                    placeholder="e.g. Updated PWRJOB_RPT_15 and PWRJOB_RPT_16 cube views. Changed margins and column formatting on existing reports..."
                    value={form.updates}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {fieldErrors.updates && (
                    <div className="os-field-error">
                      <span>⚠</span> {fieldErrors.updates}
                    </div>
                  )}
                </div>

                {/* Field 2: Report Code */}
                <div className="os-form-group">
                  <label htmlFor="reportCode" className="os-label">
                    <span className="os-label-left">
                      <span className="os-label-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="4 7 4 4 20 4 20 7"></polyline>
                          <line x1="9" y1="20" x2="15" y2="20"></line>
                          <line x1="12" y1="4" x2="12" y2="20"></line>
                        </svg>
                      </span>
                      Report Code <span className="os-required">*</span>
                    </span>
                    <span className="os-optional">e.g. R117</span>
                  </label>
                  <input
                    type="text"
                    id="reportCode"
                    name="reportCode"
                    className={`os-input ${fieldErrors.reportCode ? 'error' : ''}`}
                    placeholder="R117"
                    value={form.reportCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {fieldErrors.reportCode && (
                    <div className="os-field-error">
                      <span>⚠</span> {fieldErrors.reportCode}
                    </div>
                  )}
                </div>

                {/* Field 3: Certified By */}
                <div className="os-form-group">
                  <label htmlFor="certifiedBy" className="os-label">
                    <span className="os-label-left">
                      <span className="os-label-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </span>
                      Certified By
                    </span>
                    <span className="os-optional">Reviewer / Developer</span>
                  </label>
                  <input
                    type="text"
                    id="certifiedBy"
                    name="certifiedBy"
                    className="os-input"
                    placeholder="e.g. Siddharth Chandran"
                    value={form.certifiedBy}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>

                {/* Field 4: Ticket Number */}
                <div className="os-form-group">
                  <label htmlFor="ticketNumber" className="os-label">
                    <span className="os-label-left">
                      <span className="os-label-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                          <line x1="7" y1="8" x2="17" y2="8"></line>
                          <line x1="7" y1="12" x2="17" y2="12"></line>
                          <line x1="7" y1="16" x2="11" y2="16"></line>
                        </svg>
                      </span>
                      Ticket Number <span className="os-required">*</span>
                    </span>
                    <span className="os-optional">e.g. INC0158214 / CHG0057554</span>
                  </label>
                  <input
                    type="text"
                    id="ticketNumber"
                    name="ticketNumber"
                    className={`os-input ${fieldErrors.ticketNumber ? 'error' : ''}`}
                    placeholder="INC0158214"
                    value={form.ticketNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {fieldErrors.ticketNumber && (
                    <div className="os-field-error">
                      <span>⚠</span> {fieldErrors.ticketNumber}
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <button type="submit" id="btn-submit" className="os-btn-submit">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                  Generate OneStream Document
                </button>
              </form>
            </div>
          </div>
        )}

        {view === 'loading' && (
          <div className="os-card">
            <div className="os-loading-wrap">
              <div className="os-spinner">
                <div className="os-spinner-ring"></div>
              </div>
              <h2 className="os-loading-title">Generating Test Case Review...</h2>
              <p className="os-loading-step">{STEPS[loadingStep]?.label}</p>

              <div className="os-steps-list">
                {STEPS.map((step, idx) => {
                  const isDone = idx < loadingStep;
                  const isActive = idx === loadingStep;
                  return (
                    <div key={step.id} className={`os-step-item ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                      <div className="os-step-dot"></div>
                      <span>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {view === 'success' && (
          <div className="os-card">
            <div className="os-success-wrap">
              <div className="os-success-icon-wrap">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h2 className="os-success-title">Document Generated Successfully</h2>
              <p className="os-success-subtitle">
                Your corporate OneStream test case review document is compiled and ready for download.
              </p>

              <div className="os-doc-card">
                <div className="os-doc-icon">DOCX</div>
                <div className="os-doc-details">
                  <div className="os-doc-name">{docInfo?.filename}</div>
                  <div className="os-doc-type">Microsoft Word Document • Formatted Checklist</div>
                </div>
              </div>

              <div className="os-success-actions">
                <button onClick={handleDownload} className="os-btn-download">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download Document
                </button>
                <button onClick={handleReset} className="os-btn-reset">
                  Create Another
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="os-footer">
          OneStream Software Integration Suite • Daily Document Automation
        </footer>
      </main>
    </div>
  );
}
