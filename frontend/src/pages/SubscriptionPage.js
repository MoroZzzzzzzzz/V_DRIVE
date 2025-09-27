import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SubscriptionPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Check for payment status in URL params
  useEffect(() => {
    const paymentStatus = searchParams.get('payment_status');
    const paymentId = searchParams.get('payment_id');
    
    if (paymentStatus && paymentId) {
      checkPaymentStatus(paymentId, paymentStatus);
    }
  }, [searchParams]);

  useEffect(() => {
    loadSubscriptionPlans();
  }, []);

  const loadSubscriptionPlans = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/payments/plans`);
      setPlans(response.data.plans);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Ошибка загрузки тарифов');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (paymentId, status) => {
    try {
      if (status === 'success') {
        const response = await axios.get(`${BACKEND_URL}/api/payments/${paymentId}/status`);
        
        if (response.data.status === 'succeeded') {
          toast.success('Подписка успешно активирована!');
        } else {
          toast.error('Платеж в обработке. Подписка будет активирована после подтверждения.');
        }
      } else if (status === 'canceled') {
        toast.error('Платеж был отменен');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const handleSubscribe = async (planId) => {
    if (!isAuthenticated) {
      toast.error('Войдите в систему для оформления подписки');
      return;
    }

    setProcessingPayment(true);
    setSelectedPlan(planId);

    try {
      const returnUrl = `${window.location.origin}/subscription?payment_status=success&payment_id=`;
      
      const response = await axios.post(
        `${BACKEND_URL}/api/payments/subscription/${planId}`,
        {
          user_email: user.email,
          return_url: returnUrl
        }
      );

      // Redirect to YooKassa payment page
      if (response.data.confirmation_url) {
        window.location.href = response.data.confirmation_url;
      } else {
        toast.error('Ошибка при создании платежа');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Ошибка при оформлении подписки');
    } finally {
      setProcessingPayment(false);
      setSelectedPlan(null);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'premium': return 'fas fa-star';
      case 'business': return 'fas fa-briefcase';
      case 'enterprise': return 'fas fa-building';
      default: return 'fas fa-gem';
    }
  };

  const getPlanColor = (planId) => {
    switch (planId) {
      case 'premium': return 'from-blue-600 to-blue-800';
      case 'business': return 'from-gold to-yellow-600';
      case 'enterprise': return 'from-purple-600 to-purple-800';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка тарифных планов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-black">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <Badge className="bg-gold text-black text-sm font-semibold px-4 py-2 mb-6">
              <i className="fas fa-crown mr-2"></i>
              ПРЕМИУМ ПОДПИСКИ
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Выберите свой <span className="gold-gradient">тариф</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Расширьте возможности своего автобизнеса с премиум функциями VELES DRIVE
            </p>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          {Object.keys(plans).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(plans).map(([planId, plan]) => (
                <Card 
                  key={planId} 
                  className={`relative glass-card p-0 overflow-hidden hover-glow ${
                    planId === 'business' ? 'border-2 border-gold' : ''
                  }`}
                >
                  {/* Most Popular Badge */}
                  {planId === 'business' && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-gold text-black font-semibold">
                        Популярный
                      </Badge>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className={`bg-gradient-to-r ${getPlanColor(planId)} p-6 text-center`}>
                    <div className="text-4xl text-white mb-3">
                      <i className={getPlanIcon(planId)}></i>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    <div className="text-3xl font-bold text-white mb-1">
                      {new Intl.NumberFormat('ru-RU').format(plan.price)} ₽
                    </div>
                    <p className="text-white/80">за {plan.duration_months} месяц</p>
                  </div>

                  {/* Plan Features */}
                  <div className="p-6">
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-300">
                          <i className="fas fa-check text-gold mr-3 flex-shrink-0"></i>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Subscribe Button */}
                    <Button
                      onClick={() => handleSubscribe(planId)}
                      disabled={processingPayment && selectedPlan === planId}
                      className={`w-full ${
                        planId === 'business' ? 'btn-gold' : 'btn-outline-gold'
                      }`}
                    >
                      {processingPayment && selectedPlan === planId ? (
                        <>
                          <div className="loading-spinner mr-2 w-4 h-4 border-2"></div>
                          Обработка...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-credit-card mr-2"></i>
                          Оформить подписку
                        </>
                      )}
                    </Button>

                    {/* Plan Description */}
                    <div className="mt-4 text-center">
                      <p className="text-gray-500 text-sm">
                        {planId === 'premium' && 'Идеально для начинающих дилеров'}
                        {planId === 'business' && 'Оптимально для растущего бизнеса'}
                        {planId === 'enterprise' && 'Для крупных автосалонов'}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <i className="fas fa-exclamation-triangle text-6xl text-gray-600 mb-4"></i>
              <h3 className="text-2xl font-bold text-white mb-2">Тарифы недоступны</h3>
              <p className="text-gray-400">Не удалось загрузить тарифные планы</p>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding bg-gradient-to-t from-gray-900 to-black">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-white">
              Преимущества <span className="gold-gradient">подписки</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Получите доступ к расширенным возможностям платформы
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="glass-card p-6 text-center">
              <div className="text-3xl text-gold mb-4">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Аналитика</h3>
              <p className="text-gray-400 text-sm">
                Подробная статистика продаж и эффективности
              </p>
            </Card>

            <Card className="glass-card p-6 text-center">
              <div className="text-3xl text-gold mb-4">
                <i className="fas fa-bolt"></i>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Приоритет</h3>
              <p className="text-gray-400 text-sm">
                Ваши объявления показываются первыми
              </p>
            </Card>

            <Card className="glass-card p-6 text-center">
              <div className="text-3xl text-gold mb-4">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Поддержка</h3>
              <p className="text-gray-400 text-sm">
                Персональный менеджер и приоритетная поддержка
              </p>
            </Card>

            <Card className="glass-card p-6 text-center">
              <div className="text-3xl text-gold mb-4">
                <i className="fas fa-cogs"></i>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">API</h3>
              <p className="text-gray-400 text-sm">
                Интеграция с вашими системами через API
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-black">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Часто задаваемые <span className="gold-gradient">вопросы</span>
            </h2>
          </div>

          <div className="space-y-6">
            <Card className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-3">
                <i className="fas fa-question-circle text-gold mr-2"></i>
                Как отменить подписку?
              </h3>
              <p className="text-gray-400">
                Вы можете отменить подписку в любое время в личном кабинете. 
                Доступ к премиум функциям сохранится до конца оплаченного периода.
              </p>
            </Card>

            <Card className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-3">
                <i className="fas fa-question-circle text-gold mr-2"></i>
                Какие способы оплаты доступны?
              </h3>
              <p className="text-gray-400">
                Мы принимаем карты всех российских банков, электронные кошельки, 
                SberPay и другие популярные способы оплаты через ЮКасса.
              </p>
            </Card>

            <Card className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-3">
                <i className="fas fa-question-circle text-gold mr-2"></i>
                Можно ли изменить тариф?
              </h3>
              <p className="text-gray-400">
                Да, вы можете повысить или понизить тариф в любое время. 
                При повышении доплачивается разница, при понижении средства зачисляются на следующий период.
              </p>
            </Card>

            <Card className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-3">
                <i className="fas fa-question-circle text-gold mr-2"></i>
                Есть ли скидки при годовой оплате?
              </h3>
              <p className="text-gray-400">
                При оплате на 12 месяцев вперед предоставляется скидка 20%. 
                Свяжитесь с нашим менеджером для оформления годовой подписки.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubscriptionPage;