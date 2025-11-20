import { useEffect, useState } from 'react';
import env from '../../config/env';

interface TicketCount {
    success: boolean;
    customer: string;
    total: number;
    open: number;
    closed: number;
}

export default function TicketCardBSI() {
    const [ticketCount, setTicketCount] = useState<TicketCount | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTicketCount = async () => {
            try {
                const token = localStorage.getItem('authToken'); // Get token from localStorage
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await fetch(`${env.api.url}/tickets/bsi/count`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to fetch ticket count');
                }
                const data: TicketCount = await response.json();
                setTicketCount(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                console.error('Error fetching ticket count:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTicketCount();
    }, []);
    return (
        <div className="">
            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-20 h-20">
                    <div className="relative">
                        <div className="overflow-hidden">
                            <img
                                src="../../images/logo/Bank_Syariah_Indonesia.png"
                                alt=""
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col mt-5 gap-3">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Total Ticket BSI
                        </span>
                        <h4 className="mt-1 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {loading ? 'Loading...' : error ? 'Error' : ticketCount?.total.toLocaleString()}
                        </h4>
                    </div>

                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Open Ticket
                        </span>
                        <h4 className="mt-1 font-semibold text-red-600 text-title-sm dark:text-green-400">
                            {loading ? 'Loading...' : error ? 'Error' : ticketCount?.open.toLocaleString()}
                        </h4>
                    </div>

                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Closed Ticket
                        </span>
                        <h4 className="mt-1 font-semibold text-green-600 text-title-sm dark:text-red-400">
                            {loading ? 'Loading...' : error ? 'Error' : ticketCount?.closed.toLocaleString()}
                        </h4>
                    </div>
                </div>
            </div>
            {/* <!-- Metric Item End --> */}
        </div>
    );
}
