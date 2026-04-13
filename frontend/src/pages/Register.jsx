import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        role: 'FARMER',
        farm_name: '',
        location: '',
        company_name: '',
        company_name: '',
        vehicle_type: '',
        license_plate: '',
        capacity: 0,
        farmer_card_file: null,
        commercial_register_file: null,
        driving_license_file: null,
        car_license_file: null
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const data = new FormData();
        for (const key in formData) {
            if (formData[key] !== null && formData[key] !== '') {
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
                        </select>
                    </div>

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

                    <button type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>Open Account</button>
                </form>
                
                <p className="auth-footer">
                    Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
