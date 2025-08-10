import React from 'react'

interface NavbarProps {
  title: string
  showBreadcrumb?: boolean
  links?: Array<{ label: string; href: string }>
}

const Navbar: React.FC<NavbarProps> = ({ title, showBreadcrumb = false, links = [{ label: 'Home', href: '#' }, { label: 'Logout', href: '#' }] }) => {
  return (
    <header className="flex justify-between items-center mb-6">
      <div>
        {showBreadcrumb && (
          <nav className="text-sm text-gray-500 mb-2">
            <span>Home</span> › <span>Logout</span>
          </nav>
        )}
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      </div>
      <nav className="space-x-4">
        {links.map((link, index) => (
          <a
            key={index}
            className="text-gray-600 hover:text-gray-900"
            href={link.href}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  )
}

export default Navbar