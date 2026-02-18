import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface ClientFormProps {
    onClose: () => void;
    onSubmit: (client: any) => void;
    initialData?: any;
}

const ClientForm: React.FC<ClientFormProps> = ({ onClose, onSubmit, initialData }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(initialData || {
        name: '',
        email: '',
        phone: '',
        telegramId: '',
        category: 'salaried',
        details: '',
        status: 'onboarded',
        gst: '',
        pan: '',
        personalPan: '',
        bankDetails: {
            accountNumber: '',
            ifsc: '',
            bankName: ''
        }
    });

    const steps = [
        { id: 1, title: 'Basic Info' },
        { id: 2, title: 'Business/Tax' },
        { id: 3, title: 'Bank Details' }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 3));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {initialData ? 'Update Client' : 'Onboard New Client'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="px-8 py-6">
                    <div className="relative flex justify-between">
                        {steps.map((s) => (
                            <div key={s.id} className="flex flex-col items-center relative z-10 w-24">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${step >= s.id
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                        : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    {step > s.id ? <Check size={14} /> : s.id}
                                </div>
                                <span className={`text-xs mt-2 font-medium ${step >= s.id ? 'text-blue-600' : 'text-gray-400'
                                    }`}>
                                    {s.title}
                                </span>
                            </div>
                        ))}
                        {/* Connecting Line */}
                        <div className="absolute top-4 left-0 w-full h-[2px] bg-gray-100 -z-0">
                            <div
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${((step - 1) / 2) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 pb-6">
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telegram ID</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="@username"
                                        value={formData.telegramId || ''}
                                        onChange={(e) => setFormData({ ...formData, telegramId: e.target.value })}
                                    />
                                </div> */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="salaried">Salaried</option>
                                        <option value="small business">Small Business</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Personal PAN</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase"
                                    value={formData.personalPan || ''}
                                    onChange={(e) => setFormData({ ...formData, personalPan: e.target.value.toUpperCase() })}
                                    placeholder="ABCDE1234F"
                                />
                            </div>

                            {formData.category === 'small business' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Business PAN</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase"
                                            value={formData.pan || ''}
                                            onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                                            placeholder="ABCDE1234F"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase"
                                            value={formData.gst || ''}
                                            onChange={(e) => setFormData({ ...formData, gst: e.target.value.toUpperCase() })}
                                            placeholder="22AAAAA0000A1Z5"
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[100px]"
                                    value={formData.details}
                                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                    placeholder="Any specific client requirements..."
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={formData.bankDetails?.bankName || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        bankDetails: { ...formData.bankDetails, bankName: e.target.value }
                                    })}
                                    placeholder="HDFC Bank"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={formData.bankDetails?.accountNumber || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        bankDetails: { ...formData.bankDetails, accountNumber: e.target.value }
                                    })}
                                    placeholder="000000000000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase"
                                    value={formData.bankDetails?.ifsc || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        bankDetails: { ...formData.bankDetails, ifsc: e.target.value.toUpperCase() }
                                    })}
                                    placeholder="HDFC0001234"
                                />
                            </div>
                        </div>
                    )}
                </form>

                {/* Footer Buttons */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    {step > 1 ? (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                        >
                            Back
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
                        >
                            {initialData ? 'Update Client' : 'Complete Onboarding'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientForm;
