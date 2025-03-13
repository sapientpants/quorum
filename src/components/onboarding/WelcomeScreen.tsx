export interface WelcomeScreenProps {
  onGetStarted: () => void
}

function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="mb-8">
        <img src="/assets/round-table-icon.svg" alt="Round Table Icon" className="w-32 h-32" />
      </div>
      <h1 className="text-4xl font-bold mb-4">Welcome to ChatRound</h1>
      <p className="text-xl text-gray-600 mb-8">Connect & collaborate seamlessly</p>
      <button
        onClick={onGetStarted}
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-green-600"
      >
        Get Started
      </button>
    </div>
  )
}

export default WelcomeScreen 