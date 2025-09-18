"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_MY_PROFILE } from "@/lib/graphql";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Building, Mail, Phone, Edit } from "lucide-react";
import Link from "next/link";

interface Profile {
  id: number;
  firstname: string;
  lastname: string;
  email: string | null;
  phone: string;
  is_verified: boolean;
  is_agent: boolean;
  is_customer: boolean;
  account_created: string;
}

export default function ProfileClient() {
  const { data, loading, error } = useQuery(GET_MY_PROFILE);
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  const profile: Profile = data?.me;

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Session Expired</h2>
          <p className="text-gray-600">Please sign in again</p>
          <Button asChild className="mt-4">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-24 h-24">
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-semibold">
              {profile.firstname[0]}{profile.lastname[0]}
            </div>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.firstname} {profile.lastname}</h1>
                <p className="text-gray-500 mt-1">Member since {new Date(profile.account_created).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-3 mt-4 md:mt-0">
                <Button variant="outline" asChild>
                  <Link href="/profile/edit">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
                {!profile.is_agent && (
                  <Button asChild>
                    <Link href="/agent/register">
                      <Building className="w-4 h-4 mr-2" />
                      Become an Agent
                    </Link>
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-5 h-5" />
                {profile.email || "No email added"}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-5 h-5" />
                {profile.phone}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">My Properties</TabsTrigger>
          <TabsTrigger value="saved">Saved Properties</TabsTrigger>
          {profile.is_agent && (
            <TabsTrigger value="listings">My Listings</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Account Type</p>
                <p className="text-gray-900">{profile.is_agent ? "Agent" : "Customer"}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-500">Verification Status</p>
                <p className="text-gray-900">{profile.is_verified ? "Verified" : "Not Verified"}</p>
              </div>
              {profile.is_agent && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500">Agent Dashboard</p>
                    <Button variant="link" className="p-0" asChild>
                      <Link href="/agent/dashboard">
                        Go to Dashboard →
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="properties">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Yet</h3>
            <p className="text-gray-500 mb-4">Start exploring properties to find your perfect match.</p>
            <Button asChild>
              <Link href="/explore">
                Browse Properties
              </Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Properties</h3>
            <p className="text-gray-500 mb-4">Save properties you like to view them later.</p>
            <Button asChild>
              <Link href="/explore">
                Start Browsing
              </Link>
            </Button>
          </div>
        </TabsContent>

        {profile.is_agent && (
          <TabsContent value="listings">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Listings Yet</h3>
              <p className="text-gray-500 mb-4">Start listing your properties to reach potential clients.</p>
              <Button asChild>
                <Link href="/agent/listProperty">
                  List a Property
                </Link>
              </Button>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}