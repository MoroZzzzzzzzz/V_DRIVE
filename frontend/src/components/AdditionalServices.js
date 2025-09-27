import React, { useState, useContext } from 'react';
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
  TrendingUp
} from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import axios from 'axios';

const AdditionalServices = ({ car }) => {
  const [insuranceQuote, setInsuranceQuote] = useState(null);
  const [loanApplication, setLoanApplication] = useState(null);
  const [leaseApplication, setLeaseApplication] = useState(null);
  const [loading, setLoading] = useState({ insurance: false, loan: false, lease: false });
  
  const { user, token } = useContext(AuthContext);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Insurance form data
  const [insuranceForm, setInsuranceForm] = useState({
    type: 'OSAGO',
    coverage: ''
  });

  // Loan form data
  const [loanForm, setLoanForm] = useState({
    loanAmount: car?.price || 0,
    monthlyIncome: '',
    employmentStatus: 'employed',
    loanTermMonths: 60
  });

  // Lease form data
  const [leaseForm, setLeaseForm] = useState({
    leaseTermMonths: 36
  });

  const getInsuranceQuote = async () => {
    if (!user || !car) return;

    try {
      setLoading(prev => ({ ...prev, insurance: true }));
      
      const formData = new FormData();
      formData.append('car_id', car.id);
      formData.append('insurance_type', insuranceForm.type);
      if (insuranceForm.coverage) {
        formData.append('coverage_amount', insuranceForm.coverage);
      }

      const response = await axios.post(`${backendUrl}/api/services/insurance/quote`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setInsuranceQuote(response.data);
    } catch (error) {
      console.error('Error getting insurance quote:', error);
    } finally {
      setLoading(prev => ({ ...prev, insurance: false }));
    }
  };

  const applyForLoan = async () => {
    if (!user || !car) return;

    try {
      setLoading(prev => ({ ...prev, loan: true }));
      
      const loanData = {
        car_id: car.id,
        loan_amount: parseFloat(loanForm.loanAmount),
        monthly_income: parseFloat(loanForm.monthlyIncome),
        employment_status: loanForm.employmentStatus,
        loan_term_months: parseInt(loanForm.loanTermMonths)
      };

      const response = await axios.post(`${backendUrl}/api/services/loans/apply`, loanData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLoanApplication(response.data);
    } catch (error) {
      console.error('Error applying for loan:', error);
    } finally {
      setLoading(prev => ({ ...prev, loan: false }));
    }
  };

  const applyForLease = async () => {
    if (!user || !car) return;

    try {
      setLoading(prev => ({ ...prev, lease: true }));
      
      const leaseData = {
        car_id: car.id,
        lease_term_months: parseInt(leaseForm.leaseTermMonths)
      };

      const response = await axios.post(`${backendUrl}/api/services/leasing/apply`, leaseData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLeaseApplication(response.data);
    } catch (error) {
      console.error('Error applying for lease:', error);
    } finally {
      setLoading(prev => ({ ...prev, lease: false }));
    }
  };

  if (!user) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="text-center py-8">
          <p className="text-gray-400">Войдите в систему для доступа к дополнительным услугам</p>
        </CardContent>
      </Card>
    );
  }

  if (!car) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="text-center py-8">
          <p className="text-gray-400">Выберите автомобиль для расчета услуг</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Дополнительные услуги</h2>
        <p className="text-gray-400">Страхование, кредит и лизинг для {car.brand} {car.model}</p>
      </div>

      <Tabs defaultValue="insurance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="insurance" className="flex items-center gap-2">
            <Shield size={16} />
            Страхование
          </TabsTrigger>
          <TabsTrigger value="loan" className="flex items-center gap-2">
            <CreditCard size={16} />
            Кредит
          </TabsTrigger>
          <TabsTrigger value="lease" className="flex items-center gap-2">
            <Car size={16} />
            Лизинг
          </TabsTrigger>
        </TabsList>

        {/* Insurance */}
        <TabsContent value="insurance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield size={20} />
                  Страхование автомобиля
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
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="OSAGO">ОСАГО</SelectItem>
                      <SelectItem value="KASKO">КАСКО</SelectItem>
                      <SelectItem value="FULL">Полное покрытие</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {insuranceForm.type !== 'OSAGO' && (
                  <div>
                    <Label className="text-gray-300">Сумма покрытия</Label>
                    <Input
                      type="number"
                      placeholder="Введите сумму"
                      value={insuranceForm.coverage}
                      onChange={(e) => setInsuranceForm({...insuranceForm, coverage: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Info size={14} />
                    {insuranceForm.type === 'OSAGO' && "Обязательное страхование гражданской ответственности"}
                    {insuranceForm.type === 'KASKO' && "Добровольное страхование от ущерба и угона"}
                    {insuranceForm.type === 'FULL' && "Максимальная защита автомобиля"}
                  </div>
                </div>

                <Button 
                  onClick={getInsuranceQuote}
                  disabled={loading.insurance}
                  className="w-full bg-yellow-600 text-black hover:bg-yellow-700"
                >
                  <Calculator size={16} className="mr-2" />
                  {loading.insurance ? 'Расчет...' : 'Рассчитать стоимость'}
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
                      <Label className="text-gray-300">Тип страхования</Label>
                      <p className="text-white font-medium">{insuranceQuote.insurance_type}</p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Покрытие</Label>
                      <p className="text-white font-medium">
                        {insuranceQuote.coverage_amount.toLocaleString()} ₽
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Ежемесячно</Label>
                      <p className="text-white font-bold text-lg">
                        {insuranceQuote.monthly_premium.toLocaleString()} ₽
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-300">В год</Label>
                      <p className="text-white font-medium">
                        {insuranceQuote.yearly_premium.toLocaleString()} ₽
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
                    <p className="text-green-400 text-sm">
                      Предложение действительно до {new Date(insuranceQuote.valid_until).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <Button className="w-full bg-green-600 text-white hover:bg-green-700">
                    Оформить страховку
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Loan */}
        <TabsContent value="loan">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard size={20} />
                  Автокредит
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
                  <Label className="text-gray-300">Ежемесячный доход</Label>
                  <Input
                    type="number"
                    placeholder="Введите ваш доход"
                    value={loanForm.monthlyIncome}
                    onChange={(e) => setLoanForm({...loanForm, monthlyIncome: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Трудоустройство</Label>
                  <Select 
                    value={loanForm.employmentStatus} 
                    onValueChange={(value) => setLoanForm({...loanForm, employmentStatus: value})}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="employed">Трудоустроен</SelectItem>
                      <SelectItem value="self_employed">ИП</SelectItem>
                      <SelectItem value="unemployed">Безработный</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-300">Срок кредита (месяцы)</Label>
                  <Select 
                    value={loanForm.loanTermMonths.toString()} 
                    onValueChange={(value) => setLoanForm({...loanForm, loanTermMonths: parseInt(value)})}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="36">3 года</SelectItem>
                      <SelectItem value="48">4 года</SelectItem>
                      <SelectItem value="60">5 лет</SelectItem>
                      <SelectItem value="84">7 лет</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={applyForLoan}
                  disabled={loading.loan || !loanForm.monthlyIncome}
                  className="w-full bg-yellow-600 text-black hover:bg-yellow-700"
                >
                  <Banknote size={16} className="mr-2" />
                  {loading.loan ? 'Обработка...' : 'Подать заявку'}
                </Button>
              </CardContent>
            </Card>

            {loanApplication && (
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    {loanApplication.status === 'approved' ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <AlertCircle className="text-yellow-500" size={20} />
                    )}
                    Результат заявки на кредит
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Badge 
                    variant={loanApplication.status === 'approved' ? 'default' : 'secondary'}
                    className="text-lg p-2"
                  >
                    {loanApplication.status === 'approved' ? 'Одобрено' : 'На рассмотрении'}
                  </Badge>

                  {loanApplication.status === 'approved' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300">Процентная ставка</Label>
                        <p className="text-white font-bold text-lg">
                          {loanApplication.interest_rate}% годовых
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-300">Ежемесячный платеж</Label>
                        <p className="text-white font-bold text-lg">
                          {loanApplication.monthly_payment?.toLocaleString()} ₽
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      Партнер: {loanApplication.bank_partner}
                    </p>
                  </div>
                  
                  {loanApplication.status === 'approved' && (
                    <Button className="w-full bg-green-600 text-white hover:bg-green-700">
                      Подписать договор
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Lease */}
        <TabsContent value="lease">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Car size={20} />
                  Лизинг автомобиля
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Срок лизинга (месяцы)</Label>
                  <Select 
                    value={leaseForm.leaseTermMonths.toString()} 
                    onValueChange={(value) => setLeaseForm({...leaseForm, leaseTermMonths: parseInt(value)})}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="24">2 года</SelectItem>
                      <SelectItem value="36">3 года</SelectItem>
                      <SelectItem value="48">4 года</SelectItem>
                      <SelectItem value="60">5 лет</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Info size={14} />
                    Лизинг позволяет пользоваться автомобилем с правом выкупа
                  </div>
                  <div>• Первоначальный взнос: 20%</div>
                  <div>• Остаточная стоимость: 40%</div>
                  <div>• Возможность досрочного выкупа</div>
                </div>

                <Button 
                  onClick={applyForLease}
                  disabled={loading.lease}
                  className="w-full bg-yellow-600 text-black hover:bg-yellow-700"
                >
                  <TrendingUp size={16} className="mr-2" />
                  {loading.lease ? 'Обработка...' : 'Рассчитать лизинг'}
                </Button>
              </CardContent>
            </Card>

            {leaseApplication && (
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Предложение по лизингу</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Badge variant="default" className="text-lg p-2">
                    Одобрено
                  </Badge>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Первоначальный взнос</Label>
                      <p className="text-white font-bold text-lg">
                        {leaseApplication.down_payment?.toLocaleString()} ₽
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Ежемесячный платеж</Label>
                      <p className="text-white font-bold text-lg">
                        {leaseApplication.monthly_payment?.toLocaleString()} ₽
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Остаточная стоимость</Label>
                      <p className="text-white font-medium">
                        {leaseApplication.residual_value?.toLocaleString()} ₽
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-300">Срок</Label>
                      <p className="text-white font-medium">
                        {leaseApplication.lease_term_months} месяцев
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      Партнер: {leaseApplication.leasing_company}
                    </p>
                  </div>
                  
                  <Button className="w-full bg-green-600 text-white hover:bg-green-700">
                    Оформить лизинг
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdditionalServices;