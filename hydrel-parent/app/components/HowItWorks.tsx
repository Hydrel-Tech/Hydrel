export const HowItWorks: React.FC = () => {
  const steps = [
    { step: "01", title: "Consultation", desc: "We analyze your requirements" },
    { step: "02", title: "Design", desc: "Custom solution architecture" },
    { step: "03", title: "Implementation", desc: "Professional installation" },
    { step: "04", title: "Support", desc: "24/7 maintenance service" },
  ]

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
        How It Works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {steps.map((s, idx) => (
          <div key={idx} className="text-center">
            <div className="text-5xl font-bold text-blue-100 mb-4">{s.step}</div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">{s.title}</h3>
            <p className="text-gray-600">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
