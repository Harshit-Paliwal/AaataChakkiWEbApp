import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Users, Truck, Settings, IndianRupee, Clock, CheckCircle2, Loader2, Edit2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Navigate, Link } from 'react-router-dom';

const STATUS_OPTIONS = ['pending', 'pickup', 'grinding', 'out_for_delivery', 'delivered'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [deliveryBoys, setDeliveryBoys] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [editingPricing, setEditingPricing] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const o = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(o);
      setLoading(false);
    });

    const unsubscribeUsers = onSnapshot(query(collection(db, 'users'), where('role', '==', 'delivery')), (snapshot) => {
      const db = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDeliveryBoys(db);
    });

    const unsubscribePricing = onSnapshot(collection(db, 'pricing'), (snapshot) => {
      const p: any = {};
      snapshot.docs.forEach(doc => {
        p[doc.id] = doc.data().pricePerKg;
      });
      setPricing(p);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeUsers();
      unsubscribePricing();
    };
  }, [user]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const assignDelivery = async (orderId: string, deliveryBoyUid: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        deliveryBoyUid,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const savePricing = async (grainType: string) => {
    try {
      await updateDoc(doc(db, 'pricing', grainType), {
        pricePerKg: newPrice
      });
      setEditingPricing(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `pricing/${grainType}`);
    }
  };

  if (!user || user.role !== 'admin') return <Navigate to="/" />;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  const totalRevenue = orders.reduce((acc, o) => acc + (o.paymentStatus === 'paid' ? o.totalPrice : 0), 0);
  const pendingOrders = orders.filter(o => o.status !== 'delivered').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('admin_panel')}</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Manage your flour mill operations.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className="p-2 bg-green-50 dark:bg-green-900/10 rounded-lg">
              <IndianRupee className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">{t('revenue')}</p>
              <p className="text-xl font-extrabold">₹{totalRevenue}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Active Orders</p>
              <p className="text-xl font-extrabold">{pendingOrders}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
                Recent Orders
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Delivery Boy</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">#{order.id.substring(0, 8)}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-zinc-500">{t(order.grainType)} - {order.quantity}kg</p>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-3 py-1 text-xs font-bold uppercase"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{t(s)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={order.deliveryBoyUid || ''}
                          onChange={(e) => assignDelivery(order.id, e.target.value)}
                          className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-3 py-1 text-xs"
                        >
                          <option value="">Unassigned</option>
                          {deliveryBoys.map(db => (
                            <option key={db.uid} value={db.uid}>{db.displayName}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/dashboard/track/${order.id}`} className="text-orange-600 hover:underline text-xs font-bold">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-orange-600" />
              {t('manage_pricing')}
            </h2>
            <div className="space-y-4">
              {Object.entries(pricing).map(([grain, price]: [string, any]) => (
                <div key={grain} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                  <span className="font-bold capitalize">{t(grain)}</span>
                  {editingPricing === grain ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={newPrice}
                        onChange={(e) => setNewPrice(Number(e.target.value))}
                        className="w-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm"
                      />
                      <button onClick={() => savePricing(grain)} className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingPricing(null)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className="font-extrabold text-orange-600">₹{price}</span>
                      <button 
                        onClick={() => { setEditingPricing(grain); setNewPrice(price); }}
                        className="p-1 text-zinc-400 hover:text-orange-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              {t('delivery_boys')}
            </h2>
            <div className="space-y-4">
              {deliveryBoys.map(db => (
                <div key={db.uid} className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                  <img src={db.photoURL} alt="" className="w-10 h-10 rounded-full border border-zinc-200" />
                  <div>
                    <p className="font-bold text-sm">{db.displayName}</p>
                    <p className="text-xs text-zinc-500">{db.email}</p>
                  </div>
                </div>
              ))}
              {deliveryBoys.length === 0 && <p className="text-sm text-zinc-500 text-center py-4">No delivery boys registered.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
