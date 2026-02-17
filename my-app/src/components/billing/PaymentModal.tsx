import { useState } from 'react';
import { X, IndianRupee, Save } from 'lucide-react';

interface PaymentModalProps {
    file: any;
    onClose: () => void;
    onUpdate: (fileId: string, updates: any) => Promise<void>;
}

const PaymentModal = ({ file, onClose, onUpdate }: PaymentModalProps) => {
    const [amount, setAmount] = useState<string>(file.receivedAmount?.toString() || '');
    const [status, setStatus] = useState<string>(file.paymentStatus || 'pending');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updates: any = {
                receivedAmount: parseFloat(amount) || 0,
                paymentStatus: status
            };
            await onUpdate(file._id || file.id, updates);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Update Payment</h2>
                        <p className="text-sm text-gray-500">{file.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Received Amount</label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-semibold text-gray-900"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="mt-2 text-xs text-gray-500 flex justify-between">
                            <span>Total Billed: ₹{file.billingAmount?.toLocaleString() || 0}</span>
                            <span>Due: ₹{((file.billingAmount || 0) - (parseFloat(amount) || 0)).toLocaleString()}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['pending', 'partial', 'paid'].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setStatus(s)}
                                    className={`py-2 px-3 rounded-xl text-sm font-bold capitalize border-2 transition-all ${status === s
                                            ? s === 'paid' ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : s === 'partial' ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                    : 'border-rose-500 bg-rose-50 text-rose-700'
                                            : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
