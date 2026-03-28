import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { Truck, MapPin, CheckCircle2, Loader2, Navigation, Phone, ExternalLink, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Navigate } from 'react-router-dom';

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'delivery') return;

    const q = query(
      collection(db, 'orders'),
      where('deliveryBoyUid', '==', user.uid),
      where('status', 'in', ['pending', 'pickup', 'grinding', 'out_for_delivery'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const o = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(o);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return () => unsubscribe();
  }, [user]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  if (!user || user.role !== 'delivery') return <Navigate to="/" />;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">{t('delivery_panel')}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Assigned pickups and deliveries.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <Truck className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500">No active tasks assigned.</p>
          </div>
        ) : (
          <AnimatePresence>
            {orders.map((order, i) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        order.status === 'pending' ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {t(order.status)}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">#{order.id.substring(0, 8)}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold">{order.customerName}</h3>
                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                        {order.address?.text}
                      </p>
                      <p className="text-sm text-zinc-500 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        {t(order.grainType)} - {order.quantity}kg
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${order.address?.lat},${order.address?.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <Navigation className="w-4 h-4" />
                        Navigate
                      </a>
                      <button className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                        <Phone className="w-4 h-4" />
                        Call
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Update Status</p>
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'pickup')}
                        className="w-full bg-orange-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Truck className="w-5 h-5" />
                        Grain Picked Up
                      </button>
                    )}
                    {order.status === 'grinding' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'out_for_delivery')}
                        className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Truck className="w-5 h-5" />
                        Out for Delivery
                      </button>
                    )}
                    {order.status === 'out_for_delivery' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'delivered')}
                        className="w-full bg-green-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Mark Delivered
                      </button>
                    )}
                    {order.status === 'pickup' && (
                      <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-center">
                        <p className="text-sm font-bold text-zinc-500">Waiting for Grinding...</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
