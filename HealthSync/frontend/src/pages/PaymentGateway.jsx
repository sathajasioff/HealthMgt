import React, { useState, useEffect, useRef } from 'react';
import { assets } from '../assets/assets'
import API from '../services/api';
import { Wallet, CreditCard, ArrowLeftRight, ChevronDown, User, CheckCircle2, X, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const PaymentGateway = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cart = [], totalPrice = 0, paymentId } = location.state || {};
    const user = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();
    const role = user?.role?.toUpperCase?.() || '';
    
    const [selectedMethod, setSelectedMethod] = useState('creditCard');
    const [saveCardInfo, setSaveCardInfo] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [expandedSection, setExpandedSection] = useState({
        itemChart: true,
        shippingAddress: false,
        paymentMethod: true
    });
    // Insurance state
    const [insuranceProvider, setInsuranceProvider] = useState('');
    const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');
    const [insuranceMemberId, setInsuranceMemberId] = useState('');
    const [insuranceFile, setInsuranceFile] = useState(null);

    // Card fields
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');

    // Refs for GSAP animations
    const containerRef = useRef(null);
    const headerRef = useRef(null);
    const paymentMethodsRef = useRef(null);
    const formRef = useRef(null);
    const summaryRef = useRef(null);
    const modalRef = useRef(null);
    const modalContentRef = useRef(null);

    const paymentMethods = [
        { id: 'wallet', label: 'Wallet', icon: Wallet },
        { id: 'creditCard', label: 'Credit Card', icon: CreditCard },
        { id: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
        { id: 'insurance', label: 'Insurance', icon: ShieldCheck }
    ];

    const cardInfo = {
        number: '4256 3816 1468 2341',
        name: 'Nurul Hidayah',
        validDate: '09 / 20',
        type: 'VISA'
    };

    const toggleSection = (section) => {
        setExpandedSection(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Initial page load animations
    useEffect(() => {
        // Prevent pharmacy users from paying
        if (role === 'PHARMACY') {
            navigate('/pharmacy-dashboard', { replace: true });
            return;
        }
        const ctx = gsap.context(() => {
            // Set initial state
            gsap.set([headerRef.current, summaryRef.current], { opacity: 1 });
            gsap.set(paymentMethodsRef.current?.children || [], { opacity: 1 });
            gsap.set(formRef.current?.children || [], { opacity: 1 });

            // Animate header
            gsap.fromTo(headerRef.current,
                { y: -50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
            );

            // Animate payment methods
            if (paymentMethodsRef.current?.children) {
                gsap.fromTo(paymentMethodsRef.current.children,
                    { scale: 0.8, opacity: 0 },
                    { 
                        scale: 1, 
                        opacity: 1, 
                        duration: 0.5,
                        stagger: 0.1,
                        ease: 'back.out(1.7)',
                        delay: 0.3
                    }
                );
            }

            // Animate form fields
            if (formRef.current?.children) {
                gsap.fromTo(formRef.current.children,
                    { x: -30, opacity: 0 },
                    { 
                        x: 0, 
                        opacity: 1, 
                        duration: 0.5,
                        stagger: 0.1,
                        ease: 'power2.out',
                        delay: 0.5
                    }
                );
            }

            // Animate summary section
            gsap.fromTo(summaryRef.current,
                { x: 50, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.4 }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Modal animation
    useEffect(() => {
        if (showSuccessModal && modalRef.current && modalContentRef.current) {
            const ctx = gsap.context(() => {
                // Backdrop fade in
                gsap.fromTo(modalRef.current,
                    { opacity: 0 },
                    { opacity: 1, duration: 0.3, ease: 'power2.out' }
                );

                // Modal content animation
                gsap.fromTo(modalContentRef.current,
                    { scale: 0.7, opacity: 0, y: 50 },
                    { 
                        scale: 1, 
                        opacity: 1, 
                        y: 0,
                        duration: 0.5, 
                        ease: 'back.out(1.7)' 
                    }
                );

                // Animate success icon
                const icon = modalContentRef.current.querySelector('.success-icon');
                if (icon) {
                    gsap.from(icon, {
                        scale: 0,
                        rotation: -180,
                        duration: 0.6,
                        ease: 'back.out(2)',
                        delay: 0.3
                    });
                }

                // Animate details
                const details = modalContentRef.current.querySelectorAll('.detail-item');
                gsap.from(details, {
                    x: -20,
                    opacity: 0,
                    duration: 0.4,
                    stagger: 0.1,
                    ease: 'power2.out',
                    delay: 0.5
                });
            });

            return () => ctx.revert();
        }
    }, [showSuccessModal]);

    // Payment method selection animation
    const handleMethodChange = (methodId) => {
        setSelectedMethod(methodId);
        // reset method-specific inputs when switching
        if (methodId !== 'insurance') {
            setInsuranceProvider('');
            setInsurancePolicyNumber('');
            setInsuranceMemberId('');
            setInsuranceFile(null);
        }
        if (methodId !== 'creditCard') {
            setCardNumber('');
            setCardName('');
            setCardExpiry('');
            setCardCvv('');
        }
        
        // Animate the selected card
        const selectedCard = document.querySelector(`input[value="${methodId}"]`)?.closest('label');
        if (selectedCard) {
            gsap.fromTo(selectedCard,
                { scale: 0.95 },
                { 
                    scale: 1.05, 
                    duration: 0.3, 
                    ease: 'back.out(2)',
                    onComplete: () => {
                        gsap.to(selectedCard, { scale: 1, duration: 0.2 });
                    }
                }
            );
        }
    };

    // Validation helpers
    const validCardNumber = (val) => val.replace(/\s+/g, '').match(/^\d{16}$/);
    const validExpiry = (val) => {
        const m = val.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
        if (!m) return false;
        const mm = parseInt(m[1], 10);
        const yy = parseInt('20' + m[2], 10);
        const now = new Date();
        const exp = new Date(yy, mm, 0);
        return exp >= new Date(now.getFullYear(), now.getMonth(), 1);
    };
    const validCvv = (val) => /^\d{3}$/.test(val);

    const canSubmit = (() => {
        if (!paymentId) return true;
        if (selectedMethod === 'creditCard') {
            return Boolean(validCardNumber(cardNumber) && cardName.trim() && validExpiry(cardExpiry) && validCvv(cardCvv));
        }
        if (selectedMethod === 'insurance') {
            return Boolean(insuranceFile && insuranceProvider.trim() && insurancePolicyNumber.trim());
        }
        return true;
    })();

    // Button click animation
    const handleFinishPayment = async (e) => {
        const button = e.currentTarget;
        if (!canSubmit) return;
        
        gsap.to(button, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut',
            onComplete: async () => {
                try {
                    if (!paymentId) { setShowSuccessModal(true); return; }
                    if (selectedMethod === 'insurance') {
                        if (!insuranceFile || !insuranceProvider || !insurancePolicyNumber) { return; }
                        const fd = new FormData();
                        fd.append('file', insuranceFile);
                        if (insuranceProvider) fd.append('provider', insuranceProvider);
                        if (insurancePolicyNumber) fd.append('policyNumber', insurancePolicyNumber);
                        if (insuranceMemberId) fd.append('memberId', insuranceMemberId);
                        await API.put(`/payments/${paymentId}/insurance`, fd);
                    } else {
                        const tx = 'TX-' + Math.random().toString(36).slice(2).toUpperCase();
                        await API.post(`/payments/${paymentId}/paid`, { transactionId: tx });
                    }
                } catch (_) {
                } finally {
                    setShowSuccessModal(true);
                }
            }
        });
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Main Card Container */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div ref={headerRef} className="bg-white px-8 py-6 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <img
                                className="w-40 cursor-pointer"
                                src={assets.Logo}
                                alt="Smart Healthcare"
                                onClick={() => navigate('/')}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                        {/* Left Column - Payment Method */}
                        <div className="lg:col-span-3 p-8 bg-gradient-to-br from-gray-50 to-white">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Method</h2>
                            <p className="text-gray-600 mb-6">Choose your preferred payment option</p>

                            {/* Payment Method Options */}
                            <div ref={paymentMethodsRef} className="grid grid-cols-3 gap-4 mb-6">
                                {paymentMethods.map((method) => {
                                    const Icon = method.icon;
                                    return (
                                        <label
                                            key={method.id}
                                            className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${selectedMethod === method.id
                                                    ? 'border-primary bg-green-50 shadow-md scale-105'
                                                    : 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-sm'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method.id}
                                                checked={selectedMethod === method.id}
                                                onChange={(e) => handleMethodChange(e.target.value)}
                                                className="absolute top-3 right-3 w-5 h-5 text-green-600"
                                            />
                                            <Icon size={28} className={`mb-3 ${selectedMethod === method.id ? 'text-green-600' : 'text-gray-400'}`} />
                                            <span className={`text-sm font-medium ${selectedMethod === method.id ? 'text-green-600' : 'text-gray-700'}`}>
                                                {method.label}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>

                            {/* Selection Hint */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                                <p className="text-sm text-blue-800 flex items-center gap-2">
                                    {selectedMethod === 'creditCard' && (<><CreditCard size={16} /><span>Enter your card details securely</span></>)}
                                    {selectedMethod === 'wallet' && (<><Wallet size={16} /><span>We will deduct from your wallet balance</span></>)}
                                    {selectedMethod === 'transfer' && (<><ArrowLeftRight size={16} /><span>We will display bank transfer details</span></>)}
                                    {selectedMethod === 'insurance' && (<><ShieldCheck size={16} /><span>Provide your insurance information</span></>)}
                                </p>
                            </div>

                            {/* Method Specific Form */}
                            <div ref={formRef} className="space-y-4">
                                {selectedMethod === 'insurance' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Insurance Provider</label>
                                            <input value={insuranceProvider} onChange={(e)=>setInsuranceProvider(e.target.value)} type="text" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-200 hover:border-gray-300" placeholder="e.g., ABC Insurance" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Policy Number</label>
                                                <input value={insurancePolicyNumber} onChange={(e)=>setInsurancePolicyNumber(e.target.value)} type="text" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-200 hover:border-gray-300" placeholder="POL-XXXX" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Member ID</label>
                                                <input value={insuranceMemberId} onChange={(e)=>setInsuranceMemberId(e.target.value)} type="text" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-200 hover:border-gray-300" placeholder="MEM-XXXX" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Insurance PDF</label>
                                            <input accept="application/pdf" onChange={(e)=>setInsuranceFile(e.target.files?.[0] || null)} type="file" className="w-full text-sm" />
                                            {insuranceFile && <div className="text-xs text-gray-500 mt-1">{insuranceFile.name}</div>}
                                        </div>
                                        <div className="text-xs text-gray-500">We may contact your insurer to verify eligibility.</div>
                                    </div>
                                )}
                                {selectedMethod === 'creditCard' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number</label>
                                        <input
                                            type="text"
                                            value={cardNumber}
                                            onChange={(e)=>{
                                                const v = e.target.value.replace(/[^\d]/g,'').slice(0,16).replace(/(\d{4})(?=\d)/g,'$1 ');
                                                setCardNumber(v);
                                            }}
                                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white transition-all duration-200 hover:border-gray-300 ${validCardNumber(cardNumber)?'border-gray-200 focus:border-green-500 focus:ring-green-500':'border-red-300 focus:border-red-400 focus:ring-red-400'}`}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength="19"
                                        />
                                        {!validCardNumber(cardNumber) && cardNumber && (<div className="text-xs text-red-600 mt-1">Enter a valid 16-digit card number</div>)}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Cardholder Name</label>
                                        <input
                                            type="text"
                                            value={cardName}
                                            onChange={(e)=>setCardName(e.target.value)}
                                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white transition-all duration-200 hover:border-gray-300 ${cardName.trim()? 'border-gray-200 focus:border-green-500 focus:ring-green-500':'border-red-300 focus:border-red-400 focus:ring-red-400'}`}
                                            placeholder="John Doe"
                                        />
                                        {!cardName.trim() && cardName !== '' && (<div className="text-xs text-red-600 mt-1">Name is required</div>)}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                                            <input
                                                type="text"
                                                value={cardExpiry}
                                                onChange={(e)=>{
                                                    let v = e.target.value.replace(/[^\d]/g,'').slice(0,4);
                                                    if (v.length > 2) v = v.slice(0,2) + '/' + v.slice(2);
                                                    setCardExpiry(v);
                                                }}
                                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white transition-all duration-200 hover:border-gray-300 ${validExpiry(cardExpiry)?'border-gray-2 00 focus:border-green-500 focus:ring-green-500':'border-red-300 focus:border-red-400 focus:ring-red-400'}`}
                                                placeholder="MM/YY"
                                                maxLength="5"
                                            />
                                            {!validExpiry(cardExpiry) && cardExpiry && (<div className="text-xs text-red-600 mt-1">Enter a valid future date</div>)}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">CVV</label>
                                            <input
                                                type="password"
                                                value={cardCvv}
                                                onChange={(e)=>setCardCvv(e.target.value.replace(/[^\d]/g,'').slice(0,3))}
                                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 bg-white transition-all duration-200 hover:border-gray-300 ${validCvv(cardCvv)?'border-gray-200 focus:border-green-500 focus:ring-green-500':'border-red-300 focus:border-red-400 focus:ring-red-400'}`}
                                                placeholder="123"
                                                maxLength="3"
                                            />
                                            {!validCvv(cardCvv) && cardCvv && (<div className="text-xs text-red-600 mt-1">Enter 3-digit CVV</div>)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <label className="flex items-center space-x-3 pt-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={saveCardInfo}
                                    onChange={(e) => setSaveCardInfo(e.target.checked)}
                                    className="w-4 h-4 ml-2 text-primary border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                                />
                                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Save card information for future purchases</span>
                            </label>
                        </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between pt-8 mt-8 border-t border-gray-200">
                                <button 
                                    onClick={() => navigate(-1)}
                                    className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold"
                                >
                                    <span>Back</span>
                                </button>
                                <button 
                                    onClick={handleFinishPayment}
                                    disabled={!canSubmit}
                                    className={`px-8 py-3 rounded-lg transition-all duration-300 font-medium shadow-lg flex items-center gap-2 ${canSubmit ? 'bg-primary text-white hover:bg-emerald-600 hover:shadow-xl' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                                >
                                    <span>Finish Payment</span>
                                </button>
                            </div>
                        </div>

                        {/* Right Column - Summary */}
                        <div ref={summaryRef} className="lg:col-span-2 bg-gradient-to-br from-white to-gray-50 p-8 border-l border-gray-200">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Summary</h2>
                            <p className="text-gray-600 mb-6">Review your order details</p>

                            {/* Collapsible Sections */}
                            <div className="space-y-3">
                                {/* Item Chart */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => toggleSection('itemChart')}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-sm font-medium text-gray-700">Item Chart</span>
                                        <ChevronDown
                                            size={18}
                                            className={`text-gray-500 transition-transform ${expandedSection.itemChart ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                    {expandedSection.itemChart && (
                                        <div className="px-4 pb-4">
                                            {cart.length > 0 ? (
                                                <div className="space-y-3">
                                                    {cart.map((item) => (
                                                        <div key={item.id} className="flex gap-3 items-center py-2 border-b border-gray-100 last:border-b-0">
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="w-12 h-12 object-cover rounded-md"
                                                            />
                                                            <div className="flex-1">
                                                                <h4 className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</h4>
                                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                            </div>
                                                            <div className="text-sm font-semibold text-primary">
                                                                Rs.{(item.price * item.quantity).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-gray-200">
                                                        <span className="text-sm font-semibold text-gray-800">Total:</span>
                                                        <span className="text-lg font-bold text-primary">Rs.{totalPrice.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 text-center py-4">No items in cart</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Shipping Address */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => toggleSection('shippingAddress')}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-sm font-medium text-gray-700">Shipping Address</span>
                                        <ChevronDown
                                            size={18}
                                            className={`text-gray-500 transition-transform ${expandedSection.shippingAddress ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                    {expandedSection.shippingAddress && (
                                        <div className="px-4 pb-4 text-sm text-gray-600">
                                            {/* Address details would go here */}
                                        </div>
                                    )}
                                </div>

                                {/* Payment Method */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => toggleSection('paymentMethod')}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-sm font-medium text-gray-700">Payment Method</span>
                                        <ChevronDown
                                            size={18}
                                            className={`text-gray-500 transition-transform ${expandedSection.paymentMethod ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                    {expandedSection.paymentMethod && (
                                        <div className="px-4 pb-4">
                                            {/* Display selected payment method */}
                                            <div className="flex items-center gap-2 mb-4">
                                                {selectedMethod === 'wallet' && (
                                                    <>
                                                        <Wallet size={16} className="text-gray-500" />
                                                        <span className="text-sm text-gray-600">Wallet</span>
                                                    </>
                                                )}
                                                {selectedMethod === 'creditCard' && (
                                                    <>
                                                        <CreditCard size={16} className="text-gray-500" />
                                                        <span className="text-sm text-gray-600">Credit Card</span>
                                                    </>
                                                )}
                                                {selectedMethod === 'transfer' && (
                                                    <>
                                                        <ArrowLeftRight size={16} className="text-gray-500" />
                                                        <span className="text-sm text-gray-600">Transfer</span>
                                                    </>
                                                )}
                                                {selectedMethod === 'insurance' && (
                                                    <>
                                                        <ShieldCheck size={16} className="text-gray-500" />
                                                        <span className="text-sm text-gray-600">Insurance</span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Show card preview only for Credit Card */}
                                            {selectedMethod === 'creditCard' && (
                                                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
                                                    <div className="flex justify-between items-start mb-8">
                                                        <div className="text-2xl font-bold tracking-wider">{cardInfo.type}</div>
                                                    </div>
                                                    <div className="text-base font-mono tracking-widest mb-6">
                                                        {cardInfo.number}
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <div>
                                                            <div className="text-green-200 text-[10px] mb-1">NAME</div>
                                                            <div className="font-medium">{cardInfo.name}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-green-200 text-[10px] mb-1">VALID</div>
                                                            <div className="font-medium">{cardInfo.validDate}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Wallet Info */}
                                            {selectedMethod === 'wallet' && (
                                                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div>
                                                            <div className="text-green-200 text-xs mb-1">Available Balance</div>
                                                            <div className="text-2xl font-bold">Rs.50,000.00</div>
                                                        </div>
                                                        <Wallet size={32} className="text-green-200" />
                                                    </div>
                                                    <div className="text-sm text-green-100">
                                                        Payment will be deducted from your wallet balance
                                                    </div>
                                                </div>
                                            )}

                                            {/* Transfer Info */}
                                            {selectedMethod === 'transfer' && (
                                                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="text-lg font-bold">Bank Transfer</div>
                                                        <ArrowLeftRight size={24} className="text-green-200" />
                                                    </div>
                                                    <div className="space-y-2 text-sm">
                                                        <div>
                                                            <div className="text-green-200 text-xs">Bank Name</div>
                                                            <div className="font-medium">Smart Healthcare Bank</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-green-200 text-xs">Account Number</div>
                                                            <div className="font-medium font-mono">1234-5678-9012</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Professional Success Modal */}
            {showSuccessModal && (
                <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => {
                            setShowSuccessModal(false);
                            navigate('/order');
                        }}
                    ></div>
                    
                    {/* Modal Content */}
                    <div ref={modalContentRef} className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setShowSuccessModal(false);
                                navigate('/order');
                            }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors hover:rotate-90 duration-300"
                        >
                            <X size={24} />
                        </button>

                        {/* Success Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="relative success-icon">
                                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                                <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full p-4">
                                    <CheckCircle2 size={48} className="text-white" strokeWidth={2.5} />
                                </div>
                            </div>
                        </div>

                        {/* Success Message */}
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Payment Successful!
                            </h3>
                            <p className="text-gray-600">
                                Your payment has been processed successfully. Thank you for your purchase!
                            </p>
                        </div>

                        {/* Payment Details */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                            <div className="flex justify-between items-center detail-item">
                                <span className="text-sm text-gray-600">Amount Paid</span>
                                <span className="text-lg font-bold text-primary">Rs.{totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center detail-item">
                                <span className="text-sm text-gray-600">Payment Method</span>
                                <span className="text-sm font-medium text-gray-900 capitalize">
                                    {selectedMethod === 'creditCard' ? 'Credit Card' : selectedMethod}
                                </span>
                            </div>
                            <div className="flex justify-between items-center detail-item">
                                <span className="text-sm text-gray-600">Transaction ID</span>
                                <span className="text-sm font-mono text-gray-900">
                                    #{Math.random().toString(36).substr(2, 9).toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => {
                                setShowSuccessModal(false);
                                navigate('/orders');
                            }}
                            className="w-full bg-primary hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            View My Orders
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PaymentGateway;