import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

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

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        role: 'FARMER',
        wilaya: '',
        farm_name: '',
        location: '',
        company_name: '',
        vehicle_type: '',
        license_plate: '',
        capacity: 0,
        farmer_card_file: null,
        commercial_register_file: null,
        driving_license_file: null,
        car_license_file: null,
        // Additional farms (up to 4 more, 1st is mandatory via main fields)
        additional_farms: []
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    };

    const addFarm = () => {
        if (formData.additional_farms.length < 4) {
            setFormData({
                ...formData,
                additional_farms: [...formData.additional_farms, { name: '', wilaya: '', location: '' }]
            });
        }
    };

    const removeFarm = (index) => {
        const newFarms = [...formData.additional_farms];
        newFarms.splice(index, 1);
        setFormData({ ...formData, additional_farms: newFarms });
    };

    const handleFarmChange = (index, field, value) => {
        const newFarms = [...formData.additional_farms];
        newFarms[index][field] = value;
        setFormData({ ...formData, additional_farms: newFarms });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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
            await api.post('users/register/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                const errorMessages = Object.keys(errorData).map(key => `${key}: ${errorData[key]}`).join('\n');
                alert(`Registration failed:\n${errorMessages}`);
            } else {
                alert('Registration failed. Check console for details.');
            }
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-container fade-in" style={{ maxWidth: '550px' }}>
            <div className="glass-panel">
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Create Account</h2>
                <p className="auth-subtitle">Join AgriGov Market to start trading today</p>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="auth-form-label">Username</label>
                            <input type="text" name="username" placeholder="Choose a username" onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="auth-form-label">Password</label>
                            <input type="password" name="password" placeholder="Create a password" onChange={handleChange} required />
                        </div>
                    </div>

                    <div>
                        <label className="auth-form-label">Email Address</label>
                        <input type="email" name="email" placeholder="Enter your email" onChange={handleChange} required />
                    </div>

                    <div>
                        <label className="auth-form-label">Select Account Role</label>
                        <select name="role" onChange={handleChange} value={formData.role}>
                            <option value="FARMER">Farmer</option>
                            <option value="BUYER">Buyer</option>
                            <option value="TRANSPORTER">Transporter</option>
                            <option value="EQUIPMENT_PROVIDER">Equipment Provider</option>
                        </select>
                    </div>

                    {(formData.role === 'FARMER' || formData.role === 'BUYER') && (
                        <div>
                            <label className="auth-form-label">Select Wilaya</label>
                            <select name="wilaya" onChange={handleChange} value={formData.wilaya} required>
                                <option value="">-- Choose your Wilaya --</option>
                                {ALGERIA_WILAYAS.map(w => (
                                    <option key={w.id} value={w.name}>{w.id} - {w.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {formData.role === 'FARMER' && (
                        <div className="role-fields fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '-0.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="auth-form-label">Farm Name</label>
                                    <input type="text" name="farm_name" placeholder="Your farm name" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="auth-form-label">Location</label>
                                    <input type="text" name="location" placeholder="Farm location" onChange={handleChange} />
                                </div>
                            </div>
                            <div>
                                <label className="auth-form-label">Farmer Card (PDF)</label>
                                <input type="file" name="farmer_card_file" accept=".pdf" onChange={handleFileChange} required />
                            </div>

                            {/* Additional Farms Section */}
                            <div className="additional-farms-section">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>Additional Farms (Optional, Max 5 total)</h4>
                                    {formData.additional_farms.length < 4 && (
                                        <button type="button" onClick={addFarm} className="btn-add-farm" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                                            + Add Farm
                                        </button>
                                    )}
                                </div>
                                
                                {formData.additional_farms.map((farm, index) => (
                                    <div key={index} className="farm-entry fade-in" style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.5)', position: 'relative' }}>
                                        <button type="button" onClick={() => removeFarm(index)} style={{ position: 'absolute', top: '5px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                                            <div>
                                                <label className="auth-form-label">Farm Name</label>
                                                <input type="text" placeholder="Second Farm Name" value={farm.name} onChange={(e) => handleFarmChange(index, 'name', e.target.value)} required />
                                            </div>
                                            <div>
                                                <label className="auth-form-label">Wilaya</label>
                                                <select value={farm.wilaya} onChange={(e) => handleFarmChange(index, 'wilaya', e.target.value)} required>
                                                    <option value="">-- Choose Wilaya --</option>
                                                    {ALGERIA_WILAYAS.map(w => (
                                                        <option key={w.id} value={w.name}>{w.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="auth-form-label">Location (Optional)</label>
                                            <input type="text" placeholder="Specific location" value={farm.location} onChange={(e) => handleFarmChange(index, 'location', e.target.value)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {formData.role === 'BUYER' && (
                        <div className="role-fields fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '-0.5rem' }}>
                            <div>
                                <label className="auth-form-label">Company Name</label>
                                <input type="text" name="company_name" placeholder="Your company name" onChange={handleChange} />
                            </div>
                            <div>
                                <label className="auth-form-label">Commercial Register (PDF)</label>
                                <input type="file" name="commercial_register_file" accept=".pdf" onChange={handleFileChange} required />
                            </div>
                        </div>
                    )}

                    {formData.role === 'TRANSPORTER' && (
                        <div className="role-fields fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '-0.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                                <div>
                                    <label className="auth-form-label">Vehicle Type</label>
                                    <input type="text" name="vehicle_type" placeholder="e.g. Truck" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="auth-form-label">License Plate</label>
                                    <input type="text" name="license_plate" placeholder="Plate No." onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="auth-form-label">Capacity (Tons)</label>
                                    <input type="number" name="capacity" placeholder="Tons" onChange={handleChange} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="auth-form-label">Driving License (PDF)</label>
                                    <input type="file" name="driving_license_file" accept=".pdf" onChange={handleFileChange} required />
                                </div>
                                <div>
                                    <label className="auth-form-label">Car License (PDF)</label>
                                    <input type="file" name="car_license_file" accept=".pdf" onChange={handleFileChange} required />
                                </div>
                            </div>
                        </div>
                    )}

                    {formData.role === 'EQUIPMENT_PROVIDER' && (
                        <div className="role-fields fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '-0.5rem' }}>
                            <div>
                                <label className="auth-form-label">Company Name</label>
                                <input type="text" name="company_name" placeholder="Your machinery company" onChange={handleChange} />
                            </div>
                            <div>
                                <label className="auth-form-label">Business License (PDF)</label>
                                <input type="file" name="commercial_register_file" accept=".pdf" onChange={handleFileChange} required />
                            </div>
                        </div>
                    )}

                    <button type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>Open Account</button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
                </p>
            </div>
        </div>
    </div>
);
};

export default Register;
