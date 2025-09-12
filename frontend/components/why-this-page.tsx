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
                  I'm currently a senior at Dartmouth, and I'm graduating soon. One of the main things I've learned about Dartmouth is that there are <strong>a lot of opportunities all around you</strong>. You come to a really well-established school with incredible networking opportunities and programs that you can take advantage of.
                </p>
                
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  But here's the thing I realized: <strong>it's really hard to know what you can do.</strong>
                </p>
                
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  It's not that information isn't available. It's that people don't know what they can do. STEM scholarship opportunities, the Dickey Center, the Magnuson Center, the Dartmouth Outing Club, break trips, research with professors, the Writing Center, philosophy discussion groups, language exchange programs, debate societies, community service projects through Tucker Foundation, entrepreneurship through the Magnuson Center, study abroad programs, independent studies, undergraduate research grants, peer tutoring opportunities, leadership positions in student organizations... these incredible resources exist, but students often don't discover them until it's too late.
                </p>
                
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  That was an issue for me because I really wanted to give back and give people the opportunity to discover new things. A friend of mine told me, <strong>"Oh, I didn't know that I could do research,"</strong> and I was like, "Oh, damn, this is something that I want everybody to know when they're freshmen."
                </p>
                
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  There are <strong>so many things that you can try in your freshman year</strong> to explore different paths. Whether you're into humanities or STEM, you belong here and I want to make sure that you know some of the things you can do! You could be working on a philosophy paper with a professor, coding up a new app, joining a hiking trip with the DOC, writing for The D, getting involved in theater, or discovering a passion you never knew you had.
                </p>
                
                <p className="text-xl text-gray-700 leading-relaxed mb-8">
                  This is definitely just an MVP, but I wanted to create something that helps. A lot of us use ChatGPT nowadays, so people can basically get an idea of what's available to them depending on their interests. Think of it as your personal opportunities advisor, someone who knows about all the hidden gems on campus and can point you in the right direction based on who you are and what you care about.
                </p>
                
                <div className="border-t border-gray-200 pt-8">
                  <p className="text-xl text-gray-700 leading-relaxed font-medium mb-8">
                    I'm going to <span className="font-accent text-primary">open source</span> the code so that people can have access to it and make it better.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="bg-gray-900 hover:bg-gray-800">
                      <Link href="https://github.com/josuegodeme/find-your-path-dartmouth" target="_blank" rel="noopener noreferrer">
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