import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import env from "../../config/env";

interface Ticket {
  id: number;
  case_number: string;
  subject: string;
  customer: string;
  status: string;
  detail_ticket: string;
  opened: string;
  closed: string | null;
  summary: string;
  created_at: string | null;
}

export default function TicketDetail() {
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(
          `${env.api.url}/ticket/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch ticket details: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.success && data.data) {
          setTicket(data.data);
        } else if (data.id) {
          setTicket(data);
        } else {
          throw new Error(data.message || "Invalid ticket data format");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching ticket:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTicket();
    }
  }, [id, navigate]);

  const getStatusColor = (status: string): string => {
    if (status.toLowerCase().includes('closed')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    } else if (status.toLowerCase().includes('progress')) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    } else if (status.toLowerCase().includes('open') || status.toLowerCase().includes('waiting')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  if (error) {
    return (
      <div className="p-4 m-4 text-red-600 bg-red-100 rounded-md dark:bg-red-900/30 dark:text-red-400">
        Error: {error}
        <button
          onClick={() => navigate(-1)}
          className="block mt-2 text-blue-600 hover:underline dark:text-blue-400"
        >
          &larr; Back to tickets
        </button>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-4 m-4 text-yellow-600 bg-yellow-100 rounded-md dark:bg-yellow-900/30 dark:text-yellow-300">
        Ticket not found
        <button
          onClick={() => navigate(-1)}
          className="block mt-2 text-blue-600 hover:underline dark:text-blue-400"
        >
          &larr; Back to tickets
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {ticket.case_number}: {ticket.subject}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Customer: {ticket.customer}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          &larr; Back to tickets
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
        {loading ? (
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Loading...</h2>
          </div>
        ) : (
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Summary
              </h2>
              <div 
                className="prose max-w-none text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: ticket.summary.replace(/\n/g, '<br>') }}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Ticket Information
            </h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
                  {ticket.customer}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Opened</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
                  {formatDate(ticket.opened)}
                </dd>
              </div>

              {ticket.closed && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Closed</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
                    {formatDate(ticket.closed)}
                  </dd>
                </div>
              )}

              {/* {ticket.created_at && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
                    {formatDate(ticket.created_at)}
                  </dd>
                </div>
              )} */}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
