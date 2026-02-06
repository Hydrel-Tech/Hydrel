interface NavbarProps {
  scrolled: boolean
}

export const Navbar: React.FC<NavbarProps> = ({ scrolled }) => {
  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="text-xl font-bold text-gray-900">Hydrel Systems</div>
        <div className="space-x-6 hidden md:flex">
          <a href="#hero" className="text-gray-700 hover:text-blue-600 transition">Home</a>
          <a href="#architectures" className="text-gray-700 hover:text-blue-600 transition">Architectures</a>
          <a href="#featured" className="text-gray-700 hover:text-blue-600 transition">Featured</a>
          <a href="#process" className="text-gray-700 hover:text-blue-600 transition">Process</a>
          <a href="#contact" className="text-gray-700 hover:text-blue-600 transition">Contact</a>
        </div>
      </div>
    </nav>
  )
}