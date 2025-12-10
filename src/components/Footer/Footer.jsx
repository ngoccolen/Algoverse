import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Code2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  Heart
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white text-2xl font-bold">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span>Algoverse</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Nền tảng học thuật toán và lập trình thi đấu hàng đầu Việt Nam. 
              Chinh phục đỉnh cao công nghệ cùng cộng đồng đam mê lập trình.
            </p>
            <div className="flex space-x-4 pt-2">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-6">Khám phá</h3>
            <ul className="space-y-3">
              {[
                { label: 'Về chúng tôi', to: '/about' },
                { label: 'Khóa học', to: '/courses' },
                { label: 'Contest', to: '/contests' },
                { label: 'Bảng xếp hạng', to: '/leaderboard' },
                { label: 'Blog công nghệ', to: '/blog' }
              ].map((link, i) => (
                <li key={i}>
                  <Link 
                    to={link.to} 
                    className="text-gray-400 hover:text-blue-500 hover:translate-x-1 transition-all duration-300 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white text-lg font-bold mb-6">Tài nguyên</h3>
            <ul className="space-y-3">
              {[
                { label: 'Thư viện bài tập', to: '/problems' },
                { label: 'Wiki thuật toán', to: '/wiki' },
                { label: 'IDE Online', to: '/ide' },
                { label: 'Cộng đồng Discord', to: '/community' },
                { label: 'Điều khoản sử dụng', to: '/terms' }
              ].map((link, i) => (
                <li key={i}>
                  <Link 
                    to={link.to} 
                    className="text-gray-400 hover:text-blue-500 hover:translate-x-1 transition-all duration-300 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-lg font-bold mb-6">Liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                <span className="text-sm">Trường Đại Học Công Nghệ Thông Tin và Truyền Thông Việt Hàn</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-500" />
                <span className="text-sm">+84 0705208238</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <span className="text-sm">contact@algoverse.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; 2025 Algoverse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;