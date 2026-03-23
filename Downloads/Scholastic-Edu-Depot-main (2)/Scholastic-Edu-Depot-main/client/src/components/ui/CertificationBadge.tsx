import React, { useState } from 'react';
import { Shield, ExternalLink, FileText, CheckCircle, Award, Sparkles } from 'lucide-react';

interface CertificationBadgeProps {
    variant?: 'full' | 'compact' | 'minimal';
    className?: string;
}

export const CertificationBadge: React.FC<CertificationBadgeProps> = ({
    variant = 'full',
    className = ''
}) => {
    const [showDetails, setShowDetails] = useState(false);

    const handleViewCertificate = () => {
        window.open('/assets/Scholastic Edu.Depot QMS-Draft.pdf', '_blank');
    };

    const handleVerify = () => {
        window.open('https://www.iafcertsearch.org', '_blank');
    };

    if (variant === 'minimal') {
        return (
            <div className={`inline-flex items-center gap-2 ${className}`}>
                <div className="relative">
                    <img
                        src="/assets/iso_badge.png"
                        alt="ISO 9001:2015 Certified"
                        className="h-8 w-8 object-contain animate-pulse"
                    />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-xs font-medium text-slate-600">ISO 9001:2015 Certified</span>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div
                className={`group relative inline-flex items-center gap-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl px-4 py-3 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer ${className}`}
                onClick={() => setShowDetails(!showDetails)}
            >
                <div className="relative">
                    <img
                        src="/assets/iso_badge.png"
                        alt="ISO 9001:2015 Certified"
                        className="h-12 w-12 object-contain group-hover:rotate-12 transition-transform duration-300"
                    />
                    <Sparkles size={16} className="absolute -top-1 -right-1 text-yellow-500 animate-pulse" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">ISO 9001:2015</h4>
                        <CheckCircle size={14} className="text-green-600" />
                    </div>
                    <p className="text-xs text-slate-600">Quality Management</p>
                </div>

                {showDetails && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-4 z-50">
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-semibold text-slate-700 mb-1">Certified By:</p>
                                <p className="text-xs text-slate-600">Royal Assessments Pvt. Ltd.</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-700 mb-1">Valid Until:</p>
                                <p className="text-xs text-slate-600">December 2028</p>
                            </div>
                            <div className="flex gap-2 pt-2 border-t border-slate-100">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewCertificate();
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1 text-xs bg-brand-600 text-white px-3 py-2 rounded-md hover:bg-brand-700 transition-colors"
                                >
                                    <FileText size={12} />
                                    View
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleVerify();
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1 text-xs bg-slate-100 text-slate-700 px-3 py-2 rounded-md hover:bg-slate-200 transition-colors"
                                >
                                    <ExternalLink size={12} />
                                    Verify
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Full variant - UNIQUE PREMIUM DESIGN
    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 opacity-10 animate-gradient"></div>

            {/* Glassmorphism Card */}
            <div className="relative backdrop-blur-sm bg-white/80 border-2 border-blue-200 rounded-2xl p-8 shadow-2xl">

                {/* Decorative Corner Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-tr-full"></div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

                    {/* Left: Animated Badge with Glow Effect */}
                    <div className="md:col-span-4 flex justify-center">
                        <div className="relative group">
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-pulse"></div>

                            {/* Badge Container */}
                            <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-full border-4 border-blue-300 shadow-xl group-hover:scale-110 transition-transform duration-500">
                                <img
                                    src="/assets/iso_badge.png"
                                    alt="ISO 9001:2015 Certified"
                                    className="h-32 w-32 object-contain group-hover:rotate-12 transition-transform duration-500"
                                />
                            </div>

                            {/* Verified Badge */}
                            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-bounce">
                                <CheckCircle size={14} />
                                VERIFIED
                            </div>
                        </div>
                    </div>

                    {/* Right: Certification Details */}
                    <div className="md:col-span-8 space-y-6">

                        {/* Header with Icon */}
                        <div className="flex items-start gap-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                <Award className="text-white" size={28} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-3xl font-display font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        ISO 9001:2015
                                    </h3>
                                    <Sparkles size={20} className="text-yellow-500 animate-pulse" />
                                </div>
                                <p className="text-lg font-semibold text-slate-700">Quality Management Systems</p>
                            </div>
                        </div>

                        {/* Certification Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Certified By</p>
                                <p className="text-sm font-bold text-slate-800">Royal Assessments Pvt. Ltd.</p>
                                <p className="text-xs text-slate-600">(RAPL)</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Accreditation</p>
                                <p className="text-sm font-bold text-slate-800">EGAC, Egypt</p>
                                <p className="text-xs text-slate-600">(IAF Member)</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Valid Until</p>
                                <p className="text-sm font-bold text-slate-800">December 2028</p>
                            </div>

                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
                                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">Certificate No.</p>
                                <p className="text-sm font-bold text-slate-800">E202505XXXXX</p>
                            </div>
                        </div>

                        {/* Scope */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Certification Scope</p>
                            <p className="text-sm text-slate-700 leading-relaxed">
                                Providing high-quality training educational services for <span className="font-semibold text-brand-600">IELTS, PTE, GRE</span>, Drone Assembly & Training, <span className="font-semibold text-brand-600">AI and SQL/ML</span> Software Courses
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                onClick={handleViewCertificate}
                                className="group flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                <FileText size={20} className="group-hover:rotate-12 transition-transform" />
                                View Certificate
                            </button>
                            <button
                                onClick={handleVerify}
                                className="group flex-1 flex items-center justify-center gap-2 bg-white border-2 border-slate-300 text-slate-700 px-6 py-3.5 rounded-xl hover:bg-slate-50 hover:border-blue-400 transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:scale-105"
                            >
                                <ExternalLink size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                Verify on IAF CertSearch
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Accent Line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        </div>
    );
};
