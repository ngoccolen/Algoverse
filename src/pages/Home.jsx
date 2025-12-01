// pages/Home.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { 
  Code2, Trophy, Users, BookOpen, Zap, 
  BarChart3, Brain, ChevronRight, Star, 
  Sparkles, CheckCircle2, Play, Hash, Share2, Layers, GitBranch
} from 'lucide-react';

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

// --- Sub-components ---

// 1. Hero Section: Clean & Focused
const HeroSection = () => {
  // Hàm cuộn xuống phần Explore
  const scrollToExplore = () => {
    const element = document.getElementById('explore-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden bg-white">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>
        <div className="absolute right-0 bottom-0 -z-10 h-[310px] w-[310px] rounded-full bg-purple-400 opacity-20 blur-[100px]"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-8 text-center lg:text-left"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Nền tảng học thuật toán #1 Việt Nam</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] text-gray-900">
              Chinh phục <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                Thế giới Thuật toán
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Từ con số 0 đến chuyên gia. Lộ trình bài bản, hàng nghìn bài tập thực chiến, 
              hệ thống chấm code tự động và cộng đồng lập trình viên sôi động đang chờ đón bạn.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.button
                onClick={scrollToExplore}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all flex items-center justify-center space-x-2 text-lg"
              >
                <span>Khám phá ngay</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right Content: Code Editor Animation */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative lg:h-auto"
          >
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>

            <div className="relative bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center px-4 py-3 bg-gray-800 border-b border-gray-700">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="ml-4 text-xs text-gray-400 font-mono">solve_problem.cpp</div>
              </div>
              
              <div className="p-6 font-mono text-sm leading-relaxed overflow-hidden">
                <div className="flex">
                  <div className="text-gray-500 select-none text-right pr-4 border-r border-gray-700 mr-4">
                    1<br/>2<br/>3<br/>4<br/>5<br/>6<br/>7<br/>8
                  </div>
                  <div className="text-blue-300">
                    <span className="text-purple-400">#include</span> &lt;iostream&gt;<br/>
                    <span className="text-purple-400">using namespace</span> std;<br/><br/>
                    <span className="text-yellow-300">int</span> <span className="text-blue-400">main</span>() {'{'}<br/>
                    &nbsp;&nbsp;<span className="text-green-400">// Hello Algoverse</span><br/>
                    &nbsp;&nbsp;<span className="text-yellow-300">int</span> rating = <span className="text-orange-400">0</span>;<br/>
                    &nbsp;&nbsp;<span className="text-purple-400">while</span> (rating &lt; <span className="text-orange-400">2000</span>) {'{'}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;solve(DailyChallenge);<br/>
                    &nbsp;&nbsp;{'}'}<br/>
                    {'}'}
                  </div>
                </div>
              </div>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold text-sm">Accepted (100/100)</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// 2. Stats Section: Cards Design Xịn Xò
const StatsSection = () => {
  const stats = [
    { icon: Users, label: 'Thành viên', value: '12.5k+', desc: 'Cộng đồng năng động', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { icon: BookOpen, label: 'Bài tập', value: '1.2k+', desc: 'Đa dạng chủ đề', color: 'bg-green-50 text-green-600 border-green-100' },
    { icon: Trophy, label: 'Cuộc thi', value: '85+', desc: 'Tổ chức hàng tuần', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
    { icon: Code2, label: 'Submission', value: '1M+', desc: 'Đã chấm điểm', color: 'bg-purple-50 text-purple-600 border-purple-100' }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-sm border hover:shadow-xl transition-all duration-300 relative overflow-hidden group`}
            >
              {/* Background Blob Effect */}
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-[100px] opacity-20 transition-transform group-hover:scale-110 ${stat.color.split(' ')[0]}`}></div>

              <div className={`w-16 h-16 mb-4 rounded-2xl flex items-center justify-center ${stat.color} border shadow-sm`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div className="text-4xl font-extrabold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-base font-bold text-gray-700">{stat.label}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 3. Features Section (Giữ nguyên vì đã khá ổn, chỉ chỉnh padding)
const FeaturesSection = () => {
  const features = [
    { icon: Zap, title: 'Chấm bài siêu tốc', description: 'Hệ thống Judge Server đa luồng, trả kết quả < 1s.' },
    { icon: Trophy, title: 'Contest Định Kỳ', description: 'Thi đấu xếp hạng hàng tuần để cọ xát và nhận quà.' },
    { icon: Brain, title: 'AI Coach Mentor', description: 'Trợ lý AI phân tích lỗi sai và gợi ý tối ưu thuật toán.' },
    { icon: BarChart3, title: 'Thống kê chi tiết', description: 'Biểu đồ năng lực giúp bạn nhận ra điểm mạnh yếu.' },
    { icon: Users, title: 'Thảo luận sôi nổi', description: 'Hỏi đáp bài tập ngay tại trang làm bài với cộng đồng.' },
    { icon: Code2, title: 'Đa ngôn ngữ', description: 'Hỗ trợ C++, Java, Python, Go, JavaScript.' }
  ];

  return (
    <section className="py-24 px-6 bg-white">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Hệ sinh thái toàn diện</h2>
          <p className="text-lg text-gray-600">Mọi công cụ bạn cần để trở thành lập trình viên xuất sắc.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              whileHover={{ y: -5 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 4. Explore Algorithms Section (Thay thế Courses)
const ExploreAlgorithmsSection = () => {
  const navigate = useNavigate();
  
  // Dữ liệu chủ đề thuật toán (Giả lập)
  const topics = [
    { title: "Sắp xếp & Tìm kiếm", count: "15 Bài", icon: Hash, color: "from-blue-500 to-cyan-500" },
    { title: "Đồ thị (Graph)", count: "20 Bài", icon: Share2, color: "from-purple-500 to-pink-500" },
    { title: "Quy hoạch động", count: "30 Bài", icon: Layers, color: "from-orange-500 to-red-500" },
    { title: "Cấu trúc cây", count: "12 Bài", icon: GitBranch, color: "from-green-500 to-emerald-500" },
  ];

  return (
    <section id="explore-section" className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative bg */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Khám phá kho tàng tri thức</h2>
            <p className="text-gray-600 text-lg">
              Hệ thống bài tập được phân loại chi tiết từ cơ bản đến nâng cao. 
              Luyện tập ngay để nâng cao tư duy thuật toán.
            </p>
          </div>
          <button 
            onClick={() => navigate('/explore')}
            className="hidden md:flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
          >
            Xem tất cả chủ đề <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>

        {/* Topic Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {topics.map((topic, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => navigate('/explore')}
              className="group cursor-pointer bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${topic.color} opacity-10 rounded-bl-full transition-transform group-hover:scale-125`}></div>
              
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${topic.color} flex items-center justify-center mb-6 text-white shadow-md`}>
                <topic.icon className="w-7 h-7" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{topic.title}</h3>
              <p className="text-gray-500 font-medium mb-4">{topic.count}</p>
              
              <div className="flex items-center text-sm font-bold text-gray-400 group-hover:text-blue-600 transition-colors">
                Luyện ngay <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Big CTA Button */}
        <div className="text-center">
          <motion.button
            onClick={() => navigate('/explore')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-12 py-5 bg-gray-900 text-white rounded-full font-bold text-lg shadow-2xl hover:shadow-gray-900/30 transition-all flex items-center justify-center mx-auto space-x-3"
          >
            <span>Bắt đầu hành trình của bạn</span>
            <ChevronRight className="w-5 h-5" />
          </motion.button>
          <p className="mt-4 text-gray-500 text-sm">Miễn phí trọn đời • Không cần thẻ tín dụng</p>
        </div>
      </div>
    </section>
  );
};

// 5. Testimonials (Giữ nguyên)
const TestimonialsSection = () => {
  return (
    <section className="py-24 px-6 bg-white border-t border-gray-100">
      <div className="container mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900">Cộng đồng nói gì?</h2>
      </div>
      <div className="container mx-auto grid md:grid-cols-3 gap-8">
        {[
          { name: "Minh Tuấn", role: "Samsung R&D", text: "Nhờ Algoverse mà mình đã vượt qua vòng Coding Interview của Samsung." },
          { name: "Hoàng Yến", role: "Sinh viên Bách Khoa", text: "Bài tập sắp xếp rất logic, từ dễ đến khó, giúp mình không bị nản khi mới học." },
          { name: "Đức Thịnh", role: "VNG Corp", text: "Giao diện đẹp, trình chấm code cực nhanh. Rất recommend cho các bạn sinh viên." }
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ scale: 1.02 }}
            className="bg-gray-50 p-8 rounded-2xl border border-gray-100 relative"
          >
            <div className="text-6xl text-blue-100 absolute top-4 left-6 font-serif">"</div>
            <div className="flex justify-center mb-4 text-yellow-400 relative z-10">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current"/>)}
            </div>
            <p className="text-gray-600 italic mb-6 relative z-10">{item.text}</p>
            <div className="font-bold text-gray-900">{item.name}</div>
            <div className="text-sm text-gray-500">{item.role}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// 6. CTA Section Final
const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-purple-800"></div>
      {/* Decorative Circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500 opacity-10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

      <div className="container mx-auto relative z-10 text-center text-white">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-6"
        >
          Đừng chỉ học, hãy thực hành!
        </motion.h2>
        <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
          Tham gia cộng đồng hơn 10,000 lập trình viên và bắt đầu giải quyết các vấn đề thực tế ngay hôm nay.
        </p>
        <motion.button
          onClick={() => navigate('/register')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-12 py-4 bg-white text-blue-800 rounded-full font-bold text-lg shadow-2xl hover:bg-gray-50 transition"
        >
          Tham gia ngay
        </motion.button>
      </div>
    </section>
  );
};

// --- Main Page ---
const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <StatsSection />
        <ExploreAlgorithmsSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;