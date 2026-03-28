import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Clock, MapPin, CheckCircle2, Truck, Settings, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const STATUS_ICONS: any = {
  pending: <Clock className="w-5 h-5 text-zinc-400" />,
  pickup: <Truck className="w-5 h-5 text-blue-500" />,
  grinding: <Settings className="w-5 h-5 text-orange-500 animate-spin" />,
  out_for_delivery: <Truck className="w-5 h-5 text-purple-500" />,
  delivered: <CheckCircle2 className="w-5 h-5 text-green-500" />
};

export default function OrdersPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('customerUid', '==', user.uid),
      orderBy('createdAt', 'desc')
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ShoppingBag className="w-6 h-6 text-orange-600" />
        {t('orders')}
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-500">No orders found. Start booking now!</p>
          <Link to="/dashboard/book" className="text-orange-600 font-medium mt-2 inline-block hover:underline">Book Service</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {orders.map((order, i) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl">
                      {STATUS_ICONS[order.status]}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold capitalize">{t(order.grainType)} - {order.quantity}kg</h3>
                      <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> {new Date(order.createdAt?.seconds * 1000).toLocaleString()}
                      </p>
                      <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {order.address?.text}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                      order.status === 'delivered' ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
                      order.status === 'grinding' ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" :
                      "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                    )}>
                      {t(order.status)}
                    </span>
                    <div className="mt-4 flex items-center gap-4">
                      <span className="text-lg font-bold text-orange-600">₹{order.totalPrice}</span>
                      <Link 
                        to={`/dashboard/track/${order.id}`}
                        className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
                      >
                        {t('track_order')}
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
