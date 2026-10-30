import { useEffect } from 'react'
import { initSmoothScroll } from './lib/smoothScroll'
import Loader from './components/Loader'
import Advisory from './components/Advisory'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import Craft from './components/Craft'
import Gallery from './components/Gallery'
import Experience from './components/Experience'
import PriceBoard from './components/PriceBoard'
import Cafe from './components/Cafe'
import Branches from './components/Branches'
import Franchise from './components/Franchise'
import Hiring from './components/Hiring'
import Footer from './components/Footer'
import Chatbot from './components/Chatbot'

export default function App() {
  useEffect(() => initSmoothScroll(), [])

  return (
    <>
      <Loader />
      <Advisory />
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Craft />
        <Gallery />
        <Experience />
        <PriceBoard />
        <Cafe />
        <Branches />
        <Franchise />
        <Hiring />
      </main>
      <Footer />
      <Chatbot />
    </>
  )
}
