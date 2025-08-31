import React from 'react'
import heroImage from '@/app/assets/hero section.png'
import Image from 'next/image'
import heroMobile from '@/app/assets/maleMobile.png'
import BottomNav from './male/BottomNavigation'

const HeroSectionMale = () => {
  return (
        <section className="min-h-screen hero-gradient relative overflow-hidden ">
      {/* Full Screen Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt="AI-powered virtual try-on with digital mirror and styling interface"
          className="w-full h-full hidden md:block object-cover"
        />
        <Image
          src={heroMobile}
          alt="AI-powered virtual try-on with digital mirror and styling interface"
          className="w-full h-full md:hidden object-cover"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="px-5 mx-auto w-full h-full">
          <div className="grid lg:grid-cols-2 gap-12  h-screen items-end">
            {/* Left Content */}
            <div className=" pt-[60vh] h-full items-end space-y-6 z-10">
              <h1 className="text-[clamp(2rem,3vw,4rem)] font-semibold text-white leading-tight drop-shadow-lg">
                Your Aura called.{' '}
                <span className="block">
                  It wants a better outfit.
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 font-medium drop-shadow-lg">
                We&apos;ll fix that in seconds.
              </p>
            </div>

            {/* Right Side - Interactive Elements */}
            <div className="relative z-10 flex justify-center lg:justify-end">
              <div className="relative max-w-md">
                {/* Face Outline */}
                <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 border border-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    <BottomNav/>
      {/* Enhanced Background Decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full blur-3xl opacity-40"></div>
      </div>
    </section>
  )
}

export default HeroSectionMale
