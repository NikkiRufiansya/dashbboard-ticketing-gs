import { useEffect, useState } from "react";


interface Customer {
  id: number;
  customer: string;
  application_name: string;
  android_bundle_id: string | null;
  ios_bundle_id: string | null;
  number_of_download: string | null;
  product: string | null;
  start_date: string | null;
  expired_date: string | null;
  technical_contact: string | null;
  sales_contact: string | null;
  partner: string | null;
  pic_partner: string | null;
}

export default function TableCustomer() {

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 5; // jumlah row per page

  // filter state
  const [search, setSearch] = useState("");
  const [statusFilter] = useState("all");

  // filtering logic
  // filtering logic
  const filteredCustomers = customers.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    const inText = (v?: string | null) => (v ?? "").toLowerCase();

    // gabungkan semua field text yang ingin dicari
    const haystack = [
      c.customer,
      c.application_name,
      c.android_bundle_id,
      c.ios_bundle_id,
      c.number_of_download,
      c.product,
      c.start_date,
      c.expired_date,
      c.technical_contact,
      c.sales_contact,
      c.partner,
      c.pic_partner,
    ]
      .map(inText)
      .join(" ");

    const matchSearch = haystack.includes(q);

    // kalau masih butuh statusFilter, sesuaikan logikanya
    const matchStatus =
      statusFilter === "all" || c.application_name === statusFilter;

    return matchSearch && matchStatus;
  });

  // pagination logic
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(
    indexOfFirstCustomer,
    indexOfLastCustomer
  );
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };



  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('https://hmc1.rml.co.id/api-customer-gs/api/data', {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          Customer Guardsquare
        </h3>
        <div className="p-4 text-center text-gray-500">Loading customers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          Customer Data
        </h3>
        <div className="p-4 text-center text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Customer Guardsquare
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search ..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1 border rounded-md text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Customer
            </th>
            <th scope="col" className="px-6 py-3">
              Application Name
            </th>
            <th scope="col" className="px-6 py-3">
              Android Bundle ID
            </th>
            <th scope="col" className="px-6 py-3">
              iOS Bundle ID
            </th>
            <th scope="col" className="px-6 py-3">
              Number of Download
            </th>
            <th scope="col" className="px-6 py-3">
              Product
            </th>
            <th scope="col" className="px-6 py-3">
              Start Date
            </th>
            <th scope="col" className="px-6 py-3">
              Expired Date
            </th>
            <th scope="col" className="px-6 py-3">
              Technical Contact
            </th>
            <th scope="col" className="px-6 py-3">
              Sales Contact
            </th>
          </tr>
        </thead>
        <tbody>
          {currentCustomers.length > 0 ? (
            currentCustomers.map((customer) => (
              <tr key={customer.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {customer.customer}
                </th>
                <td className="px-6 py-4">
                  {customer.application_name}
                </td>
                <td className="px-6 py-4">
                  {customer.android_bundle_id}
                </td>
                <td className="px-6 py-4">
                  {customer.ios_bundle_id}
                </td>
                <td className="px-6 py-4">
                  {customer.number_of_download}
                </td>
                <td className="px-6 py-4">
                  {customer.product}
                </td>
                <td className="px-6 py-4">
                  {customer.start_date}
                </td>
                <td className="px-6 py-4">
                  {customer.expired_date}
                </td>
                <td className="px-6 py-4">
                  {customer.technical_contact}
                </td>
                <td className="px-6 py-4">
                  {customer.sales_contact}
                </td>
              </tr>
            ))
          ) : (
            <tr className="bg-white dark:bg-gray-800">
              <td colSpan={12} className="px-6 py-4 text-center">
                No customers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Previous
          </button>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}