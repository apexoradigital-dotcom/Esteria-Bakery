import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigation } from '../context/NavigationContext';
import { bakeryStore, formatNaira } from '../lib/bakeryStore';
import { Product } from '../types/bakery';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  Send,
  MessageCircle,
  Truck,
  Store,
  Calendar,
  Clock,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export const OrderPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();
  const { navigate } = useNavigation();

  // Available products to add to cart easily
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [email, setEmail] = useState('');
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');
  const [locationArea, setLocationArea] = useState('');
  const [city, setCity] = useState('Lagos');
  const [state, setState] = useState('Lagos State');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    bakeryStore.getProducts().then((prods) => {
      setAvailableProducts(prods.filter((p) => p.is_available));
    });

    // Default preferred date to today or tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPreferredDate(tomorrow.toISOString().split('T')[0]);
    setPreferredTime('12:00 PM');
  }, []);

  const handleQuickAdd = (product: Product) => {
    bakeryStore.getProducts().then(() => {
      // Add through cart context
      updateQuantity(product.id, (cart.find((i) => i.product.id === product.id)?.quantity || 0) + 1);
    });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (cart.length === 0) {
      setFormError('Your order tray is empty. Please select at least one item before continuing.');
      return;
    }

    if (!fullName.trim() || !phone.trim() || !preferredDate || !preferredTime) {
      setFormError('Please fill in your full name, phone number, and preferred date/time.');
      return;
    }

    if (orderType === 'delivery' && (!address.trim() || !locationArea.trim())) {
      setFormError('Please provide your full delivery address and area for dispatch.');
      return;
    }

    const finalWhatsApp = sameAsPhone ? phone.trim() : whatsappNumber.trim() || phone.trim();

    try {
      setIsSubmitting(true);

      const newOrder = await bakeryStore.createOrder({
        customer_name: fullName.trim(),
        phone: phone.trim(),
        whatsapp_number: finalWhatsApp,
        email: email.trim() || undefined,
        order_type: orderType,
        address: orderType === 'delivery' ? address.trim() : undefined,
        location: orderType === 'delivery' ? locationArea.trim() : 'Esteria Bakery Pickup Counter',
        city,
        state,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        special_instructions: specialInstructions.trim() || undefined,
        total_amount: totalAmount,
        items: cart.map((item) => ({
          id: `item-${Date.now()}-${item.product.id}`,
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price,
          subtotal: item.product.price * item.quantity,
          custom_instructions: item.specialNote,
        })),
      });

      // Fire confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti optional
      }

      setSubmittedOrder(newOrder);

      // Generate WhatsApp link
      const whatsappUrl = bakeryStore.generateWhatsAppUrl(newOrder, '2349158209566');

      // Attempt immediate redirection to WhatsApp
      setTimeout(() => {
        window.location.href = whatsappUrl;
      }, 1200);

      clearCart();
    } catch (err) {
      console.error(err);
      setFormError('Failed to save order. Please try again or reach out directly on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order was successfully created, show confirmation card with direct WhatsApp button
  if (submittedOrder) {
    const whatsappUrl = bakeryStore.generateWhatsAppUrl(submittedOrder, '2349158209566');

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-amber-950/10 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Order Confirmed &amp; Logged
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D1A12]">
              Thank You, {submittedOrder.customer_name}!
            </h1>
            <p className="text-stone-600 text-sm max-w-md mx-auto">
              Your order <strong className="text-stone-900 font-mono">#{submittedOrder.id}</strong> has been saved. We are redirecting you to WhatsApp for immediate confirmation.
            </p>
          </div>

          {/* Order Details Summary Box */}
          <div className="bg-stone-50 rounded-2xl p-6 text-left border border-stone-200 space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-stone-200 pb-2">
              <span className="text-stone-500">Order ID:</span>
              <span className="font-mono font-bold text-stone-900">{submittedOrder.id}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-2">
              <span className="text-stone-500">Total Amount:</span>
              <span className="font-bold text-amber-950 tabular-nums">
                {formatNaira(submittedOrder.total_amount)}
              </span>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-2">
              <span className="text-stone-500">Order Type:</span>
              <span className="capitalize font-semibold text-stone-800">
                {submittedOrder.order_type} ({submittedOrder.location})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Preferred Slot:</span>
              <span className="font-semibold text-stone-800">
                {submittedOrder.preferred_date} at {submittedOrder.preferred_time}
              </span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="space-y-3 pt-2">
            <a
              href={whatsappUrl}
              className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto py-4 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Continue on WhatsApp Now</span>
            </a>
            <p className="text-xs text-stone-400">
              If WhatsApp did not open automatically, click the button above or message us at <strong className="text-stone-700">09158209566</strong>.
            </p>
          </div>

          <div className="pt-4 border-t border-stone-100">
            <button
              onClick={() => {
                setSubmittedOrder(null);
                navigate('/menu');
              }}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline"
            >
              Order More Items
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-24">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-bold text-amber-800">
          Easy Ordering &amp; Delivery
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D1A12] leading-tight">
          Complete Your Esteria Bakery Order
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          Fill in your details below. Once submitted, your order will be sent straight to our WhatsApp line (<strong className="font-mono text-stone-900">09158209566</strong>) for immediate confirmation.
        </p>
      </div>

      {formError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-3 max-w-3xl mx-auto">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Customer & Delivery Details */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Section 1: Customer Information */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-950/10 shadow-xs space-y-5">
            <h2 className="font-serif text-xl font-bold text-[#2D1A12] flex items-center gap-2">
              <span>1. Customer Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#452A1E] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Tunde Adeleke"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#452A1E] mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., 08023456789"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#452A1E] mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., tunde@gmail.com"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsPhone}
                    onChange={(e) => setSameAsPhone(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                  />
                  <span>WhatsApp number is the same as my phone number</span>
                </label>

                {!sameAsPhone && (
                  <div>
                    <label className="block text-xs font-semibold text-[#452A1E] mb-1">
                      WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required={!sameAsPhone}
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="e.g., 08123456789"
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Order Type & Delivery Information */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-950/10 shadow-xs space-y-5">
            <h2 className="font-serif text-xl font-bold text-[#2D1A12] flex items-center gap-2">
              <span>2. Delivery or Store Pickup</span>
            </h2>

            {/* Order Type Toggle */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  orderType === 'delivery'
                    ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <Truck className={`w-5 h-5 mt-0.5 ${orderType === 'delivery' ? 'text-amber-700' : 'text-stone-400'}`} />
                <div>
                  <span className="font-serif text-sm font-bold text-[#2D1A12] block">
                    Direct Delivery
                  </span>
                  <span className="text-xs text-stone-500">
                    Dispatched to your home or office address
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  orderType === 'pickup'
                    ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <Store className={`w-5 h-5 mt-0.5 ${orderType === 'pickup' ? 'text-amber-700' : 'text-stone-400'}`} />
                <div>
                  <span className="font-serif text-sm font-bold text-[#2D1A12] block">
                    Store Pickup
                  </span>
                  <span className="text-xs text-stone-500">
                    Pick up directly from our bakery
                  </span>
                </div>
              </button>
            </div>

            {orderType === 'delivery' && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#452A1E] mb-1">
                    Delivery Address *
                  </label>
                  <input
                    type="text"
                    required={orderType === 'delivery'}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g., Flat 4B, 15 Adeola Odeku Street"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#452A1E] mb-1">
                      Area / Neighborhood *
                    </label>
                    <input
                      type="text"
                      required={orderType === 'delivery'}
                      value={locationArea}
                      onChange={(e) => setLocationArea(e.target.value)}
                      placeholder="e.g., Victoria Island, Maitama"
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#452A1E] mb-1">
                      City *
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                    >
                      <option value="Lagos">Lagos</option>
                      <option value="Abuja">Abuja</option>
                      <option value="Ibadan">Ibadan</option>
                      <option value="Port Harcourt">Port Harcourt</option>
                      <option value="Other">Other (Confirm on WhatsApp)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#452A1E] mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g., Lagos State"
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Date & Time selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#452A1E] mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>Preferred Delivery/Pickup Date *</span>
                </label>
                <input
                  type="date"
                  required
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#452A1E] mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Preferred Pickup / Delivery Time *</span>
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                >
                  <option value="Morning (9:00 AM - 11:30 AM)">Morning (9:00 AM - 11:30 AM)</option>
                  <option value="Midday (12:00 PM - 2:00 PM)">Midday (12:00 PM - 2:00 PM)</option>
                  <option value="Afternoon (2:30 PM - 4:30 PM)">Afternoon (2:30 PM - 4:30 PM)</option>
                  <option value="Evening (5:00 PM - 7:00 PM)">Evening (5:00 PM - 7:00 PM)</option>
                </select>
              </div>
            </div>

            {/* Additional notes / Cake inscription */}
            <div>
              <label className="block text-xs font-semibold text-[#452A1E] mb-1">
                Special Instructions / Customization Requirements
              </label>
              <textarea
                rows={3}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g., Birthday message for cake, spicy samosas, or specific packaging for meetings..."
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Tray Summary & WhatsApp Submit */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-950/10 shadow-md space-y-6 sticky top-28">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h2 className="font-serif text-xl font-bold text-[#2D1A12] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-700" />
                <span>Order Summary</span>
              </h2>
              <span className="text-xs font-bold text-stone-500">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Items Tray */}
            {cart.length === 0 ? (
              <div className="py-8 text-center text-stone-500 space-y-3">
                <p className="text-sm">Your order tray is currently empty.</p>
                <button
                  type="button"
                  onClick={() => navigate('/menu')}
                  className="py-2 px-4 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs transition-colors"
                >
                  Pick pastries from Menu
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/60 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-stone-500 tabular-nums">
                        {formatNaira(item.product.price)} each
                      </p>
                      {item.specialNote && (
                        <p className="text-[11px] text-amber-800 italic truncate">
                          Note: {item.specialNote}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white border border-stone-200 rounded-md">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-stone-600 hover:text-stone-950"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-4 text-center font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 text-stone-600 hover:text-stone-950"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-bold text-stone-900 tabular-nums min-w-16 text-right">
                        {formatNaira(item.product.price * item.quantity)}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-stone-400 hover:text-rose-600 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Add Suggestions if few items */}
            {availableProducts.length > 0 && cart.length < 3 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                  Add popular extras:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {availableProducts.slice(0, 3).map((extra) => (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => handleQuickAdd(extra)}
                      className="text-xs bg-stone-100 hover:bg-amber-100 text-stone-800 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-amber-700" />
                      <span>{extra.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subtotal & Delivery Notes */}
            <div className="pt-4 border-t border-stone-100 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-600">Subtotal</span>
                <span className="font-bold text-stone-900 tabular-nums">
                  {formatNaira(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-stone-500">
                <span>Delivery Cost</span>
                <span className="italic">Calculated based on address via WhatsApp</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-stone-100">
                <span className="font-serif text-base font-bold text-[#2D1A12]">Total</span>
                <span className="font-serif text-2xl font-bold text-[#2D1A12] tabular-nums">
                  {formatNaira(totalAmount)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-400 text-[#2D1A12] font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <span>Generating Order...</span>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5 text-emerald-900" />
                  <span>Place Order on WhatsApp</span>
                </>
              )}
            </button>

            <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-950/10 text-[11px] text-[#452A1E] leading-relaxed text-center">
              🔒 Order details are saved to our bakery dispatch system and immediately forwarded to <strong className="font-mono">09158209566</strong> on WhatsApp.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
