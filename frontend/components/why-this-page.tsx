"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, Heart } from "lucide-react"
import Link from "next/link"

export function WhyThisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-25 to-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Heart className="w-12 h-12 text-primary" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900">
              Why I Built This
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A personal story about discovering opportunities at Dartmouth and making sure others don't miss out.
            </p>
          </div>
        </div>
      </section>

      {/* Story Content */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Main Story */}
          <div className="bg-white rounded-2xl p-10 sm:p-12 shadow-sm border border-gray-100">
            <div className="space-y-8">
              
              <div className="text-center space-y-4">
                <h2 className="font-display text-3xl font-semibold text-gray-900">
                  Hi, I'm <span className="font-accent text-primary">Josue</span>
                </h2>
              </div>
              
              <div className="prose prose-lg prose-gray max-w-none">
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  I'm Josue, a senior at Dartmouth. Here's what I learned: <strong>Dartmouth has incredible opportunities everywhere</strong> — research positions, fellowships, grants, unique programs — but <strong>most students don't know they exist.</strong>
                </p>

                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  A friend told me, <strong>"I didn't know I could do research,"</strong> and that hit me hard. How many amazing opportunities do we miss simply because we don't know about them?
                </p>

                <p className="text-xl text-gray-700 leading-relaxed mb-8">
                  So I built this — your personal opportunities advisor. Tell it who you are and what you care about, and it'll point you to the right programs with real deadlines and next steps. Think ChatGPT, but it actually knows Dartmouth.
                </p>
                
                <div className="border-t border-gray-200 pt-8">
                  <p className="text-xl text-gray-700 leading-relaxed font-medium mb-8">
                    I'm going to <span className="font-accent text-primary">open source</span> the code so that people can have access to it and make it better.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="bg-gray-900 hover:bg-gray-800">
                      <Link href="https://github.com/FrejusGdm/find-your-path-dartm" target="_blank" rel="noopener noreferrer">
                        ⭐ Star on GitHub
                      </Link>
                    </Button>
                    
                    <Button asChild variant="outline" size="lg">
                      <Link href="/chat">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Try It Out
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          {/* Personal Message */}
          <div className="text-center space-y-6 py-12">
            <div className="space-y-4">
              <p className="text-2xl text-gray-700 font-medium">
                My name is <span className="font-accent text-primary">Josue</span>, and I'm glad you're here.
              </p>
              
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                If you like this project, please star the repo on GitHub. If you don't, let me know why. Maybe we can improve it together.
              </p>
            </div>

            <div className="flex justify-center">
              <Button asChild variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
                <Link href="mailto:josue.godeme.25@dartmouth.edu">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Feedback
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}