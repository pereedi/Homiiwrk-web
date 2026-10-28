import React, { useState, useEffect, useMemo } from 'react'
import { PROPERTIES } from './data/properties'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FilterBar from './components/FilterBar'
import ListingsSection from './components/ListingsSection'
import RoommateBanner from './components/RoommateBanner'
import CampusHubs from './components/CampusHubs'
import Footer from './components/Footer'
import PropertyDetailModal from './components/PropertyDetailModal'
import FullTourModal from './components/FullTourModal'
import MatchPage from './pages/MatchPage'

// Styles
import './styles/fonts.css'
import './styles/variables.css'
import './styles/reset.css'
import './styles/layout.css'
import './styles/hero.css'
import './styles/filters.css'
import './styles/listings.css'
import './styles/banner.css'
import './styles/hubs.css'
import './styles/footer.css'
import './styles/modals.css'
import './styles/match.css'

export default function App() {
  // Page Routing State ('home' | 'match')
  const [currentPage, setCurrentPage] = useState(() => {
    return window.location.hash === '#match' ? 'match' : 'home'
  })

  // Hash synchronization
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#match') {
        setCurrentPage('match')
      } else if (window.location.hash === '#home' || !window.location.hash) {
        setCurrentPage('home')
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigateTo = (page) => {
    setCurrentPage(page)
    window.location.hash = page === 'match' ? 'match' : 'home'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Home Page Property Filter & Sort State
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('recommended')
  const [favorites, setFavorites] = useState(['apex-scholars-haven'])
  const [selectedPropertyModal, setSelectedPropertyModal] = useState(null)
  const [fullTourScene, setFullTourScene] = useState(null)

  // Toggle favorite property
  const handleToggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Filter and sort properties
  const filteredAndSortedProperties = useMemo(() => {
    let result = [...PROPERTIES]

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory)
    }

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'distance') {
      result.sort((a, b) => a.distance - b.distance)
    }

    return result
  }, [selectedCategory, sortBy])

  // Reset filters
  const handleResetFilters = () => {
    setSelectedCategory('All')
    setSortBy('recommended')
  }

  // Handle Hub click
  const handleHubSelect = (hubTitle) => {
    setSelectedCategory('All')
    const elem = document.getElementById('property-directory')
    elem?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="site-wrapper">
      {/* Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={(page) => navigateTo(page)}
      />

      {/* Conditional Page Rendering */}
      <main className="main-content">
        {currentPage === 'home' ? (
          <>
            {/* Hero with interactive video house shape */}
            <Hero
              onNavigateToMatch={() => navigateTo('match')}
              onOpenFullTour={(scene) => setFullTourScene(scene)}
            />

            {/* Sticky Filter Bar */}
            <FilterBar
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
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
              onViewStay={(prop) => setSelectedPropertyModal(prop)}
              onResetFilters={handleResetFilters}
            />

            {/* Roommate Matching Network Banner */}
            <RoommateBanner onNavigateToMatch={() => navigateTo('match')} />

            {/* Campus Area Hubs */}
            <CampusHubs onSelectHub={handleHubSelect} />
          </>
        ) : (
          /* Dedicated Match Page */
          <MatchPage
            onNavigateHome={() => navigateTo('home')}
            onSelectProperty={(prop) => setSelectedPropertyModal(prop)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* View Stay Detail Modal */}
      {selectedPropertyModal && (
        <PropertyDetailModal
          property={selectedPropertyModal}
          onClose={() => setSelectedPropertyModal(null)}
        />
      )}

      {/* 360 Panoramic Fullscreen Tour Modal */}
      {fullTourScene && (
        <FullTourModal
          initialScene={fullTourScene}
          onClose={() => setFullTourScene(null)}
          onBookInspection={() => setSelectedPropertyModal(PROPERTIES[0])}
        />
      )}
    </div>
  )
}
