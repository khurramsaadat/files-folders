'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LuMail, LuClock, LuMessageSquare, LuSend, LuChevronRight } from 'react-icons/lu';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const handleClearForm = () => {
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10">
      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-red-700 to-red-900 dark:from-rose-200 dark:to-orange-200 bg-clip-text text-transparent">Get in </span>
            <span className="bg-gradient-to-r from-red-600 to-red-800 dark:from-rose-300 dark:to-orange-300 bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-lg text-red-600 dark:text-rose-400 max-w-2xl mx-auto">
            Have a question or suggestion? We'd love to hear from you!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Email Card */}
            <Card className="border-rose-200 dark:border-rose-700 bg-gradient-to-br from-rose-50/80 to-pink-50/80 dark:from-red-900/20 dark:to-rose-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-red-700 dark:text-rose-300">
                  <div className="p-2 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
                    <LuMail className="w-5 h-5 text-white" />
                  </div>
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-600 dark:text-rose-400 mb-3">
                  For general inquiries and support
                </p>
                <a 
                  href="mailto:khurram.saadat@yahoo.com" 
                  className="text-red-700 dark:text-rose-300 hover:text-red-800 dark:hover:text-rose-200 font-medium transition-colors"
                >
                  khurram.saadat@yahoo.com
                </a>
              </CardContent>
            </Card>

            {/* Response Time Card */}
            <Card className="border-rose-200 dark:border-rose-700 bg-gradient-to-br from-rose-50/80 to-pink-50/80 dark:from-red-900/20 dark:to-rose-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-red-700 dark:text-rose-300">
                  <div className="p-2 bg-gradient-to-br from-amber-600 to-orange-700 rounded-lg">
                    <LuClock className="w-5 h-5 text-white" />
                  </div>
                  Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-600 dark:text-rose-400">
                  We typically respond within 24-48 hours
                </p>
              </CardContent>
            </Card>

            {/* Common Topics Card */}
            <Card className="border-rose-200 dark:border-rose-700 bg-gradient-to-br from-rose-50/80 to-pink-50/80 dark:from-red-900/20 dark:to-rose-900/20">
              <CardHeader>
                <CardTitle className="text-red-700 dark:text-rose-300">Common Topics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  'Feature requests',
                  'Bug reports', 
                  'General feedback',
                  'Partnership inquiries'
                ].map((topic) => (
                  <div key={topic} className="flex items-center gap-2 text-sm text-red-600 dark:text-rose-400">
                    <LuChevronRight className="w-4 h-4 text-red-500 dark:text-rose-500" />
                    {topic}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-rose-200 dark:border-rose-700 bg-gradient-to-br from-white/80 to-rose-50/80 dark:from-red-900/20 dark:to-rose-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-red-700 dark:text-rose-300 text-2xl">
                  <LuMessageSquare className="w-6 h-6" />
                  Send us a message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-red-700 dark:text-rose-300 font-medium">
                        Your Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="border-rose-200 dark:border-rose-600 bg-rose-50/50 dark:bg-red-800/10 focus:border-red-400 dark:focus:border-red-500 focus:ring-red-400/20"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-red-700 dark:text-rose-300 font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="border-rose-200 dark:border-rose-600 bg-rose-50/50 dark:bg-red-800/10 focus:border-red-400 dark:focus:border-red-500 focus:ring-red-400/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-red-700 dark:text-rose-300 font-medium">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="What is this about?"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="border-rose-200 dark:border-rose-600 bg-rose-50/50 dark:bg-red-800/10 focus:border-red-400 dark:focus:border-red-500 focus:ring-red-400/20"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-red-700 dark:text-rose-300 font-medium">
                      Message
                    </Label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-3 py-2 border border-rose-200 dark:border-rose-600 bg-rose-50/50 dark:bg-red-800/10 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400/20 focus:border-red-400 dark:focus:border-red-500 resize-none"
                      required
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-semibold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <LuSend className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClearForm}
                      className="border-rose-300 dark:border-rose-600 text-red-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-red-800/30"
                    >
                      Clear Form
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <Card className="border-rose-200 dark:border-rose-700 bg-gradient-to-br from-white/80 to-rose-50/80 dark:from-red-900/20 dark:to-rose-900/20 max-w-5xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-red-700 dark:text-rose-300 text-center">
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-red-700 dark:text-rose-300 mb-2">
                  How do I request a new tool?
                </h3>
                <p className="text-red-600 dark:text-rose-400">
                  Use the contact form above and select "Feature Request" as your subject. Describe the tool you'd like to see and how it would help you.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-red-700 dark:text-rose-300 mb-2">
                  Is my data secure when using Files & Folders?
                </h3>
                <p className="text-red-600 dark:text-rose-400">
                  Yes! All tools run entirely in your browser. Your data never leaves your device and we don't store any information you process.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-red-700 dark:text-rose-300 mb-2">
                  Can I use Files & Folders for commercial projects?
                </h3>
                <p className="text-red-600 dark:text-rose-400">
                  Absolutely! Files & Folders is free to use for both personal and commercial projects.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-red-700 dark:text-rose-300 mb-2">
                  Do you offer API access?
                </h3>
                <p className="text-red-600 dark:text-rose-400">
                  Currently, Files & Folders is a browser-based tool collection. API access is not available at this time.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
