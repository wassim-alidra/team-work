import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import './register.css';
import bakgoudLogo from '../assets/bakgoud-logo.png';

const ALGERIA_WILAYAS = [
    { id: 1, name: "Adrar" }, { id: 2, name: "Chlef" }, { id: 3, name: "Laghouat" }, { id: 4, name: "Oum El Bouaghi" },
    { id: 5, name: "Batna" }, { id: 6, name: "Bejaia" }, { id: 7, name: "Biskra" }, { id: 8, name: "Bechar" },
    { id: 9, name: "Blida" }, { id: 10, name: "Bouira" }, { id: 11, name: "Tamanrasset" }, { id: 12, name: "Tebessa" },
    { id: 13, name: "Tlemcen" }, { id: 14, name: "Tiaret" }, { id: 15, name: "Tizi Ouzou" }, { id: 16, name: "Algiers" },
    { id: 17, name: "Djelfa" }, { id: 18, name: "Jijel" }, { id: 19, name: "Setif" }, { id: 20, name: "Saida" },
    { id: 21, name: "Skikda" }, { id: 22, name: "Sidi Bel Abbes" }, { id: 23, name: "Annaba" }, { id: 24, name: "Guelma" },
    { id: 25, name: "Constantine" }, { id: 26, name: "Medea" }, { id: 27, name: "Mostaganem" }, { id: 28, name: "M'Sila" },
    { id: 29, name: "Mascara" }, { id: 30, name: "Ouargla" }, { id: 31, name: "Oran" }, { id: 32, name: "El Bayadh" },
    { id: 33, name: "Illizi" }, { id: 34, name: "Bordj Bou Arreridj" }, { id: 35, name: "Boumerdes" }, { id: 36, name: "El Tarf" },
    { id: 37, name: "Tindouf" }, { id: 38, name: "Tissemsilt" }, { id: 39, name: "El Oued" }, { id: 40, name: "Khenchela" },
    { id: 41, name: "Souk Ahras" }, { id: 42, name: "Tipaza" }, { id: 43, name: "Mila" }, { id: 44, name: "Ain Defla" },
    { id: 45, name: "Naama" }, { id: 46, name: "Ain Temouchent" }, { id: 47, name: "Ghardaia" }, { id: 48, name: "Relizane" },
    { id: 49, name: "El M'Ghair" }, { id: 50, name: "El Meniaa" }, { id: 51, name: "Ouled Djellal" }, { id: 52, name: "Bordj Baji Mokhtar" },
    { id: 53, name: "Beni Abbes" }, { id: 54, name: "Timimoun" }, { id: 55, name: "Touggourt" }, { id: 56, name: "Djanet" },
    { id: 57, name: "In Salah" }, { id: 58, name: "In Guezzam" }
];

const ROLES = [
    { value: 'FARMER', label: 'Farmer', icon: '🌾', desc: 'Manage crops, list seeds for sale, and access government agricultural resources and insights.' },
    { value: 'BUYER', label: 'Buyer', icon: '🛒', desc: 'Procure fresh produce, grains, and agricultural goods directly from verified farmers in the network.' },
    { value: 'TRANSPORTER', label: 'Transporter', icon: '🚚', desc: 'Provide logistics, track deliveries, and manage fleet operations across the agricultural supply chain.' },
    { value: 'EQUIPMENT_PROVIDER', label: 'Equipment Provider', icon: '🏗️', desc: 'Lease or sell heavy machinery, tools, and smart farming equipment to producers.' },
];

// ── Step progress bar ──────────────────────────────────────────
const StepBar = ({ step, total, label }) => {
    const pct = (step / total) * 100;
    return (
        <div className="rg-stepbar">
            <div className="rg-stepbar-meta">
                <span className="rg-stepbar-label">STEP {step} OF {total}</span>
                <span className="rg-stepbar-name">{label}</span>
            </div>
            <div className="rg-stepbar-track">
                <div className="rg-stepbar-fill" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

// ── File drop zone ─────────────────────────────────────────────
const FileDropZone = ({ label, name, required, onChange, icon = '📄' }) => {
    const [fileName, setFileName] = useState('');
    const handleChange = (e) => {
        const f = e.target.files[0];
        setFileName(f ? f.name : '');
        onChange(e);
    };
    return (
        <div className="rg-field">
            <label className="rg-label">{label}{required && <span className="rg-required">*</span>}</label>
            <label className="rg-dropzone">
                <input type="file" name={name} accept=".pdf" onChange={handleChange} style={{ display: 'none' }} />
                <span className="rg-dropzone-icon">{icon}</span>
                {fileName
                    ? <><strong className="rg-drop-link">{fileName}</strong><span className="rg-drop-sub">selected</span></>
                    : <><strong className="rg-drop-link">Upload a file</strong><span className="rg-drop-text"> or drag and drop</span><br /><span className="rg-drop-sub">PDF up to 10MB</span></>
                }
            </label>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════
const Register = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '', password: '', email: '', phone_number: '',
        role: '', wilaya: '', farm_name: '', location: '',
        company_name: '', vehicle_type: '', license_plate: '', capacity: 0,
        farmer_card_file: null, commercial_register_file: null,
        driving_license_file: null, car_license_file: null,
        additional_farms: [],
    });
    const [showPassword, setShowPassword] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.files[0] });

    const addFarm = () => {
        if (formData.additional_farms.length < 4)
            setFormData({ ...formData, additional_farms: [...formData.additional_farms, { name: '', wilaya: '', location: '' }] });
    };
    const removeFarm = (i) => {
        const f = [...formData.additional_farms]; f.splice(i, 1);
        setFormData({ ...formData, additional_farms: f });
    };
    const handleFarmChange = (i, field, val) => {
        const f = [...formData.additional_farms]; f[i][field] = val;
        setFormData({ ...formData, additional_farms: f });
    };

    const handleSubmit = async () => {
        setSubmitError(''); setIsSubmitting(true);
        const data = new FormData();
        for (const key in formData) {
            if (key === 'additional_farms') {
                const allFarms = [
                    { name: formData.farm_name, wilaya: formData.wilaya, location: formData.location },
                    ...formData.additional_farms
                ].filter(f => f.name && f.wilaya);
                data.append('farms_data', JSON.stringify(allFarms));
            } else if (formData[key] !== null && formData[key] !== '') {
                data.append(key, formData[key]);
            }
        }
        try {
            const res = await api.post('users/register/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            navigate('/verify-email', { state: { email: res.data.email } });
        } catch (error) {
            if (error.response?.data) {
                const d = error.response.data;
                setSubmitError(Object.keys(d).map(k => `${k}: ${Array.isArray(d[k]) ? d[k].join(', ') : d[k]}`).join(' | '));
            } else {
                setSubmitError('Registration failed. Please check your details and try again.');
            }
            setStep(1);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── STEP 1 – Account Details ─────────────────────────────
    const renderStep1 = () => (
        <div className="rg-card fade-in">
            <div className="rg-card-header">
                <h1 className="rg-brand">AgriGov Market</h1>
                <p className="rg-brand-sub">Empowering Sustainable Agricultural Growth.</p>
            </div>
            <div className="rg-card-body">
                <StepBar step={1} total={4} label="Account Details" />
                <h2 className="rg-step-title">Create Your Account</h2>

                <div className="rg-field">
                    <label className="rg-label">Username</label>
                    <div className="rg-input-wrap">
                        <input className="rg-input" type="text" name="username" value={formData.username}
                            placeholder="Enter your username" onChange={handleChange} required />
                    </div>
                </div>

                <div className="rg-field">
                    <label className="rg-label">Email Address</label>
                    <div className="rg-input-wrap">
                        <input className="rg-input" type="email" name="email" value={formData.email}
                            placeholder="Enter your email" onChange={handleChange} required />
                    </div>
                </div>

                <div className="rg-field">
                    <label className="rg-label">Password</label>
                    <div className="rg-input-wrap">
                        <input className="rg-input" type={showPassword ? 'text' : 'password'} name="password"
                            value={formData.password} placeholder="Create a password" onChange={handleChange} required />
                    </div>
                    <p className="rg-hint">Must be at least 8 characters long.</p>
                </div>

                <div className="rg-field">
                    <label className="rg-label">Phone Number</label>
                    <div className="rg-input-wrap">
                        <input className="rg-input" type="tel" name="phone_number" value={formData.phone_number}
                            placeholder="0XXXXXXXXX (e.g. 0550 00 00 00)" onChange={handleChange} required />
                    </div>
                </div>

                {submitError && <div className="rg-error">{submitError}</div>}

                <div className="rg-footer-actions">
                    <Link to="/" className="rg-btn-cancel">Cancel</Link>
                    <button className="rg-btn-next"
                        onClick={() => { if (formData.username && formData.email && formData.password && formData.phone_number) setStep(2); }}
                    >
                        Next <span>→</span>
                    </button>
                </div>

                <div className="rg-divider" />
                <p className="rg-already">Already have an account? <Link to="/login" className="rg-link">Log in</Link></p>
            </div>
        </div>
    );

    // ── STEP 2 – Choose Role ─────────────────────────────────
    const renderStep2 = () => (
        <div className="rg-wide-card fade-in">
            <div className="rg-role-header">
                <span className="rg-role-icon-top">🚜</span>
                <h2 className="rg-step-title">Choose Your Role</h2>
                <p className="rg-step-sub">Select the primary way you intend to use AgriGov Market to tailor your experience.</p>
                <div className="rg-stepbar-inline">
                    <span className="rg-stepbar-label">Step 2 of 4</span>
                    <div className="rg-stepbar-track">
                        <div className="rg-stepbar-fill" style={{ width: '50%' }} />
                    </div>
                    <span className="rg-stepbar-pct">50%</span>
                </div>
            </div>

            <div className="rg-roles-grid">
                {ROLES.map(r => (
                    <label key={r.value}
                        className={`rg-role-card ${formData.role === r.value ? 'rg-role-card--selected' : ''}`}>
                        <input type="radio" name="role" value={r.value} checked={formData.role === r.value}
                            onChange={handleChange} style={{ display: 'none' }} />
                        <div className="rg-role-radio">{formData.role === r.value ? '🟢' : '⭕'}</div>
                        <div className="rg-role-emoji">{r.icon}</div>
                        <h3 className="rg-role-name">{r.label}</h3>
                        <p className="rg-role-desc">{r.desc}</p>
                    </label>
                ))}
            </div>

            <div className="rg-wide-footer">
                <button className="rg-btn-back" onClick={() => setStep(1)}>← Back</button>
                <button className="rg-btn-next" onClick={() => { if (formData.role) setStep(3); }}>
                    Next Step →
                </button>
            </div>
        </div>
    );

    // ── STEP 3 – Role Profile ────────────────────────────────
    const renderStep3 = () => {
        const role = formData.role;
        return (
            <div className="rg-profile-page fade-in">
                <header className="rg-profile-header">
                    <span className="rg-profile-brand">AgriGov Market</span>
                </header>

                {/* Stepper dots */}
                <div className="rg-dots-stepper">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className={`rg-dot ${n < 3 ? 'rg-dot--done' : n === 3 ? 'rg-dot--active' : ''}`}>
                            {n < 3 ? '✓' : n}
                        </div>
                    ))}
                </div>

                <h2 className="rg-profile-title">
                    {role === 'FARMER' ? 'Farmer Profile' :
                        role === 'BUYER' ? 'Buyer Profile' :
                            role === 'TRANSPORTER' ? 'Vehicle & Capacity Details' :
                                'Equipment Provider Profile'}
                </h2>
                <p className="rg-profile-sub">
                    {role === 'FARMER' ? 'Step 3 of 4: Provide your main farm details.' :
                        role === 'BUYER' ? 'Enter your official company details and commercial documentation to establish your trading identity.' :
                            role === 'TRANSPORTER' ? 'Provide accurate information about your primary transport vehicle to connect with suitable loads.' :
                                'Please provide your official company details and upload your valid business license to operate within the AgriGov digital ecosystem.'}
                </p>

                <div className="rg-profile-card">
                    {/* ── FARMER ── */}
                    {role === 'FARMER' && (<>
                        <div className="rg-row-2">
                            <div className="rg-field">
                                <label className="rg-label">Select Wilaya</label>
                                <div className="rg-select-wrap">
                                    <select className="rg-select" name="wilaya" value={formData.wilaya} onChange={handleChange} required>
                                        <option value="">Choose your province</option>
                                        {ALGERIA_WILAYAS.map(w => <option key={w.id} value={w.name}>{w.id} - {w.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="rg-field">
                                <label className="rg-label">Farm Name</label>
                                <input className="rg-input rg-input--bare" type="text" name="farm_name"
                                    value={formData.farm_name} placeholder="e.g. Domaine Benali" onChange={handleChange} />
                            </div>
                        </div>
                        <div className="rg-field">
                            <label className="rg-label">Farm Location</label>
                            <div className="rg-input-wrap">
                                <span className="rg-input-icon">📍</span>
                                <input className="rg-input" type="text" name="location"
                                    value={formData.location} placeholder="Enter specific commune or drop a pin" onChange={handleChange} />
                            </div>
                            <p className="rg-hint">Providing a precise location helps optimize logistics.</p>
                        </div>
                        <FileDropZone label="Farmer Card (PDF)" name="farmer_card_file" required onChange={handleFileChange} icon="📁" />

                        <div className="rg-additional-farms">
                            <div className="rg-additional-farms-head">
                                <div>
                                    <h4 className="rg-af-title">Additional Farms</h4>
                                    <p className="rg-af-sub">Manage operations across multiple locations.</p>
                                </div>
                                {formData.additional_farms.length < 4 && (
                                    <button type="button" className="rg-btn-add-farm" onClick={addFarm}>+ Add Farm<br /><small>(Max 5 farms)</small></button>
                                )}
                            </div>
                            {formData.additional_farms.map((farm, i) => (
                                <div key={i} className="rg-farm-entry fade-in">
                                    <button type="button" className="rg-farm-remove" onClick={() => removeFarm(i)}>✕</button>
                                    <div className="rg-row-2">
                                        <div className="rg-field">
                                            <label className="rg-label">Farm Name</label>
                                            <input className="rg-input rg-input--bare" type="text" placeholder="Farm name"
                                                value={farm.name} onChange={e => handleFarmChange(i, 'name', e.target.value)} />
                                        </div>
                                        <div className="rg-field">
                                            <label className="rg-label">Wilaya</label>
                                            <select className="rg-select" value={farm.wilaya} onChange={e => handleFarmChange(i, 'wilaya', e.target.value)}>
                                                <option value="">-- Choose Wilaya --</option>
                                                {ALGERIA_WILAYAS.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="rg-field">
                                        <label className="rg-label">Location (Optional)</label>
                                        <input className="rg-input rg-input--bare" type="text" placeholder="Specific location"
                                            value={farm.location} onChange={e => handleFarmChange(i, 'location', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>)}

                    {/* ── BUYER ── */}
                    {role === 'BUYER' && (<>
                        <div className="rg-field">
                            <label className="rg-label">Company Name <span className="rg-required">*</span></label>
                            <div className="rg-input-wrap">
                                <span className="rg-input-icon">🏢</span>
                                <input className="rg-input" type="text" name="company_name"
                                    value={formData.company_name} placeholder="e.g. Atlas AgriTrade SARL" onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="rg-field">
                            <label className="rg-label">Select Wilaya <span className="rg-required">*</span></label>
                            <div className="rg-select-wrap">
                                <span className="rg-select-icon">📍</span>
                                <select className="rg-select rg-select--icon" name="wilaya" value={formData.wilaya} onChange={handleChange} required>
                                    <option value="">Choose a region</option>
                                    {ALGERIA_WILAYAS.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <FileDropZone label="Commercial Register (PDF)" name="commercial_register_file" required onChange={handleFileChange} icon="📁" />
                    </>)}

                    {/* ── TRANSPORTER ── */}
                    {role === 'TRANSPORTER' && (<>
                        <div className="rg-row-2">
                            <div className="rg-field">
                                <label className="rg-label">Select Wilaya (Operating Region)</label>
                                <div className="rg-select-wrap">
                                    <select className="rg-select" name="wilaya" value={formData.wilaya} onChange={handleChange} required>
                                        <option value="">Choose a region...</option>
                                        {ALGERIA_WILAYAS.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="rg-field">
                                <label className="rg-label">Vehicle Type</label>
                                <div className="rg-select-wrap">
                                    <select className="rg-select" name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} required>
                                        <option value="">Select vehicle class...</option>
                                        <option value="Light Truck">Light Truck</option>
                                        <option value="Medium Truck">Medium Truck</option>
                                        <option value="Heavy Truck">Heavy Truck</option>
                                        <option value="Refrigerated Truck">Refrigerated Truck</option>
                                        <option value="Flatbed">Flatbed</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="rg-row-2">
                            <div className="rg-field">
                                <label className="rg-label">License Plate Number</label>
                                <div className="rg-input-wrap">
                                    <span className="rg-input-icon">🪪</span>
                                    <input className="rg-input" type="text" name="license_plate"
                                        value={formData.license_plate} placeholder="e.g. 12345 116 16" onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="rg-field">
                                <label className="rg-label">Capacity in Tons</label>
                                <div className="rg-input-wrap">
                                    <span className="rg-input-icon">📦</span>
                                    <input className="rg-input" type="number" name="capacity"
                                        value={formData.capacity || ''} placeholder="e.g. 15.5" onChange={handleChange} required />
                                    <span className="rg-input-suffix">Tons</span>
                                </div>
                            </div>
                        </div>

                        <h4 className="rg-docs-title">Required Documents</h4>
                        <p className="rg-hint">Please upload clear PDF copies of the following documents. Max file size: 5MB per document.</p>
                        <div className="rg-row-2">
                            <FileDropZone label="Driving License (PDF)" name="driving_license_file" required onChange={handleFileChange} icon="🪪" />
                            <FileDropZone label="Car License / Carte Grise (PDF)" name="car_license_file" required onChange={handleFileChange} icon="🚗" />
                        </div>
                    </>)}

                    {/* ── EQUIPMENT PROVIDER ── */}
                    {role === 'EQUIPMENT_PROVIDER' && (<>
                        <div className="rg-field">
                            <label className="rg-label">Company Name <span className="rg-required">*</span></label>
                            <input className="rg-input rg-input--bare" type="text" name="company_name"
                                value={formData.company_name} placeholder="Enter registered business name" onChange={handleChange} required />
                        </div>
                        <div className="rg-field">
                            <label className="rg-label">Primary Operating Wilaya <span className="rg-required">*</span></label>
                            <div className="rg-select-wrap">
                                <select className="rg-select" name="wilaya" value={formData.wilaya} onChange={handleChange} required>
                                    <option value="">Select a Wilaya</option>
                                    {ALGERIA_WILAYAS.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <FileDropZone label="Business License (PDF)" name="commercial_register_file" required onChange={handleFileChange} icon="📁" />
                    </>)}

                    <div className="rg-profile-footer">
                        <button className="rg-btn-back" onClick={() => setStep(2)}>Back</button>
                        <button className="rg-btn-next" onClick={() => setStep(4)} disabled={isSubmitting}>
                            Next Step →
                        </button>
                    </div>
                </div>

                <footer className="rg-page-footer">
                    <p>© 2024 AgriGov Market. Empowering Sustainable Agricultural Growth.</p>
                </footer>
            </div>
        );
    };

    // ── STEP 4 – Submit & verify ─────────────────────────────
    const renderStep4 = () => (
        <div className="rg-card fade-in">
            <div className="rg-card-header" style={{ borderBottom: '4px solid #1b4332' }}>
                <StepBar step={4} total={4} label="" />
            </div>
            <div className="rg-card-body rg-verify-body">
                <div className="rg-verify-icon-wrap">
                    <div className="rg-verify-icon">✉️</div>
                </div>
                <h2 className="rg-verify-title">Ready to submit!</h2>
                <p className="rg-verify-sub">
                    We'll create your account and send a verification link to <strong>{formData.email}</strong>.
                    Please click the link to confirm your account and access the agricultural marketplace.
                </p>

                {submitError && <div className="rg-error">{submitError}</div>}

                <button className="rg-btn-submit" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? '⏳ Creating Account…' : '✉️ Create Account & Send Email'}
                </button>
                <button className="rg-btn-outline" onClick={() => setStep(3)} disabled={isSubmitting}>
                    ← Back
                </button>

                <p className="rg-verify-footer">
                    Didn't receive the email? Check your spam folder or <a href="#" className="rg-link">contact support</a>.
                </p>
            </div>
        </div>
    );

    return (
        <div className="rg-page" style={{ 
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(${bakgoudLogo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
        </div>
    );
};

export default Register;
