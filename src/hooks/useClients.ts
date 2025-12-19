import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
    website: string;
    status: "Active" | "Inactive";
    logo?: string;
    contact_person?: string;
    country?: string;
    address?: string;
}

export function useClients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchClients = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('clients')
                    .select('*')
                    .order('name', { ascending: true }); // Ordered by name for better dropdown experience

                if (error) throw error;
                setClients(data || []);
            } catch (err: any) {
                console.error('Error fetching clients:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    return { clients, loading, error };
}
