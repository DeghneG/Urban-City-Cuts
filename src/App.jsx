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
import Tour from './components/Tour'
import Booking from './components/Booking'
import Admin from './pages/Admin'
import Preview from './pages/Preview'
import Login from './pages/Login'
import { usePath, navigate } from './lib/nav'
import { isAuthed } from './lib/auth'

function Site() {
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
      <Tour />
      <Booking />
    </>
  )
}

// The demo pages share the app; everything else is the website. Lenis only starts on the site, so the
// dashboard scrolls natively. /admin needs the demo sign-in.
function AdminGate() {
  const authed = isAuthed()
  useEffect(() => { if (!authed) navigate('/login', { replace: true }) }, [authed])
  return authed ? <Admin /> : null
}

export default function App() {
  const path = usePath()
  if (path === '/admin') return <AdminGate />
  if (path === '/login') return isAuthed() ? <AdminGate /> : <Login />
  if (path === '/preview') return <Preview />
  return <Site />
}
