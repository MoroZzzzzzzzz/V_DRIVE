import React, { useState, useContext, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  ShieldCheck, 
  ShieldX,
  Key, 
  QrCode,
  Copy,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  History,
  Lock
} from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const SecuritySettings = () => {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showSetup2FA, setShowSetup2FA] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [password, setPassword] = useState('');
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState({ setup: false, verify: false, disable: false });
  
  const { user, token } = useContext(AuthContext);
  const { toast } = useToast();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (user) {
      setTwoFAEnabled(user.two_fa_enabled || false);
      loadAuditLog();
    }
  }, [user]);

  const loadAuditLog = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/security/audit-log?days=7`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuditLog(response.data.activities || []);
    } catch (error) {
      console.error('Error loading audit log:', error);
    }
  };

  const setup2FA = async () => {
    try {
      setLoading(prev => ({ ...prev, setup: true }));
      
      const response = await axios.get(`${backendUrl}/api/security/2fa/setup`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSetupData(response.data);
      setShowSetup2FA(true);
      
      toast({
        title: "2FA настройка",
        description: "Отсканируйте QR-код приложением аутентификатора"
      });
      
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.detail || "Не удалось настроить 2FA",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, setup: false }));
    }
  };

  const verify2FA = async () => {
    try {
      setLoading(prev => ({ ...prev, verify: true }));
      
      const formData = new FormData();
      formData.append('token', verificationCode);
      
      const response = await axios.post(`${backendUrl}/api/security/2fa/verify-setup`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBackupCodes(response.data.backup_codes);
      setTwoFAEnabled(true);
      setShowSetup2FA(false);
      setShowBackupCodes(true);
      setVerificationCode('');
      
      toast({
        title: "2FA включена!",
        description: "Сохраните резервные коды в безопасном месте"
      });
      
    } catch (error) {
      toast({
        title: "Ошибка верификации",
        description: error.response?.data?.detail || "Неверный код",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, verify: false }));
    }
  };

  const disable2FA = async () => {
    try {
      setLoading(prev => ({ ...prev, disable: true }));
      
      const formData = new FormData();
      formData.append('password', password);
      formData.append('token_or_backup', verificationCode);
      
      await axios.post(`${backendUrl}/api/security/2fa/disable`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTwoFAEnabled(false);
      setPassword('');
      setVerificationCode('');
      
      toast({
        title: "2FA отключена",
        description: "Двухфакторная аутентификация деактивирована"
      });
      
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.detail || "Не удалось отключить 2FA",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, disable: false }));
    }
  };

  const regenerateBackupCodes = async () => {
    try {
      const formData = new FormData();
      formData.append('password', password);
      
      const response = await axios.post(`${backendUrl}/api/security/2fa/regenerate-backup-codes`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBackupCodes(response.data.backup_codes);
      setShowBackupCodes(true);
      setPassword('');
      
      toast({
        title: "Коды обновлены",
        description: "Новые резервные коды сгенерированы"
      });
      
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.detail || "Не удалось обновить коды",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: "Текст скопирован в буфер обмена"
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="text-center py-8">
          <p className="text-gray-400">Войдите для доступа к настройкам безопасности</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield size={20} />
            Двухфакторная аутентификация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {twoFAEnabled ? (
                  <>
                    <ShieldCheck className="text-green-500" size={16} />
                    <span className="text-white font-medium">2FA включена</span>
                    <Badge className="bg-green-900 text-green-300">Активна</Badge>
                  </>
                ) : (
                  <>
                    <ShieldX className="text-red-500" size={16} />
                    <span className="text-white font-medium">2FA отключена</span>
                    <Badge variant="secondary">Неактивна</Badge>
                  </>
                )}
              </div>
              <p className="text-gray-400 text-sm">
                {twoFAEnabled 
                  ? "Ваш аккаунт защищен двухфакторной аутентификацией"
                  : "Добавьте дополнительный уровень защиты для аккаунта"
                }
              </p>
            </div>
            
            {!twoFAEnabled ? (
              <Button
                onClick={setup2FA}
                disabled={loading.setup}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                {loading.setup ? (
                  <>
                    <RefreshCw className="animate-spin mr-2" size={16} />
                    Настройка...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2" size={16} />
                    Включить 2FA
                  </>
                )}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                      <RefreshCw size={16} className="mr-2" />
                      Новые коды
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Генерация новых резервных кодов</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded">
                        <p className="text-yellow-300 text-sm">
                          ⚠️ Старые резервные коды будут отключены
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-300">Подтвердите пароль</Label>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <Button 
                        onClick={regenerateBackupCodes}
                        disabled={!password}
                        className="w-full bg-yellow-600 text-black hover:bg-yellow-700"
                      >
                        Сгенерировать новые коды
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <ShieldX size={16} className="mr-2" />
                      Отключить
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Отключить 2FA</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-4 bg-red-900/20 border border-red-700 rounded">
                        <p className="text-red-300 text-sm">
                          ⚠️ Это снизит безопасность вашего аккаунта
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-300">Пароль</Label>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">2FA код или резервный код</Label>
                        <Input
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="123456 или XXXX-XXXX"
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <Button 
                        onClick={disable2FA}
                        disabled={!password || !verificationCode || loading.disable}
                        variant="destructive"
                        className="w-full"
                      >
                        {loading.disable ? "Отключение..." : "Отключить 2FA"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Activity Log */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <History size={20} />
            Журнал безопасности
            <Badge variant="secondary" className="ml-auto">
              Последние 7 дней
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {auditLog.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Нет записей активности</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {auditLog.slice(0, 10).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                      {activity.action === 'login' && <CheckCircle size={16} className="text-green-500" />}
                      {activity.action === '2fa_enabled' && <Shield size={16} className="text-blue-500" />}
                      {activity.action === '2fa_disabled' && <ShieldX size={16} className="text-red-500" />}
                      {activity.action === 'backup_codes_regenerated' && <RefreshCw size={16} className="text-yellow-500" />}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        {activity.action === 'login' && 'Вход в систему'}
                        {activity.action === '2fa_enabled' && '2FA включена'}
                        {activity.action === '2fa_disabled' && '2FA отключена'}
                        {activity.action === 'backup_codes_regenerated' && 'Обновлены резервные коды'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {formatDate(activity.timestamp)}
                        {activity.ip_address && ` • ${activity.ip_address}`}
                      </p>
                    </div>
                  </div>
                  {activity.details?.method && (
                    <Badge variant="outline" className="text-xs">
                      {activity.details.method}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2FA Setup Dialog */}
      <Dialog open={showSetup2FA} onOpenChange={setShowSetup2FA}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Настройка 2FA</DialogTitle>
          </DialogHeader>
          
          {setupData && (
            <div className="space-y-6">
              {/* QR Code */}
              <div className="text-center space-y-3">
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img src={setupData.qr_code} alt="2FA QR Code" className="w-48 h-48" />
                </div>
                <p className="text-gray-400 text-sm">
                  Отсканируйте QR-код приложением Google Authenticator или Authy
                </p>
              </div>

              {/* Manual Entry */}
              <div className="space-y-2">
                <Label className="text-gray-300">Ключ для ручного ввода:</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={setupData.secret}
                    readOnly
                    className="bg-gray-800 border-gray-600 text-white font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(setupData.secret)}
                    className="border-gray-600"
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              {/* Verification */}
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Введите код из приложения:</Label>
                  <Input
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="bg-gray-800 border-gray-600 text-white text-center text-lg font-mono"
                  />
                </div>
                
                <Button
                  onClick={verify2FA}
                  disabled={verificationCode.length !== 6 || loading.verify}
                  className="w-full bg-green-600 text-white hover:bg-green-700"
                >
                  {loading.verify ? (
                    <>
                      <RefreshCw className="animate-spin mr-2" size={16} />
                      Проверка...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2" size={16} />
                      Подтвердить и включить 2FA
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Резервные коды</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded">
              <p className="text-yellow-300 text-sm font-medium mb-2">
                ⚠️ Важно! Сохраните эти коды в безопасном месте:
              </p>
              <ul className="text-yellow-300 text-xs space-y-1">
                <li>• Каждый код можно использовать только один раз</li>
                <li>• Используйте их если потеряли доступ к приложению</li>
                <li>• Никому не показывайте эти коды</li>
              </ul>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div key={index} className="bg-gray-800 p-3 rounded border border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-mono text-sm">{code}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(code)}
                      className="p-1 h-auto"
                    >
                      <Copy size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => copyToClipboard(backupCodes.join('\n'))}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300"
              >
                <Copy className="mr-2" size={16} />
                Копировать все
              </Button>
              <Button
                onClick={() => setShowBackupCodes(false)}
                className="flex-1 bg-green-600 text-white hover:bg-green-700"
              >
                Сохранил, продолжить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecuritySettings;