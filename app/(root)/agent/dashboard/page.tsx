"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import PropertyCard from "@/components/PropertyCard";
import { Property } from "@/types/property";
import { mockProperties } from "@/lib/mockData";
import {
  GET_AGENT_PROPERTIES_QUERY,
  DELETE_PROPERTY_MUTATION,
  UPDATE_PROPERTY_MUTATION,
} from "@/lib/graphql";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Filter,
  Grid,
  List,
  Search,
  PencilLine,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const AgentDashboard = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  /** -----------------------------
   *  GraphQL — Queries & Mutations
   *  ----------------------------*/
  const {
    data: queryData,
    loading: queryLoading,
    error: queryError,
    refetch,
  } = useQuery(GET_AGENT_PROPERTIES_QUERY, {
    variables: { agentId: "current-agent-id" },
    onCompleted: (data) => {
      if (data?.agentProperties) {
        setProperties(data.agentProperties);
      } else {
        setProperties(mockProperties);
      }
    },
    onError: () => setProperties(mockProperties),
  });

  const [deleteProperty, { loading: deleteLoading }] = useMutation(
    DELETE_PROPERTY_MUTATION,
    {
      update(cache, { data }) {
        if (data?.deleteProperty?.id) {
          cache.modify({
            fields: {
              agentProperties(existingRefs = [], { readField }) {
                return existingRefs.filter(
                  (ref: any) => readField("id", ref) !== data.deleteProperty.id
                );
              },
            },
          });
          setProperties((prev) =>
            prev.filter((p) => p.id !== data.deleteProperty.id)
          );
        }
      },
    }
  );

  const [updateProperty, { loading: updateLoading }] = useMutation(
    UPDATE_PROPERTY_MUTATION,
    {
      onCompleted: (data) => {
        if (data?.updateProperty) {
          setProperties((prev) =>
            prev.map((p) =>
              p.id === data.updateProperty.id ? data.updateProperty : p
            )
          );
        }
      },
    }
  );

  /** -----------------------------
   *  Handlers
   *  ----------------------------*/
  const openEdit = (property: Property) => {
    setEditingProperty(property);
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setEditingProperty(null);
    setIsEditOpen(false);
  };

  const handleDelete = async (id: number) => {
    const proceed = window.confirm("Are you sure you want to delete this listing? This cannot be undone.");
    if (!proceed) return;

    try {
      await deleteProperty({ variables: { id } });
      toast.success("Property deleted successfully");
    } catch (err) {
      toast.error("Failed to delete property. Please try again.");
    }
  };

  const handleEditSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProperty) return;

    const formData = new FormData(e.currentTarget);

    // Construct variables for the mutation
    const variables: any = { id: editingProperty.id };
    [
      "propertyName",
      "price",
      "city",
      "address",
      "description",
      "status",
      "type",
    ].forEach((field) => {
      const value = formData.get(field);
      if (value !== null) variables[field] = value;
    });

    try {
      await updateProperty({ variables });
      toast.success("Property updated");
      closeEdit();
    } catch (err) {
      toast.error("Unable to update property");
    }
  };

  /** -----------------------------
   *  Filtering & Search
   *  ----------------------------*/
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === "all" || property.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  /** -----------------------------
   *  Render
   *  ----------------------------*/
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Manage Your Property Listings
              </h1>
              <p className="text-gray-600">
                Efficiently oversee and update your property portfolio.
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              <Link href="/agent/listProperty">
                <Button size="lg">
                  <Plus className="h-5 w-5 mr-2" /> Add New Property
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by city, neighborhood, address, or property name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002b6d] focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002b6d] focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="sold">Sold</option>
                <option value="pending">Pending</option>
              </select>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" /> More Filters
              </Button>

              {/* View toggle */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-[#002b6d] text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-[#002b6d] text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredProperties.length} of {properties.length} properties
          </p>
        </div>

        {/* Loading */}
        {queryLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md h-80 animate-pulse"
              >
                <div className="h-48 bg-gray-200 rounded-t-lg" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-6 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredProperties.length ? (
              filteredProperties.map((property) => (
                <div key={property.id} className="relative group">
                  {/* Card */}
                  <PropertyCard property={property} />

                  {/* CRUD actions overlay */}
                  <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => openEdit(property)}
                    >
                      <PencilLine className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(property.id)}
                      disabled={deleteLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No properties found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || filterStatus !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "You haven't listed any properties yet."}
                  </p>
                  <Link href="/agent/listProperty">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" /> List Your First Property
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pagination (placeholder) */}
        {filteredProperties.length > 0 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                Previous
              </button>
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  className={`px-3 py-2 border rounded-lg text-sm ${
                    page === 1
                      ? "bg-[#002b6d] text-white border-[#002b6d]"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
          </DialogHeader>
          {editingProperty && (
            <form id="edit-property-form" onSubmit={handleEditSave} className="space-y-4">
              <div className="grid grid-cols-6 gap-4">
                <div className="col-span-6 sm:col-span-3">
                  <Label htmlFor="propertyName">Property Name</Label>
                  <Input
                    id="propertyName"
                    name="propertyName"
                    defaultValue={editingProperty.propertyName}
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    defaultValue={editingProperty.price}
                    min={0}
                    step={100}
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" defaultValue={editingProperty.city} required />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" defaultValue={editingProperty.address} required />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={editingProperty.status}
                    className="w-full border border-gray-300 rounded-lg h-10 px-3 text-sm focus:ring-2 focus:ring-[#002b6d] focus:border-transparent"
                  >
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                    <option value="sold">Sold</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div className="col-span-6">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingProperty.description ?? ""}
                    rows={4}
                  />
                </div>
              </div>
            </form>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeEdit} type="button">
              Cancel
            </Button>
            <Button type="submit" form="edit-property-form" disabled={updateLoading}>
              {updateLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentDashboard;
