"use client";

import { useState, useEffect } from "react";
import { Loader } from "@/components/ui/loader";
import { ServiceCard } from "@/components/dashboard/services/ServiceCard";
import { ServiceModal } from "@/components/dashboard/services/ServiceModal";
import { Plus } from "lucide-react";
import { Service } from "@/types/service";

export default function ServicesPage() {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState<Service[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [error, setError] = useState("");

    // Fetch services from API
    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/services');

            if (!response.ok) {
                throw new Error('Failed to fetch services');
            }

            const data = await response.json();
            setServices(data);
        } catch (err: any) {
            console.error('Error fetching services:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchServices();
    }, []);

    // Handle create/update service
    const handleSaveService = async (serviceData: any) => {
        const url = serviceData.id ? '/api/update-service' : '/api/create-service';
        const method = serviceData.id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(serviceData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save service');
        }

        // Refresh services list
        await fetchServices();
    };

    // Handle delete service
    const handleDeleteService = async (serviceId: string) => {
        if (!confirm('Are you sure you want to delete this service?')) {
            return;
        }

        try {
            const response = await fetch('/api/delete-service', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: serviceId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete service');
            }

            // Refresh services list
            await fetchServices();
        } catch (err: any) {
            console.error('Error deleting service:', err);
            alert(err.message);
        }
    };

    // Handle edit service
    const handleEditService = (service: Service) => {
        setEditingService(service);
        setIsModalOpen(true);
    };

    // Handle add new service
    const handleAddService = () => {
        setEditingService(null);
        setIsModalOpen(true);
    };

    if (loading && !mounted) return <Loader />;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Services</h1>
                    <p className="text-white/60">Manage your agency's service offerings and pricing.</p>
                </div>
                <button
                    onClick={handleAddService}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Add New Service
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            {loading ? (
                <Loader />
            ) : services.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-white/40">No services found. Create your first service to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            onEdit={handleEditService}
                            onDelete={handleDeleteService}
                        />
                    ))}
                </div>
            )}

            <ServiceModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingService(null);
                }}
                onSave={handleSaveService}
                service={editingService}
            />
        </div>
    );
}
