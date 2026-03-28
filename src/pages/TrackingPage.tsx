import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { Clock, MapPin, CheckCircle2, Truck, Settings, Loader2, ArrowLeft, Info, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const STEPS = [
  { id: 'pending', label: 'pending', icon: <Clock className="w-6 h-6" /> },
  { id: 'pickup', label: 'pickup', icon: <Truck className="w-6 h-6" /> },
  { id: 'grinding', label: 'grinding', icon: <Settings className="w-6 h-6" /> },
  { id: 'out_for_delivery', label: 'out_for_delivery', icon: <Truck className="w-6 h-6" /> },
  { id: 'delivered', label: 'delivered', icon: <CheckCircle2 className="w-6 h-6" /> }
];

export default function TrackingPage() {
  const { orderId } = useParams();
  const { t } = useTranslation();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [queueStatus, setQueueStatus] = useState<any>(null);

  useEffect(() => {
    if (!orderId) return;

    const unsubscribeOrder = onSnapshot(doc(db, 'orders', orderId), (snapshot) => {
      if (snapshot.exists()) {
        setOrder({ id: snapshot.id, ...snapshot.data() });
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `orders/${orderId}`);
    });

    const unsubscribeQueue = onSnapshot(doc(db, 'queue', 'status'), (snapshot) => {
      if (snapshot.exists()) {
        setQueueStatus(snapshot.data());
      }
    });

    return () => {
      unsubscribeOrder();
      unsubscribeQueue();
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
        <p className="text-zinc-500">Order not found.</p>
        <Link to="/dashboard/orders" className="text-orange-600 font-medium mt-2 inline-block hover:underline">Back to Orders</Link>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex(s => s.id === order.status);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/orders" className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h2 className="text-2xl font-bold">{t('track_order')} #{order.id.substring(0, 8)}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="relative flex justify-between items-center">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-100 dark:bg-zinc-800 -translate-y-1/2 z-0"></div>
              <div 
                className="absolute top-1/2 left-0 h-1 bg-orange-600 -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
              ></div>

              {STEPS.map((step, i) => {
                const isActive = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;

                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                      isActive ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600",
                      isCurrent && "ring-4 ring-orange-100 dark:ring-orange-900/20 scale-110"
                    )}>
                      {step.icon}
                    </div>
                    <span className={cn(
                      "text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center max-w-[60px] sm:max-w-none",
                      isActive ? "text-orange-600" : "text-zinc-400 dark:text-zinc-600"
                    )}>
                      {t(step.label)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-orange-600" />
              Order Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 block">{t('grain_type')}</label>
                  <p className="text-lg font-medium capitalize">{t(order.grainType)}</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 block">{t('quantity')}</label>
                  <p className="text-lg font-medium">{order.quantity} kg</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 block">{t('address')}</label>
                  <p className="text-sm font-medium flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                    {order.address?.text}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 block">{t('total_price')}</label>
                  <p className="text-lg font-bold text-orange-600">₹{order.totalPrice}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-orange-600 text-white p-8 rounded-2xl shadow-lg shadow-orange-600/20">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 animate-spin" />
              {t('current_queue')}
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-orange-200 mb-1 block">{t('waiting_list')}</label>
                <p className="text-3xl font-extrabold">3 Orders Ahead</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-orange-200 mb-1 block">{t('est_time')}</label>
                <p className="text-3xl font-extrabold">~ 45 Mins</p>
              </div>
              {order.status === 'grinding' && (
                <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm border border-white/20 animate-pulse">
                  <p className="text-sm font-bold text-center">Your grain is being processed now!</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-lg font-bold mb-4">{t('payment_status')}</h3>
            <div className={cn(
              "p-4 rounded-xl flex items-center justify-between",
              order.paymentStatus === 'paid' ? "bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400" : "bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-400"
            )}>
              <span className="font-bold uppercase tracking-wider text-xs">{t(order.paymentStatus)}</span>
              {order.paymentStatus !== 'paid' && (
                <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-700 transition-colors">
                  {t('pay_now')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
