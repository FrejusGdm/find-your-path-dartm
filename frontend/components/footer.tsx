import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Brand */}
            <div className="text-center md:text-left">
              <h3 className="font-display font-semibold text-lg text-gray-900 mb-2">
                Find your <span className="font-accent text-green-600">Path</span>
              </h3>
              <p className="text-sm text-gray-600">Connecting students to campus opportunities.</p>
            </div>

            {/* Simple Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link href="/story" className="text-gray-600 hover:text-gray-900 transition-colors">
                Why this
              </Link>
              <Link href="/help" className="text-gray-600 hover:text-gray-900 transition-colors">
                Help
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
                Privacy
              </Link>
            </div>
          </div>

          <div className="pt-4 text-center">
            <p className="text-sm text-gray-500">© 2024 Find your Path. Made with care for students. • Independent student project - not officially affiliated with Dartmouth College</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
