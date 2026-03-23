import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, CheckCircle, User, Mail, Phone, BookOpen, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface BookingForm {
    name: string;
    email: string;
    phone: string;
    course: string;
    date: string;
    time: string;
    message: string;
}

const TIME_SLOTS = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
];

const COURSES = [
    'Full Stack Development',
    'Data Science & AI',
    'Python Programming',
    'Java Full Stack',
    'Mobile App Development',
    'UI/UX Design',
    'DevOps & Cloud',
    'Cybersecurity',
    'Other'
];

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<'datetime' | 'form' | 'success'>('datetime');
    const [formData, setFormData] = useState<BookingForm>({
        name: '',
        email: '',
        phone: '',
        course: '',
        date: '',
        time: '',
        message: ''
    });
    const [errors, setErrors] = useState<Partial<BookingForm>>({});

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setStep('datetime');
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    course: '',
                    date: '',
                    time: '',
                    message: ''
                });
                setErrors({});
            }, 300);
        }
    }, [isOpen]);

    // Get minimum date (today)
    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Get maximum date (3 months from now)
    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        return maxDate.toISOString().split('T')[0];
    };

    const handleDateTimeNext = () => {
        if (!formData.date || !formData.time) {
            setErrors({
                date: !formData.date ? 'Please select a date' : '',
                time: !formData.time ? 'Please select a time slot' : ''
            });
            return;
        }
        setErrors({});
        setStep('form');
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<BookingForm> = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number';
        }
        if (!formData.course) newErrors.course = 'Please select a course';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            // Here you would typically send the data to your backend
            console.log('Booking submitted:', formData);
            setStep('success');
        }
    };

    const handleClose = () => {
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-6 relative">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <h2 className="text-2xl font-bold text-white mb-2">Book Free Counseling</h2>
                    <p className="text-brand-100 text-sm">Get personalized guidance from our career experts</p>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Step Indicator */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex items-center gap-2">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 'datetime' ? 'bg-brand-600 text-white' : step === 'form' || step === 'success' ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                {step === 'form' || step === 'success' ? <CheckCircle size={16} /> : '1'}
                            </div>
                            <span className="text-sm font-medium text-slate-600">Select Date & Time</span>
                            <div className="w-12 h-0.5 bg-slate-200 mx-2"></div>
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 'form' ? 'bg-brand-600 text-white' : step === 'success' ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                {step === 'success' ? <CheckCircle size={16} /> : '2'}
                            </div>
                            <span className="text-sm font-medium text-slate-600">Your Details</span>
                        </div>
                    </div>

                    {/* Step 1: Date & Time Selection */}
                    {step === 'datetime' && (
                        <div className="space-y-6">
                            {/* Date Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <Calendar size={18} className="text-brand-600" />
                                    Select Date
                                </label>
                                <input
                                    type="date"
                                    min={getMinDate()}
                                    max={getMaxDate()}
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className={`w-full px-4 py-3 border ${errors.date ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none`}
                                />
                                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                            </div>

                            {/* Time Slot Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <Clock size={18} className="text-brand-600" />
                                    Select Time Slot
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {TIME_SLOTS.map((slot) => (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, time: slot })}
                                            className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${formData.time === slot
                                                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                                                    : 'border-slate-200 hover:border-brand-300 text-slate-700'
                                                }`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                                {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
                            </div>

                            <Button
                                onClick={handleDateTimeNext}
                                className="w-full"
                                size="lg"
                            >
                                Continue to Details
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Contact Form */}
                    {step === 'form' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Selected Date & Time Display */}
                            <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-brand-700 font-medium mb-2">Selected Schedule:</p>
                                <div className="flex items-center gap-4 text-sm text-brand-900">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={16} />
                                        {new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={16} />
                                        {formData.time}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep('datetime')}
                                    className="text-brand-600 text-sm font-medium mt-2 hover:underline"
                                >
                                    Change Date/Time
                                </button>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <User size={18} className="text-brand-600" />
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none`}
                                    placeholder="Enter your full name"
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <Mail size={18} className="text-brand-600" />
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none`}
                                    placeholder="your.email@example.com"
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <Phone size={18} className="text-brand-600" />
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className={`w-full px-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none`}
                                    placeholder="+91 98765 43210"
                                />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                            </div>

                            {/* Course */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <BookOpen size={18} className="text-brand-600" />
                                    Interested Course *
                                </label>
                                <select
                                    value={formData.course}
                                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                    className={`w-full px-4 py-3 border ${errors.course ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white`}
                                >
                                    <option value="">Select a course</option>
                                    {COURSES.map((course) => (
                                        <option key={course} value={course}>{course}</option>
                                    ))}
                                </select>
                                {errors.course && <p className="text-red-500 text-sm mt-1">{errors.course}</p>}
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <MessageSquare size={18} className="text-brand-600" />
                                    Message (Optional)
                                </label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
                                    placeholder="Any specific questions or topics you'd like to discuss?"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep('datetime')}
                                    className="flex-1"
                                >
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    size="lg"
                                >
                                    Confirm Booking
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Success */}
                    {step === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={40} className="text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Booking Confirmed!</h3>
                            <p className="text-slate-600 mb-6 max-w-md mx-auto">
                                Thank you, {formData.name}! Your counseling session has been scheduled for{' '}
                                <strong>{new Date(formData.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong> at{' '}
                                <strong>{formData.time}</strong>.
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                                <p className="text-sm text-blue-900 font-medium mb-2">📧 Confirmation Email Sent</p>
                                <p className="text-sm text-blue-700">
                                    We've sent a confirmation email to <strong>{formData.email}</strong> with the meeting details and a calendar invite.
                                </p>
                            </div>
                            <Button onClick={handleClose} size="lg" className="w-full">
                                Close
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
