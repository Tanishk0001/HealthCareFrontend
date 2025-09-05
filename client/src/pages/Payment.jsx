import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/services/api';
import { CreditCard, Calendar, User, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Payment() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);

  useEffect(() => {
    // Get appointment data from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const doctorId = urlParams.get('doctorId');
    const date = urlParams.get('date');
    const time = urlParams.get('time');
    const type = urlParams.get('type') || 'consultation';
    const amount = urlParams.get('amount') || '500';

    if (doctorId && date && time) {
      setAppointmentData({
        doctorId,
        date,
        time,
        type,
        amount: parseInt(amount)
      });
    }
  }, []);

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <CreditCard className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h1>
            <p className="text-gray-600 mb-6">
              Please login to your account to proceed with payment.
            </p>
            <button 
              onClick={() => setLocation('/login')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Login to Continue
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handlePayment = async () => {
    if (!appointmentData) {
      toast({
        title: "Error",
        description: "Missing appointment information",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Create order on backend
      const orderResponse = await apiRequest('POST', '/api/payment/create-order', {
        amount: appointmentData.amount * 100, // Razorpay expects amount in paisa
        currency: 'INR',
        receipt: `appointment_${Date.now()}`,
        appointmentData: appointmentData
      });

      const orderData = await orderResponse.json();

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Smart Health Care',
        description: 'Appointment Booking Payment',
        image: '/logo.png',
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyResponse = await apiRequest('POST', '/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appointmentData: appointmentData
            });

            const result = await verifyResponse.json();
            
            if (result.success) {
              toast({
                title: "Payment Successful!",
                description: "Your appointment has been booked successfully.",
              });
              setLocation('/patient');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            toast({
              title: "Payment Error",
              description: "Payment verification failed. Please contact support.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          contact: user.phone || ''
        },
        notes: {
          appointment_type: appointmentData.type,
          doctor_id: appointmentData.doctorId
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!appointmentData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <Calendar className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Invalid Payment Request</h1>
            <p className="text-gray-600 mb-6">
              No appointment data found. Please book an appointment first.
            </p>
            <button 
              onClick={() => setLocation('/appointment-booking')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Book Appointment
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Complete Your Payment</h1>
          <p className="text-lg text-gray-600">Secure your appointment with our doctor</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Appointment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Appointment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-800">Doctor ID: {appointmentData.doctorId}</p>
                  <p className="text-sm text-gray-600">Specialist Consultation</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-800">{appointmentData.date}</p>
                  <p className="text-sm text-gray-600">Appointment Date</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-800">{appointmentData.time}</p>
                  <p className="text-sm text-gray-600">Appointment Time</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">₹{appointmentData.amount}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Including all taxes and fees</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <CreditCard className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure Payment</h3>
                  <p className="text-gray-600 mb-4">
                    Your payment is secured by Razorpay. We accept all major credit/debit cards, UPI, and net banking.
                  </p>
                  <div className="flex justify-center space-x-4 mb-4">
                    <div className="w-8 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center">VISA</div>
                    <div className="w-8 h-6 bg-red-500 rounded text-white text-xs flex items-center justify-center">MC</div>
                    <div className="w-8 h-6 bg-green-600 rounded text-white text-xs flex items-center justify-center">UPI</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">What's Included:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Doctor consultation ({appointmentData.type})</li>
                      <li>• Digital prescription</li>
                      <li>• Follow-up support</li>
                      <li>• Secure medical records</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                  >
                    {loading ? 'Processing...' : `Pay ₹${appointmentData.amount} Now`}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By proceeding, you agree to our terms and conditions. 
                    Your payment information is encrypted and secure.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />

      {/* Load Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
}