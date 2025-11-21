import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import env from "../../config/env";

interface Ticket {
  id: string;
  case_number: string;
  subject: string;
  status: string;
  opened: string;
}

export default function TableTicketAllBNI() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 5;

  // filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(
          `${env.api.url}/ticket/customer/bni`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const contentType = response.headers.get("content-type") || "";
        if (!response.ok) {
          const errBody = contentType.includes("application/json")
            ? await response.json().catch(() => ({}))
            : await response.text();
          const message =
            typeof errBody === "string"
              ? errBody.slice(0, 200)
              : errBody.message || "Failed to fetch tickets";
          throw new Error(message);
        }

        if (!contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error(`Unexpected response (not JSON): ${text.slice(0, 200)}`);
        }

        const data = await response.json();
        if (data.success) {
          setTickets(data.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // filtering logic
  const filteredTickets = tickets.filter((ticket) => {
    const matchSearch =
      ticket.case_number.toLowerCase().includes(search.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all" || ticket.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // pagination logic
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(
    indexOfFirstTicket,
    indexOfLastTicket
  );
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (loading) {
    return <div>Loading tickets...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="relative overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tickets - Customer BNI
          </h3>
          
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search case/subject..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1 border rounded-md text-sm dark:bg-gray-700 dark:text-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1 border rounded-md text-sm dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="Opened">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting For Reply">Waiting for Reply</option>
            <option value="Closed Confirmed">Closed Confirmed</option>
            <option value="Closed Unconfirmed">Closed Unconfirmed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">Case Number</th>
            <th scope="col" className="px-6 py-3">Subject</th>
            <th scope="col" className="px-6 py-3">Status</th>
            <th scope="col" className="px-6 py-3">Opened</th>
            <th scope="col" className="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentTickets.length > 0 ? (
            currentTickets.map((ticket) => (
              <tr key={ticket.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{ticket.case_number}</td>
                <td className="px-6 py-4">{ticket.subject}</td>
                <td className="px-6 py-4">
                <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      ticket.status === "In Progress"
                        ? "bg-orange-200 text-gray-800"
                        : ticket.status === "Waiting For Reply"
                        ? "bg-yellow-200 text-gray-800"
                        : ticket.status === "Opened"
                        ? "bg-red-200 text-gray-800"
                        : "bg-green-100 text-gray-800"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(ticket.opened).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr className="bg-white dark:bg-gray-800">
              <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                No tickets found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center p-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
