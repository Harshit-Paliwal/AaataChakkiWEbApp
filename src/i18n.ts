import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app_name": "Jai Bherunath Flour Mills",
      "home": "Home",
      "login": "Login",
      "logout": "Logout",
      "book_now": "Book Now",
      "track_order": "Track Order",
      "admin_panel": "Admin Panel",
      "delivery_panel": "Delivery Panel",
      "grain_type": "Grain Type",
      "quantity": "Quantity (kg)",
      "pickup_slot": "Pickup Slot",
      "address": "Address",
      "status": "Status",
      "pending": "Pending",
      "pickup": "Pickup",
      "grinding": "Grinding",
      "out_for_delivery": "Out for Delivery",
      "delivered": "Delivered",
      "pay_now": "Pay Now",
      "price_per_kg": "Price per kg",
      "total_price": "Total Price",
      "payment_status": "Payment Status",
      "paid": "Paid",
      "failed": "Failed",
      "waiting_list": "Waiting List",
      "est_time": "Estimated Time",
      "current_queue": "Current Queue",
      "assign_delivery": "Assign Delivery",
      "manage_pricing": "Manage Pricing",
      "revenue": "Revenue",
      "orders": "Orders",
      "users": "Users",
      "delivery_boys": "Delivery Boys",
      "select_location": "Select Location on Map",
      "hi": "Hi",
      "welcome": "Welcome to Jai Bherunath Flour Mills",
      "tagline": "Freshly ground flour delivered to your doorstep.",
      "wheat": "Wheat",
      "maize": "Maize",
      "bajra": "Bajra",
      "jowar": "Jowar",
      "other": "Other"
    }
  },
  hi: {
    translation: {
      "app_name": "जय भेरुनाथ फ्लोर मिल्स",
      "home": "होम",
      "login": "लॉगिन",
      "logout": "लॉगआउट",
      "book_now": "अभी बुक करें",
      "track_order": "ऑर्डर ट्रैक करें",
      "admin_panel": "एडमिन पैनल",
      "delivery_panel": "डिलीवरी पैनल",
      "grain_type": "अनाज का प्रकार",
      "quantity": "मात्रा (किलो)",
      "pickup_slot": "पिकअप स्लॉट",
      "address": "पता",
      "status": "स्थिति",
      "pending": "लंबित",
      "pickup": "पिकअप",
      "grinding": "पिसाई",
      "out_for_delivery": "डिलीवरी के लिए बाहर",
      "delivered": "डिलीवर किया गया",
      "pay_now": "अभी भुगतान करें",
      "price_per_kg": "प्रति किलो मूल्य",
      "total_price": "कुल मूल्य",
      "payment_status": "भुगतान की स्थिति",
      "paid": "भुगतान किया गया",
      "failed": "विफल",
      "waiting_list": "प्रतीक्षा सूची",
      "est_time": "अनुमानित समय",
      "current_queue": "वर्तमान कतार",
      "assign_delivery": "डिलीवरी असाइन करें",
      "manage_pricing": "मूल्य प्रबंधन",
      "revenue": "राजस्व",
      "orders": "ऑर्डर",
      "users": "उपयोगकर्ता",
      "delivery_boys": "डिलीवरी बॉय",
      "select_location": "नक्शे पर स्थान चुनें",
      "hi": "नमस्ते",
      "welcome": "जय भेरुनाथ फ्लोर मिल्स में आपका स्वागत है",
      "tagline": "ताजा पिसा हुआ आटा आपके दरवाजे पर।",
      "wheat": "गेहूं",
      "maize": "मक्का",
      "bajra": "बाजरा",
      "jowar": "ज्वार",
      "other": "अन्य"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
