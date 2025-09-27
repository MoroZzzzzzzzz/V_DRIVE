import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    catalog: [
      { label: 'Легковые автомобили', href: '/catalog?type=cars' },
      { label: 'Внедорожники', href: '/catalog?type=suv' },
      { label: 'Спортивные авто', href: '/catalog?type=sport' },
      { label: 'Электромобили', href: '/catalog?type=electric' },
      { label: 'Премиум класс', href: '/catalog?is_premium=true' }
    ],
    services: [
      { label: 'Для дилеров', href: '/dealers' },
      { label: 'ERP система', href: '/erp' },
      { label: 'Лизинг', href: '/services/leasing' },
      { label: 'Страхование', href: '/services/insurance' },
      { label: 'Кредиты', href: '/services/credit' }
    ],
    company: [
      { label: 'О компании', href: '/about' },
      { label: 'Новости', href: '/news' },
      { label: 'Вакансии', href: '/careers' },
      { label: 'Партнеры', href: '/partners' },
      { label: 'Контакты', href: '/contacts' }
    ],
    support: [
      { label: 'Помощь', href: '/help' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Техподдержка', href: '/support' },
      { label: 'Пользовательское соглашение', href: '/terms' },
      { label: 'Политика конфиденциальности', href: '/privacy' }
    ]
  };

  const socialLinks = [
    { icon: 'fab fa-telegram', href: '#', label: 'Telegram' },
    { icon: 'fab fa-whatsapp', href: '#', label: 'WhatsApp' },
    { icon: 'fab fa-vk', href: '#', label: 'ВКонтакте' },
    { icon: 'fab fa-youtube', href: '#', label: 'YouTube' },
    { icon: 'fab fa-instagram', href: '#', label: 'Instagram' }
  ];

  return (
    <footer className="bg-gradient-to-t from-black to-gray-900 border-t border-gold/20">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto container-padding py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-gold to-yellow-600 rounded-lg flex items-center justify-center text-black text-2xl font-bold">
                V
              </div>
              <div>
                <div className="text-2xl font-bold text-white">VELES</div>
                <div className="text-sm text-gold font-medium -mt-1">DRIVE</div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              Премиум платформа для автомобильного бизнеса. Объединяем покупателей, 
              дилеров и всех участников рынка в одной экосистеме.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-400">
                <i className="fas fa-phone w-4 mr-3 text-gold"></i>
                <span>+7 (495) 123-45-67</span>
              </div>
              <div className="flex items-center text-gray-400">
                <i className="fas fa-envelope w-4 mr-3 text-gold"></i>
                <span>info@velesdrive.ru</span>
              </div>
              <div className="flex items-center text-gray-400">
                <i className="fas fa-map-marker-alt w-4 mr-3 text-gold"></i>
                <span>г. Москва, ул. Тверская, 10</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 hover:bg-gold hover:text-black rounded-lg flex items-center justify-center text-gray-400 hover:scale-110 transition-all duration-300"
                  title={social.label}
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Catalog Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Каталог</h3>
            <ul className="space-y-3">
              {footerLinks.catalog.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-gold text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Услуги</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-gold text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Компания</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-gold text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Поддержка</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-gold text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto container-padding py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Copyright */}
            <div className="text-gray-500 text-sm mb-4 md:mb-0">
              © {currentYear} VELES DRIVE. Все права защищены.
            </div>

            {/* Additional Info */}
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-500">
              <span>Лицензия: № 123456789</span>
              <span>ИНН: 7701234567</span>
              <span className="flex items-center">
                <i className="fas fa-shield-alt mr-1 text-gold"></i>
                Защищенные сделки
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gold hover:bg-yellow-600 text-black rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 flex items-center justify-center group"
        data-testid="back-to-top-btn"
      >
        <i className="fas fa-chevron-up group-hover:transform group-hover:-translate-y-1 transition-transform duration-300"></i>
      </button>
    </footer>
  );
};

export default Footer;