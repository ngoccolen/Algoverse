import React from 'react';
import AstronautRocket from '../../assets/astronaut_rocket.png';
import StarDust from '../../assets/star_dust.png';
import Planet from '../../assets/planet.PNG';

const Hero = () => {
  return (
    <section className="relative bg-primary text-white h-[90vh] flex justify-center items-center overflow-hidden m-0 p-0">
      {/* 🌌 Background Layer */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={StarDust}
          alt="star dust background"
          className="w-full h-full object-cover opacity-50 animate-twinkle"
        />
        <img
          src={StarDust}
          alt="floating dust"
          className="absolute top-0 left-0 w-full h-full object-cover opacity-30 animate-drift"
        />
      </div>

      {/* 🌠 Text + Rocket Container */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center w-full h-full container">
        {/* Text + Button */}
        <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-4xl transform -translate-y-12">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            HÀNH TRÌNH KHÁM PHÁ<br />VŨ TRỤ GIẢI THUẬT
          </h1>
          <p className="text-lg opacity-90">
            Học thuật toán trực quan – Đa dạng bài tập
          </p>
          <button
            className="relative px-8 py-3 text-lg font-semibold text-white 
              rounded-full overflow-hidden transition-all duration-300 
              bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
              hover:scale-105 hover:shadow-[0_0_20px_rgba(236,72,153,0.6)]"
          >
            Bắt đầu ngay
          </button>
        </div>

        {/* 🚀 Rocket Image */}
        <div className="absolute right-[8%] bottom-[18%] md:bottom-[22%]">
          <img
            src={AstronautRocket}
            alt="astronaut rocket"
            className="max-h-[240px] md:max-h-[300px] animate-rocket"
          />
        </div>
      </div>

      {/* 🪐 Planet at bottom */}
      <img
        src={Planet}
        alt="planet"
        className="absolute bottom-[-80px] left-1/2 transform -translate-x-1/2 
             w-[800px] md:w-[1000px] scale-125 opacity-95 pointer-events-none" />
    </section>
  );
};

export default Hero;
