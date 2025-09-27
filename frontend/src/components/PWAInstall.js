import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  X, 
  Smartphone, 
  Monitor,
  Zap,
  Bell,
  WifiOff
} from 'lucide-react';

const PWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    setIsStandalone(
      window.navigator.standalone === true || 
      window.matchMedia('(display-mode: standalone)').matches
    );

    // Check if app is installed via PWA
    if ('getInstalledRelatedApps' in navigator) {
      navigator.getInstalledRelatedApps().then((relatedApps) => {
        if (relatedApps.length > 0) {
          setIsInstalled(true);
        }
      });
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show install prompt if user hasn't dismissed it
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed && !isStandalone && !isInstalled) {
        setShowInstallPrompt(true);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('VELES DRIVE PWA installed successfully');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New update available
                  if (confirm('Доступно обновление VELES DRIVE. Обновить сейчас?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              }
            });
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone, isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted');
        
        // Show welcome notification
        new Notification('VELES DRIVE', {
          body: 'Уведомления включены! Вы будете получать информацию о новых аукционах и предложениях.',
          icon: '/icon-192x192.png',
          badge: '/icon-96x96.png'
        });
      }
    }
  };

  // Don't show if already installed or in standalone mode
  if (isInstalled || isStandalone || !showInstallPrompt) {
    return null;
  }

  return (
    <Card className="fixed bottom-20 right-4 left-4 md:left-auto md:w-96 bg-gradient-to-r from-gray-900 to-black border-yellow-600 shadow-2xl z-40 animate-slide-in-up">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg flex items-center justify-center">
              <Download size={20} className="text-black" />
            </div>
            <div>
              <h4 className="text-white font-semibold">Установить VELES DRIVE</h4>
              <Badge className="bg-yellow-600 text-black text-xs">
                PWA приложение
              </Badge>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white p-1"
          >
            <X size={16} />
          </Button>
        </div>

        <div className="space-y-3 mb-4">
          <p className="text-gray-300 text-sm">
            Установите приложение для лучшего опыта использования
          </p>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1 text-gray-400">
              <WifiOff size={12} />
              Офлайн режим
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Zap size={12} />
              Быстрый запуск
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <Bell size={12} />
              Push-уведомления
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleInstallClick}
            className="flex-1 bg-yellow-600 text-black hover:bg-yellow-700"
            disabled={!deferredPrompt}
          >
            <Download size={16} className="mr-2" />
            Установить
          </Button>
          
          <Button
            onClick={requestNotificationPermission}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Bell size={16} />
          </Button>
        </div>

        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Smartphone size={12} />
            Телефон
          </div>
          <div className="flex items-center gap-1">
            <Monitor size={12} />
            Компьютер
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAInstall;