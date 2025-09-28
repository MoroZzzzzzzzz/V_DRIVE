import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  CreditCard, 
  Car, 
  Calculator,
  CheckCircle,
  AlertCircle,
  Info,
  Banknote,
  Calendar,
  TrendingUp,
  ArrowLeft,
  StarIcon,
  PhoneIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const AdditionalServicesPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);
  const { toast } = useToast();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Get car data from URL params if available
  const carId = searchParams.get('carId');
  const carPrice = searchParams.get('price');
  const carBrand = searchParams.get('brand');
  const carModel = searchParams.get('model');

  const [selectedCar, setSelectedCar] = useState({
    id: carId,
    price: carPrice ? parseInt(carPrice) : 0,
    brand: carBrand || '',
    model: carModel || ''
  });

  const [insuranceQuote, setInsuranceQuote] = useState(null);
  const [loanApplication, setLoanApplication] = useState(null);
  const [leaseApplication, setLeaseApplication] = useState(null);
  const [loadingStates, setLoadingStates] = useState({ insurance: false, loan: false, lease: false });

  // Form states
  const [insuranceForm, setInsuranceForm] = useState({
    type: 'OSAGO',
    coverage: '',
    driverAge: '',
    drivingExperience: '',
    region: 'moscow'
  });

  const [loanForm, setLoanForm] = useState({
    loanAmount: selectedCar.price || 1000000,
    monthlyIncome: '',
    employmentStatus: 'employed',
    loanTermMonths: 60,
    downPayment: selectedCar.price ? Math.round(selectedCar.price * 0.2) : 200000
  });

  const [leaseForm, setLeaseForm] = useState({
    leaseTermMonths: 36,
    mileageLimit: 15000,
    maintenanceIncluded: true
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const getInsuranceQuote = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, insurance: true }));
      
      const response = await axios.post(`${backendUrl}/api/services/insurance/quote`, {
        car_id: selectedCar.id,
        insurance_type: insuranceForm.type,
        coverage_amount: parseInt(insuranceForm.coverage) || 300000,
        driver_age: parseInt(insuranceForm.driverAge),
        driving_experience: parseInt(insuranceForm.drivingExperience),
        region: insuranceForm.region
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      setInsuranceQuote(response.data);
      toast({
        title: "Расчет готов!",
        description: "Предложение по страхованию рассчитано"
      });
      
    } catch (error) {
      toast({
        title: "Ошибка расчета",
        description: error.response?.data?.detail || "Не удалось рассчитать стоимость страхования",
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, insurance: false }));
    }
  };

  const applyForLoan = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, loan: true }));
      
      const response = await axios.post(`${backendUrl}/api/services/loan/apply`, {
        car_id: selectedCar.id,
        loan_amount: parseInt(loanForm.loanAmount),
        monthly_income: parseInt(loanForm.monthlyIncome),
        employment_status: loanForm.employmentStatus,
        loan_term_months: parseInt(loanForm.loanTermMonths),
        down_payment: parseInt(loanForm.downPayment)
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      setLoanApplication(response.data);
      toast({
        title: "Заявка отправлена!",
        description: "Банк рассмотрит вашу заявку в течение 24 часов"
      });
      
    } catch (error) {
      toast({
        title: "Ошибка заявки",
        description: error.response?.data?.detail || "Не удалось отправить заявку на кредит",
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, loan: false }));
    }
  };

  const applyForLease = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, lease: true }));
      
      const response = await axios.post(`${backendUrl}/api/services/lease/apply`, {
        car_id: selectedCar.id,
        lease_term_months: parseInt(leaseForm.leaseTermMonths),
        mileage_limit: parseInt(leaseForm.mileageLimit),
        maintenance_included: leaseForm.maintenanceIncluded
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      setLeaseApplication(response.data);
      toast({
        title: "Заявка на лизинг отправлена!",
        description: "Лизинговая компания свяжется с вами в ближайшее время"
      });
      
    } catch (error) {
      toast({
        title: "Ошибка заявки",
        description: error.response?.data?.detail || "Не удалось отправить заявку на лизинг",
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, lease: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-gray-400 mt-4">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <ArrowLeft size={20} className="mr-2" />
              Назад
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <Shield size={28} className="text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Дополнительные услуги
              </h1>
              <p className="text-gray-400">
                Страхование, кредиты и лизинг для вашего автомобиля
              </p>
            </div>
          </div>

          {/* Selected Car Info */}
          {selectedCar.brand && (
            <Card className="bg-gray-800/50 border-gray-700 mt-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Car size={24} className="text-yellow-400" />
                  <div>
                    <h3 className="text-white font-medium">
                      {selectedCar.brand} {selectedCar.model}
                    </h3>
                    <p className="text-gray-400">
                      Стоимость: {selectedCar.price.toLocaleString()} ₽
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Service Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-gray-700">
            <CardContent className="p-6 text-center">
              <Shield size={32} className="text-blue-400 mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">Страхование</h3>
              <p className="text-gray-400 text-sm">
                ОСАГО, КАСКО и комплексная защита вашего автомобиля
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-gray-700">
            <CardContent className="p-6 text-center">
              <CreditCard size={32} className="text-green-400 mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">Автокредит</h3>
              <p className="text-gray-400 text-sm">
                Выгодные условия кредитования от ведущих банков
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-gray-700">
            <CardContent className="p-6 text-center">
              <Calendar size={32} className="text-purple-400 mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">Лизинг</h3>
              <p className="text-gray-400 text-sm">
                Лизинговые программы для физических и юридических лиц
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Services Tabs */}
        <Tabs defaultValue="insurance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="insurance" className="text-white data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
              <Shield size={16} className="mr-2" />
              Страхование
            </TabsTrigger>
            <TabsTrigger value="loan" className="text-white data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
              <CreditCard size={16} className="mr-2" />
              Автокредит
            </TabsTrigger>
            <TabsTrigger value="lease" className="text-white data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
              <Calendar size={16} className="mr-2" />
              Лизинг
            </TabsTrigger>
          </TabsList>

          {/* Insurance Tab */}
          <TabsContent value="insurance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield size={20} />
                    Расчет страхования
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Тип страхования</Label>
                    <Select 
                      value={insuranceForm.type} 
                      onValueChange={(value) => setInsuranceForm({...insuranceForm, type: value})}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OSAGO">ОСАГО</SelectItem>
                        <SelectItem value="KASKO">КАСКО</SelectItem>
                        <SelectItem value="FULL">Полное покрытие</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-300">Возраст водителя</Label>
                    <Input
                      type="number"
                      placeholder="25"
                      value={insuranceForm.driverAge}
                      onChange={(e) => setInsuranceForm({...insuranceForm, driverAge: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Стаж вождения (лет)</Label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={insuranceForm.drivingExperience}
                      onChange={(e) => setInsuranceForm({...insuranceForm, drivingExperience: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Регион</Label>
                    <Select 
                      value={insuranceForm.region} 
                      onValueChange={(value) => setInsuranceForm({...insuranceForm, region: value})}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="moscow">Москва</SelectItem>
                        <SelectItem value="spb">Санкт-Петербург</SelectItem>
                        <SelectItem value="regions">Регионы</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {insuranceForm.type !== 'OSAGO' && (
                    <div>
                      <Label className="text-gray-300">Страховая сумма</Label>
                      <Input
                        type="number"
                        placeholder="300000"
                        value={insuranceForm.coverage}
                        onChange={(e) => setInsuranceForm({...insuranceForm, coverage: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  )}

                  <Button 
                    onClick={getInsuranceQuote}
                    disabled={loadingStates.insurance}
                    className="w-full bg-yellow-600 text-black hover:bg-yellow-700"
                  >
                    <Calculator size={16} className="mr-2" />
                    {loadingStates.insurance ? 'Расчет...' : 'Рассчитать стоимость'}
                  </Button>
                </CardContent>
              </Card>

              {insuranceQuote && (
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Предложение по страхованию</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300">Тип</Label>
                        <p className="text-white font-medium">{insuranceQuote.insurance_type}</p>
                      </div>
                      <div>
                        <Label className="text-gray-300">Покрытие</Label>
                        <p className="text-white font-medium">
                          {insuranceQuote.coverage_amount?.toLocaleString()} ₽
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-300">В месяц</Label>
                        <p className="text-white font-bold text-lg text-yellow-400">
                          {insuranceQuote.monthly_premium?.toLocaleString()} ₽
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-300">В год</Label>
                        <p className="text-white font-medium">
                          {insuranceQuote.yearly_premium?.toLocaleString()} ₽
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
                      <p className="text-green-400 text-sm">
                        ✅ Предложение действительно до {new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <Button className="w-full bg-green-600 text-white hover:bg-green-700">
                      <PhoneIcon size={16} className="mr-2" />
                      Связаться с агентом
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Loan Tab */}
          <TabsContent value="loan">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard size={20} />
                    Заявка на автокредит
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Сумма кредита</Label>
                    <Input
                      type="number"
                      value={loanForm.loanAmount}
                      onChange={(e) => setLoanForm({...loanForm, loanAmount: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Первоначальный взнос</Label>
                    <Input
                      type="number"
                      value={loanForm.downPayment}
                      onChange={(e) => setLoanForm({...loanForm, downPayment: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Ежемесячный доход</Label>
                    <Input
                      type="number"
                      placeholder="80000"
                      value={loanForm.monthlyIncome}
                      onChange={(e) => setLoanForm({...loanForm, monthlyIncome: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Срок кредита (месяцев)</Label>
                    <Select 
                      value={loanForm.loanTermMonths.toString()} 
                      onValueChange={(value) => setLoanForm({...loanForm, loanTermMonths: parseInt(value)})}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12 месяцев</SelectItem>
                        <SelectItem value="24">24 месяца</SelectItem>
                        <SelectItem value="36">36 месяцев</SelectItem>
                        <SelectItem value="48">48 месяцев</SelectItem>
                        <SelectItem value="60">60 месяцев</SelectItem>
                        <SelectItem value="84">84 месяца</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-300">Статус занятости</Label>
                    <Select 
                      value={loanForm.employmentStatus} 
                      onValueChange={(value) => setLoanForm({...loanForm, employmentStatus: value})}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employed">Трудоустроен</SelectItem>
                        <SelectItem value="self-employed">ИП</SelectItem>
                        <SelectItem value="business-owner">Владелец бизнеса</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={applyForLoan}
                    disabled={loadingStates.loan || !loanForm.monthlyIncome}
                    className="w-full bg-yellow-600 text-black hover:bg-yellow-700"
                  >
                    <CreditCard size={16} className="mr-2" />
                    {loadingStates.loan ? 'Отправка...' : 'Подать заявку'}
                  </Button>
                </CardContent>
              </Card>

              {loanApplication && (
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Результат заявки</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={20} className="text-green-400" />
                        <span className="text-green-400 font-medium">Заявка одобрена!</span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Номер заявки: {loanApplication.application_id}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300">Одобренная сумма</Label>
                        <p className="text-white font-bold text-lg">
                          {loanApplication.approved_amount?.toLocaleString()} ₽
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-300">Процентная ставка</Label>
                        <p className="text-white font-bold text-lg text-yellow-400">
                          {loanApplication.interest_rate}%
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-300">Ежемесячный платеж</Label>
                        <p className="text-white font-medium">
                          {loanApplication.monthly_payment?.toLocaleString()} ₽
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-300">Срок</Label>
                        <p className="text-white font-medium">
                          {loanApplication.loan_term} мес.
                        </p>
                      </div>
                    </div>

                    <Button className="w-full bg-green-600 text-white hover:bg-green-700">
                      <PhoneIcon size={16} className="mr-2" />
                      Связаться с банком
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Lease Tab */}
          <TabsContent value="lease">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar size={20} />
                    Заявка на лизинг
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Срок лизинга (месяцев)</Label>
                    <Select 
                      value={leaseForm.leaseTermMonths.toString()} 
                      onValueChange={(value) => setLeaseForm({...leaseForm, leaseTermMonths: parseInt(value)})}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12 месяцев</SelectItem>
                        <SelectItem value="24">24 месяца</SelectItem>
                        <SelectItem value="36">36 месяцев</SelectItem>
                        <SelectItem value="48">48 месяцев</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-300">Лимит пробега (км/год)</Label>
                    <Select 
                      value={leaseForm.mileageLimit.toString()}
                      onValueChange={(value) => setLeaseForm({...leaseForm, mileageLimit: parseInt(value)})}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10000">10,000 км</SelectItem>
                        <SelectItem value="15000">15,000 км</SelectItem>
                        <SelectItem value="20000">20,000 км</SelectItem>
                        <SelectItem value="25000">25,000 км</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="maintenance"
                      checked={leaseForm.maintenanceIncluded}
                      onChange={(e) => setLeaseForm({...leaseForm, maintenanceIncluded: e.target.checked})}
                      className="rounded border-gray-600"
                    />
                    <Label htmlFor="maintenance" className="text-gray-300">
                      Включить техническое обслуживание
                    </Label>
                  </div>

                  <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      <Info size={14} className="inline mr-1" />
                      Лизинг позволяет пользоваться автомобилем с минимальными начальными вложениями
                    </p>
                  </div>

                  <Button 
                    onClick={applyForLease}
                    disabled={loadingStates.lease}
                    className="w-full bg-yellow-600 text-black hover:bg-yellow-700"
                  >
                    <Calendar size={16} className="mr-2" />
                    {loadingStates.lease ? 'Отправка...' : 'Подать заявку'}
                  </Button>
                </CardContent>
              </Card>

              {leaseApplication && (
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Предложение по лизингу</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={20} className="text-green-400" />
                        <span className="text-green-400 font-medium">Предварительное одобрение!</span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Номер заявки: {leaseApplication.application_id}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300">Ежемесячный платеж</Label>
                        <p className="text-white font-bold text-lg text-yellow-400">
                          {leaseApplication.monthly_payment?.toLocaleString()} ₽
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-300">Первоначальный взнос</Label>
                        <p className="text-white font-medium">
                          {leaseApplication.down_payment?.toLocaleString()} ₽
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-300">Срок лизинга</Label>
                        <p className="text-white font-medium">
                          {leaseApplication.lease_term} мес.
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-300">Лимит пробега</Label>
                        <p className="text-white font-medium">
                          {leaseApplication.mileage_limit?.toLocaleString()} км/год
                        </p>
                      </div>
                    </div>

                    {leaseApplication.maintenance_included && (
                      <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
                        <p className="text-green-400 text-sm">
                          ✅ Техническое обслуживание включено
                        </p>
                      </div>
                    )}

                    <Button className="w-full bg-green-600 text-white hover:bg-green-700">
                      <PhoneIcon size={16} className="mr-2" />
                      Связаться с менеджером
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Partners Section */}
        <Card className="bg-gray-900 border-gray-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Наши партнеры</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Shield size={24} className="text-blue-400" />
                </div>
                <p className="text-white font-medium">Росгосстрах</p>
                <p className="text-gray-400 text-sm">Страхование</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CreditCard size={24} className="text-green-400" />
                </div>
                <p className="text-white font-medium">Сбербанк</p>
                <p className="text-gray-400 text-sm">Автокредиты</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Calendar size={24} className="text-purple-400" />
                </div>
                <p className="text-white font-medium">Европлан</p>
                <p className="text-gray-400 text-sm">Лизинг</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <StarIcon size={24} className="text-yellow-400" />
                </div>
                <p className="text-white font-medium">ВТБ</p>
                <p className="text-gray-400 text-sm">Банковские услуги</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdditionalServicesPage;