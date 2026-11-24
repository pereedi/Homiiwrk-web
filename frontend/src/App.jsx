import React, { useState, useEffect, useMemo } from 'react'
import { PROPERTIES } from './data/properties'
import { AuthProvider } from './lib/AuthContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FilterBar from './components/FilterBar'
import ListingsSection from './components/ListingsSection'
import HowItWorks from './components/HowItWorks'
import RoommateBanner from './components/RoommateBanner'
import CampusHubs from './components/CampusHubs'
import Footer from './components/Footer'
import FullTourModal from './components/FullTourModal'
import MatchPage from './pages/MatchPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import DashboardPage from './pages/DashboardPage'
import AuthPage from './pages/AuthPage'
import ListApartmentPage from './pages/ListApartmentPage'
import LydiaChat from './components/lydia/LydiaChat'

// Styles
import './styles/fonts.css'
import './styles/variables.css'
import './styles/reset.css'
import './styles/layout.css'
import './styles/hero.css'
import './styles/filters.css'
import './styles/listings.css'
import './styles/howItWorks.css'
import './styles/banner.css'
import './styles/hubs.css'
import './styles/footer.css'
import './styles/modals.css'
import './styles/match.css'
import './styles/propertyDetail.css'
import './styles/lydia.css'
import './styles/auth.css'
import './styles/dashboard.css'
import './styles/listApartment.css'

function MainContent() {
  const [isLydiaDrawerOpen, setIsLydiaDrawerOpen] = useState(false)
  const [allProperties, setAllProperties] = useState(PROPERTIES)

  // Router Helper
  const parseRoute = () => {
    const hash = window.location.hash || ''
    if (hash.startsWith('#property/')) {
      return { page: 'property', propId: hash.replace('#property/', '') }
    }
    if (hash === '#match') {
      return { page: 'match', propId: null }
    }
    if (hash === '#dashboard') {
      return { page: 'dashboard', propId: null }
    }
    if (hash === '#list-space' || hash === '#list' || hash === '#list-apartment') {
      return { page: 'list', propId: null }
    }
    if (hash === '#auth' || hash === '#login' || hash.startsWith('#verify-email')) {
      return { page: 'auth', mode: 'login' }
    }
    if (hash === '#signup') {
      return { page: 'auth', mode: 'signup' }
    }
    return { page: 'home', propId: null }
  }

  // Page Routing State ('home' | 'match' | 'property' | 'dashboard' | 'auth')
  const [route, setRoute] = useState(parseRoute)

  // Hash synchronization
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseRoute())
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Sync persisted user-listed apartments from backend on load
  useEffect(() => {
    let active = true
    async function loadPublishedListings() {
      try {
        const res = await fetch('/api/listings')
        if (!res.ok) return
        const data = await res.json()
        if (active && Array.isArray(data.listings) && data.listings.length > 0) {
          setAllProperties((prev) => {
            const seen = new Set()
            const merged = []
            for (const item of [...data.listings, ...prev]) {
              const key = String(item.id)
              if (!seen.has(key)) {
                seen.add(key)
                merged.push(item)
              }
            }
            return merged
          })
        }
      } catch {
        // Keep seeded PROPERTIES if backend is offline
      }
    }
    loadPublishedListings()
    return () => { active = false }
  }, [])

  // Sync removed listing across the entire marketplace
  useEffect(() => {
    const handleListingRemoved = (e) => {
      const removedId = e.detail?.id
      if (removedId) {
        setAllProperties((prev) => prev.filter((p) => String(p.id) !== String(removedId)))
      }
    }
    window.addEventListener('homiiwrk:listing-removed', handleListingRemoved)
    return () => window.removeEventListener('homiiwrk:listing-removed', handleListingRemoved)
  }, [])

  const navigateTo = (page, param) => {
    if (page === 'property') {
      window.location.hash = `#property/${param}`
    } else if (page === 'match') {
      window.location.hash = '#match'
    } else if (page === 'dashboard') {
      window.location.hash = '#dashboard'
    } else if (page === 'list' || page === 'list-space') {
      window.location.hash = '#list-space'
    } else if (page === 'auth' || page === 'login') {
      window.location.hash = '#auth'
    } else if (page === 'signup') {
      window.location.hash = '#signup'
    } else {
      window.location.hash = '#home'
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Home Page Property Filter & Sort State
  const [selectedAreaId, setSelectedAreaId] = useState(100)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('recommended')
  const [favorites, setFavorites] = useState(['apex-scholars-haven'])
  const [fullTourScene, setFullTourScene] = useState(null)

  // Toggle favorite property
  const handleToggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Filter and sort properties
  const filteredAndSortedProperties = useMemo(() => {
    let result = allProperties.filter((p) => {
      const matchesStatus = String(p.status || 'active').toLowerCase() === 'active'
      const matchesArea = selectedAreaId === 100 || Number(p.area_id) === Number(selectedAreaId)
      const matchesCategory =
        selectedCategory === 'All' ||
        p.accommodation_type === selectedCategory ||
        p.category?.toLowerCase() === selectedCategory.toLowerCase()
      return matchesStatus && matchesArea && matchesCategory
    })

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'distance') {
      result.sort((a, b) => a.distance - b.distance)
    }

    return result
  }, [allProperties, selectedAreaId, selectedCategory, sortBy])

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedAreaId(100)
    setSelectedCategory('All')
    setSortBy('recommended')
  }

  // Scroll to property directory
  const handleScrollToDirectory = () => {
    const elem = document.getElementById('property-directory')
    elem?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle Hub click on landing page
  const handleHubSelect = (hubIdOrTitle) => {
    if (typeof hubIdOrTitle === 'number') {
      setSelectedAreaId(hubIdOrTitle)
    } else {
      setSelectedAreaId(100)
    }
    handleScrollToDirectory()
  }

  const handleAddListing = (newProp) => {
    setAllProperties((prev) => [newProp, ...prev.filter((p) => String(p.id) !== String(newProp.id))])
    window.dispatchEvent(new CustomEvent('homiiwrk:listing-added', { detail: newProp }))
  }

  return (
    <div className="site-wrapper">
      {/* Navigation */}
      <Navbar
        currentPage={route.page}
        onNavigate={(page) => navigateTo(page)}
        onOpenListModal={() => navigateTo('list')}
      />

      {/* Conditional Page Rendering */}
      <main className="main-content">
        {route.page === 'home' && (
          <>
            {/* Hero with interactive location search & media */}
            <Hero
              selectedAreaId={selectedAreaId}
              onSelectArea={(areaId) => setSelectedAreaId(areaId)}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              onNavigateToMatch={() => navigateTo('match')}
              onOpenFullTour={(scene) => setFullTourScene(scene)}
              onSearchListings={handleScrollToDirectory}
            />

            {/* Sticky Filter Bar with Area & Category controls */}
            <FilterBar
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              selectedAreaId={selectedAreaId}
              onSelectArea={(areaId) => setSelectedAreaId(areaId)}
              count={filteredAndSortedProperties.length}
              sortBy={sortBy}
              onSortChange={(sort) => setSortBy(sort)}
              onResetFilters={handleResetFilters}
            />

            {/* Property Directory */}
            <ListingsSection
              properties={filteredAndSortedProperties}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onViewStay={(prop) => navigateTo('property', prop.slug || prop.id)}
              onResetFilters={handleResetFilters}
            />

            {/* How Homiiwrk Works Section */}
            <HowItWorks
              onExploreStays={handleScrollToDirectory}
              onOpenListModal={() => navigateTo('list')}
              onOpenLydia={() => setIsLydiaDrawerOpen(true)}
            />

            {/* Roommate Matching Network Banner */}
            <RoommateBanner onNavigateToMatch={() => navigateTo('match')} />

            {/* Hubs */}
            <CampusHubs onSelectHub={handleHubSelect} />
          </>
        )}

        {route.page === 'match' && (
          <MatchPage
            onNavigateHome={() => navigateTo('home')}
            onSelectProperty={(prop) =>
              navigateTo('property', typeof prop === 'object' ? (prop.slug || prop.public_id || prop.id) : prop)
            }
            onApplyLocationFilter={(areaId) => {
              setSelectedAreaId(areaId)
              navigateTo('home')
              setTimeout(() => handleScrollToDirectory(), 100)
            }}
          />
        )}

        {route.page === 'property' && (
          <PropertyDetailPage
            propertyId={route.propId}
            allProperties={allProperties}
            onNavigateHome={() => navigateTo('home')}
            onSelectProperty={(prop) => navigateTo('property', prop.id)}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {route.page === 'dashboard' && (
          <DashboardPage
            onNavigate={navigateTo}
            onOpenListModal={() => navigateTo('list')}
          />
        )}

        {route.page === 'list' && (
          <ListApartmentPage
            onNavigate={navigateTo}
            onAddListing={handleAddListing}
          />
        )}

        {route.page === 'auth' && (
          <AuthPage
            initialMode={route.mode || 'login'}
            onNavigate={navigateTo}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* 360 Panoramic Fullscreen Tour Modal */}
      {fullTourScene && (
        <FullTourModal
          initialScene={fullTourScene}
          onClose={() => setFullTourScene(null)}
          onBookInspection={() => navigateTo('property', PROPERTIES[0].id)}
        />
      )}

      {/* Global Floating Lydia Concierge Trigger (Bottom Right) */}
      <div
        className="lydia-fab-trigger"
        onClick={() => setIsLydiaDrawerOpen(true)}
        role="button"
        tabIndex={0}
      >
        <div className="lydia-fab-bubble">Ask Lydia (Concierge)</div>
        <div className="lydia-fab-btn" aria-label="Open Lydia Concierge">
          <span>L</span>
          <span className="lydia-fab-online-dot" />
        </div>
      </div>

      {/* Slide-over Drawer for Lydia */}
      {isLydiaDrawerOpen && (
        <div
          className="lydia-drawer-overlay"
          onClick={() => setIsLydiaDrawerOpen(false)}
        >
          <div
            className="lydia-drawer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <LydiaChat
              isDrawer={true}
              onCloseDrawer={() => setIsLydiaDrawerOpen(false)}
              onSelectProperty={(prop) => {
                setIsLydiaDrawerOpen(false)
                navigateTo('property', typeof prop === 'object' ? (prop.slug || prop.public_id || prop.id) : prop)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  )
}
