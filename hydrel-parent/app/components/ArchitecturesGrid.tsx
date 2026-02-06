export const ArchitecturesGrid: React.FC = () => {
  const architectures = [
    { title: "High-Pressure Systems", desc: "Industrial grade pressure management" },
    { title: "Flow Control", desc: "Precision fluid dynamics" },
    { title: "Smart Monitoring", desc: "IoT-enabled sensors and analytics" },
  ]

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
        Our Architectures
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {architectures.map((arch, idx) => (
          <div 
            key={idx} 
            className="p-8 border border-gray-200 rounded-xl hover:shadow-xl transition bg-white"
          >
            <h3 className="text-xl font-semibold mb-3 text-gray-900">{arch.title}</h3>
            <p className="text-gray-600">{arch.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
