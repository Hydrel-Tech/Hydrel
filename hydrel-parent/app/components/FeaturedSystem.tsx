export const FeaturedSystem: React.FC = () => {
  return (
    <div className="container mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
        Featured System
      </h2>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto">
        <div className="h-64 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
          <span className="text-white text-2xl font-bold">System Visualization</span>
        </div>
        <div className="p-8 md:p-12">
          <h3 className="text-2xl font-bold mb-4 text-gray-900">Hydrel Pro X1</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Our flagship hydraulic system featuring state-of-the-art pressure regulation,
            real-time monitoring, and automated safety controls designed for critical
            infrastructure applications.
          </p>
          <button className="text-blue-600 font-semibold hover:text-blue-800 transition flex items-center gap-2">
            Learn More <span>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
