import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  DollarSign,
  Users,
  Car,
  Target,
  PieChart,
  LineChart,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdvancedReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('sales');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock analytics data
  const mockSalesData = {
    period: 'month',
    total_revenue: 25600000,
    total_sales: 12,
    average_sale: 2133333,
    growth_rate: 15.3,
    top_models: [
      { name: 'BMW X5', sales: 3, revenue: 18600000 },
      { name: 'Mercedes-Benz E-Class', revenue: 4800000, sales: 2 },
      { name: 'Audi A6', revenue: 2200000, sales: 1 }
    ],
    sales_by_date: [
      { date: '2024-01-01', amount: 8500000, count: 1 },
      { date: '2024-01-05', amount: 6200000, count: 1 },
      { date: '2024-01-10', amount: 9600000, count: 2 },
      { date: '2024-01-15', amount: 1300000, count: 1 }
    ],
    conversion_funnel: {
      leads: 45,
      test_drives: 23,
      negotiations: 15,
      sales: 12
    }
  };

  const mockClientData = {
    total_clients: 127,
    new_clients: 23,
    active_clients: 89,
    retention_rate: 78.5,
    avg_purchase_value: 2133333,
    client_sources: [
      { source: 'Website', count: 45, percentage: 35.4 },
      { source: 'Telegram', count: 32, percentage: 25.2 },
      { source: 'Referral', count: 28, percentage: 22.0 },
      { source: 'Advertisement', count: 22, percentage: 17.3 }
    ],
    client_segments: [
      { segment: 'Premium', count: 23, avg_purchase: 8500000 },
      { segment: 'Business', count: 67, avg_purchase: 3200000 },
      { segment: 'Economy', count: 37, avg_purchase: 1200000 }
    ]
  };

  const mockInventoryData = {
    total_cars: 156,
    available_cars: 134,
    sold_cars: 22,
    avg_days_on_lot: 28,
    turnover_rate: 0.14,
    inventory_value: 495600000,
    by_brand: [
      { brand: 'BMW', count: 34, value: 125400000 },
      { brand: 'Mercedes-Benz', count: 28, value: 98700000 },
      { brand: 'Audi', count: 23, value: 76800000 },
      { brand: 'Toyota', count: 45, value: 89200000 },
      { brand: 'Lexus', count: 26, value: 105500000 }
    ],
    by_status: [
      { status: 'Available', count: 134, percentage: 85.9 },
      { status: 'Reserved', count: 12, percentage: 7.7 },
      { status: 'Sold', count: 10, percentage: 6.4 }
    ]
  };

  const mockFinancialData = {
    total_revenue: 65400000,
    total_costs: 48200000,
    gross_profit: 17200000,
    profit_margin: 26.3,
    expenses: [
      { category: 'Закупка авто', amount: 42000000, percentage: 64.2 },
      { category: 'Зарплата', amount: 8900000, percentage: 13.6 },
      { category: 'Аренда', amount: 3200000, percentage: 4.9 },
      { category: 'Реклама', amount: 2100000, percentage: 3.2 },
      { category: 'Прочие', amount: 2800000, percentage: 4.3 }
    ],
    monthly_profit: [
      { month: 'Янв', profit: 2100000 },
      { month: 'Фев', profit: 2800000 },
      { month: 'Мар', profit: 3200000 },
      { month: 'Апр', profit: 2900000 }
    ]
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const formatPercentage = (value) => {
    return value.toFixed(1) + '%';
  };

  const exportReport = async (reportType) => {
    try {
      setLoading(true);
      // Mock export functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Успешно",
        description: `Отчет "${reportType}" экспортирован в Excel`
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось экспортировать отчет",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSalesReport = () => (
    <div className="space-y-6">
      {/* Sales Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Общий доход</p>
                <p className="text-2xl font-bold text-white">{formatPrice(mockSalesData.total_revenue)}</p>
                <p className="text-green-400 text-sm">+{formatPercentage(mockSalesData.growth_rate)}</p>
              </div>
              <DollarSign className="text-green-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Количество продаж</p>
                <p className="text-2xl font-bold text-white">{mockSalesData.total_sales}</p>
                <p className="text-blue-400 text-sm">За {selectedPeriod === 'month' ? 'месяц' : 'период'}</p>
              </div>
              <Car className="text-blue-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Средняя сделка</p>
                <p className="text-2xl font-bold text-white">{formatPrice(mockSalesData.average_sale)}</p>
                <p className="text-yellow-400 text-sm">Средний чек</p>
              </div>
              <Target className="text-yellow-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Рост</p>
                <p className="text-2xl font-bold text-white">+{formatPercentage(mockSalesData.growth_rate)}</p>
                <p className="text-green-400 text-sm">К прошлому периоду</p>
              </div>
              <TrendingUp className="text-green-400" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Models */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Топ модели по продажам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockSalesData.top_models.map((model, index) => (
              <div key={model.name} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-600 text-black rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{model.name}</p>
                    <p className="text-gray-400 text-sm">{model.sales} продаж</p>
                  </div>
                </div>
                <p className="text-yellow-400 font-bold">{formatPrice(model.revenue)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Воронка продаж</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Лиды</span>
              <div className="flex items-center gap-3">
                <div className="w-64 bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-full"></div>
                </div>
                <span className="text-white font-medium w-12">{mockSalesData.conversion_funnel.leads}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Тест-драйвы</span>
              <div className="flex items-center gap-3">
                <div className="w-64 bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: `${(mockSalesData.conversion_funnel.test_drives / mockSalesData.conversion_funnel.leads) * 100}%`}}></div>
                </div>
                <span className="text-white font-medium w-12">{mockSalesData.conversion_funnel.test_drives}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Переговоры</span>
              <div className="flex items-center gap-3">
                <div className="w-64 bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{width: `${(mockSalesData.conversion_funnel.negotiations / mockSalesData.conversion_funnel.leads) * 100}%`}}></div>
                </div>
                <span className="text-white font-medium w-12">{mockSalesData.conversion_funnel.negotiations}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Продажи</span>
              <div className="flex items-center gap-3">
                <div className="w-64 bg-gray-700 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{width: `${(mockSalesData.conversion_funnel.sales / mockSalesData.conversion_funnel.leads) * 100}%`}}></div>
                </div>
                <span className="text-white font-medium w-12">{mockSalesData.conversion_funnel.sales}</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-gray-300 text-sm">
                Конверсия: <span className="text-yellow-400 font-bold">
                  {formatPercentage((mockSalesData.conversion_funnel.sales / mockSalesData.conversion_funnel.leads) * 100)}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderClientReport = () => (
    <div className="space-y-6">
      {/* Client Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Всего клиентов</p>
                <p className="text-2xl font-bold text-white">{mockClientData.total_clients}</p>
                <p className="text-blue-400 text-sm">+{mockClientData.new_clients} новых</p>
              </div>
              <Users className="text-blue-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Активные</p>
                <p className="text-2xl font-bold text-white">{mockClientData.active_clients}</p>
                <p className="text-green-400 text-sm">{formatPercentage((mockClientData.active_clients / mockClientData.total_clients) * 100)}</p>
              </div>
              <Target className="text-green-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Удержание</p>
                <p className="text-2xl font-bold text-white">{formatPercentage(mockClientData.retention_rate)}</p>
                <p className="text-yellow-400 text-sm">Retention rate</p>
              </div>
              <TrendingUp className="text-yellow-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ср. покупка</p>
                <p className="text-2xl font-bold text-white">{formatPrice(mockClientData.avg_purchase_value)}</p>
                <p className="text-purple-400 text-sm">LTV</p>
              </div>
              <DollarSign className="text-purple-400" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Sources */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Источники клиентов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockClientData.client_sources.map((source) => (
              <div key={source.source} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                  <span className="text-white">{source.source}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">{source.count} клиентов</span>
                  <Badge className="bg-blue-600 text-white">{formatPercentage(source.percentage)}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Client Segments */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Сегменты клиентов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockClientData.client_segments.map((segment) => (
              <div key={segment.segment} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-white font-medium">{segment.segment}</p>
                  <p className="text-gray-400 text-sm">{segment.count} клиентов</p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-bold">{formatPrice(segment.avg_purchase)}</p>
                  <p className="text-gray-400 text-sm">Средняя покупка</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInventoryReport = () => (
    <div className="space-y-6">
      {/* Inventory Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Всего авто</p>
                <p className="text-2xl font-bold text-white">{mockInventoryData.total_cars}</p>
                <p className="text-blue-400 text-sm">В наличии: {mockInventoryData.available_cars}</p>
              </div>
              <Car className="text-blue-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Продано</p>
                <p className="text-2xl font-bold text-white">{mockInventoryData.sold_cars}</p>
                <p className="text-green-400 text-sm">За период</p>
              </div>
              <TrendingUp className="text-green-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Дней на площадке</p>
                <p className="text-2xl font-bold text-white">{mockInventoryData.avg_days_on_lot}</p>
                <p className="text-yellow-400 text-sm">В среднем</p>
              </div>
              <Calendar className="text-yellow-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Стоимость склада</p>
                <p className="text-2xl font-bold text-white">{formatPrice(mockInventoryData.inventory_value)}</p>
                <p className="text-purple-400 text-sm">Общая стоимость</p>
              </div>
              <DollarSign className="text-purple-400" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* By Brand */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Склад по брендам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockInventoryData.by_brand.map((brand) => (
              <div key={brand.brand} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-white font-medium">{brand.brand}</p>
                  <p className="text-gray-400 text-sm">{brand.count} автомобилей</p>
                </div>
                <p className="text-yellow-400 font-bold">{formatPrice(brand.value)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* By Status */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Статус автомобилей</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockInventoryData.by_status.map((status) => (
              <div key={status.status} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${
                    status.status === 'Available' ? 'bg-green-600' :
                    status.status === 'Reserved' ? 'bg-yellow-600' : 'bg-red-600'
                  }`}></div>
                  <span className="text-white">{status.status}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">{status.count} авто</span>
                  <Badge className={
                    status.status === 'Available' ? 'bg-green-600 text-white' :
                    status.status === 'Reserved' ? 'bg-yellow-600 text-black' : 'bg-red-600 text-white'
                  }>
                    {formatPercentage(status.percentage)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFinancialReport = () => (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Выручка</p>
                <p className="text-2xl font-bold text-white">{formatPrice(mockFinancialData.total_revenue)}</p>
                <p className="text-green-400 text-sm">Общая выручка</p>
              </div>
              <DollarSign className="text-green-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Расходы</p>
                <p className="text-2xl font-bold text-white">{formatPrice(mockFinancialData.total_costs)}</p>
                <p className="text-red-400 text-sm">Общие расходы</p>
              </div>
              <TrendingUp className="text-red-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Прибыль</p>
                <p className="text-2xl font-bold text-white">{formatPrice(mockFinancialData.gross_profit)}</p>
                <p className="text-blue-400 text-sm">Валовая прибыль</p>
              </div>
              <Target className="text-blue-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Маржинальность</p>
                <p className="text-2xl font-bold text-white">{formatPercentage(mockFinancialData.profit_margin)}</p>
                <p className="text-yellow-400 text-sm">Profit margin</p>
              </div>
              <PieChart className="text-yellow-400" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Breakdown */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Структура расходов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockFinancialData.expenses.map((expense) => (
              <div key={expense.category} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-white font-medium">{expense.category}</p>
                  <div className="w-64 bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full" 
                      style={{width: `${expense.percentage}%`}}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{formatPrice(expense.amount)}</p>
                  <p className="text-gray-400 text-sm">{formatPercentage(expense.percentage)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Расширенные отчеты</h2>
          <p className="text-gray-400">Детальная аналитика вашего бизнеса</p>
        </div>

        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
              <Calendar size={16} className="mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Эта неделя</SelectItem>
              <SelectItem value="month">Этот месяц</SelectItem>
              <SelectItem value="quarter">Квартал</SelectItem>
              <SelectItem value="year">Год</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={() => exportReport(selectedReport)}
            disabled={loading}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <Download size={16} className="mr-2" />
            {loading ? 'Экспорт...' : 'Экспорт'}
          </Button>

          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-gray-600 text-gray-300"
          >
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'sales', label: 'Продажи', icon: BarChart3 },
          { id: 'clients', label: 'Клиенты', icon: Users },
          { id: 'inventory', label: 'Склад', icon: Car },
          { id: 'financial', label: 'Финансы', icon: DollarSign }
        ].map((report) => (
          <Button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            variant={selectedReport === report.id ? "default" : "outline"}
            className={selectedReport === report.id 
              ? "bg-yellow-600 text-black" 
              : "border-gray-600 text-gray-300 hover:bg-gray-800"
            }
          >
            <report.icon size={16} className="mr-2" />
            {report.label}
          </Button>
        ))}
      </div>

      {/* Report Content */}
      <div className="min-h-96">
        {selectedReport === 'sales' && renderSalesReport()}
        {selectedReport === 'clients' && renderClientReport()}
        {selectedReport === 'inventory' && renderInventoryReport()}
        {selectedReport === 'financial' && renderFinancialReport()}
      </div>
    </div>
  );
};

export default AdvancedReports;