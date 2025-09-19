"use client";

import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Building, Mail, Phone, Edit, Shield, CheckCircle, Calendar, Settings, MapPin, User, Briefcase } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { User as UserType } from "@/lib/auth-types";

interface ProfileClientProps {
  user: UserType;
}

export default function ProfileClient({ user: profile }: ProfileClientProps) {

  // Agent form state (no functionality for now, just UI)
  const [agentInfo, setAgentInfo] = useState({
    businessName: '',
    businessAddress: '',
    experience: '',
    specialization: '',
    aboutMe: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setAgentInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No functionality for now - just prevent form submission
    console.log('Agent form submitted:', agentInfo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Profile Header Card */}
        <Card className="bg-white/90 shadow-xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="relative">
              <Avatar className="w-32 h-32 ring-4 ring-white shadow-lg">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#002b6d] to-[#001a42] flex items-center justify-center text-white text-4xl font-bold">
                  {profile.firstname?.[0] || 'U'}{profile.lastname?.[0] || 'N'}
                </div>
              </Avatar>
              {profile.is_verified && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            
              <div className="flex-1 text-center lg:text-left">
                <div className="mb-4">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{profile.firstname} {profile.lastname}</h1>
                  {/* All users can list properties - no agent distinction */}
                  {profile.is_verified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-500 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {profile.account_created ? new Date(profile.account_created).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-[#002b6d]" />
                  <span className="font-medium">{profile.phone}</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-[#002b6d]" />
                  <span className="font-medium">{profile.email}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button variant="outline" className="border-[#002b6d] text-[#002b6d] hover:bg-[#002b6d] hover:text-white" asChild>
                  <Link href="/profile/edit">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
                <Button className="bg-gradient-to-r from-[#002b6d] to-[#001a42] hover:from-[#001a42] hover:to-[#000d1a]" asChild>
                  <Link href="/agent/dashboard">
                    <Settings className="w-4 h-4 mr-2" />
                    My Properties
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#002b6d] data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="properties" className="data-[state=active]:bg-[#002b6d] data-[state=active]:text-white">My Properties</TabsTrigger>
            <TabsTrigger value="agent-info" className="data-[state=active]:bg-[#002b6d] data-[state=active]:text-white">Agent Info</TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-[#002b6d] data-[state=active]:text-white">Saved</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="bg-white/90 shadow-xl p-8">
              <h2 className="text-2xl font-bold text-[#0B316F] mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Account Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Account Type</p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-[#002b6d] to-[#001a42] text-white">
                        <User className="w-3 h-3 mr-1" />
                        User Account
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Verification Status</p>
                    <div className="flex items-center gap-2">
                      {profile.is_verified ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified Account
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          Not Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Property Dashboard</p>
                    <Button className="bg-gradient-to-r from-[#002b6d] to-[#001a42] hover:from-[#001a42] hover:to-[#000d1a]" asChild>
                      <Link href="/agent/dashboard">
                        <Settings className="w-4 h-4 mr-2" />
                        My Properties
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Quick Actions</p>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <Link href="/explore">
                          <MapPin className="w-4 h-4 mr-2" />
                          Browse Properties
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <Link href="/profile/edit">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="properties">
            <Card className="bg-white/90 shadow-xl p-8">
              <div className="text-center py-12">
                <div className="mx-auto mb-6 w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <Building className="w-12 h-12 text-[#002b6d]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Properties Listed Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">Start listing your properties to connect with potential renters and buyers.</p>
                <div className="flex gap-3 justify-center">
                  <Button className="bg-gradient-to-r from-[#002b6d] to-[#001a42] hover:from-[#001a42] hover:to-[#000d1a]" asChild>
                    <Link href="/agent/listProperty">
                      <Building className="w-4 h-4 mr-2" />
                      List a Property
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/agent/dashboard">
                      <Settings className="w-4 h-4 mr-2" />
                      My Properties
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="agent-info">
            <Card className="bg-white/90 shadow-xl p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#0B316F] mb-2 flex items-center gap-2">
                  <Briefcase className="w-6 h-6" />
                  Agent Information
                </h2>
                <p className="text-gray-600">Provide additional information about your business (optional)</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                      Business/Company Name
                    </label>
                    <Input
                      id="businessName"
                      value={agentInfo.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder="Enter your business name"
                    />
                  </div>
                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization
                    </label>
                    <Input
                      id="specialization"
                      value={agentInfo.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      placeholder="e.g., Residential, Commercial, Hostels"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address
                  </label>
                  <Input
                    id="businessAddress"
                    value={agentInfo.businessAddress}
                    onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                    placeholder="Enter your business address"
                  />
                </div>
                
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <Input
                    id="experience"
                    value={agentInfo.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="Enter years of experience in real estate"
                  />
                </div>
                
                <div>
                  <label htmlFor="aboutMe" className="block text-sm font-medium text-gray-700 mb-2">
                    About Me
                  </label>
                  <Textarea
                    id="aboutMe"
                    value={agentInfo.aboutMe}
                    onChange={(e) => handleInputChange('aboutMe', e.target.value)}
                    placeholder="Tell us about yourself, your experience, and what makes you a great agent..."
                    className="min-h-[120px]"
                  />
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Shield className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> This information is for display purposes only. Form functionality is not yet implemented.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled className="opacity-50 cursor-not-allowed">
                    <Building className="w-4 h-4 mr-2" />
                    Save Agent Information (Coming Soon)
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="saved">
            <Card className="bg-white/90 shadow-xl p-8">
              <div className="text-center py-12">
                <div className="mx-auto mb-6 w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                  <Shield className="w-12 h-12 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Saved Properties</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">Save properties you&apos;re interested in to easily access them later and compare options.</p>
                <Button className="bg-gradient-to-r from-[#002b6d] to-[#001a42] hover:from-[#001a42] hover:to-[#000d1a]" asChild>
                  <Link href="/explore">
                    <MapPin className="w-4 h-4 mr-2" />
                    Start Browsing
                  </Link>
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}