import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 sm:py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">Portrait Banana</span>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/upload">Get Started</Link>
          </Button>
          <Button variant="outline" size="sm" className="sm:hidden" asChild>
            <Link href="/upload">Start</Link>
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4 text-xs sm:text-sm">
            AI-Powered Professional Portraits
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Transform Your Photos Into
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Professional Portraits
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Upload your casual photo and get a stunning professional business portrait in minutes. 
            Perfect for LinkedIn, resumes, and professional profiles.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/upload">Create Your Portrait</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="#how-it-works">How It Works</Link>
            </Button>
          </div>

          {/* Preview Images Placeholder */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16 px-4">
            <Card className="overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-500 text-sm sm:text-base">Before</span>
              </div>
            </Card>
            <Card className="overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center">
                <span className="text-blue-600 text-sm sm:text-base">AI Processing</span>
              </div>
            </Card>
            <Card className="overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-green-200 to-green-300 flex items-center justify-center">
                <span className="text-green-600 text-sm sm:text-base">After</span>
              </div>
            </Card>
          </div>
        </div>

        {/* How It Works */}
        <section id="how-it-works" className="py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12 px-4">
            How It Works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <CardTitle>Upload Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Upload your casual photo - any selfie or casual shot works
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <CardTitle>Customize</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Choose your style and background preferences
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  See your professional portrait before you pay
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">4</span>
                </div>
                <CardTitle>Download</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Pay and download your high-quality portrait
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

          {/* Features */}
          <section className="py-12 sm:py-16 bg-white rounded-2xl mx-4 sm:mx-0">
            <div className="text-center mb-8 sm:mb-12 px-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Why Choose Portrait Banana?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
                Professional-quality business portraits without the hassle and expense of traditional photography
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">✓</span>
                  </div>
                  Affordable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Only $7.99 per portrait - a fraction of the cost of professional photography
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">✓</span>
                  </div>
                  Fast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get your professional portrait in just 2-3 minutes
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">✓</span>
                  </div>
                  High Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  AI-powered generation ensures professional, high-resolution results
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
            <span className="text-lg sm:text-xl font-bold">Portrait Banana</span>
          </div>
          <p className="text-gray-400 mb-4 text-sm sm:text-base px-4">
            Transform your photos into professional business portraits with AI
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            © 2024 Portrait Banana. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
