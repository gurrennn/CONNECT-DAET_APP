import { Card, CardContent, CardHeader } from "./components/ui/Card";
import { Button } from "./components/ui/Button";

export default function Home() {
  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to CONNECT-Daet
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Your Smart Tourism Gateway to the Municipality of Daet
            </p>
            <Button size="lg" variant="secondary">
              Explore Daet
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
          Explore Our Services
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tourist Info */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <h3 className="text-xl font-semibold text-gray-800">Tourist Info</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Essential information for visitors including attractions, accommodations, and local guidelines.
              </p>
              <Button variant="primary" className="w-full">
                Learn More
              </Button>
            </CardContent>
          </Card>

          {/* Museum */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <h3 className="text-xl font-semibold text-gray-800">Digital Museum</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Explore Daet's rich cultural heritage through our interactive digital museum experience.
              </p>
              <Button variant="primary" className="w-full">
                Visit Museum
              </Button>
            </CardContent>
          </Card>

          {/* Experiences */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <h3 className="text-xl font-semibold text-gray-800">Local Experiences</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Discover authentic local experiences and activities that showcase Daet's unique culture.
              </p>
              <Button variant="primary" className="w-full">
                Explore Activities
              </Button>
            </CardContent>
          </Card>

          {/* Tours */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <h3 className="text-xl font-semibold text-gray-800">Guided Tours</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Book guided tours and explore Daet's hidden gems with our expert local guides.
              </p>
              <Button variant="primary" className="w-full">
                Book Tour
              </Button>
            </CardContent>
          </Card>

          {/* Shop */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <h3 className="text-xl font-semibold text-gray-800">Local Shop</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Support local artisans and bring home authentic Daet products and souvenirs.
              </p>
              <Button variant="primary" className="w-full">
                Browse Shop
              </Button>
            </CardContent>
          </Card>

          {/* Rewards */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <h3 className="text-xl font-semibold text-gray-800">Rewards Program</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Earn points and rewards as you explore Daet and participate in various activities.
              </p>
              <Button variant="primary" className="w-full">
                View Rewards
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-600 dark:bg-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">11</div>
              <div className="text-blue-100 dark:text-blue-200">Integrated Systems</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-blue-100 dark:text-blue-200">Local Attractions</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-blue-100 dark:text-blue-200">Tourist Support</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">1M+</div>
              <div className="text-blue-100 dark:text-blue-200">Happy Visitors</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
