import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, Weight, Info, CheckCircle2, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const GRAIN_TYPES = ['wheat', 'maize', 'bajra', 'jowar', 'other'];

export default function BookingPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [grainType, setGrainType] = useState('wheat');
  const [quantity, setQuantity] = useState(5);
  const [pickupSlot, setPickupSlot] = useState('');
  const [address, setAddress] = useState('');
  const [pricing, setPricing] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'pricing'), (snapshot) => {
      const p: any = {};
      snapshot.docs.forEach(doc => {
        p[doc.id] = doc.data().pricePerKg;
      });
      setPricing(p);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const pricePerKg = pricing[grainType] || 10; // Default if not set
    const totalPrice = quantity * pricePerKg;

    try {
      await addDoc(collection(db, 'orders'), {
        customerUid: user.uid,
        customerName: user.displayName,
        grainType,
        quantity,
        pickupSlot,
        address: {
          text: address,
          lat: 24.5854, // Mock coordinates
          lng: 73.7125
        },
        status: 'pending',
        pricePerKg,
        totalPrice,
        paymentStatus: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setSuccess(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800"
      >
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Order Booked Successfully!</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">Our delivery boy will pick up your grain during the selected slot.</p>
        <button onClick={() => setSuccess(false)} className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium">
          Book Another
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ShoppingBag className="w-6 h-6 text-orange-600" />
        {t('book_now')}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Info className="w-4 h-4" /> {t('grain_type')}
            </label>
            <select 
              value={grainType}
              onChange={(e) => setGrainType(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
            >
              {GRAIN_TYPES.map(type => (
                <option key={type} value={type}>{t(type)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Weight className="w-4 h-4" /> {t('quantity')}
            </label>
            <input 
              type="number" 
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {t('pickup_slot')}
          </label>
          <input 
            type="datetime-local" 
            required
            value={pickupSlot}
            onChange={(e) => setPickupSlot(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> {t('address')}
          </label>
          <textarea 
            required
            placeholder="Enter your full address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none min-h-[100px]"
          />
          <p className="text-xs text-zinc-500 italic">{t('select_location')}</p>
        </div>

        <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/30">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{t('price_per_kg')}</span>
            <span className="font-bold text-orange-600">₹{pricing[grainType] || 10}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-orange-200 dark:border-orange-900/50">
            <span className="font-medium">{t('total_price')}</span>
            <span className="text-xl font-extrabold text-orange-600">₹{quantity * (pricing[grainType] || 10)}</span>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={cn(
            "w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]",
            loading ? "bg-zinc-400 cursor-not-allowed" : "bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-600/20"
          )}
        >
          {loading ? "Processing..." : t('book_now')}
        </button>
      </form>
    </div>
  );
}
