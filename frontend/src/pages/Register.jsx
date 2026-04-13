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
        vehicle_type: '',
        license_plate: '',
        capacity: 0
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('users/register/', formData);
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
        <div className="auth-page-wrapper fade-in">
            <div className="auth-card" style={{ maxWidth: '600px' }}>
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Join AgriGov Market to start trading today</p>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-grid">
                        <div className="auth-form-group">
                            <label className="auth-label">Username</label>
                            <input type="text" name="username" placeholder="Choose a username" onChange={handleChange} required />
                        </div>
                        <div className="auth-form-group">
                            <label className="auth-label">Password</label>
                            <input type="password" name="password" placeholder="Create a password" onChange={handleChange} required />
                        </div>
                        <div className="auth-form-group form-grid-full">
                            <label className="auth-label">Email Address</label>
                            <input type="email" name="email" placeholder="Enter your email" onChange={handleChange} required />
                        </div>
                        <div className="auth-form-group form-grid-full">
                            <label className="auth-label">Select Account Role</label>
                            <select name="role" onChange={handleChange} value={formData.role}>
                                <option value="FARMER">Farmer</option>
                                <option value="BUYER">Buyer</option>
                                <option value="TRANSPORTER">Transporter</option>
                            </select>
                        </div>
                    </div>

                    {formData.role === 'FARMER' && (
<<<<<<< Updated upstream
                        <div className="role-fields fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '-0.5rem' }}>
                            <div>
                                <label className="auth-form-label">Farm Name</label>
                                <input type="text" name="farm_name" placeholder="Your farm name" onChange={handleChange} />
                            </div>
                            <div>
                                <label className="auth-form-label">Location</label>
                                <input type="text" name="location" placeholder="Farm location" onChange={handleChange} />
=======
                        <div className="role-fields fade-in auth-form">
                            <div className="form-grid">
                                <div className="auth-form-group">
                                    <label className="auth-label">Farm Name</label>
                                    <input type="text" name="farm_name" placeholder="Your farm name" onChange={handleChange} />
                                </div>
                                <div className="auth-form-group">
                                    <label className="auth-label">Location</label>
                                    <input type="text" name="location" placeholder="Farm location" onChange={handleChange} />
                                </div>
                                <div className="auth-form-group form-grid-full">
                                    <label className="auth-label">Farmer Card (PDF)</label>
                                    <div className="file-input-wrapper">
                                        <input type="file" name="farmer_card_file" accept=".pdf" onChange={handleFileChange} required />
                                        <div className="file-input-custom">
                                            <span>{formData.farmer_card_file ? formData.farmer_card_file.name : 'Upload PDF Document'}</span>
                                            <span style={{ fontSize: '1.2rem' }}>📄</span>
                                        </div>
                                    </div>
                                </div>
>>>>>>> Stashed changes
                            </div>
                        </div>
                    )}

                    {formData.role === 'BUYER' && (
<<<<<<< Updated upstream
                        <div className="role-fields fade-in" style={{ marginTop: '-0.5rem' }}>
                            <label className="auth-form-label">Company Name</label>
                            <input type="text" name="company_name" placeholder="Your company name" onChange={handleChange} />
=======
                        <div className="role-fields fade-in auth-form">
                            <div className="auth-form-group">
                                <label className="auth-label">Company Name</label>
                                <input type="text" name="company_name" placeholder="Your company name" onChange={handleChange} />
                            </div>
                            <div className="auth-form-group">
                                <label className="auth-label">Commercial Register (PDF)</label>
                                <div className="file-input-wrapper">
                                    <input type="file" name="commercial_register_file" accept=".pdf" onChange={handleFileChange} required />
                                    <div className="file-input-custom">
                                        <span>{formData.commercial_register_file ? formData.commercial_register_file.name : 'Upload PDF Document'}</span>
                                        <span style={{ fontSize: '1.2rem' }}>📄</span>
                                    </div>
                                </div>
                            </div>
>>>>>>> Stashed changes
                        </div>
                    )}

                    {formData.role === 'TRANSPORTER' && (
<<<<<<< Updated upstream
                        <div className="role-fields fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '-0.5rem' }}>
                            <div>
                                <label className="auth-form-label">Vehicle Type</label>
                                <input type="text" name="vehicle_type" placeholder="e.g. Truck" onChange={handleChange} />
                            </div>
                            <div>
                                <label className="auth-form-label">License Plate</label>
                                <input type="text" name="license_plate" placeholder="Plate No." onChange={handleChange} />
                            </div>
                            <div>
                                <label className="auth-form-label">Capacity</label>
                                <input type="number" name="capacity" placeholder="Tons" onChange={handleChange} />
=======
                        <div className="role-fields fade-in auth-form">
                            <div className="form-grid">
                                <div className="auth-form-group">
                                    <label className="auth-label">Vehicle Type</label>
                                    <input type="text" name="vehicle_type" placeholder="e.g. Truck" onChange={handleChange} />
                                </div>
                                <div className="auth-form-group">
                                    <label className="auth-label">License Plate</label>
                                    <input type="text" name="license_plate" placeholder="Plate No." onChange={handleChange} />
                                </div>
                                <div className="auth-form-group form-grid-full">
                                    <label className="auth-label">Capacity (Tons)</label>
                                    <input type="number" name="capacity" placeholder="Enter capacity" onChange={handleChange} />
                                </div>
                                <div className="auth-form-group">
                                    <label className="auth-label">Driving License (PDF)</label>
                                    <div className="file-input-wrapper">
                                        <input type="file" name="driving_license_file" accept=".pdf" onChange={handleFileChange} required />
                                        <div className="file-input-custom">
                                            <span>{formData.driving_license_file ? formData.driving_license_file.name : 'Upload PDF'}</span>
                                            <span style={{ fontSize: '1.2rem' }}>📄</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="auth-form-group">
                                    <label className="auth-label">Car License (PDF)</label>
                                    <div className="file-input-wrapper">
                                        <input type="file" name="car_license_file" accept=".pdf" onChange={handleFileChange} required />
                                        <div className="file-input-custom">
                                            <span>{formData.car_license_file ? formData.car_license_file.name : 'Upload PDF'}</span>
                                            <span style={{ fontSize: '1.2rem' }}>📄</span>
                                        </div>
                                    </div>
                                </div>
>>>>>>> Stashed changes
                            </div>
                        </div>
                    )}

                    <button type="submit" style={{ width: '100%', marginTop: '1rem' }}>
                        Create Account
                    </button>
                </form>
                
                <p className="auth-footer">
                    Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
