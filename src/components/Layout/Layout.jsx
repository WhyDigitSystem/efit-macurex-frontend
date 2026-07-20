import React from 'react'
import { useSelector } from 'react-redux'
import Header from './Header'
import Sidebar from './Sidebar'

const Layout = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth)
  const { sidebarOpen } = useSelector((state) => state.ui)

  // If not authenticated, just show the children (login page)
  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">{children}</div>
  }

   return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <Header />

      {/* Sidebar below header */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-2 py-2">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout